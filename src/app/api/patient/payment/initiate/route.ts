import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { createGoogleMeetEvent, generateSimpleMeetingLink } from "@/lib/google-meet";

/**
 * Initiate payment for a patient's own therapy session booking
 * Web API endpoint - uses session authentication
 *
 * Body (JSON):
 * - date: 'YYYY-MM-DD' - REQUIRED
 * - timeSlot: 'HH:mm-HH:mm' - REQUIRED
 * - sessionType: string (e.g., "Individual", "Group") - defaults to "Individual"
 * - meetingType: 'IN_PERSON' | 'ONLINE' | 'HYBRID' - REQUIRED
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireApiAuth(request);

    if (session.user.role !== "NORMAL_USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, timeSlot, sessionType = "Individual", meetingType = "IN_PERSON" } = await request.json();

    if (!date || !timeSlot) {
      return NextResponse.json(
        { error: "Missing required fields: date and timeSlot" },
        { status: 400 }
      );
    }

    if (!meetingType || !["IN_PERSON", "ONLINE", "HYBRID"].includes(meetingType)) {
      return NextResponse.json(
        { error: "Invalid meetingType. Must be IN_PERSON, ONLINE, or HYBRID" },
        { status: 400 }
      );
    }

    // Get the patient and verify they exist
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        primaryTherapistId: true,
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found. Please create a profile first." },
        { status: 404 }
      );
    }

    if (!patient.primaryTherapistId) {
      return NextResponse.json(
        { error: "No assigned therapist. Please select a therapist first." },
        { status: 400 }
      );
    }

    // Get the therapist and verify they exist
    const therapist = await prisma.therapist.findUnique({
      where: { id: patient.primaryTherapistId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Assigned therapist not found" },
        { status: 404 }
      );
    }

    console.log(`Patient Payment - Booking for date=${date}, timeSlot=${timeSlot}, meetingType=${meetingType}`);

    // Parse the date and time slot
    let sessionDate: Date;
    let startTime: string;
    let inputDate: Date;

    try {
      inputDate = new Date(date);
      if (isNaN(inputDate.getTime())) {
        throw new Error("Invalid date");
      }

      // Extract start time from slot (format: "HH:MM-HH:MM")
      const [timeSlotStart] = timeSlot.split("-");
      const cleanTimeSlot = timeSlotStart.trim();

      // Parse time (24-hour format)
      let hours: number, minutes: number;

      const time24Match = cleanTimeSlot.match(/^(\d{1,2}):(\d{2})$/);
      if (time24Match) {
        hours = parseInt(time24Match[1]);
        minutes = parseInt(time24Match[2]);
      } else {
        throw new Error(`Invalid time format: "${cleanTimeSlot}"`);
      }

      // Validate time values
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error("Invalid time values");
      }

      // Create session datetime that preserves the exact time
      const dateStr = `${inputDate.getFullYear()}-${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getDate().toString().padStart(2, '0')}`;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

      // Create as UTC datetime to preserve the exact time values
      sessionDate = new Date(`${dateStr}T${timeStr}.000Z`);
      startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      console.log(`Parsed session details - Date: ${dateStr}, Time: ${timeStr}, SessionDate: ${sessionDate.toISOString()}`);

    } catch (error) {
      console.error("Failed to parse date/time:", error);
      return NextResponse.json(
        { error: "Invalid date or time provided" },
        { status: 400 }
      );
    }

    // Get the date string for matching
    const dateStr = `${inputDate.getFullYear()}-${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getDate().toString().padStart(2, '0')}`;

    // Create target date for comparison
    const targetDate = new Date(dateStr + 'T00:00:00.000Z');
    const nextDay = new Date(dateStr + 'T00:00:00.000Z');
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    // Check if therapist has availability for this specific date and time
    const availabilitySlot = await prisma.therapistAvailability.findFirst({
      where: {
        therapistId: patient.primaryTherapistId,
        startTime: startTime,
        isBooked: false,
        date: {
          gte: targetDate,
          lt: nextDay
        }
      }
    });

    if (!availabilitySlot) {
      return NextResponse.json(
        { error: "This time slot is not available or has already been booked" },
        { status: 400 }
      );
    }

    // Get the rate - check if slot is free, otherwise use therapist's session rate
    const sessionRate = availabilitySlot.isFree ? 0 : (therapist.session_rate || 0);

    // Store therapist info for use outside transaction
    const therapistUserId = therapist.user.id;
    const therapistName = therapist.user.name || "Therapist";

    // Generate meeting link for online/hybrid sessions BEFORE payment
    let meetingLink: string | null = null;
    let calendarEventId: string | null = null;

    if (meetingType === "ONLINE" || meetingType === "HYBRID") {
      try {
        console.log(`🔍 Looking for Google OAuth tokens...`);
        console.log(`🔍 Patient User ID: ${session.user.id}`);
        console.log(`🔍 Therapist User ID: ${therapistUserId}`);

        // Get therapist's Google OAuth tokens
        let therapistAccount = await prisma.account.findFirst({
          where: {
            userId: therapistUserId,
            provider: "google",
          },
          select: {
            access_token: true,
            refresh_token: true,
            userId: true,
            provider: true,
          },
        });

        console.log(`🔍 Therapist Google account found: ${!!therapistAccount}`);
        if (therapistAccount) {
          console.log(`🔍 Therapist has access_token: ${!!therapistAccount.access_token}`);
          console.log(`🔍 Therapist has refresh_token: ${!!therapistAccount.refresh_token}`);
        }

        // DEMO FALLBACK: If therapist doesn't have Google OAuth, use patient's account
        let oauthUserId = therapistUserId;
        if (!therapistAccount?.access_token || !therapistAccount?.refresh_token) {
          console.log(`⚠️ Therapist doesn't have Google OAuth, trying patient's account...`);
          therapistAccount = await prisma.account.findFirst({
            where: {
              userId: session.user.id,
              provider: "google",
            },
            select: {
              access_token: true,
              refresh_token: true,
              userId: true,
              provider: true,
            },
          });
          oauthUserId = session.user.id;

          console.log(`🔍 Patient Google account found: ${!!therapistAccount}`);
          if (therapistAccount) {
            console.log(`🔍 Patient has access_token: ${!!therapistAccount.access_token}`);
            console.log(`🔍 Patient has refresh_token: ${!!therapistAccount.refresh_token}`);
          }
        }

        if (therapistAccount?.access_token && therapistAccount?.refresh_token) {
          // Get patient user details
          const patientUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { email: true, name: true },
          });

          // Calculate session end time (45 minutes after start)
          const sessionEnd = new Date(sessionDate);
          sessionEnd.setMinutes(sessionEnd.getMinutes() + 45);

          // Create Google Meet event
          const meetingResponse = await createGoogleMeetEvent(
            {
              summary: `Therapy Session - ${patient.firstName} ${patient.lastName}`,
              description: `Online therapy session\nSession Type: ${sessionType}\nPatient: ${patient.firstName} ${patient.lastName}\nTherapist: ${therapistName}`,
              startDateTime: sessionDate.toISOString(),
              endDateTime: sessionEnd.toISOString(),
              attendeeEmails: [
                ...(patientUser?.email ? [patientUser.email] : []),
                ...(therapist.user.email ? [therapist.user.email] : []),
              ].filter(Boolean),
              timezone: "Asia/Colombo",
            },
            therapistAccount.access_token,
            therapistAccount.refresh_token,
            oauthUserId
          );

          meetingLink = meetingResponse.meetingLink;
          calendarEventId = meetingResponse.eventId;

          console.log(`✅ Google Meet event created: ${meetingResponse.meetingLink}`);
        } else {
          // Fallback to simple meeting link if neither has Google OAuth
          meetingLink = generateSimpleMeetingLink(`${patient.id}-${Date.now()}`);
          console.log(`⚠️ Using fallback meeting link (no Google OAuth available)`);
        }
      } catch (meetError) {
        // If Google Meet creation fails, fall back to simple meeting link
        console.error("Failed to create Google Meet event:", meetError);
        meetingLink = generateSimpleMeetingLink(`${patient.id}-${Date.now()}`);
        console.log(`⚠️ Using fallback meeting link (Google Meet creation failed)`);
      }
    }

    // If the session is free, skip payment and create session directly
    if (sessionRate === 0) {
      try {
        const therapySession = await prisma.$transaction(async (tx) => {
          // Mark the availability slot as booked
          await tx.therapistAvailability.update({
            where: { id: availabilitySlot.id },
            data: { isBooked: true }
          });

          // Create therapy session
          return await tx.therapySession.create({
            data: {
              patientId: patient.id,
              therapistId: patient.primaryTherapistId!,
              scheduledAt: sessionDate,
              duration: 45,
              status: "SCHEDULED",
              type: sessionType,
              bookedRate: 0,
              sessionType: meetingType as "IN_PERSON" | "ONLINE" | "HYBRID",
              meetingLink: meetingLink,
              calendarEventId: calendarEventId,
            },
          });
        });

        // Create notifications
        await prisma.notification.createMany({
          data: [
            {
              receiverId: session.user.id,
              type: "APPOINTMENT",
              title: "Session Booked",
              message: `Your free therapy session has been booked for ${sessionDate.toLocaleDateString()} at ${startTime}`,
              isRead: false,
            },
            {
              receiverId: therapistUserId,
              type: "APPOINTMENT",
              title: "New Session Booked",
              message: `New free session booked with ${patient.firstName} ${patient.lastName} on ${sessionDate.toLocaleDateString()} at ${startTime}`,
              isRead: false,
            },
          ],
        });

        return NextResponse.json({
          message: "Free session booked successfully",
          requiresPayment: false,
          session: {
            id: therapySession.id,
            scheduledAt: therapySession.scheduledAt,
            meetingLink: therapySession.meetingLink,
            sessionType: therapySession.sessionType,
          },
        });
      } catch (error) {
        console.error("Error creating free session:", error);
        return NextResponse.json(
          { error: "Failed to book free session" },
          { status: 500 }
        );
      }
    }

    // Generate unique order ID
    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create the therapy session NOW (before payment) with Google Meet link
    const therapySession = await prisma.$transaction(async (tx) => {
      // Mark the availability slot as booked
      await tx.therapistAvailability.update({
        where: { id: availabilitySlot.id },
        data: { isBooked: true },
      });

      // Create therapy session
      return await tx.therapySession.create({
        data: {
          patientId: patient.id,
          therapistId: patient.primaryTherapistId!,
          scheduledAt: sessionDate,
          duration: 45,
          status: "SCHEDULED",
          type: sessionType,
          bookedRate: sessionRate,
          sessionType: meetingType as "IN_PERSON" | "ONLINE" | "HYBRID",
          meetingLink: meetingLink,
          calendarEventId: calendarEventId,
        },
      });
    });

    console.log(`✅ Created session ${therapySession.id} with meeting link BEFORE payment`);

    // Create payment record linked to existing session
    const payment = await prisma.payment.create({
      data: {
        orderId,
        sessionId: therapySession.id,
        patientId: patient.id,
        amount: sessionRate,
        currency: "LKR",
        status: "PENDING",
        metadata: {
          initiatedBy: {
            userId: session.user.id,
            userName: session.user.name,
            userEmail: session.user.email,
          },
          bookingDetails: {
            date: dateStr,
            timeSlot: timeSlot,
            therapistId: patient.primaryTherapistId,
            sessionType: sessionType,
            meetingType: meetingType,
            availabilitySlotId: availabilitySlot.id,
            patientId: patient.id,
          },
        },
      },
    });

    console.log(`Created payment ${payment.id} linked to session ${therapySession.id}`);

    // Calculate PayHere hash
    const merchant_id = process.env.PAYHERE_MERCHANT_ID;
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchant_id || !merchant_secret) {
      throw new Error("PayHere credentials not configured");
    }

    const merchant_secret_hash = crypto
      .createHash("md5")
      .update(merchant_secret)
      .digest("hex")
      .toUpperCase();

    const amount = sessionRate.toFixed(2);
    const hash_string = merchant_id + orderId + amount + "LKR" + merchant_secret_hash;
    const hash = crypto.createHash("md5").update(hash_string).digest("hex").toUpperCase();

    // Prepare PayHere payment data
    const paymentData = {
      merchant_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/patient/appointments?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/patient/appointments?payment=cancelled`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/notify`,
      order_id: orderId,
      items: `Therapy Session - ${sessionType}`,
      currency: "LKR",
      amount: amount,
      first_name: patient.firstName,
      last_name: patient.lastName,
      email: session.user.email || "",
      phone: "",
      address: "",
      city: "Colombo",
      country: "Sri Lanka",
      hash: hash,
    };

    return NextResponse.json({
      requiresPayment: true,
      paymentData,
      sessionId: therapySession.id,
      meetingLink: meetingLink,
      message: "Payment initiated successfully",
    });

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error initiating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
