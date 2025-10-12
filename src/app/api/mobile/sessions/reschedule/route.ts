import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

/**
 * Reschedule a therapy session
 * Mobile API endpoint - uses JWT token authentication
 *
 * Body (JSON):
 * - sessionId: ID of the session to reschedule
 * - newDate: New date for the session (YYYY-MM-DD)
 * - newTimeSlot: New time slot (e.g., "14:00")
 * - rescheduleReason: Optional reason for rescheduling
 * - paymentId: Payment ID if reschedule fee was paid
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

    const {
      sessionId,
      newDate,
      newTimeSlot,
      rescheduleReason,
      paymentId
    } = await request.json();

    // Validate required fields
    if (!sessionId || !newDate || !newTimeSlot) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, newDate, newTimeSlot" },
        { status: 400 }
      );
    }

    // Get the patient
    const patient = await prisma.patient.findUnique({
      where: { userId: payload.userId }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Get the session
    const session = await prisma.therapySession.findUnique({
      where: { id: sessionId },
      include: {
        therapist: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Verify session belongs to this patient
    if (session.patientId !== patient.id) {
      return NextResponse.json(
        { error: "Session does not belong to this patient" },
        { status: 403 }
      );
    }

    // Check if session can be rescheduled
    if (!["SCHEDULED", "APPROVED", "REQUESTED"].includes(session.status)) {
      return NextResponse.json(
        { error: `Cannot reschedule session with status: ${session.status}` },
        { status: 400 }
      );
    }

    // Calculate days until session to determine if fee is required
    const now = new Date();
    const sessionDate = new Date(session.scheduledAt);
    const daysUntilSession = Math.ceil((sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const fee = daysUntilSession >= 5 ? 0 : 30;

    // If fee is required, verify payment
    if (fee > 0) {
      if (!paymentId) {
        return NextResponse.json(
          {
            error: "Payment required",
            message: `Rescheduling within ${daysUntilSession} day(s) requires a Rs. ${fee} fee. Please complete payment first.`,
            fee,
            requiresPayment: true
          },
          { status: 402 } // Payment Required
        );
      }

      // Verify payment exists and is completed
      const payment = await prisma.payment.findUnique({
        where: { paymentId }
      });

      if (!payment || payment.status !== "COMPLETED") {
        return NextResponse.json(
          { error: "Invalid or incomplete payment" },
          { status: 400 }
        );
      }

      // Verify payment amount matches fee
      if (Number(payment.amount) !== fee) {
        return NextResponse.json(
          { error: "Payment amount does not match reschedule fee" },
          { status: 400 }
        );
      }
    }

    // Parse new date and time
    const [hours, minutes] = newTimeSlot.split(':').map(Number);
    const newScheduledAt = new Date(newDate);
    newScheduledAt.setHours(hours, minutes, 0, 0);

    // Validate new date is in the future
    if (newScheduledAt <= now) {
      return NextResponse.json(
        { error: "New session date must be in the future" },
        { status: 400 }
      );
    }

    // Check if the new time slot is available
    const targetDate = new Date(newDate + 'T00:00:00.000Z');
    const nextDay = new Date(newDate + 'T00:00:00.000Z');
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const availabilitySlot = await prisma.therapistAvailability.findFirst({
      where: {
        therapistId: session.therapistId,
        startTime: newTimeSlot,
        isBooked: false,
        date: {
          gte: targetDate,
          lt: nextDay
        }
      }
    });

    if (!availabilitySlot) {
      return NextResponse.json(
        { error: "Selected time slot is not available" },
        { status: 400 }
      );
    }

    // Find and free up the old availability slot
    const oldDate = new Date(session.scheduledAt.toISOString().split('T')[0] + 'T00:00:00.000Z');
    const oldNextDay = new Date(oldDate);
    oldNextDay.setUTCDate(oldNextDay.getUTCDate() + 1);

    const [oldHours, oldMinutes] = [session.scheduledAt.getHours(), session.scheduledAt.getMinutes()];
    const oldTimeSlot = `${oldHours.toString().padStart(2, '0')}:${oldMinutes.toString().padStart(2, '0')}`;

    // Update availability slots in a transaction
    await prisma.$transaction(async (tx) => {
      // Free up old slot
      await tx.therapistAvailability.updateMany({
        where: {
          therapistId: session.therapistId,
          startTime: oldTimeSlot,
          date: {
            gte: oldDate,
            lt: oldNextDay
          }
        },
        data: {
          isBooked: false
        }
      });

      // Book new slot
      await tx.therapistAvailability.update({
        where: {
          id: availabilitySlot.id
        },
        data: {
          isBooked: true
        }
      });

      // Update session
      await tx.therapySession.update({
        where: { id: sessionId },
        data: {
          scheduledAt: newScheduledAt,
          status: "RESCHEDULED"
        }
      });

      // Create reschedule record
      await tx.sessionReschedule.create({
        data: {
          sessionId,
          previousScheduledAt: session.scheduledAt,
          newScheduledAt,
          rescheduledBy: payload.userId,
          rescheduledByRole: "NORMAL_USER",
          rescheduleReason: rescheduleReason || `Rescheduled by patient${fee > 0 ? ' (with fee)' : ''}`
        }
      });

      // Create notification for therapist
      await tx.notification.create({
        data: {
          senderId: payload.userId,
          receiverId: session.therapist.user.id,
          type: "APPOINTMENT",
          title: "Session Rescheduled",
          message: `${patient.firstName} ${patient.lastName} has rescheduled their session to ${newScheduledAt.toLocaleDateString()} at ${newTimeSlot}.${rescheduleReason ? ` Reason: ${rescheduleReason}` : ''}`,
          isUrgent: false
        }
      });
    });

    console.log(`Session ${sessionId} rescheduled successfully by patient ${patient.id}`);
    console.log(`Old: ${session.scheduledAt.toISOString()}, New: ${newScheduledAt.toISOString()}`);
    console.log(`Fee paid: ${fee > 0 ? `Rs. ${fee}` : 'Free'}`);

    return NextResponse.json({
      success: true,
      message: "Session rescheduled successfully",
      session: {
        id: sessionId,
        newScheduledAt: newScheduledAt.toISOString(),
        therapistName: session.therapist.user.name,
        feePaid: fee
      }
    });

  } catch (error) {
    console.error("Error rescheduling session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
