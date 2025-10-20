import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to create a consistent month key (e.g., "Oct 2025")
const getMonthKey = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// --- 1. Handler for User Registration Growth Chart ---
async function handleUserRegistration() {
    const endDate = new Date();
    // Start date is August 1st of the current year
    const startDate = new Date(endDate.getFullYear(), 7, 1); 

    const patients = await prisma.patient.findMany({ where: { createdAt: { gte: startDate, lte: endDate } }, select: { createdAt: true } });
    const guardians = await prisma.parentGuardian.findMany({ where: { createdAt: { gte: startDate, lte: endDate } }, select: { createdAt: true } });
    const therapists = await prisma.therapist.findMany({ where: { createdAt: { gte: startDate, lte: endDate } }, select: { createdAt: true } });

    const monthlyData: Record<string, { patients: number; guardians: number; therapists: number }> = {};
    
    // Initialize all months from start to end date to ensure no gaps
    let currentLoopDate = new Date(startDate);
    while (currentLoopDate.getFullYear() < endDate.getFullYear() || (currentLoopDate.getFullYear() === endDate.getFullYear() && currentLoopDate.getMonth() <= endDate.getMonth())) {
        const key = getMonthKey(currentLoopDate);
        monthlyData[key] = { patients: 0, guardians: 0, therapists: 0 };
        currentLoopDate.setMonth(currentLoopDate.getMonth() + 1);
    }

    // Aggregate new users per month
    patients.forEach(p => { const key = getMonthKey(p.createdAt); if (monthlyData[key]) monthlyData[key].patients++; });
    guardians.forEach(g => { const key = getMonthKey(g.createdAt); if (monthlyData[key]) monthlyData[key].guardians++; });
    therapists.forEach(t => { const key = getMonthKey(t.createdAt); if (monthlyData[key]) monthlyData[key].therapists++; });

    const monthlyResult = Object.entries(monthlyData).map(([month, data]) => ({ month, ...data }));

    // Calculate cumulative (running total) for the chart
    return monthlyResult.reduce<typeof monthlyResult>((acc, current, index) => {
        const previous = index > 0 ? acc[index - 1] : { patients: 0, guardians: 0, therapists: 0 };
        acc.push({
            month: current.month,
            patients: previous.patients + current.patients,
            guardians: previous.guardians + current.guardians,
            therapists: previous.therapists + current.therapists,
        });
        return acc;
    }, []);
}


// --- 2. Handler for Therapist Leaderboard Chart ---
async function handleTherapistLeaderboard() {
    const therapists = await prisma.therapist.findMany({
        include: { user: { select: { name: true } } },
    });

    const leaderboardData = await Promise.all(
        therapists.map(async (therapist) => {
            const sessionCount = await prisma.therapySession.count({ where: { therapistId: therapist.id } });
            const distinctPatients = await prisma.therapySession.findMany({ where: { therapistId: therapist.id }, distinct: ['patientId'] });
            return {
                name: therapist.user.name,
                sessionCount: sessionCount,
                patientCount: distinctPatients.length,
            };
        })
    );

    return leaderboardData.sort((a, b) => b.sessionCount - a.sessionCount).slice(0, 5);
}


// --- 3. Handler for Session Growth Chart ---
async function handleSessionGrowth() {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), 7, 1); // August 1st

    const sessions = await prisma.therapySession.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        select: { createdAt: true },
    });

    const monthlyData: Record<string, { sessions: number }> = {};

    let currentLoopDate = new Date(startDate);
    while (currentLoopDate.getFullYear() < endDate.getFullYear() || (currentLoopDate.getFullYear() === endDate.getFullYear() && currentLoopDate.getMonth() <= endDate.getMonth())) {
        const key = getMonthKey(currentLoopDate);
        monthlyData[key] = { sessions: 0 };
        currentLoopDate.setMonth(currentLoopDate.getMonth() + 1);
    }
    
    sessions.forEach(session => {
        const key = getMonthKey(session.createdAt);
        if (monthlyData[key]) {
            monthlyData[key].sessions++;
        }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({ month, ...data }));
}


// --- 4. Handler for Revenue Breakdown Chart ---
async function handleRevenueBreakdown() {
    // Sum all payments to calculate commission
    const paymentAggregation = await prisma.payment.aggregate({
        _sum: { amount: true },
    });
    
    // Sum all donations
    const donationAggregation = await prisma.donation.aggregate({
        _sum: { amount: true },
    });

    // Convert Prisma's Decimal type to a number before calculation
    const totalPayments = paymentAggregation._sum.amount?.toNumber() || 0;
    const totalDonations = donationAggregation._sum.amount?.toNumber() || 0;

    // Calculate 10% commission
    const commissionTotal = totalPayments * 0.10;

    return [
        { name: 'Therapy Commissions', value: commissionTotal },
        { name: 'Donations', value: totalDonations },
    ];
}

// --- 5. Handler to fetch all donations with details ---
async function handleAllDonations() {
  const donations = await prisma.donation.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      donorName: true,
      amount: true,
      donorPhone: true,
      donorEmail: true,
      message: true,
      createdAt: true,
    },
  });
  return donations;
}

// --- Main GET Function to Route Requests ---
export async function GET(request: NextRequest) {
  try {
    const chartType = request.nextUrl.searchParams.get('chart');

    let data;
    switch (chartType) {
      case 'therapistLeaderboard':
        data = await handleTherapistLeaderboard();
        break;
      case 'sessionGrowth':
        data = await handleSessionGrowth();
        break;
      case 'revenueBreakdown':
        data = await handleRevenueBreakdown();
        break;
      case 'allDonations':
        data = await handleAllDonations();
        break;
      default:
        data = await handleUserRegistration();
        break;
    }
    
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while fetching analytics data." },
      { status: 500 }
    );
  }
}