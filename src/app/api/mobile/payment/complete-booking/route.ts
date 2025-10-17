import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

/**
 * Complete booking after successful payment
 * Mobile API endpoint - uses JWT token authentication
 *
 * This endpoint is called after payment is verified as COMPLETED.
 * It creates the TherapySession and marks the slot as booked.
 *
 * Body (JSON):
 * - orderId: Payment order ID
 */
export async function POST(request: NextRequest) {
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

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    // Find the payment
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: {
        patient: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify payment belongs to this user
    if (payment.patient?.userId !== payload.userId) {
      return NextResponse.json(
        { error: "Unauthorized - payment does not belong to you" },
        { status: 403 }
      );
    }

    // Verify payment is completed
    if (payment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Payment is not completed. Current status: ${payment.status}` },
        { status: 400 }
      );
    }

    // Check if session already created
    if (payment.sessionId) {
      const existingSession = await prisma.therapySession.findUnique({
        where: { id: payment.sessionId },
        include: {
          therapist: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (existingSession) {
        return NextResponse.json({
          message: "Session already booked",
          session: {
            id: existingSession.id,
            scheduledAt: existingSession.scheduledAt,
            duration: existingSession.duration,
            status: existingSession.status,
            bookedRate: existingSession.bookedRate,
            therapist: {
              id: existingSession.therapist.id,
              name: existingSession.therapist.user.name,
            },
          },
        });
      }
    }

    // Extract booking details from payment metadata
    const metadata = payment.metadata as Record<string, unknown>;
    const bookingDetails = metadata?.bookingDetails as Record<string, unknown> | undefined;

    if (!bookingDetails) {
      return NextResponse.json(
        { error: "No booking details found in payment" },
        { status: 400 }
      );
    }

    const date = bookingDetails.date as string;
    const timeSlot = bookingDetails.timeSlot as string;
    const therapistId = bookingDetails.therapistId as string;
    const sessionType = bookingDetails.sessionType as string | undefined;
    const availabilitySlotId = bookingDetails.availabilitySlotId as string;

    // Parse the date and time
    const inputDate = new Date(date);
    const [timeSlotStart] = timeSlot.split("-");
    const cleanTimeSlot = timeSlotStart.trim();

    // Parse time to create session datetime
    const time24Match = cleanTimeSlot.match(/^(\d{1,2}):(\d{2})$/);
    if (!time24Match) {
      return NextResponse.json(
        { error: "Invalid time format in booking details" },
        { status: 400 }
      );
    }

    const hours = parseInt(time24Match[1]);
    const minutes = parseInt(time24Match[2]);

    const dateStr = `${inputDate.getFullYear()}-${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getDate().toString().padStart(2, '0')}`;
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    const sessionDate = new Date(`${dateStr}T${timeStr}.000Z`);

    // Create the session and mark slot as booked in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mark availability slot as booked
      const updateRes = await tx.therapistAvailability.updateMany({
        where: {
          id: availabilitySlotId,
          isBooked: false,
        },
        data: { isBooked: true },
      });

      if (updateRes.count === 0) {
        throw new Error('SLOT_ALREADY_BOOKED');
      }

      // Create therapy session
      const therapySession = await tx.therapySession.create({
        data: {
          patientId: payment.patient!.id,
          therapistId: therapistId,
          scheduledAt: sessionDate,
          duration: 45,
          status: "SCHEDULED",
          type: sessionType || "Individual",
          bookedRate: payment.amount,
        },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          therapist: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Link payment to session
      await tx.payment.update({
        where: { id: payment.id },
        data: { sessionId: therapySession.id },
      });

      return therapySession;
    });

    // Create notifications
    const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const notificationMessage = `New therapy session scheduled for ${result.patient.firstName} ${result.patient.lastName} on ${sessionDate.toLocaleDateString()} at ${startTime}`;

    await prisma.notification.createMany({
      data: [
        {
          senderId: payload.userId,
          receiverId: result.therapist.user.id,
          type: "APPOINTMENT",
          title: "New Session Booked",
          message: notificationMessage,
          isRead: false,
        },
        {
          receiverId: payload.userId,
          type: "APPOINTMENT",
          title: "Booking Confirmed",
          message: `Your session with ${result.therapist.user.name} has been confirmed for ${sessionDate.toLocaleDateString()} at ${startTime}`,
          isRead: false,
        },
      ],
    });

    return NextResponse.json({
      message: "Session booked successfully",
      session: {
        id: result.id,
        scheduledAt: result.scheduledAt,
        duration: result.duration,
        status: result.status,
        bookedRate: result.bookedRate,
        therapist: {
          id: result.therapist.id,
          name: result.therapist.user.name,
        },
      },
    });

  } catch (error) {
    console.error("Error completing booking:", error);

    const maybeErr = error as Error | undefined;
    if (maybeErr?.message === 'SLOT_ALREADY_BOOKED') {
      return NextResponse.json(
        { error: 'This time slot has already been booked' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
