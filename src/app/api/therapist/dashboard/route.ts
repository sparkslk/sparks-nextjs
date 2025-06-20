import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    // Use NextAuth JWT for API route auth
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'THERAPIST') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find therapist by userId and include related data
    const therapist = await prisma.therapist.findUnique({
        where: { userId: token.sub },
        include: {
            patients: true,
            therapySessions: true,
        },
    });

    // Fetch tasks assigned to this therapist's patients
    const patientIds = therapist?.patients.map(p => p.id) || [];
    const tasks = await prisma.task.findMany({
        where: { patientId: { in: patientIds } },
    });

    if (!therapist) {
        return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    // Stats
    const stats = {
        totalPatients: therapist.patients.length,
        todayAppointments: therapist.therapySessions.filter((s) => {
            const today = new Date();
            const sessionDate = new Date(s.scheduledAt);
            return sessionDate.toDateString() === today.toDateString();
        }).length,
        completedSessions: therapist.therapySessions.filter((s) => s.status === 'COMPLETED').length,
        pendingTasks: tasks.filter((t) => t.status !== 'COMPLETED').length,
    };

    // Recent activities (last 5 sessions)
    const recentActivities = therapist.therapySessions
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
        .slice(0, 5)
        .map((s) => ({
            id: s.id,
            type: s.type,
            title: `Session with ${s.patientId}`,
            description: s.notes || '',
            time: s.scheduledAt,
            status: s.status,
        }));

    // Upcoming appointments (next 5 sessions)
    const now = new Date();
    const upcomingAppointments = therapist.therapySessions
        .filter((s) => new Date(s.scheduledAt) > now)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 5)
        .map((s) => ({
            id: s.id,
            patientId: s.patientId,
            time: s.scheduledAt,
            type: s.type,
            status: s.status,
        }));

    return NextResponse.json({ stats, recentActivities, upcomingAppointments });
}
