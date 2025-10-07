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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const date = searchParams.get("date");

    if (!childId || !date) {
        console.log("Missing ChildId or date parameter");
      return NextResponse.json(
        { error: "Missing childId or date parameter" },
        { status: 400 }
      );
    }

    // Get the child and verify parent ownership through ParentGuardian relationship
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
          select: {
            id: true,
            session_rate: true, // Include session_rate from therapist table
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    console.log("Child found:", !!child);
    console.log("Primary therapist found:", !!child?.primaryTherapist);
    console.log("Primary therapist ID:", child?.primaryTherapistId);

    if (!child || !child.primaryTherapist) {
      console.log("Child not found or no therapist assigned");
      return NextResponse.json(
        { error: "Child not found or no therapist assigned" },
        { status: 404 }
      );
    }

    const selectedDate = new Date(date); 
    const jsDay = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert JS day (0=Sunday) to database day (1=Monday, 7=Sunday)
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;
    
    console.log("Selected date:", selectedDate.toDateString());
    console.log("JS Day of week:", jsDay, "(0=Sunday, 1=Monday, ..., 6=Saturday)");
    console.log("Database Day of week:", dayOfWeek, "(1=Monday, ..., 6=Saturday, 7=Sunday)");

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
              { recurrenceEndDate: { gte: selectedDate } }
            ]
          }
        ]
      }
    }) as TherapistAvailability[];

    console.log("Therapist availability from DB:", therapistAvailability);
    
    if (!therapistAvailability || therapistAvailability.length === 0) {
      console.log("Therapist availability not configured properly");
      return NextResponse.json({
        availableSlots: [],
        message: "Therapist availability not configured"
      });
    }

    const availableSlots = therapistAvailability;

    if (availableSlots.length === 0) {
      console.log("Therapist is not available on this day");
      return NextResponse.json({
        availableSlots: [],
        message: "Therapist is not available on this day"
      });
    }

    // Get existing sessions for this therapist on the selected date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log("Checking existing sessions from:", startOfDay, "to:", endOfDay);

    const existingSessions = await prisma.therapySession.findMany({
      where: {
        therapistId: child.primaryTherapistId!,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ["SCHEDULED", "APPROVED", "REQUESTED", "RESCHEDULED"]
        }
      }
    });

    console.log("Found existing sessions:", existingSessions.length);
    console.log("Existing sessions details:", existingSessions.map(s => ({
      scheduledAt: s.scheduledAt,
      status: s.status
    })));

    // Generate time slots based on availability
    const timeSlots: Array<{slot: string, isAvailable: boolean, isBooked: boolean, isBlocked: boolean}> = [];
    
    availableSlots.forEach((availability: TherapistAvailability) => {
      const [startHour, startMinute] = availability.startTime.split(':').map(Number);
      const [endHour, endMinute] = availability.endTime.split(':').map(Number);
      const sessionDuration = availability.sessionDuration;
      const bufferTime = availability.breakBetweenSessions;
      
      console.log(`Processing availability: ${availability.startTime} - ${availability.endTime}, duration: ${sessionDuration}min`);
      
      let currentTime = startHour * 60 + startMinute; // Convert to minutes
      const endTime = endHour * 60 + endMinute;
      
      while (currentTime + sessionDuration <= endTime) {
        const slotStartHour = Math.floor(currentTime / 60);
        const slotStartMinute = currentTime % 60;
        const slotEndHour = Math.floor((currentTime + sessionDuration) / 60);
        const slotEndMinute = (currentTime + sessionDuration) % 60;
        
        // Create the exact slot date time using the same format as booking
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();
        
        const slotDateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}:00.000Z`;
        const slotDateTime = new Date(slotDateString);
        
        // Check if this slot conflicts with existing sessions
        const hasConflict = existingSessions.some(session => {
          const sessionTime = new Date(session.scheduledAt);
          const timeDiff = Math.abs(sessionTime.getTime() - slotDateTime.getTime());
          const isConflict = timeDiff < 60 * 1000; // Less than 1 minute difference means same slot
          
          if (isConflict) {
            console.log(`Conflict found: slot ${slotDateTime.toISOString()} conflicts with session at ${sessionTime.toISOString()}`);
          }
          
          return isConflict;
        });

        // Check if slot is in the past or within 5 hours of current time
        const now = new Date();
        const fiveHoursFromNow = new Date(now.getTime() + (5 * 60 * 60 * 1000));
        const isTooSoon = slotDateTime <= fiveHoursFromNow;
        
        const formatTime = (hour: number, minute: number) => {
          const period = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        };
        
        const timeSlot = `${formatTime(slotStartHour, slotStartMinute)} - ${formatTime(slotEndHour, slotEndMinute)}`;
        
        timeSlots.push({
          slot: timeSlot,
          isAvailable: !hasConflict && !isTooSoon,
          isBooked: hasConflict,
          isBlocked: isTooSoon
        });
        
        if (!hasConflict && !isTooSoon) {
          console.log(`Added available slot: ${timeSlot}`);
        } else if (hasConflict) {
          console.log(`Added booked slot: ${timeSlot}`);
        } else {
          console.log(`Added blocked slot (too soon): ${timeSlot}`);
        }
        
        currentTime += sessionDuration + bufferTime;
      }
    });

    console.log("Final slots with availability:", timeSlots);

    return NextResponse.json({
      slots: timeSlots,
      therapistName: child.primaryTherapist.user?.name || "Therapist",
      sessionDuration: availableSlots[0]?.sessionDuration || 60,
      cost: child.primaryTherapist.session_rate || 0 // Use therapist's session_rate, not availability rate
    });

  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}