import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { sessionId, newDate, newTime, rescheduleReason } = await request.json();

    console.log('Reschedule request received:', { sessionId, newDate, newTime, rescheduleReason });

    if (!sessionId || !newDate || !newTime) {
      return NextResponse.json({ error: "Session ID, new date, and new time are required" }, { status: 400 });
    }

    // Find the therapy session and verify the user has permission to reschedule it
    const therapySession = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        patient: {
          parentGuardians: {
            some: {
              userId: user.id
            }
          }
        }
      },
      include: {
        patient: {
          include: {
            parentGuardians: {
              include: {
                user: true
              }
            }
          }
        },
        therapist: {
          include: {
            user: true
          }
        }
      }
    });

    if (!therapySession) {
      return NextResponse.json({ error: "Session not found or unauthorized" }, { status: 404 });
    }

    // Check if session can be rescheduled
    if (therapySession.status === "CANCELLED") {
      return NextResponse.json({ error: "Cannot reschedule a cancelled session" }, { status: 400 });
    }

    if (therapySession.status === "COMPLETED") {
      return NextResponse.json({ error: "Cannot reschedule a completed session" }, { status: 400 });
    }

    // Get the current therapist rate and the rate at time of booking
    const currentTherapistRate = therapySession.therapist.session_rate || 0;
    const bookedRate = therapySession.bookedRate || 0;

    console.log('Current therapist rate:', currentTherapistRate);
    console.log('Original booked rate:', bookedRate);

    // Check if therapist rate has changed since booking
    // Only compare if we have a booked rate stored (for existing sessions that might not have this field)
    const hasRateChanged =
      (typeof bookedRate === "object" && "gt" in bookedRate
        ? bookedRate.gt(0)
        : bookedRate > 0) &&
      bookedRate.toString() !== currentTherapistRate.toString();

    if (hasRateChanged) {
      // Rate has changed - parent cannot reschedule, must cancel and book new session
      return NextResponse.json({
        error: "RATE_CHANGED",
        message: "The therapist's rate has changed since your original booking. You cannot reschedule this session. Please cancel this session and book a new one at the current rate.",
        originalRate: bookedRate,
        currentRate: currentTherapistRate,
        canReschedule: false
      }, { status: 409 }); // 409 Conflict
    }

    // Rate is the same or this is a free session - proceed with rescheduling

    // Parse the new date and time
    let newDateTime: Date;
    let adjustedHours: number;
    let minutes: number;
    let startTime: string;

    try {
      console.log('Parsing date:', newDate, 'time:', newTime);

      // Parse the incoming date string (should be in ISO format from frontend)
      const inputDate = new Date(newDate);
      if (isNaN(inputDate.getTime())) {
        throw new Error("Invalid date");
      }

      // Extract start time from time slot (format can be "HH:MM-HH:MM" or "HH:MM AM - HH:MM PM")
      const [timeSlotStart] = newTime.split(/[-−]/); // Handle both regular dash and em-dash
      startTime = timeSlotStart.trim(); // Store for notification message

      console.log('Extracted start time:', startTime);

      // Parse time (prioritize 24h format since our system uses 24h, same as book route)
      let hours: number;

      // First try 24-hour format (HH:MM)
      const time24Match = startTime.match(/^(\d{1,2}):(\d{2})$/);
      if (time24Match) {
        hours = parseInt(time24Match[1]);
        minutes = parseInt(time24Match[2]);
        console.log(`Parsed 24h format: ${hours}:${minutes}`);
      } else {
        // Try 12-hour format as fallback
        const time12Match = startTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (time12Match) {
          const h = parseInt(time12Match[1]);
          minutes = parseInt(time12Match[2]);
          const period = time12Match[3].toUpperCase();
          hours = period === "AM" ? (h === 12 ? 0 : h) : (h === 12 ? 12 : h + 12);
          console.log(`Parsed 12h format: ${h}${period} -> ${hours}:${minutes}`);
        } else {
          console.log("Invalid time slot format:", newTime);
          return NextResponse.json(
            { error: "Invalid time slot format" },
            { status: 400 }
          );
        }
      }

      // Validate time values
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.log("Invalid time values:", { hours, minutes });
        return NextResponse.json(
          { error: "Invalid time values" },
          { status: 400 }
        );
      }

      adjustedHours = hours;

      // Create the session date directly without timezone conversion
      // Store exactly what the user selects: 9:00 AM should be stored as 09:00
      const year = inputDate.getFullYear();
      const month = inputDate.getMonth();
      const day = inputDate.getDate();

      // Create a date string in local format to avoid timezone issues
      const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000Z`;
      newDateTime = new Date(dateString);

      console.log("Selected time slot:", newTime);
      console.log("Parsed start time:", startTime);
      console.log("Adjusted hours (24h format):", adjustedHours);
      console.log("Final session date:", newDateTime);

    } catch (error) {
      console.log("Failed to parse date:", newDate, error);
      return NextResponse.json(
        { error: "Invalid date provided" },
        { status: 400 }
      );
    }

    // Check if the new time is in the future (with a small buffer for immediate times)
    const now = new Date();
    const timeDifference = newDateTime.getTime() - now.getTime();
    console.log("Time difference (minutes):", timeDifference / (1000 * 60));

    if (timeDifference < -5 * 60 * 1000) { // Allow 5 minutes buffer for processing delays
      console.log("Session time is too far in the past");
      return NextResponse.json({ error: "New session time must be in the future" }, { status: 400 });
    }

    // Store original session details for notifications
    const originalDateTime = therapySession.scheduledAt;
    const patientName = `${therapySession.patient.firstName} ${therapySession.patient.lastName}`;
    // const therapistName = therapySession.therapist.user.name || therapySession.therapist.user.email;
    const parentName = user.name || user.email;

    // Update the session with new date and time (keep status as SCHEDULED)
    const updatedSession = await prisma.therapySession.update({
      where: {
        id: sessionId
      },
      data: {
        scheduledAt: newDateTime,
        updatedAt: new Date(),
        sessionNotes: rescheduleReason
          ? `Rescheduled by parent from ${originalDateTime.toLocaleString()} to ${newDateTime.toLocaleString()}. Reason: ${rescheduleReason}`
          : `Rescheduled by parent from ${originalDateTime.toLocaleString()} to ${newDateTime.toLocaleString()}`
      }
    });

    // Create SessionReschedule record to track the reschedule history
    await prisma.sessionReschedule.create({
      data: {
        id: `rsch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: sessionId,
        previousScheduledAt: originalDateTime,
        newScheduledAt: newDateTime,
        rescheduledBy: user.id,
        rescheduledByRole: "PARENT_GUARDIAN",
        rescheduleReason: rescheduleReason || "No reason provided",
        rescheduledAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create notification for the therapist
    await prisma.notification.create({
      data: {
        receiverId: therapySession.therapist.userId,
        senderId: user.id,
        type: "APPOINTMENT",
        title: "Therapy Session Rescheduled",
        message: `${parentName} has rescheduled ${patientName}'s therapy session from ${originalDateTime.toLocaleDateString()} at ${originalDateTime.toLocaleTimeString()} to ${newDateTime.toLocaleDateString()} at ${newDateTime.toLocaleTimeString()}.${rescheduleReason ? ` Reason: ${rescheduleReason}` : ''}`,
        isUrgent: true
      }
    });

    // // Create notification for the parent/patient
    // await prisma.notification.create({
    //   data: {
    //     receiverId: user.id,
    //     senderId: therapySession.therapist.userId,
    //     type: "APPOINTMENT",
    //     title: "Session Rescheduled Successfully",
    //     message: `${patientName}'s therapy session with ${therapistName} has been successfully rescheduled from ${originalDateTime.toLocaleDateString()} at ${originalDateTime.toLocaleTimeString()} to ${newDateTime.toLocaleDateString()} at ${newDateTime.toLocaleTimeString()}. The therapist has been notified of this change.`,
    //     isUrgent: false
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: "Session rescheduled successfully",
      session: {
        id: updatedSession.id,
        scheduledAt: updatedSession.scheduledAt,
        status: updatedSession.status,
        updatedAt: updatedSession.updatedAt,
        originalDateTime: originalDateTime.toISOString(),
        newDateTime: newDateTime.toISOString()
      }
    });

  } catch (error) {
    console.error("Error rescheduling session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}