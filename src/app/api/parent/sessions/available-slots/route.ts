import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get available therapy session slots for a child on a specific date
 * 
 * Query Parameters:
 * - childId: ID of the patient/child
 * - date: Date to check availability (YYYY-MM-DD format)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const dateStr = searchParams.get("date");

    if (!childId || !dateStr) {
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
            session_rate: true,
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

    const requestedDate = new Date(dateStr);
    const dateOnly = requestedDate.toISOString().split('T')[0];

    // Get all availability slots for this therapist on the requested date
    const availabilitySlots = await prisma.therapistAvailability.findMany({
      where: {
        therapistId: child.primaryTherapistId!,
        date: {
          gte: new Date(dateOnly + 'T00:00:00.000Z'),
          lt: new Date(dateOnly + 'T23:59:59.999Z')
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    if (availabilitySlots.length === 0) {
      return NextResponse.json({
        availableSlots: [],
        message: "Therapist is not available on this day"
      });
    }

    // Get existing sessions for this therapist on the selected date
    const startOfDay = new Date(dateOnly + 'T00:00:00.000Z');
    const endOfDay = new Date(dateOnly + 'T23:59:59.999Z');

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

    // Convert availability slots to the format expected by frontend
    const timeSlots = availabilitySlots.map((slot) => {
      // Check if this specific slot is booked
      const isBooked = slot.isBooked || existingSessions.some(session => {
        const sessionTime = new Date(session.scheduledAt);
        const slotDateTime = new Date(`${dateOnly}T${slot.startTime}:00.000Z`);
        const timeDiff = Math.abs(sessionTime.getTime() - slotDateTime.getTime());
        return timeDiff < 60 * 1000; // Less than 1 minute difference
      });

      const [hours, minutes] = slot.startTime.split(':').map(Number);
      const endHours = hours;
      const endMinutes = minutes + 45;
      const adjustedEndHours = Math.floor(endMinutes / 60) + endHours;
      const adjustedEndMinutes = endMinutes % 60;

      return {
        slot: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}-${adjustedEndHours.toString().padStart(2, '0')}:${adjustedEndMinutes.toString().padStart(2, '0')}`,
        startTime: slot.startTime,
        isAvailable: !isBooked,
        isBooked: isBooked,
        isBlocked: false,
        isFree: slot.isFree,
        cost: slot.isFree ? 0 : (child.primaryTherapist.session_rate || 0)
      };
    });

    return NextResponse.json({
      availableSlots: timeSlots,
      therapistName: child.primaryTherapist.user.name,
      date: dateStr
    });

  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
