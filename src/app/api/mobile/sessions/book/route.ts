import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

/**
 * Book a therapy session for a patient
 * Mobile API endpoint - uses JWT token authentication
 *
 * Body (JSON):
 * - date: 'YYYY-MM-DD' - REQUIRED
 * - timeSlot: 'HH:mm-HH:mm' - REQUIRED
 * - sessionType: string (e.g., "Individual", "Group") - defaults to "Individual"
 * - therapistId: Therapist ID to book with - REQUIRED
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyMobileToken(token);

    if (!payload || payload.role !== "NORMAL_USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, timeSlot, sessionType = "Individual", therapistId } = await request.json();

    if (!date || !timeSlot) {
      return NextResponse.json(
        { error: "Missing required fields: date and timeSlot" },
        { status: 400 }
      );
    }

    if (!therapistId) {
      return NextResponse.json(
        { error: "Missing required field: therapistId" },
        { status: 400 }
      );
    }

    // Get the patient and verify they exist
    let patient = await prisma.patient.findUnique({
      where: { userId: payload.userId }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // If patient has no primary therapist, automatically assign this one
    if (!patient.primaryTherapistId) {
      console.log(`Auto-assigning therapist ${therapistId} to patient ${patient.id} during booking`);

      patient = await prisma.patient.update({
        where: { id: patient.id },
        data: { primaryTherapistId: therapistId }
      });
    }

    const targetTherapistId = therapistId;

    // Get the therapist and verify they exist
    const therapist = await prisma.therapist.findUnique({
      where: { id: targetTherapistId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    console.log(`Mobile Book API received: date=${date}, timeSlot=${timeSlot}`);

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

      // Parse time (24-hour format)
      let hours: number, minutes: number;

      const time24Match = cleanTimeSlot.match(/^(\d{1,2}):(\d{2})$/);
      if (time24Match) {
        hours = parseInt(time24Match[1]);
        minutes = parseInt(time24Match[2]);
        console.log(`Parsed 24h format: ${hours}:${minutes}`);
      } else {
        console.error(`Failed to parse time format: "${cleanTimeSlot}"`);
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

      console.log(`Parsed time: ${startTime}`);
      console.log(`Date: ${dateStr}, Time: ${timeStr}`);
      console.log(`SessionDate: ${sessionDate.toISOString()}`);

    } catch (error) {
      console.error("Failed to parse date/time:", error);
      return NextResponse.json(
        { error: "Invalid date or time provided" },
        { status: 400 }
      );
    }

    // Get the date string for matching
    const dateStr = `${inputDate.getFullYear()}-${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getDate().toString().padStart(2, '0')}`;

    console.log(`Mobile Book API - Querying for date: ${dateStr}, time: ${startTime}`);

    // Create target date for comparison
    const targetDate = new Date(dateStr + 'T00:00:00.000Z');
    const nextDay = new Date(dateStr + 'T00:00:00.000Z');
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    // Check if therapist has availability for this specific date and time
    const availabilitySlot = await prisma.therapistAvailability.findFirst({
      where: {
        therapistId: targetTherapistId,
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
          patientId: patient.id,
          therapistId: targetTherapistId,
          scheduledAt: sessionDate,
          duration: 45, // Fixed 45-minute sessions
          status: "SCHEDULED",
          type: sessionType,
          bookedRate: sessionRate
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

    // Create notifications for both patient and therapist
    const notificationMessage = `New therapy session scheduled for ${patient.firstName} ${patient.lastName} on ${sessionDate.toLocaleDateString()} at ${startTime}`;

    await prisma.notification.createMany({
      data: [
        {
          senderId: payload.userId,
          receiverId: therapist.user.id,
          type: "APPOINTMENT",
          title: "New Session Booked",
          message: notificationMessage,
          isRead: false
        },
        {
          receiverId: payload.userId,
          type: "APPOINTMENT",
          title: "Session Confirmation",
          message: `Your session booking for ${patient.firstName} ${patient.lastName} has been confirmed for ${sessionDate.toLocaleDateString()} at ${startTime}`,
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
        therapist: {
          id: result.therapist.id,
          name: result.therapist.user.name
        }
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
