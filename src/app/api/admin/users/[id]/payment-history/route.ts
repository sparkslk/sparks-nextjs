import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: patientId } = await params;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: { select: { name: true } } },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Get all therapy sessions for this patient with payments
    const sessions = await prisma.therapySession.findMany({
      where: { patientId },
      include: {
        Payment: {
          where: { status: "COMPLETED" },
        },
        therapist: {
          include: { user: { select: { name: true } } },
        },
        cancelRefund: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Process payments
    const payments = sessions
      .filter(session => session.Payment && session.Payment.length > 0)
      .map(session => {
        const payment = session.Payment[0];
        return {
          id: payment.id,
          amount: payment.amount.toNumber(),
          status: payment.status,
          paymentMethod: payment.paymentMethod || "Unknown",
          createdAt: payment.createdAt,
          sessionId: session.id,
          sessionStatus: session.status,
          sessionScheduledAt: session.scheduledAt,
          therapistName: session.therapist.user.name,
          type: "payment" as const,
        };
      });

    // Process refunds
    const refunds = sessions
      .filter(session => session.cancelRefund)
      .map(session => {
        const refund = session.cancelRefund!;
        return {
          id: refund.id,
          refundAmount: refund.refundAmount.toNumber(),
          originalAmount: refund.originalAmount.toNumber(),
          refundPercentage: refund.refundPercentage.toNumber(),
          refundStatus: refund.refundStatus,
          createdAt: refund.createdAt,
          sessionId: session.id,
          hoursBeforeSession: refund.hoursBeforeSession.toNumber(),
          cancelReason: refund.cancelReason || "No reason provided",
          therapistName: session.therapist.user.name,
          type: "refund" as const,
        };
      });

    // Combine and sort all transactions by date (latest first)
    const allTransactions = [...payments, ...refunds].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Latest first
    });

    // Calculate summary
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalRefunded = refunds.reduce((sum, refund) => sum + refund.refundAmount, 0);
    const netAmount = totalPaid - totalRefunded;
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === "COMPLETED").length;
    const cancelledSessions = sessions.filter(s => s.cancelRefund).length;

    const summary = {
      totalPaid,
      totalRefunded,
      netAmount,
      totalSessions,
      completedSessions,
      cancelledSessions,
    };

    return NextResponse.json({
      payments,
      refunds,
      allTransactions, // New unified chronological list
      summary,
    });

  } catch (error) {
    console.error("Error fetching payment history:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while fetching payment history" },
      { status: 500 }
    );
  }
}
