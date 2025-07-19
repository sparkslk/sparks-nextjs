import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, context: { params: { childId: string } }) {
  const { childId } = await context.params; // Await params before destructuring

  // Get all medications for this child (using patientId)
  const medications = await prisma.medication.findMany({
    where: { patientId: childId },
    select: { id: true, name: true, dosage: true, frequency: true, customFrequency: true, instructions: true, mealTiming: true, isActive: true, isDiscontinued: true, startDate: true, endDate: true },
  });
  const medicationIds = medications.map((m: { id: string }) => m.id);

  type Medication = {
    id: string;
    name: string;
    dosage: string | null;
    frequency: string | null;
    customFrequency: string | null;
    instructions: string | null;
    mealTiming: string | null;
    isActive: boolean;
    isDiscontinued: boolean;
    startDate: Date | null;
    endDate: Date | null;
  };

  const medIdToDetails = Object.fromEntries(medications.map((m: Medication) => [m.id, m]));

  // Get all medication history for these medications, include user info
  const history = await prisma.medicationHistory.findMany({
    where: { medicationId: { in: medicationIds } },
    include: {
      medication: true,
      // changedBy is a user id, get user name/email if possible
      // We'll fetch user info separately for all unique changedBy ids
    },
    orderBy: { changedAt: 'desc' },
  });

  // Get all unique user ids who made changes
  const userIds = Array.from(new Set(history.map(h => h.changedBy).filter(Boolean)));
  let users: Record<string, { name: string | null, email: string | null }> = {};
  if (userIds.length > 0) {
    const userList = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    users = Object.fromEntries(userList.map(u => [u.id, { name: u.name, email: u.email }]));
  }

  // Attach medication details and user info to each history record
  const historyWithDetails = history.map((h) => ({
    ...h,
    medicationName: medIdToDetails[h.medicationId]?.name || '',
    medicationDetails: medIdToDetails[h.medicationId] || {},
    changedByUser: users[h.changedBy] || null,
  }));

  return NextResponse.json({ history: historyWithDetails });
}