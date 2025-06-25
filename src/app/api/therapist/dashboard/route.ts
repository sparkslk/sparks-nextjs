import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireApiAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);

        // Find therapist by userId and include related data
        const therapist = await prisma.therapist.findUnique({
            where: { userId: session.user.id },
            include: {
                patients: true,
                therapySessions: {
                    include: {
                        patient: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
            },
        });

        if (!therapist) {
            return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
        }

        // Fetch tasks assigned to this therapist's patients
        const patientIds = therapist.patients.map(p => p.id);
        const tasks = await prisma.task.findMany({
            where: { patientId: { in: patientIds } },
        });

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
                type: "session" as const,
                title: `Session with ${s.patient.firstName} ${s.patient.lastName}`,
                description: s.notes || `${s.type} session`,
                time: s.scheduledAt,
                status: s.status.toLowerCase(),
            }));

        // Upcoming appointments (next 5 sessions)
        const now = new Date();
        const upcomingAppointments = therapist.therapySessions
            .filter((s) => new Date(s.scheduledAt) > now)
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
            .slice(0, 5)
            .map((s) => ({
                id: s.id,
                patientName: `${s.patient.firstName} ${s.patient.lastName}`,
                time: s.scheduledAt,
                type: s.type,
                status: s.status.toLowerCase(),
            }));

        return NextResponse.json({ stats, recentActivities, upcomingAppointments });
    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching therapist dashboard data:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
