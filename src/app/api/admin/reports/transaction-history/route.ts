import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    if (!month) {
      return NextResponse.json(
        { error: "Month parameter is required (format: YYYY-MM)" },
        { status: 400 }
      );
    }

    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
    
    const now = new Date();
    const isCurrentMonth = year === now.getFullYear() && monthNum - 1 === now.getMonth();
    const effectiveEndDate = isCurrentMonth ? now : endDate;

    // 1. Get all completed therapy session payments
    const sessionPayments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: effectiveEndDate,
        },
        status: "COMPLETED",
        sessionId: {
          not: null,
        },
      },
      include: {
        TherapySession: {
          include: {
            therapist: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            patient: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const sessionTransactions = sessionPayments.map(payment => ({
      id: payment.id,
      transactionId: payment.orderId,
      date: payment.createdAt,
      type: "Session Booking",
      category: "THERAPY_SESSION",
      description: payment.TherapySession 
        ? `Session with ${payment.TherapySession.therapist.user.name || "Therapist"} - Patient: ${payment.TherapySession.patient.firstName} ${payment.TherapySession.patient.lastName}`
        : "Therapy Session Booking",
      amount: payment.amount.toNumber(),
      commission: payment.amount.toNumber() * 0.1,
      paymentMethod: payment.paymentMethod || "Unknown",
      status: payment.status,
      customerName: payment.TherapySession 
        ? `${payment.TherapySession.patient.firstName} ${payment.TherapySession.patient.lastName}`
        : payment.patient 
          ? `${payment.patient.firstName} ${payment.patient.lastName}`
          : "Unknown",
      sessionId: payment.sessionId,
    }));

    // 2. Get all completed donations
    const donations = await prisma.donation.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: effectiveEndDate,
        },
        paymentStatus: "COMPLETED",
      },
    });

    const donationTransactions = donations.map(donation => ({
      id: donation.id,
      transactionId: donation.payHereOrderId || donation.id,
      date: donation.createdAt,
      type: "Donation",
      category: "DONATION",
      description: donation.message || "Platform Donation",
      amount: donation.amount.toNumber(),
      commission: 0,
      paymentMethod: donation.paymentMethod || "Online Payment",
      status: donation.paymentStatus,
      customerName: donation.isAnonymous ? "Anonymous" : (donation.donorName || donation.donorEmail || "Unknown"),
      sessionId: null,
    }));

    // 3. Get all completed refunds
    const refunds = await prisma.cancelRefund.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: effectiveEndDate,
        },
        refundStatus: "COMPLETED",
      },
      include: {
        session: {
          include: {
            therapist: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            patient: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        parentUser: {
          select: {
            name: true,
          },
        },
      },
    });

    const refundTransactions = refunds.map(refund => {
      const originalAmount = refund.originalAmount.toNumber();
      const refundAmount = refund.refundAmount.toNumber();
      const hoursBeforeSession = refund.hoursBeforeSession.toNumber();
      
      // Platform keeps 10% commission on ALL scheduled sessions (no loss on refunds)
      // Before 24hrs: 90% to patient, 10% platform, 0% therapist
      // Within 24hrs: 60% to patient, 10% platform, 30% therapist
      
      return {
        id: refund.id,
        transactionId: refund.id,
        date: refund.createdAt,
        type: "Session Refund",
        category: "REFUND",
        description: `Refund ${refund.refundPercentage.toNumber()}% - Cancelled ${hoursBeforeSession.toFixed(1)}hrs before (Platform keeps 10%)`,
        amount: -refundAmount,
        commission: 0, // Platform commission already counted in session booking, no loss on refund
        paymentMethod: "Bank Transfer",
        status: refund.refundStatus,
        customerName: refund.parentUser.name || "Parent",
        sessionId: refund.sessionId,
        refundDetails: {
          originalAmount,
          refundAmount,
          refundPercentage: refund.refundPercentage.toNumber(),
          hoursBeforeSession,
          reason: refund.cancelReason,
          platformCommission: originalAmount * 0.1,
          therapistShare: hoursBeforeSession < 24 ? originalAmount * 0.3 : 0,
        },
      };
    });

    // Combine all transactions and sort by date (most recent first)
    const allTransactions = [
      ...sessionTransactions,
      ...donationTransactions,
      ...refundTransactions,
    ].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    // Calculate summary statistics
    const summary = {
      totalTransactions: allTransactions.length,
      sessionBookings: {
        count: sessionTransactions.length,
        totalAmount: sessionTransactions.reduce((sum, t) => sum + t.amount, 0),
        totalCommission: sessionTransactions.reduce((sum, t) => sum + t.commission, 0),
      },
      donations: {
        count: donationTransactions.length,
        totalAmount: donationTransactions.reduce((sum, t) => sum + t.amount, 0),
      },
      refunds: {
        count: refundTransactions.length,
        totalAmount: Math.abs(refundTransactions.reduce((sum, t) => sum + t.amount, 0)),
        platformCommissionRetained: refundTransactions.reduce((sum, t) => sum + (t.refundDetails?.platformCommission || 0), 0),
        therapistShareOnLateCancellations: refundTransactions.reduce((sum, t) => sum + (t.refundDetails?.therapistShare || 0), 0),
      },
      netRevenue: allTransactions.reduce((sum, t) => sum + t.amount, 0),
      netCommission: allTransactions.reduce((sum, t) => sum + t.commission, 0),
    };

    // Group by category
    const byCategory = {
      THERAPY_SESSION: sessionTransactions,
      DONATION: donationTransactions,
      REFUND: refundTransactions,
    };

    const report = {
      month,
      period: {
        start: startDate.toISOString(),
        end: effectiveEndDate.toISOString(),
        isCurrentMonth,
      },
      summary,
      transactions: allTransactions,
      byCategory,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating transaction history report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

