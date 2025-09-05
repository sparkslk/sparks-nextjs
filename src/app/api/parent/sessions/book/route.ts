import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface TherapistAvailability {
  id: string;
  therapistId: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  isRecurring: boolean;
  recurrenceType: string | null;
  recurrenceDays: number[];
  recurrenceEndDate: Date | null;
  sessionDuration: number;
  breakBetweenSessions: number;
  isActive: boolean;
  rate: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { childId, date, timeSlot, sessionType = "Individual" } = await request.json();

    if (!childId || !date || !timeSlot) {
        console.log("Missing fields:", { childId, date, timeSlot });
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
    let adjustedHours: number;
    let minutes: number;
    let startTime: string;
    
    try {
      // Parse the incoming date string (should be in ISO format from frontend)
      const inputDate = new Date(date);
      if (isNaN(inputDate.getTime())) {
        throw new Error("Invalid date");
      }
      
      const [timeSlotStart] = timeSlot.split(" - ");
      startTime = timeSlotStart; // Store for notification message
      
      // Parse time more carefully
      const timeMatch = timeSlotStart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!timeMatch) {
        console.log("Invalid time slot format:", timeSlot);
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
      sessionDate = new Date(dateString);
      
      console.log("Original selected time:", `${hours}:${minutes.toString().padStart(2, '0')} ${period}`);
      console.log("Adjusted hours (24h format):", adjustedHours);
      console.log("Final session date:", sessionDate);
      console.log("Selected time slot:", timeSlot);
      
    } catch (error) {
      console.log("Failed to parse date:", date, error);
      return NextResponse.json(
        { error: "Invalid date provided" },
        { status: 400 }
      );
    }

    // Check if the therapist is available at this time
    const jsDay = sessionDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Debug logging
    console.log("Session date:", sessionDate);
    console.log("JS Day:", jsDay);
    console.log("Session date is valid:", !isNaN(sessionDate.getTime()));
    
    // Validate that we have a valid day
    if (isNaN(jsDay)) {
      console.log("Invalid day calculated from sessionDate");
      return NextResponse.json(
        { error: "Invalid date provided" },
        { status: 400 }
      );
    }
    
    // Convert JS day (0=Sunday) to database day (1=Monday, 7=Sunday)
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;
    const sessionTime = `${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    console.log("Database day of week:", dayOfWeek);
    console.log("Session time:", sessionTime);
    
    // Additional validation to prevent NaN values
    if (isNaN(dayOfWeek) || isNaN(sessionDate.getTime())) {
      console.log("Invalid dayOfWeek or sessionDate:", { dayOfWeek, sessionDate });
      return NextResponse.json(
        { error: "Invalid date or time calculation" },
        { status: 400 }
      );
    }
    
    // Get therapist availability using Prisma
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const therapistAvailability = await (prisma as any).therapistAvailability.findMany({
      where: {
        therapistId: child.primaryTherapistId,
        isActive: true,
        OR: [
          // Direct day match
          { dayOfWeek: dayOfWeek },
          // Recurring weekly match
          { 
            isRecurring: true,
            recurrenceType: "WEEKLY",
            recurrenceDays: {
              has: dayOfWeek
            }
          }
        ],
        AND: [
          {
            OR: [
              { recurrenceEndDate: null },
              { recurrenceEndDate: { gte: sessionDate } }
            ]
          }
        ]
      }
    }) as TherapistAvailability[];
    
    if (!therapistAvailability || therapistAvailability.length === 0) {
      return NextResponse.json(
        { error: "Therapist availability not configured" },
        { status: 400 }
      );
    }

    const availability = therapistAvailability.find((avail: TherapistAvailability) => {
      const startTime = avail.startTime;
      const endTime = avail.endTime;
      
      // Check if this availability applies to the selected day
      const appliesToDay = avail.dayOfWeek === dayOfWeek || 
                          (avail.isRecurring && avail.recurrenceType === "WEEKLY" && avail.recurrenceDays.includes(dayOfWeek));
      
      return appliesToDay &&
             sessionTime >= startTime &&
             sessionTime < endTime &&
             avail.isActive &&
             (!avail.recurrenceEndDate || new Date(avail.recurrenceEndDate) >= sessionDate);
    });

    if (!availability) {
      return NextResponse.json(
        { error: "Therapist is not available at the selected time" },
        { status: 400 }
      );
    }

    // Check for existing sessions at the same time
    const existingSession = await prisma.therapySession.findFirst({
      where: {
        therapistId: child.primaryTherapistId!,
        scheduledAt: sessionDate,
        status: {
          in: ["SCHEDULED", "APPROVED", "REQUESTED"]
        }
      }
    });

    if (existingSession) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 400 }
      );
    }

    // Create the therapy session
    const therapySession = await prisma.therapySession.create({
      data: {
        patientId: childId,
        therapistId: child.primaryTherapistId!,
        scheduledAt: sessionDate,
        duration: availability.sessionDuration,
        status: "SCHEDULED",
        type: sessionType,
        bookedRate: child.primaryTherapist.session_rate || 0, // Store the rate at time of booking
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        therapist: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Create notification for therapist
    await prisma.notification.create({
      data: {
        receiverId: child.primaryTherapist.userId,
        title: "New Session Scheduled",
        message: `${child.firstName} ${child.lastName} has scheduled a session on ${sessionDate.toLocaleDateString()} at ${startTime}`,
        type: "APPOINTMENT",
        isRead: false,
        isUrgent: false
      }
    });

    return NextResponse.json({
      success: true,
      session: {
        id: therapySession.id,
        scheduledAt: therapySession.scheduledAt,
        duration: therapySession.duration,
        status: therapySession.status,
        type: therapySession.type,
        therapistName: therapySession.therapist.user.name,
        childName: `${therapySession.patient.firstName} ${therapySession.patient.lastName}`
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