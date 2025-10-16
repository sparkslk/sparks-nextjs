import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
    const sessions = await prisma.therapySession.findMany({
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
      },
      orderBy: { scheduledAt: "desc" },
    });

    // Calculate statistics
    const totalSessions = sessions.length;
    
    // Count by status
    const completedSessions = sessions.filter((s: { status: string }) => s.status === "COMPLETED").length;
    const scheduledSessions = sessions.filter((s: { status: string }) => 
      ["SCHEDULED", "APPROVED"].includes(s.status)
    ).length;
    const cancelledSessions = sessions.filter((s: { status: string }) => 
      ["CANCELLED"].includes(s.status)
    ).length;
    const noShowSessions = sessions.filter((s: { status: string }) => s.status === "NO_SHOW").length;

    // Calculate paid vs free sessions
    const paidSessions = sessions.filter((s: { bookedRate: any }) => 
      s.bookedRate && Number(s.bookedRate) > 0
    ).length;
    const freeSessions = sessions.filter((s: { bookedRate: any }) => 
      !s.bookedRate || Number(s.bookedRate) === 0
    ).length;

    // Calculate total income
    const totalIncome = sessions.reduce((sum: number, session: any) => {
      // Check if session has completed payment
      const hasCompletedPayment = session.Payment.some(
        (payment: { status: string }) => payment.status === "COMPLETED"
      );
      
      if (hasCompletedPayment && session.bookedRate) {
        return sum + Number(session.bookedRate);
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
    const sessionsByType = sessions.reduce((acc: Record<string, number>, session: any) => {
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
        },
      });

      const monthIncome = monthSessions.reduce((sum: number, session: any) => {
        const hasCompletedPayment = session.Payment.some(
          (payment: { status: string }) => payment.status === "COMPLETED"
        );
        if (hasCompletedPayment && session.bookedRate) {
          return sum + Number(session.bookedRate);
        }
        return sum;
      }, 0);

      monthlyIncomeData.push({
        month: monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        income: monthIncome,
        sessions: monthSessions.filter((s: { status: string }) => s.status === "COMPLETED").length,
      });
    }

    // Prepare session status data for chart
    const sessionStatusData = [
      { status: "Completed", count: completedSessions, color: "#10b981" },
      { status: "Scheduled", count: scheduledSessions, color: "#3b82f6" },
      { status: "Cancelled", count: cancelledSessions, color: "#ef4444" },
      { status: "No Show", count: noShowSessions, color: "#f59e0b" },
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
      sessions: sessions.map((session: any) => ({
        id: session.id,
        patientName: `${session.patient.firstName} ${session.patient.lastName}`,
        patientId: session.patient.id,
        scheduledAt: session.scheduledAt,
        duration: session.duration,
        type: session.type,
        status: session.status,
        bookedRate: session.bookedRate ? Number(session.bookedRate) : 0,
        isPaid: session.Payment.some((p: { status: string }) => p.status === "COMPLETED"),
      })),
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
