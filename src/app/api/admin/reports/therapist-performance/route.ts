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

    // Get all therapists
    const therapists = await prisma.therapist.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Get performance data for each therapist
    const performanceData = await Promise.all(
      therapists.map(async (therapist) => {
        // Get all sessions in the period
        const sessions = await prisma.therapySession.findMany({
          where: {
            therapistId: therapist.id,
            scheduledAt: {
              gte: startDate,
              lte: effectiveEndDate,
            },
          },
          include: {
            Payment: {
              where: {
                status: "COMPLETED",
              },
            },
            cancelRefund: true,
          },
        });

        // Count sessions by status
        const scheduledSessions = sessions.filter(s => s.status === "SCHEDULED").length;
        const completedSessions = sessions.filter(s => s.status === "COMPLETED").length;
        const cancelledSessions = sessions.filter(s => s.status === "CANCELLED").length;
        const noShowSessions = sessions.filter(s => s.status === "NO_SHOW").length;

        // Get unique patients
        const uniquePatients = new Set(sessions.map(s => s.patientId));
        const patientCount = uniquePatients.size;

        // Calculate revenue from ALL scheduled/completed sessions with payments
        let totalRevenue = 0;
        let platformCommission = 0; // Platform always gets 10%
        let therapistEarnings = 0;
        
        sessions.forEach(session => {
          if (session.Payment && session.Payment.length > 0) {
            const payment = session.Payment[0];
            const amount = payment.amount.toNumber();
            totalRevenue += amount;
            platformCommission += amount * 0.1; // Platform gets 10% on ALL scheduled sessions
            
            // If not cancelled, therapist gets 90%
            if (session.status === "COMPLETED") {
              therapistEarnings += amount * 0.9;
            } else if (session.cancelRefund) {
              // If cancelled, check refund policy
              const hoursBeforeSession = session.cancelRefund.hoursBeforeSession.toNumber();
              if (hoursBeforeSession >= 24) {
                // Before 24hrs: 90% refunded to patient, 10% to platform, 0% to therapist
                therapistEarnings += 0;
              } else {
                // Within 24hrs: 60% refunded to patient, 10% to platform, 30% to therapist
                therapistEarnings += amount * 0.3;
              }
            } else if (session.status === "SCHEDULED") {
              // Scheduled but not yet happened - therapist will get 90% when completed
              therapistEarnings += amount * 0.9;
            }
          }
        });

        // Calculate refunds
        const refundedSessions = sessions.filter(s => s.cancelRefund).length;
        let refundedAmount = 0;
        sessions.forEach(session => {
          if (session.cancelRefund) {
            refundedAmount += session.cancelRefund.refundAmount.toNumber();
          }
        });

        // Net revenue for therapist (after refunds and platform commission)
        const netRevenue = therapistEarnings;

        // Calculate average session rate
        const avgSessionRate = completedSessions > 0 
          ? totalRevenue / completedSessions 
          : 0;

        // Calculate completion rate
        const totalSessionsBooked = sessions.length;
        const completionRate = totalSessionsBooked > 0 
          ? (completedSessions / totalSessionsBooked) * 100 
          : 0;

        return {
          therapistId: therapist.id,
          therapistName: therapist.user.name || therapist.user.email || "Unknown",
          therapistEmail: therapist.user.email,
          specialization: therapist.specialization,
          performance: {
            totalSessions: totalSessionsBooked,
            scheduledSessions,
            completedSessions,
            cancelledSessions,
            noShowSessions,
            refundedSessions,
            uniquePatients: patientCount,
            completionRate: parseFloat(completionRate.toFixed(2)),
          },
          revenue: {
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            refundedAmount: parseFloat(refundedAmount.toFixed(2)),
            therapistEarnings: parseFloat(netRevenue.toFixed(2)),
            platformCommission: parseFloat(platformCommission.toFixed(2)),
            avgSessionRate: parseFloat(avgSessionRate.toFixed(2)),
          },
        };
      })
    );

    // Sort by therapist earnings (descending)
    performanceData.sort((a, b) => b.revenue.therapistEarnings - a.revenue.therapistEarnings);

    // Calculate overall statistics
    const overallStats = {
      totalTherapists: therapists.length,
      activeTherapists: performanceData.filter(p => p.performance.totalSessions > 0).length,
      totalSessions: performanceData.reduce((sum, p) => sum + p.performance.totalSessions, 0),
      totalCompletedSessions: performanceData.reduce((sum, p) => sum + p.performance.completedSessions, 0),
      totalRevenue: performanceData.reduce((sum, p) => sum + p.revenue.totalRevenue, 0),
      totalPlatformCommission: performanceData.reduce((sum, p) => sum + p.revenue.platformCommission, 0),
      totalTherapistEarnings: performanceData.reduce((sum, p) => sum + p.revenue.therapistEarnings, 0),
      averageCompletionRate: performanceData.length > 0
        ? performanceData.reduce((sum, p) => sum + p.performance.completionRate, 0) / performanceData.length
        : 0,
    };

    const report = {
      month,
      period: {
        start: startDate.toISOString(),
        end: effectiveEndDate.toISOString(),
        isCurrentMonth,
      },
      overallStats,
      therapists: performanceData,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating therapist performance report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

