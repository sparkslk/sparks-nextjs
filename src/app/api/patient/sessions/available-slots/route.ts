import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * Get available therapy session slots for a patient on a specific date
 * Web API endpoint - uses session authentication
 *
 * Query Parameters:
 * - date: Date to check availability (YYYY-MM-DD format) - REQUIRED
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireApiAuth(request);

    if (session.user.role !== "NORMAL_USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json(
        { error: "Missing date parameter" },
        { status: 400 }
      );
    }

    // Get the patient and verify they exist
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        primaryTherapistId: true,
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found. Please create a profile first." },
        { status: 404 }
      );
    }

    if (!patient.primaryTherapistId) {
      return NextResponse.json(
        { error: "No assigned therapist. Please select a therapist first." },
        { status: 400 }
      );
    }

    // Get the therapist details
    const therapist = await prisma.therapist.findUnique({
      where: { id: patient.primaryTherapistId },
      select: {
        id: true,
        session_rate: true,
        user: {
          select: {
            name: true
          }
        }
      }
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Assigned therapist not found" },
        { status: 404 }
      );
    }

    console.log(`Patient Dashboard - Querying for date: ${dateStr}`);

    // Create target date for comparison (start and end of the day in UTC)
    const targetDate = new Date(dateStr + 'T00:00:00.000Z');
    const nextDay = new Date(dateStr + 'T00:00:00.000Z');
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    console.log(`Target date range: ${targetDate.toISOString()} to ${nextDay.toISOString()}`);

    // Get all availability slots for this therapist on the exact date
    const availabilitySlots = await prisma.therapistAvailability.findMany({
      where: {
        therapistId: patient.primaryTherapistId,
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
        therapistName: therapist.user.name,
        therapistId: therapist.id,
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
        slotId: slot.id,
        slot: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}-${adjustedEndHours.toString().padStart(2, '0')}:${adjustedEndMinutes.toString().padStart(2, '0')}`,
        startTime: slot.startTime,
        isAvailable: !slot.isBooked,
        isBooked: slot.isBooked,
        isBlocked: false,
        isFree: slot.isFree,
        cost: slot.isFree ? 0 : Number(therapist.session_rate || 0)
      };
    });

    console.log(`Returning ${timeSlots.length} processed time slots`);

    return NextResponse.json({
      availableSlots: timeSlots,
      therapistName: therapist.user.name,
      therapistId: therapist.id,
      date: dateStr
    });

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
