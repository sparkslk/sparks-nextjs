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

    const existingSessions = await prisma.therapySession.findMany({
      where: {
        therapistId: child.primaryTherapistId!,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ["SCHEDULED", "APPROVED", "REQUESTED"]
        }
      }
    });

    // Generate time slots based on availability
    const timeSlots: string[] = [];
    
    availableSlots.forEach((availability: TherapistAvailability) => {
      const [startHour, startMinute] = availability.startTime.split(':').map(Number);
      const [endHour, endMinute] = availability.endTime.split(':').map(Number);
      const sessionDuration = availability.sessionDuration;
      const bufferTime = availability.breakBetweenSessions;
      
      let currentTime = startHour * 60 + startMinute; // Convert to minutes
      const endTime = endHour * 60 + endMinute;
      
      while (currentTime + sessionDuration <= endTime) {
        const slotStartHour = Math.floor(currentTime / 60);
        const slotStartMinute = currentTime % 60;
        const slotEndHour = Math.floor((currentTime + sessionDuration) / 60);
        const slotEndMinute = (currentTime + sessionDuration) % 60;
        
        // Check if this slot conflicts with existing sessions
        const slotDateTime = new Date(selectedDate);
        slotDateTime.setHours(slotStartHour, slotStartMinute, 0, 0);
        
        const hasConflict = existingSessions.some(session => {
          const sessionTime = new Date(session.scheduledAt);
          return Math.abs(sessionTime.getTime() - slotDateTime.getTime()) < sessionDuration * 60 * 1000;
        });
        
        if (!hasConflict) {
          const formatTime = (hour: number, minute: number) => {
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
          };
          
          const timeSlot = `${formatTime(slotStartHour, slotStartMinute)} - ${formatTime(slotEndHour, slotEndMinute)}`;
          timeSlots.push(timeSlot);
        }
        
        currentTime += sessionDuration + bufferTime;
      }
    });

    return NextResponse.json({
      availableSlots: timeSlots,
      therapistName: child.primaryTherapist.user?.name || "Therapist",
      sessionDuration: availableSlots[0]?.sessionDuration || 60,
      cost: availableSlots[0]?.rate || 0
    });

  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}