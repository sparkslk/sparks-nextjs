import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";

/**
 * Admin Donations Metrics API
 * GET endpoint that returns donation statistics and KPIs
 *
 * Returns:
 * - Total donation amount (all time, COMPLETED only)
 * - Total donation count (all time, COMPLETED only)
 * - Average donation amount
 * - Last 7 days total and count
 * - Last 30 days total and count
 * - Status breakdown (count by status)
 * - Monthly trend (last 6 months)
 */
export async function GET(req: NextRequest) {
  try {
    // Require ADMIN role
    await requireApiAuth(req, ["ADMIN"]);

    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    // Get all completed donations for total stats
    const completedDonations = await prisma.donation.findMany({
      where: {
        paymentStatus: "COMPLETED",
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Calculate totals
    const totalAmount = completedDonations.reduce(
      (sum, d) => sum + parseFloat(d.amount.toString()),
      0
    );
    const totalCount = completedDonations.length;
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    // Last 7 days
    const last7DaysDonations = completedDonations.filter(
      (d) => d.createdAt >= last7Days
    );
    const last7DaysTotal = last7DaysDonations.reduce(
      (sum, d) => sum + parseFloat(d.amount.toString()),
      0
    );
    const last7DaysCount = last7DaysDonations.length;

    // Last 30 days
    const last30DaysDonations = completedDonations.filter(
      (d) => d.createdAt >= last30Days
    );
    const last30DaysTotal = last30DaysDonations.reduce(
      (sum, d) => sum + parseFloat(d.amount.toString()),
      0
    );
    const last30DaysCount = last30DaysDonations.length;

    // Status breakdown
    const statusBreakdown = await prisma.donation.groupBy({
      by: ["paymentStatus"],
      _count: {
        paymentStatus: true,
      },
    });

    const statusCounts = statusBreakdown.reduce(
      (acc: Record<string, number>, item) => {
        acc[item.paymentStatus] = item._count.paymentStatus;
        return acc;
      },
      {}
    );

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyDonations = completedDonations.filter(
      (d) => d.createdAt >= sixMonthsAgo
    );

    // Group by month
    const monthlyTrend: Record<string, { count: number; total: number }> = {};

    monthlyDonations.forEach((donation) => {
      const monthKey = `${donation.createdAt.getFullYear()}-${String(
        donation.createdAt.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyTrend[monthKey]) {
        monthlyTrend[monthKey] = { count: 0, total: 0 };
      }

      monthlyTrend[monthKey].count++;
      monthlyTrend[monthKey].total += parseFloat(donation.amount.toString());
    });

    // Convert to array and sort
    const monthlyTrendArray = Object.entries(monthlyTrend)
      .map(([month, data]) => ({
        month,
        count: data.count,
        total: Math.round(data.total * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Get top donors (non-anonymous, COMPLETED donations)
    const topDonorsData = await prisma.donation.findMany({
      where: {
        paymentStatus: "COMPLETED",
        isAnonymous: false,
        donorEmail: {
          not: null,
        },
      },
      select: {
        donorName: true,
        donorEmail: true,
        amount: true,
      },
    });

    // Group by email and sum amounts
    const donorTotals: Record<
      string,
      { name: string; email: string; total: number; count: number }
    > = {};

    topDonorsData.forEach((donation) => {
      const email = donation.donorEmail!;
      if (!donorTotals[email]) {
        donorTotals[email] = {
          name: donation.donorName || "Unknown",
          email: email,
          total: 0,
          count: 0,
        };
      }
      donorTotals[email].total += parseFloat(donation.amount.toString());
      donorTotals[email].count++;
    });

    // Get top 5 donors
    const topDonors = Object.values(donorTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((donor) => ({
        name: donor.name,
        email: donor.email,
        totalAmount: Math.round(donor.total * 100) / 100,
        donationCount: donor.count,
      }));

    return NextResponse.json({
      success: true,
      data: {
        allTime: {
          totalAmount: Math.round(totalAmount * 100) / 100,
          totalCount,
          averageAmount: Math.round(averageAmount * 100) / 100,
        },
        last7Days: {
          totalAmount: Math.round(last7DaysTotal * 100) / 100,
          totalCount: last7DaysCount,
        },
        last30Days: {
          totalAmount: Math.round(last30DaysTotal * 100) / 100,
          totalCount: last30DaysCount,
        },
        statusBreakdown: statusCounts,
        monthlyTrend: monthlyTrendArray,
        topDonors,
      },
    });
  } catch (error) {
    console.error("Error fetching donation metrics:", error);

    // Check if error is from requireApiAuth
    if (error instanceof NextResponse) {
      return error;
    }

    return NextResponse.json(
      { error: "Failed to fetch donation metrics" },
      { status: 500 }
    );
  }
}
