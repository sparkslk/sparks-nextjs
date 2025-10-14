import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

/**
 * Get available therapy session slots for a patient on a specific date
 * Mobile API endpoint - uses JWT token authentication
 *
 * Query Parameters:
 * - date: Date to check availability (YYYY-MM-DD format) - REQUIRED
 * - therapistId: Therapist ID to check availability for - REQUIRED
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const therapistId = searchParams.get("therapistId");

    if (!dateStr) {
      return NextResponse.json(
        { error: "Missing date parameter" },
        { status: 400 }
      );
    }

    if (!therapistId) {
      return NextResponse.json(
        { error: "Missing therapistId parameter. Please specify which therapist's availability to check." },
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
      console.log(`Auto-assigning therapist ${therapistId} to patient ${patient.id}`);

      patient = await prisma.patient.update({
        where: { id: patient.id },
        data: { primaryTherapistId: therapistId }
      });

      // Create notification for therapist about new patient
      try {
        const therapistUser = await prisma.therapist.findUnique({
          where: { id: therapistId },
          select: { userId: true }
        });

        if (therapistUser) {
          await prisma.notification.create({
            data: {
              senderId: payload.userId,
              receiverId: therapistUser.userId,
              type: "SYSTEM",
              title: "New Patient",
              message: `${patient.firstName} ${patient.lastName} has selected you as their therapist and is viewing your available slots.`,
              isUrgent: false
            }
          });
        }
      } catch (notifError) {
        console.error("Failed to create notification:", notifError);
        // Don't fail the request if notification fails
      }
    }

    const targetTherapistId = therapistId;

    // Get the therapist details
    const therapist = await prisma.therapist.findUnique({
      where: { id: targetTherapistId },
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
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    console.log(`Mobile API - Querying for date: ${dateStr}`);

    // Create target date for comparison (start and end of the day in UTC)
    const targetDate = new Date(dateStr + 'T00:00:00.000Z');
    const nextDay = new Date(dateStr + 'T00:00:00.000Z');
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    console.log(`Target date range: ${targetDate.toISOString()} to ${nextDay.toISOString()}`);

    // Get all availability slots for this therapist on the exact date
    const availabilitySlots = await prisma.therapistAvailability.findMany({
      where: {
        therapistId: targetTherapistId,
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
        slot: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}-${adjustedEndHours.toString().padStart(2, '0')}:${adjustedEndMinutes.toString().padStart(2, '0')}`,
        startTime: slot.startTime,
        isAvailable: !slot.isBooked,
        isBooked: slot.isBooked,
        isBlocked: false,
        isFree: slot.isFree,
        cost: slot.isFree ? 0 : Number(therapist.session_rate || 0)
      };
    });

    console.log(`Returning ${timeSlots.length} processed time slots:`, timeSlots);

    return NextResponse.json({
      availableSlots: timeSlots,
      therapistName: therapist.user.name,
      therapistId: therapist.id,
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
