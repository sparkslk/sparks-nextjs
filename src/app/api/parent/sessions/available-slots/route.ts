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

    console.log(`Querying for date: ${dateStr}`);

    // Create target date for comparison (start and end of the day in UTC)
    const targetDate = new Date(dateStr + 'T00:00:00.000Z');
    const nextDay = new Date(dateStr + 'T00:00:00.000Z');
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    console.log(`Target date range: ${targetDate.toISOString()} to ${nextDay.toISOString()}`);

    // Get all availability slots for this therapist on the exact date
    const availabilitySlots = await prisma.therapistAvailability.findMany({
      where: {
        therapistId: child.primaryTherapistId!,
        date: {
          gte: targetDate,
          lt: nextDay
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    console.log(`Found ${availabilitySlots.length} availability slots for ${dateStr}:`);
    availabilitySlots.forEach(slot => {
      console.log(`- Date: ${slot.date.toISOString()}, Time: ${slot.startTime}, Booked: ${slot.isBooked}, Free: ${slot.isFree}`);
    });

    if (availabilitySlots.length === 0) {
      return NextResponse.json({
        availableSlots: [],
        message: "Therapist is not available on this day"
      });
    }

    // Convert availability slots to the format expected by frontend
    const timeSlots = availabilitySlots.map((slot) => {
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      const endHours = hours;
      const endMinutes = minutes + 45;
      const adjustedEndHours = Math.floor(endMinutes / 60) + endHours;
      const adjustedEndMinutes = endMinutes % 60;

      return {
        slot: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}-${adjustedEndHours.toString().padStart(2, '0')}:${adjustedEndMinutes.toString().padStart(2, '0')}`,
        startTime: slot.startTime,
        isAvailable: !slot.isBooked, // Use the isBooked field directly from TherapistAvailability
        isBooked: slot.isBooked,
        isBlocked: false,
        isFree: slot.isFree,
        cost: slot.isFree ? 0 : (child.primaryTherapist?.session_rate || 0)
      };
    });

    console.log(`Returning ${timeSlots.length} processed time slots:`, timeSlots);

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

/**
 * Create a booking for a child on a specific therapist slot
 * Body (JSON): { childId, date: 'YYYY-MM-DD', timeSlot: 'HH:mm-HH:mm', duration?: number, sessionType?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { childId, date, timeSlot, duration = 45, sessionType = "STANDARD" } = body || {};

    if (!childId || !date || !timeSlot) {
      return NextResponse.json({ error: "Missing childId, date or timeSlot" }, { status: 400 });
    }

    // Extract start time from timeSlot (e.g., "15:00-15:45" -> "15:00")
    const startTime = timeSlot.split('-')[0];

    // Verify child belongs to this parent and get primary therapist
    const child = await prisma.patient.findFirst({
      where: {
        id: childId,
        parentGuardians: {
          some: { userId: session.user.id }
        }
      },
      include: { primaryTherapist: true }
    });

    if (!child || !child.primaryTherapist) {
      return NextResponse.json({ error: "Child not found or no therapist assigned" }, { status: 404 });
    }

    const primaryTherapistId = child.primaryTherapistId!;

    // Create target date for comparison (same logic as GET method)
    const targetDate = new Date(date + 'T00:00:00.000Z');
    const nextDay = new Date(date + 'T00:00:00.000Z');
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    // Find the specific availability slot for the therapist on that date/time
    const availability = await prisma.therapistAvailability.findFirst({
      where: {
        therapistId: primaryTherapistId,
        startTime: startTime,
        date: {
          gte: targetDate,
          lt: nextDay
        }
      }
    });

    if (!availability) {
      return NextResponse.json({ error: "Therapist not available for the selected slot" }, { status: 404 });
    }

    if (availability.isBooked) {
      return NextResponse.json({ error: "Slot already booked" }, { status: 409 });
    }

    // Create the scheduled time
    const scheduledAt = new Date(date + 'T' + startTime + ':00.000Z');

    // Use a transactional flow: mark availability as booked, then create the session
    try {
      const createdSession = await prisma.$transaction(async (tx) => {
        // First, update the availability slot to mark it as booked
        const updateRes = await tx.therapistAvailability.updateMany({
          where: {
            id: availability.id,
            isBooked: false // Only update if still unbooked
          },
          data: { isBooked: true }
        });

        if (updateRes.count === 0) {
          throw new Error('SLOT_ALREADY_BOOKED');
        }

        // Determine the booking rate - free if isFree is true, otherwise use therapist rate
        const bookedRate = availability.isFree ? 0 : (child.primaryTherapist?.session_rate ? Number(child.primaryTherapist.session_rate) : 0);

        // Create the therapy session
        const sessionRecord = await tx.therapySession.create({
          data: {
            patientId: child.id,
            therapistId: primaryTherapistId,
            scheduledAt,
            duration: Number(duration),
            type: sessionType,
            bookedRate
          }
        });

        return sessionRecord;
      });

      return NextResponse.json({
        session: createdSession,
        message: 'Session booked successfully'
      }, { status: 201 });

    } catch (err) {
      const maybeErr = err as Error | undefined;
      if (maybeErr?.message === 'SLOT_ALREADY_BOOKED') {
        return NextResponse.json({ error: 'Slot already booked' }, { status: 409 });
      }
      throw err;
    }

  } catch (error) {
    console.error('Error booking session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
