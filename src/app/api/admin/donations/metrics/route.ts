import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    // Require ADMIN role
    await requireApiAuth(req, ["ADMIN"]);

    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    // Completed donations
    const completedDonations = await prisma.donation.findMany({
      where: { paymentStatus: "COMPLETED" },
      select: { amount: true, createdAt: true },
    });

    const toNumber = (d: { amount: unknown }) => parseFloat(String(d.amount));

    const totalAmount = completedDonations.reduce((sum, d) => sum + toNumber(d), 0);
    const totalCount = completedDonations.length;
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    const last7 = completedDonations.filter((d) => d.createdAt >= last7Days);
    const last7DaysTotal = last7.reduce((sum, d) => sum + toNumber(d), 0);
    const last7DaysCount = last7.length;

    const last30 = completedDonations.filter((d) => d.createdAt >= last30Days);
    const last30DaysTotal = last30.reduce((sum, d) => sum + toNumber(d), 0);
    const last30DaysCount = last30.length;

    const statusBreakdown = await prisma.donation.groupBy({
      by: ["paymentStatus"],
      _count: { paymentStatus: true },
    });

    const statusCounts = statusBreakdown.reduce((acc: Record<string, number>, item) => {
      acc[item.paymentStatus] = item._count.paymentStatus;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthly = completedDonations.filter((d) => d.createdAt >= sixMonthsAgo);
    const monthlyTrendMap: Record<string, { count: number; total: number }> = {};
    monthly.forEach((d) => {
      const key = `${d.createdAt.getFullYear()}-${String(d.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyTrendMap[key]) monthlyTrendMap[key] = { count: 0, total: 0 };
      monthlyTrendMap[key].count += 1;
      monthlyTrendMap[key].total += toNumber(d);
    });
    const monthlyTrend = Object.entries(monthlyTrendMap)
      .map(([month, data]) => ({ month, count: data.count, total: Math.round(data.total * 100) / 100 }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({
      success: true,
      data: {
        allTime: {
          totalAmount: Math.round(totalAmount * 100) / 100,
          totalCount,
          averageAmount: Math.round(averageAmount * 100) / 100,
        },
        last7Days: { totalAmount: Math.round(last7DaysTotal * 100) / 100, totalCount: last7DaysCount },
        last30Days: { totalAmount: Math.round(last30DaysTotal * 100) / 100, totalCount: last30DaysCount },
        statusBreakdown: statusCounts,
        monthlyTrend,
      },
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Error fetching donation metrics:", error);
    return NextResponse.json({ error: "Failed to fetch donation metrics" }, { status: 500 });
  }
}

