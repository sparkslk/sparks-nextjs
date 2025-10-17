import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['PARENT_GUARDIAN']);

        // Get all children that this parent/guardian is responsible for
        const parentGuardianRelations = await prisma.parentGuardian.findMany({
            where: { userId: session.user.id },
            include: {
                patient: {
                    include: {
                        therapySessions: {
                            where: {
                                scheduledAt: { gte: new Date() },
                                status: { in: ['APPROVED', 'SCHEDULED'] }
                            }
                        },
                        // NOTE: The Assessments table in the database no longer contains a patientId
                        // column in the current deployment. Avoid including assessments here to prevent
                        // Prisma trying to select non-existent columns. We will fallback to a safe
                        // default (0) for progressReports below.
                        primaryTherapist: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });

        if (parentGuardianRelations.length === 0) {
            // No children enrolled - return null to trigger empty state
            return NextResponse.json(null);
        }

        // Get notifications for recent updates
        const notifications = await prisma.notification.findMany({
            where: {
                receiverId: session.user.id,
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            },
            orderBy: { createdAt: "desc" },
            take: 5
        });

        // Count unread messages/notifications
        const unreadMessages = await prisma.notification.count({
            where: {
                receiverId: session.user.id,
                isRead: false
            }
        });

        // Use a single 'now' variable for the whole function
        const now = new Date();

        // Format children data with complete information
        const children = await Promise.all(
            parentGuardianRelations.map(async (relation) => {
                // Calculate progress percentage as tasks completed for the current month
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                const allTasksThisMonth = await prisma.task.findMany({
                    where: {
                        patientId: relation.patient.id,
                        dueDate: {
                            gte: startOfMonth,
                            lte: endOfMonth
                        }
                    }
                });
                const completedTasksThisMonth = allTasksThisMonth.filter(task => task.status === 'COMPLETED');
                const progressPercentage = allTasksThisMonth.length > 0 ? Math.round((completedTasksThisMonth.length / allTasksThisMonth.length) * 100) : 0;

                // Get last session date
                const lastSession = await prisma.therapySession.findFirst({
                    where: {
                        patientId: relation.patient.id,
                        status: 'COMPLETED'
                    },
                    orderBy: { scheduledAt: 'desc' }
                });

                // Fetch patient user image
                let patientImage = null;
                if (relation.patient.userId) {
                    const patientUser = await prisma.user.findUnique({
                        where: { id: relation.patient.userId },
                        select: { image: true }
                    });
                    patientImage = patientUser?.image || null;
                }

                // Fix: Count upcoming sessions with status SCHEDULED and scheduledAt >= now
                const upcomingSessions = await prisma.therapySession.count({
                    where: {
                        patientId: relation.patient.id,
                        status: 'SCHEDULED',
                        scheduledAt: { gte: now }
                    }
                });

                // Debug logging for next upcoming session
                const scheduledCount = await prisma.therapySession.count({
                    where: {
                        patientId: relation.patient.id,
                        status: 'SCHEDULED',
                        scheduledAt: { gte: now }
                    }
                });
                console.error('Debug nextUpcomingSession:', {
                    patientId: relation.patient.id,
                    now,
                    scheduledCount
                });

                // Get next upcoming session (soonest SCHEDULED session in the future)
                const nextUpcomingSession = await prisma.therapySession.findFirst({
                    where: {
                        patientId: relation.patient.id,
                        status: 'SCHEDULED',
                        scheduledAt: { gte: now }
                    },
                    orderBy: { scheduledAt: 'asc' }
                });
                console.error('Next upcoming session result:', nextUpcomingSession);

                return {
                    id: relation.patient.id,
                    firstName: relation.patient.firstName,
                    lastName: relation.patient.lastName,
                    dateOfBirth: relation.patient.dateOfBirth?.toISOString() || '',
                    relationship: relation.relationship,
                    isPrimary: relation.isPrimary,
                    upcomingSessions,
                    nextUpcomingSession: nextUpcomingSession?.scheduledAt
                        ? new Date(nextUpcomingSession.scheduledAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'Asia/Colombo'
                        })
                        : null,
                    // assessments are not included to avoid querying a non-existent patientId column
                    progressReports: 0,
                    progressPercentage,
                    lastSession: lastSession?.scheduledAt
                        ? (() => {
                            const d = new Date(lastSession.scheduledAt);
                            return d.toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                                timeZone: 'Asia/Colombo'
                            });
                        })()
                        : null,
                    therapist: relation.patient.primaryTherapist ? {
                        name: relation.patient.primaryTherapist.user.name || 'Unknown Therapist',
                        email: relation.patient.primaryTherapist.user.email || '',
                        image: relation.patient.primaryTherapist.user.image || null
                    } : null,
                    image: patientImage
                };
            })
        );

        // Calculate total upcoming sessions across all children
        const totalUpcomingSessions = children.reduce((sum, child) => sum + child.upcomingSessions, 0);

        // Get parent's name and image from user table
        const parentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, image: true }
        });

        // Format recent updates from notifications
        let recentUpdates = notifications.map(notification => ({
            id: notification.id,
            message: notification.message,
            timestamp: new Date(notification.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            type: notification.isUrgent ? "warning" as const : "info" as const
        }));

        // Add mock therapist messages if no real updates
        if (recentUpdates.length === 0) {
            recentUpdates = [
                {
                    id: 'mock1',
                    message: 'Dr. Ravindi Fernando: Your child had a great session today! Keep up the good work at home.',
                    timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    type: 'info'
                },
                {
                    id: 'mock2',
                    message: 'Dr. Ravindi Fernando: Please remember to complete the progress questionnaire before the next session.',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    type: 'info'
                }

            ];
        }

        const parentData = {
            children,
            totalUpcomingSessions,
            unreadMessages,
            recentUpdates,
            parentName: parentUser?.name,
            parentImage: parentUser?.image
        };

        return NextResponse.json(parentData);

    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching parent dashboard data:", error);
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 });
    }
}
