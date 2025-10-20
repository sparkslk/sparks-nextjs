import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

/**
 * Cancel a therapy session
 * Mobile API endpoint - uses JWT token authentication
 *
 * Body (JSON):
 * - sessionId: ID of the session to cancel
 * - cancellationReason: Optional reason for cancellation
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

    const { sessionId, cancellationReason } = await request.json();

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing required field: sessionId" },
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
        },
        Payment: true
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

    // Check if session can be cancelled
    if (!["SCHEDULED", "APPROVED", "REQUESTED", "RESCHEDULED"].includes(session.status)) {
      return NextResponse.json(
        { error: `Cannot cancel session with status: ${session.status}` },
        { status: 400 }
      );
    }

    // Calculate hours until session to determine refund
    const now = new Date();
    const sessionDate = new Date(session.scheduledAt);
    const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundAmount = 0;
    let cancellationFee = 0;
    let refundStatus = "NO_REFUND";

    // Determine refund based on cancellation policy
    // Get the first payment for this session
    const sessionPayment = session.Payment && session.Payment.length > 0 ? session.Payment[0] : null;
    const paymentAmount = sessionPayment ? Number(sessionPayment.amount) : 0;

    if (hoursUntilSession >= 24) {
      // 90% refund for 24+ hours notice (10% cancellation fee)
      refundAmount = paymentAmount * 0.90;
      cancellationFee = paymentAmount * 0.10;
      refundStatus = "PARTIAL_REFUND_90";
    } else if (hoursUntilSession >= 0) {
      // 60% refund for within 24 hours (40% cancellation fee)
      refundAmount = paymentAmount * 0.60;
      cancellationFee = paymentAmount * 0.40;
      refundStatus = "PARTIAL_REFUND_60";
    } else {
      // Session already passed
      refundStatus = "NO_REFUND";
      refundAmount = 0;
      cancellationFee = paymentAmount;
    }

    // Free up the availability slot and update session in a transaction
    await prisma.$transaction(async (tx) => {
      // Free up the availability slot
      const sessionDateOnly = new Date(session.scheduledAt.toISOString().split('T')[0] + 'T00:00:00.000Z');
      const nextDay = new Date(sessionDateOnly);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      const [hours, minutes] = [session.scheduledAt.getHours(), session.scheduledAt.getMinutes()];
      const timeSlot = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      await tx.therapistAvailability.updateMany({
        where: {
          therapistId: session.therapistId,
          startTime: timeSlot,
          date: {
            gte: sessionDateOnly,
            lt: nextDay
          }
        },
        data: {
          isBooked: false
        }
      });

      // Update session status
      await tx.therapySession.update({
        where: { id: sessionId },
        data: {
          status: "CANCELLED"
        }
      });

      // Note: CancelRefund model is designed for parent-guardian refunds with bank details
      // For mobile patient cancellations, we track this via payment metadata instead

      // Update payment metadata if refund is applicable
      // Note: Payment status remains COMPLETED but refund info is tracked in metadata
      if (sessionPayment && refundAmount > 0) {
        await tx.payment.update({
          where: { id: sessionPayment.id },
          data: {
            metadata: {
              ...(sessionPayment.metadata as object || {}),
              refundAmount,
              cancellationFee,
              refundInitiatedAt: new Date().toISOString(),
              refundReason: "Session cancelled by patient",
              refundStatus
            }
          }
        });
      }

      // Create notification for therapist
      await tx.notification.create({
        data: {
          senderId: payload.userId,
          receiverId: session.therapist.user.id,
          type: "APPOINTMENT",
          title: "Session Cancelled",
          message: `${patient.firstName} ${patient.lastName} has cancelled their session scheduled for ${sessionDate.toLocaleDateString()} at ${timeSlot}.${cancellationReason ? ` Reason: ${cancellationReason}` : ''}`,
          isUrgent: false
        }
      });
    });

    console.log(`Session ${sessionId} cancelled successfully by patient ${patient.id}`);
    console.log(`Scheduled date: ${session.scheduledAt.toISOString()}`);
    console.log(`Hours until session: ${hoursUntilSession.toFixed(2)}`);
    console.log(`Refund status: ${refundStatus}, Amount: Rs. ${refundAmount.toFixed(2)}, Fee: Rs. ${cancellationFee.toFixed(2)}`);

    return NextResponse.json({
      success: true,
      message: "Session cancelled successfully",
      cancellation: {
        sessionId,
        cancelledAt: new Date().toISOString(),
        refundStatus,
        refundAmount: Number(refundAmount.toFixed(2)),
        cancellationFee: Number(cancellationFee.toFixed(2)),
        hoursUntilSession: Number(hoursUntilSession.toFixed(2)),
        therapistName: session.therapist.user.name
      }
    });

  } catch (error) {
    console.error("Error cancelling session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
