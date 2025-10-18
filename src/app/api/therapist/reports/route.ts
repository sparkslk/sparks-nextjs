import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Define types for the session data
type SessionWithPaymentAndPatient = {
  id: string;
  status: string;
  type: string | null;
  bookedRate: Prisma.Decimal | null;
  scheduledAt: Date;
  duration: number;
  sessionNotes: string | null;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  Payment: {
    status: string;
    amount: Prisma.Decimal;
  }[];
  cancelRefund?: {
    id: string;
    originalAmount: Prisma.Decimal;
    refundAmount: Prisma.Decimal;
    refundPercentage: Prisma.Decimal;
    refundStatus: string;
  } | null;
};

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get therapist profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { therapistProfile: true },
    });

    if (!user?.therapistProfile) {
      return NextResponse.json(
        { error: "Therapist profile not found" },
        { status: 404 }
      );
    }

    const therapistId = user.therapistProfile.id;

    // Get query parameters for filtering
    const searchParams = req.nextUrl.searchParams;
    const filterType = searchParams.get("filterType") || "all"; // all, weekly, monthly, custom
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const patientId = searchParams.get("patientId");

    // Build date filter
    let dateFilter: Prisma.TherapySessionWhereInput["scheduledAt"] = {};
    const now = new Date();

    switch (filterType) {
      case "weekly":
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = { gte: weekAgo };
        break;
      case "monthly":
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = { gte: monthAgo };
        break;
      case "custom":
        if (startDate) {
          dateFilter.gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          dateFilter.lte = end;
        }
        break;
    }

    // Build where clause
    const whereClause: Prisma.TherapySessionWhereInput = {
      therapistId,
      scheduledAt: dateFilter,
    };

    if (patientId) {
      whereClause.patientId = patientId;
    }

    // Fetch all sessions matching criteria
    const sessions: SessionWithPaymentAndPatient[] = await prisma.therapySession.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        Payment: {
          select: {
            amount: true,
            status: true,
          },
        },
        cancelRefund: {
          select: {
            id: true,
            originalAmount: true,
            refundAmount: true,
            refundPercentage: true,
            refundStatus: true,
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });

    // Calculate statistics
    const totalSessions = sessions.length;
    
    // Count by status
    const completedSessions = sessions.filter((s) => s.status === "COMPLETED").length;
    const scheduledSessions = sessions.filter((s) => 
      ["SCHEDULED", "APPROVED"].includes(s.status)
    ).length;
    const cancelledSessions = sessions.filter((s) => 
      ["CANCELLED"].includes(s.status)
    ).length;
    const noShowSessions = sessions.filter((s) => s.status === "NO_SHOW").length;

    // Calculate paid vs free sessions
    const paidSessions = sessions.filter((s) => 
      s.bookedRate && Number(s.bookedRate) > 0
    ).length;
    const freeSessions = sessions.filter((s) => 
      !s.bookedRate || Number(s.bookedRate) === 0
    ).length;

    // Calculate total income
    // For completed sessions: therapist gets 90% of bookedRate
    // For NO_SHOW sessions: therapist gets 90% of bookedRate
    // For cancelled sessions with refunds:
    //   - If refundPercentage = 60%, therapist gets 30% of originalAmount
    //   - If refundPercentage = 90%, therapist gets 0%
    const totalIncome = sessions.reduce((sum: number, session) => {
      // Handle completed sessions
      if (session.status === "COMPLETED") {
        // Check if session has completed payment
        const hasCompletedPayment = session.Payment.some(
          (payment) => payment.status === "COMPLETED"
        );
        
        if (hasCompletedPayment && session.bookedRate) {
          // Therapist gets 90% of the booked rate
          const therapistShare = Number(session.bookedRate) * 0.9;
          return sum + therapistShare;
        }
      }
      
      // Handle NO_SHOW sessions (treat like completed)
      if (session.status === "NO_SHOW") {
        const hasCompletedPayment = session.Payment.some(
          (payment) => payment.status === "COMPLETED"
        );
        
        if (hasCompletedPayment && session.bookedRate) {
          // Therapist gets 90% of the booked rate
          const therapistShare = Number(session.bookedRate) * 0.9;
          return sum + therapistShare;
        }
      }
      
      // Handle cancelled sessions with refunds
      if (session.status === "CANCELLED" && session.cancelRefund) {
        const refundPercentage = Number(session.cancelRefund.refundPercentage);
        const originalAmount = Number(session.cancelRefund.originalAmount);
        
        if (refundPercentage === 60) {
          // Therapist gets 30% of original amount
          const therapistShare = originalAmount * 0.3;
          return sum + therapistShare;
        }
        // If refundPercentage === 90, therapist gets 0%, so don't add anything
      }
      
      return sum;
    }, 0);

    // Calculate no-show and cancellation rates
    const noShowRate = totalSessions > 0 
      ? ((noShowSessions / totalSessions) * 100).toFixed(1)
      : "0.0";
    const cancellationRate = totalSessions > 0 
      ? ((cancelledSessions / totalSessions) * 100).toFixed(1)
      : "0.0";

    // Get patient list for filter dropdown
    const patients = await prisma.patient.findMany({
      where: {
        therapySessions: {
          some: {
            therapistId,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: {
        firstName: "asc",
      },
    });

    // Prepare session breakdown by type
    const sessionsByType = sessions.reduce((acc: Record<string, number>, session) => {
      const type = session.type || "Other";
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type]++;
      return acc;
    }, {} as Record<string, number>);

    // Prepare monthly income data (last 6 months)
    const monthlyIncomeData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

      const monthSessions = await prisma.therapySession.findMany({
        where: {
          therapistId,
          scheduledAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        include: {
          Payment: {
            select: {
              amount: true,
              status: true,
            },
          },
          cancelRefund: {
            select: {
              originalAmount: true,
              refundPercentage: true,
            },
          },
        },
      });

      const monthIncome = monthSessions.reduce((sum: number, session) => {
        // Handle completed sessions
        if (session.status === "COMPLETED") {
          const hasCompletedPayment = session.Payment.some(
            (payment) => payment.status === "COMPLETED"
          );
          if (hasCompletedPayment && session.bookedRate) {
            // Therapist gets 90% of the booked rate
            return sum + (Number(session.bookedRate) * 0.9);
          }
        }
        
        // Handle NO_SHOW sessions (treat like completed)
        if (session.status === "NO_SHOW") {
          const hasCompletedPayment = session.Payment.some(
            (payment) => payment.status === "COMPLETED"
          );
          if (hasCompletedPayment && session.bookedRate) {
            // Therapist gets 90% of the booked rate
            return sum + (Number(session.bookedRate) * 0.9);
          }
        }
        
        // Handle cancelled sessions with refunds
        if (session.status === "CANCELLED" && session.cancelRefund) {
          const refundPercentage = Number(session.cancelRefund.refundPercentage);
          const originalAmount = Number(session.cancelRefund.originalAmount);
          
          if (refundPercentage === 60) {
            // Therapist gets 30% of original amount
            return sum + (originalAmount * 0.3);
          }
          // If refundPercentage === 90, therapist gets 0%
        }
        
        return sum;
      }, 0);

      monthlyIncomeData.push({
        month: monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        income: monthIncome,
        sessions: monthSessions.filter((s) => s.status === "COMPLETED").length,
      });
    }

    // Prepare session status data for chart with system-aligned colors
    const sessionStatusData = [
      { status: "Completed", count: completedSessions, color: "#10b981" }, // emerald-500 - professional green
      { status: "Scheduled", count: scheduledSessions, color: "#8159A8" }, // primary purple
      { status: "Cancelled", count: cancelledSessions, color: "#ef4444" }, // red-500 - professional red
      { status: "No Show", count: noShowSessions, color: "#f59e0b" }, // amber-500 - professional orange
    ];

    // Prepare paid vs free data for chart
    const paidVsFreeData = [
      { type: "Paid Sessions", count: paidSessions, color: "#8159A8" },
      { type: "Free Sessions", count: freeSessions, color: "#e0d4f0" },
    ];

    return NextResponse.json({
      summary: {
        totalSessions,
        completedSessions,
        scheduledSessions,
        cancelledSessions,
        noShowSessions,
        paidSessions,
        freeSessions,
        totalIncome: totalIncome.toFixed(2),
        noShowRate,
        cancellationRate,
      },
      charts: {
        sessionStatusData,
        paidVsFreeData,
        sessionsByType: Object.entries(sessionsByType).map(([type, count]) => ({
          type,
          count,
        })),
        monthlyIncomeData,
      },
      patients,
      sessions: sessions.map((session) => {
        const bookedRateValue = session.bookedRate ? Number(session.bookedRate) : 0;
        let therapistAmount = 0;
        let systemFeeOrRefund = 0;
        let breakdown = "";

        // Calculate therapist amount based on session status
        if (session.status === "COMPLETED") {
          const hasCompletedPayment = session.Payment.some((p) => p.status === "COMPLETED");
          if (hasCompletedPayment && bookedRateValue > 0) {
            therapistAmount = bookedRateValue * 0.9;
            systemFeeOrRefund = bookedRateValue * 0.1;
            breakdown = `Total: LKR ${bookedRateValue.toFixed(2)} | System Fee (10%): LKR ${systemFeeOrRefund.toFixed(2)} | Your Share (90%): LKR ${therapistAmount.toFixed(2)}`;
          }
        } else if (session.status === "NO_SHOW") {
          // Treat NO_SHOW like completed sessions
          const hasCompletedPayment = session.Payment.some((p) => p.status === "COMPLETED");
          if (hasCompletedPayment && bookedRateValue > 0) {
            therapistAmount = bookedRateValue * 0.9;
            systemFeeOrRefund = bookedRateValue * 0.1;
            breakdown = `Total: LKR ${bookedRateValue.toFixed(2)} | System Fee (10%): LKR ${systemFeeOrRefund.toFixed(2)} | Your Share (90%): LKR ${therapistAmount.toFixed(2)}`;
          }
        } else if (session.status === "CANCELLED" && session.cancelRefund) {
          const refundPercentage = Number(session.cancelRefund.refundPercentage);
          const originalAmount = Number(session.cancelRefund.originalAmount);
          
          if (refundPercentage === 60) {
            therapistAmount = originalAmount * 0.3;
            systemFeeOrRefund = originalAmount * 0.6; // Refund to patient
            breakdown = `Original: LKR ${originalAmount.toFixed(2)} | Refund (60%): LKR ${systemFeeOrRefund.toFixed(2)} | Your Share (30%): LKR ${therapistAmount.toFixed(2)}`;
          } else if (refundPercentage === 90) {
            therapistAmount = 0;
            systemFeeOrRefund = originalAmount * 0.9; // Refund to patient
            breakdown = `Original: LKR ${originalAmount.toFixed(2)} | Refund (90%): LKR ${systemFeeOrRefund.toFixed(2)} | Your Share: LKR 0.00`;
          }
        }

        return {
          id: session.id,
          patientName: `${session.patient.firstName} ${session.patient.lastName}`,
          patientId: session.patient.id,
          scheduledAt: session.scheduledAt,
          duration: session.duration,
          type: session.type,
          status: session.status,
          bookedRate: bookedRateValue,
          therapistAmount,
          systemFeeOrRefund,
          breakdown,
          sessionNotes: session.sessionNotes,
          isPaid: session.Payment.some((p) => p.status === "COMPLETED"),
          hasRefund: !!session.cancelRefund,
          refundPercentage: session.cancelRefund ? Number(session.cancelRefund.refundPercentage) : 0,
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
