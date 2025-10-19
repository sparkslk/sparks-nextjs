import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createGoogleMeetEvent, generateSimpleMeetingLink } from "@/lib/google-meet";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { childId, date, timeSlot, sessionType = "Individual", meetingType = "IN_PERSON" } = await request.json();

    if (!childId || !date || !timeSlot) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the child and verify parent ownership
    const child = await prisma.patient.findFirst({
      where: {
        id: childId,
        parentGuardians: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        primaryTherapist: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!child || !child.primaryTherapist) {
      return NextResponse.json(
        { error: "Child not found or no therapist assigned" },
        { status: 404 }
      );
    }

    console.log(`Book API received: date=${date}, timeSlot=${timeSlot}`);

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
      console.log(`Extracted timeSlotStart: "${timeSlotStart}"`);

      // Clean the time string (remove any extra spaces)
      const cleanTimeSlot = timeSlotStart.trim();
      console.log(`Clean timeSlotStart: "${cleanTimeSlot}"`);

      // Parse time (prioritize 24h format since our system uses 24h)
      let hours: number, minutes: number;

      // First try 24-hour format (HH:MM)
      const time24Match = cleanTimeSlot.match(/^(\d{1,2}):(\d{2})$/);
      if (time24Match) {
        hours = parseInt(time24Match[1]);
        minutes = parseInt(time24Match[2]);
        console.log(`Parsed 24h format: ${hours}:${minutes}`);
      } else {
        // Try 12-hour format as fallback
        const time12Match = cleanTimeSlot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (time12Match) {
          const h = parseInt(time12Match[1]);
          minutes = parseInt(time12Match[2]);
          const period = time12Match[3].toUpperCase();
          hours = period === "AM" ? (h === 12 ? 0 : h) : (h === 12 ? 12 : h + 12);
          console.log(`Parsed 12h format: ${h}${period} -> ${hours}:${minutes}`);
        } else {
          console.error(`Failed to parse time format: "${cleanTimeSlot}"`);
          throw new Error(`Invalid time format: "${cleanTimeSlot}"`);
        }
      }

      // Validate time values
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error("Invalid time values");
      }

      // Create session datetime that preserves the exact time
      // Build the datetime string to avoid timezone conversion issues
      const dateStr = `${inputDate.getFullYear()}-${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getDate().toString().padStart(2, '0')}`;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

      // Create as UTC datetime to preserve the exact time values
      sessionDate = new Date(`${dateStr}T${timeStr}.000Z`);
      startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      console.log(`Parsed time: ${startTime}`);
      console.log(`Date: ${dateStr}, Time: ${timeStr}`);
      console.log(`Combined UTC string: ${dateStr}T${timeStr}.000Z`);
      console.log(`SessionDate: ${sessionDate.toISOString()}`);
      console.log(`Time part in DB will be: ${sessionDate.toISOString().split('T')[1]}`);

    } catch (error) {
      console.error("Failed to parse date/time:", error);
      return NextResponse.json(
        { error: "Invalid date or time provided" },
        { status: 400 }
      );
    }

    // Get the date string for matching
    const dateStr = `${inputDate.getFullYear()}-${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getDate().toString().padStart(2, '0')}`;

    console.log(`Book API - Querying for date: ${dateStr}, time: ${startTime}`);

    // Create target date for comparison (same logic as available-slots)
    const targetDate = new Date(dateStr + 'T00:00:00.000Z');
    const nextDay = new Date(dateStr + 'T00:00:00.000Z');
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    // Check if therapist has availability for this specific date and time
    const availabilitySlot = await prisma.therapistAvailability.findFirst({
      where: {
        therapistId: child.primaryTherapistId!,
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
    const sessionRate = availabilitySlot.isFree ? 0 : (child.primaryTherapist.session_rate || 0);

    // Store therapist info for use outside transaction
    const therapistUserId = child.primaryTherapist.user.id;
    const therapistName = child.primaryTherapist.user.name || "Therapist";

    // Generate meeting link for online/hybrid sessions
    let meetingLink: string | null = null;
    let calendarEventId: string | null = null;

    if (meetingType === "ONLINE" || meetingType === "HYBRID") {
      try {
        // Get therapist's Google OAuth tokens
        const therapistAccount = await prisma.account.findFirst({
          where: {
            userId: therapistUserId,
            provider: "google",
          },
          select: {
            access_token: true,
            refresh_token: true,
          },
        });

        if (therapistAccount?.access_token && therapistAccount?.refresh_token) {
          // Get parent user details
          const parentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { email: true, name: true },
          });

          // Get therapist email
          const therapistEmail = await prisma.user.findUnique({
            where: { id: therapistUserId },
            select: { email: true },
          });

          // Calculate session end time (45 minutes after start)
          const sessionEnd = new Date(sessionDate);
          sessionEnd.setMinutes(sessionEnd.getMinutes() + 45);

          // Create Google Meet event
          const meetingResponse = await createGoogleMeetEvent(
            {
              summary: `Therapy Session - ${child.firstName} ${child.lastName}`,
              description: `Online therapy session\nSession Type: ${sessionType}\nPatient: ${child.firstName} ${child.lastName}\nTherapist: ${therapistName}\nParent: ${parentUser?.name || 'Guardian'}`,
              startDateTime: sessionDate.toISOString(),
              endDateTime: sessionEnd.toISOString(),
              attendeeEmails: [
                ...(parentUser?.email ? [parentUser.email] : []),
                ...(therapistEmail?.email ? [therapistEmail.email] : []),
              ],
              timezone: "Asia/Colombo",
            },
            therapistAccount.access_token,
            therapistAccount.refresh_token,
            therapistUserId
          );

          meetingLink = meetingResponse.meetingLink;
          calendarEventId = meetingResponse.eventId;

          console.log(`✅ Google Meet event created: ${meetingResponse.meetingLink}`);
        } else {
          // Fallback to simple meeting link if therapist hasn't connected Google account
          meetingLink = generateSimpleMeetingLink(`${childId}-${Date.now()}`);
          console.log(`⚠️ Using fallback meeting link (therapist not connected to Google)`);
        }
      } catch (meetError) {
        // If Google Meet creation fails, fall back to simple meeting link
        console.error("Failed to create Google Meet event:", meetError);
        meetingLink = generateSimpleMeetingLink(`${childId}-${Date.now()}`);
        console.log(`⚠️ Using fallback meeting link (Google Meet creation failed)`);
      }
    }

    // Create the therapy session and mark the slot as booked in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // First, mark the availability slot as booked (double-check it's still available)
      const updateRes = await tx.therapistAvailability.updateMany({
        where: {
          id: availabilitySlot.id,
          isBooked: false // Only update if still unbooked
        },
        data: { isBooked: true }
      });

      if (updateRes.count === 0) {
        throw new Error('SLOT_ALREADY_BOOKED');
      }

      // Create therapy session
      const therapySession = await tx.therapySession.create({
        data: {
          patientId: childId,
          therapistId: child.primaryTherapistId!,
          scheduledAt: sessionDate,
          duration: 45, // Fixed 45-minute sessions
          status: "SCHEDULED",
          type: sessionType,
          bookedRate: sessionRate,
          sessionType: meetingType as "IN_PERSON" | "ONLINE" | "HYBRID",
          meetingLink: meetingLink,
          calendarEventId: calendarEventId
        },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          therapist: {
            include: {
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      return therapySession;
    });

    // Create notifications for both parent and therapist
    const notificationMessage = `New therapy session scheduled for ${child.firstName} ${child.lastName} on ${sessionDate.toLocaleDateString()} at ${startTime}`;

    await prisma.notification.createMany({
      data: [
        {
          senderId: session.user.id,
          receiverId: child.primaryTherapist.user.id,
          type: "APPOINTMENT",
          title: "New Session Booked",
          message: notificationMessage,
          isRead: false
        },
        {
          receiverId: session.user.id,
          type: "APPOINTMENT",
          title: "Session Confirmation",
          message: `Your session booking for ${child.firstName} ${child.lastName} has been confirmed for ${sessionDate.toLocaleDateString()} at ${startTime}`,
          isRead: false
        }
      ]
    });

    return NextResponse.json({
      message: "Session booked successfully",
      session: {
        id: result.id,
        scheduledAt: result.scheduledAt,
        duration: result.duration,
        status: result.status,
        bookedRate: result.bookedRate,
        sessionType: result.sessionType,
        meetingLink: result.meetingLink
      }
    });

  } catch (error) {
    console.error("Error booking session:", error);

    const maybeErr = error as Error | undefined;
    if (maybeErr?.message === 'SLOT_ALREADY_BOOKED') {
      return NextResponse.json(
        { error: 'This time slot has already been booked' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
