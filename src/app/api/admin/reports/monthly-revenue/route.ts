import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  try {
    // Get the month parameter (format: YYYY-MM)
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    if (!month) {
      return NextResponse.json(
        { error: "Month parameter is required (format: YYYY-MM)" },
        { status: 400 }
      );
    }

    // Parse the month
    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999); // Last day of month
    
    // If current month, use current date as end date
    const now = new Date();
    const isCurrentMonth = year === now.getFullYear() && monthNum - 1 === now.getMonth();
    const effectiveEndDate = isCurrentMonth ? now : endDate;

    // 1. Get ALL therapy session payments (SCHEDULED or COMPLETED with payments)
    const bookedSessions = await prisma.therapySession.findMany({
      where: {
        scheduledAt: {
          gte: startDate,
          lte: effectiveEndDate,
        },
        status: {
          in: ["SCHEDULED", "COMPLETED"],
        },
      },
      include: {
        Payment: {
          where: {
            status: "COMPLETED",
          },
        },
      },
    });

    let therapyRevenue = 0;
    let therapyCommission = 0;
    const therapyTransactions = bookedSessions
      .filter(session => session.Payment && session.Payment.length > 0)
      .map(session => {
        const payment = session.Payment[0];
        const amount = payment.amount.toNumber();
        const commission = amount * 0.1; // Platform always gets 10% commission on scheduled sessions
        therapyRevenue += amount;
        therapyCommission += commission;
        
        return {
          id: payment.id,
          date: session.scheduledAt,
          type: "Therapy Session",
          description: `Session Payment - ${session.id} (${session.status})`,
          amount: amount,
          commission: commission,
          status: session.status,
          isRefunded: false,
        };
      });

    // 2. Get refunded sessions
    const refunds = await prisma.cancelRefund.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: effectiveEndDate,
        },
        refundStatus: "COMPLETED",
      },
      include: {
        session: true,
      },
    });

    const refundTransactions = refunds.map(refund => {
      const refundAmount = refund.refundAmount.toNumber();
      const originalAmount = refund.originalAmount.toNumber();
      const refundPercentage = refund.refundPercentage.toNumber();
      const hoursBeforeSession = refund.hoursBeforeSession.toNumber();
      
      // Calculate commission based on refund policy
      // Before 24hrs (>= 24): 90% refunded, 10% to platform
      // Within 24hrs (< 24): 60% refunded, 10% to platform, 30% to therapist
      // Platform ALWAYS gets 10% on any scheduled session (already counted in therapyCommission)
      // So refunds don't reduce platform commission, only patient gets money back
      
      return {
        id: refund.id,
        date: refund.createdAt,
        type: "Session Refund",
        description: `Refund ${refundPercentage}% - Cancelled ${hoursBeforeSession.toFixed(1)}hrs before session`,
        amount: -refundAmount,
        commission: 0, // Platform keeps 10% commission regardless of refund
        status: "Refunded",
        isRefunded: true,
        refundDetails: {
          originalAmount,
          refundAmount,
          refundPercentage,
          hoursBeforeSession,
        },
      };
    });

    // 3. Get donations
    const donations = await prisma.donation.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: effectiveEndDate,
        },
        paymentStatus: "COMPLETED",
      },
    });

    let donationRevenue = 0;
    const donationTransactions = donations.map(donation => {
      const amount = donation.amount.toNumber();
      donationRevenue += amount;
      
      return {
        id: donation.id,
        date: donation.createdAt,
        type: "Donation",
        description: `Donation from ${donation.isAnonymous ? "Anonymous" : donation.donorName || "Donor"}`,
        amount: amount,
        commission: 0, // No commission on donations
        status: "Completed",
        isRefunded: false,
      };
    });

    // Combine all transactions
    const allTransactions = [
      ...therapyTransactions,
      ...refundTransactions,
      ...donationTransactions,
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate totals
    const totalRevenue = therapyRevenue + donationRevenue;
    const totalCommission = therapyCommission;
    const netRevenue = totalCommission + donationRevenue;

    const report = {
      month,
      period: {
        start: startDate.toISOString(),
        end: effectiveEndDate.toISOString(),
        isCurrentMonth,
      },
      summary: {
        totalRevenue: totalRevenue,
        therapyRevenue: therapyRevenue,
        donationRevenue: donationRevenue,
        totalCommission: totalCommission,
        netRevenue: netRevenue,
        transactionCount: allTransactions.length,
      },
      breakdown: {
        bookedSessions: bookedSessions.filter(s => s.Payment && s.Payment.length > 0).length,
        scheduledSessions: bookedSessions.filter(s => s.status === "SCHEDULED" && s.Payment && s.Payment.length > 0).length,
        completedSessions: bookedSessions.filter(s => s.status === "COMPLETED" && s.Payment && s.Payment.length > 0).length,
        refundedSessions: refunds.length,
        donations: donations.length,
      },
      transactions: allTransactions,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating monthly revenue report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
