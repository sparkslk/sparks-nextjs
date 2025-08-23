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
      
      // Extract start time from time slot (e.g., "10:15 AM - 11:15 AM" -> "10:15 AM")
      const [timeSlotStart] = newTime.split(" - ");
      startTime = timeSlotStart; // Store for notification message
      
      console.log('Extracted start time:', startTime);
      
      // Parse time more carefully using the same logic as book route
      const timeMatch = startTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!timeMatch) {
        console.log("Invalid time slot format:", newTime);
        return NextResponse.json(
          { error: "Invalid time slot format" },
          { status: 400 }
        );
      }
      
      const hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();
      
      // Validate hours and minutes
      if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
        console.log("Invalid time values:", { hours, minutes });
        return NextResponse.json(
          { error: "Invalid time values" },
          { status: 400 }
        );
      }
      
      adjustedHours = period === "AM" ? (hours === 12 ? 0 : hours) : (hours === 12 ? 12 : hours + 12);
      
      // Create the session date directly without timezone conversion
      // Store exactly what the user selects: 9:00 AM should be stored as 09:00
      const year = inputDate.getFullYear();
      const month = inputDate.getMonth();
      const day = inputDate.getDate();
      
      // Create a date string in local format to avoid timezone issues
      const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000Z`;
      newDateTime = new Date(dateString);
      
      console.log("Original selected time:", `${hours}:${minutes.toString().padStart(2, '0')} ${period}`);
      console.log("Adjusted hours (24h format):", adjustedHours);
      console.log("Final session date:", newDateTime);
      console.log("Selected time slot:", newTime);
      
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

    // Update the session with new date and time
    const updatedSession = await prisma.therapySession.update({
      where: {
        id: sessionId
      },
      data: {
        scheduledAt: newDateTime,
        status: "SCHEDULED",
        updatedAt: new Date(),
        sessionNotes: rescheduleReason 
          ? `Rescheduled by parent from ${originalDateTime.toLocaleString()} to ${newDateTime.toLocaleString()}. Reason: ${rescheduleReason}`
          : `Rescheduled by parent from ${originalDateTime.toLocaleString()} to ${newDateTime.toLocaleString()}`
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