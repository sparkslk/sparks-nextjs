import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { childId, date, timeSlot, sessionType = "Individual" } = await request.json();

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

    // Parse the date and time slot
    let sessionDate: Date;
    let startTime: string;

    try {
      const inputDate = new Date(date);
      if (isNaN(inputDate.getTime())) {
        throw new Error("Invalid date");
      }

      // Extract start time from slot (format: "HH:MM" or "HH:MM AM/PM")
      const [timeSlotStart] = timeSlot.split(" - ");

      // Parse time (handle both 24h and 12h formats)
      let hours: number, minutes: number;

      const time12Match = timeSlotStart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (time12Match) {
        // 12-hour format
        const h = parseInt(time12Match[1]);
        minutes = parseInt(time12Match[2]);
        const period = time12Match[3].toUpperCase();
        hours = period === "AM" ? (h === 12 ? 0 : h) : (h === 12 ? 12 : h + 12);
      } else {
        // 24-hour format
        const time24Match = timeSlotStart.match(/^(\d{1,2}):(\d{2})$/);
        if (!time24Match) {
          throw new Error("Invalid time format");
        }
        hours = parseInt(time24Match[1]);
        minutes = parseInt(time24Match[2]);
      }

      // Validate time values
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error("Invalid time values");
      }

      // Create session datetime
      const year = inputDate.getFullYear();
      const month = inputDate.getMonth();
      const day = inputDate.getDate();

      const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000Z`;
      sessionDate = new Date(dateString);
      startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    } catch (error) {
      console.error("Failed to parse date/time:", error);
      return NextResponse.json(
        { error: "Invalid date or time provided" },
        { status: 400 }
      );
    }

    const dateOnly = sessionDate.toISOString().split('T')[0];

    // Check if therapist has availability for this specific date and time
    const availabilitySlot = await prisma.therapistAvailability.findFirst({
      where: {
        therapistId: child.primaryTherapistId!,
        date: {
          gte: new Date(dateOnly + 'T00:00:00.000Z'),
          lt: new Date(dateOnly + 'T23:59:59.999Z')
        },
        startTime: startTime,
        isBooked: false
      }
    });

    if (!availabilitySlot) {
      return NextResponse.json(
        { error: "This time slot is not available or has already been booked" },
        { status: 400 }
      );
    }

    // Check for existing sessions at the same time (double-check)
    const existingSession = await prisma.therapySession.findFirst({
      where: {
        therapistId: child.primaryTherapistId!,
        scheduledAt: sessionDate,
        status: {
          in: ["SCHEDULED", "APPROVED", "REQUESTED", "RESCHEDULED"]
        }
      }
    });

    if (existingSession) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 400 }
      );
    }

    // Get the rate - check if slot is free, otherwise use therapist's session rate
    const sessionRate = availabilitySlot.isFree ? 0 : (child.primaryTherapist.session_rate || 0);

    // Create the therapy session and mark the slot as booked in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create therapy session
      const therapySession = await tx.therapySession.create({
        data: {
          patientId: childId,
          therapistId: child.primaryTherapistId!,
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

      // Mark the availability slot as booked
      await tx.therapistAvailability.update({
        where: { id: availabilitySlot.id },
        data: { isBooked: true }
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
        bookedRate: result.bookedRate
      }
    });

  } catch (error) {
    console.error("Error booking session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
