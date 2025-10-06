import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { calculateRefund, validateBankDetails } from "@/lib/refund-utils";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { sessionId, cancelReason, bankDetails } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Find the therapy session and verify the user has permission to cancel it
    const therapySession = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        patient: {
          parentGuardians: {
            some: {
              userId: user.id
            }
          }
        }
      },
      include: {
        patient: true,
        therapist: {
          include: {
            user: true
          }
        }
      }
    });

    if (!therapySession) {
      return NextResponse.json({ error: "Session not found or unauthorized" }, { status: 404 });
    }

    // Check if session is already cancelled or completed
    if (therapySession.status === "CANCELLED") {
      return NextResponse.json({ error: "Session is already cancelled" }, { status: 400 });
    }

    if (therapySession.status === "COMPLETED") {
      return NextResponse.json({ error: "Cannot cancel a completed session" }, { status: 400 });
    }

    // Calculate refund details
    const cancellationTime = new Date();
    const sessionTime = new Date(therapySession.scheduledAt);
    const originalAmount = Number(therapySession.bookedRate || 0);

    const refundCalculation = calculateRefund(sessionTime, originalAmount, cancellationTime);

    // If refund is due and bank details are provided, create refund request
    if (refundCalculation.canRefund && bankDetails) {
      const { bankAccountName, bankName, accountNumber, branchCode, swiftCode } = bankDetails;

      // Validate bank details
      const validation = validateBankDetails({
        bankAccountName,
        bankName,
        accountNumber,
        branchCode,
        swiftCode
      });

      if (!validation.isValid) {
        return NextResponse.json({
          error: "Invalid bank details: " + validation.errors.join(", ")
        }, { status: 400 });
      }

      // Create refund record
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).cancelRefund.create({
        data: {
          sessionId: sessionId,
          parentUserId: user.id,
          originalAmount: originalAmount,
          refundAmount: refundCalculation.refundAmount,
          refundPercentage: refundCalculation.refundPercentage,
          cancellationTime: cancellationTime,
          sessionTime: sessionTime,
          hoursBeforeSession: refundCalculation.hoursBeforeSession,
          cancelReason: cancelReason,
          bankAccountName: bankAccountName,
          bankName: bankName,
          accountNumber: accountNumber,
          branchCode: branchCode,
          swiftCode: swiftCode,
          refundStatus: "PENDING"
        }
      });
    }

    // Update the session status to CANCELLED
    const updatedSession = await prisma.therapySession.update({
      where: {
        id: sessionId
      },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
        sessionNotes: cancelReason ? `Cancelled by parent. Reason: ${cancelReason}` : "Cancelled by parent"
      }
    });

    // Create a notification for the therapist
    await prisma.notification.create({
      data: {
        receiverId: therapySession.therapist.userId,
        senderId: user.id,
        type: "APPOINTMENT",
        title: "Session Cancelled",
        message: `A therapy session scheduled for ${therapySession.scheduledAt.toLocaleDateString()} has been cancelled by the parent.${refundCalculation.canRefund ? ` Refund of Rs.${refundCalculation.refundAmount.toFixed(2)} (${refundCalculation.refundPercentage}%) has been requested.` : ''}`,
        isUrgent: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Session cancelled successfully",
      session: {
        id: updatedSession.id,
        status: updatedSession.status,
        updatedAt: updatedSession.updatedAt
      },
      refund: {
        originalAmount: refundCalculation.originalAmount,
        refundAmount: refundCalculation.refundAmount,
        refundPercentage: refundCalculation.refundPercentage,
        hoursBeforeSession: refundCalculation.hoursBeforeSession.toFixed(1),
        refundRequested: refundCalculation.canRefund && bankDetails ? true : false
      }
    });

  } catch (error) {
    console.error("Error cancelling session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}