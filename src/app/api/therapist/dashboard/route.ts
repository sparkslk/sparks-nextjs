import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireApiAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/therapist/dashboard:
 *   get:
 *     summary: Get therapist dashboard data
 *     description: Retrieve dashboard information for the authenticated therapist including patients, sessions, and statistics
 *     tags:
 *       - Therapist
 *       - Dashboard
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 therapist:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Therapist ID
 *                     licenseNumber:
 *                       type: string
 *                       description: Therapist license number
 *                     specializations:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of specializations
 *                 totalPatients:
 *                   type: number
 *                   description: Total number of patients
 *                 totalSessions:
 *                   type: number
 *                   description: Total number of sessions conducted
 *                 pendingRequests:
 *                   type: number
 *                   description: Number of pending session requests
 *                 recentSessions:
 *                   type: array
 *                   description: List of recent therapy sessions
 *                   items:
 *                     type: object
 *                 upcomingAppointments:
 *                   type: array
 *                   description: List of upcoming appointments
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - user is not a therapist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Therapist profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

        // Helper function to calculate session end time
        const getSessionEndTime = (scheduledAt: Date, duration: number) => {
            return new Date(scheduledAt.getTime() + duration * 60000); // duration in minutes
        };

        // Today's Appointments
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayAppointments = therapist.therapySessions.filter((s) => {
            const sessionDate = new Date(s.scheduledAt);
            return sessionDate >= startOfDay && sessionDate <= endOfDay;
        }).length;

        // Sessions to Document
        const sessionsToDocument = therapist.therapySessions.filter((s) => {
            if (s.status !== 'SCHEDULED') return false;
            const sessionEndTime = getSessionEndTime(new Date(s.scheduledAt), s.duration);
            return sessionEndTime < new Date();
        });

        // Stats
        const stats = {
            totalPatients: therapist.patients.length,
            todayAppointments,
            completedSessions: therapist.therapySessions.filter((s) => s.status === 'COMPLETED').length,
            pendingTasks: tasks.filter((t) => t.status !== 'COMPLETED').length,
            sessionsToDocument: sessionsToDocument.length,
        };

        // Chart data for session overview (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date;
        }).reverse();

        const sessionChartData = last7Days.map(date => {
            const sessionsOnDate = therapist.therapySessions.filter(s => {
                const sessionDate = new Date(s.scheduledAt);
                return sessionDate.toDateString() === date.toDateString();
            });
            
            return {
                date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                scheduled: sessionsOnDate.filter(s => s.status === 'SCHEDULED').length,
                completed: sessionsOnDate.filter(s => s.status === 'COMPLETED').length,
                cancelled: sessionsOnDate.filter(s => s.status === 'CANCELLED').length,
            };
        });

        // Patient engagement data
        const engagementData = [
            { 
                level: 'High', 
                count: therapist.therapySessions.filter(s => s.patientEngagement === 'HIGH').length,
                color: '#22c55e'
            },
            { 
                level: 'Medium', 
                count: therapist.therapySessions.filter(s => s.patientEngagement === 'MEDIUM').length,
                color: '#f59e0b'
            },
            { 
                level: 'Low', 
                count: therapist.therapySessions.filter(s => s.patientEngagement === 'LOW').length,
                color: '#ef4444'
            },
        ];

        // Monthly progress data (last 6 months)
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            return date;
        }).reverse();

        const progressData = last6Months.map(date => {
            const sessionsInMonth = therapist.therapySessions.filter(s => {
                const sessionDate = new Date(s.scheduledAt);
                return sessionDate.getMonth() === date.getMonth() && 
                       sessionDate.getFullYear() === date.getFullYear();
            });
            
            return {
                month: date.toLocaleDateString('en-US', { month: 'short' }),
                sessions: sessionsInMonth.length,
                completed: sessionsInMonth.filter(s => s.status === 'COMPLETED').length,
            };
        });

        // Recent activities (last 5 sessions)
        const recentActivities = therapist.therapySessions
            .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
            .slice(0, 5)
            .map((s) => ({
                id: s.id,
                type: "session" as const,
                title: `Session with ${s.patient.firstName} ${s.patient.lastName}`,
                description: s.sessionNotes || `${s.type} session`,
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

        return NextResponse.json({ 
            stats, 
            recentActivities, 
            upcomingAppointments,
            chartData: {
                sessionOverview: sessionChartData,
                patientEngagement: engagementData,
                monthlyProgress: progressData
            }
        });
    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching therapist dashboard data:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
