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
                                scheduledAt: {
                                    gte: new Date() // Only future sessions from current date/time
                                },
                                status: 'APPROVED' // Only approved upcoming sessions
                            }
                        },
                        assessments: {
                            where: {
                                assessmentDate: {
                                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                                }
                            }
                        },
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

        // Format children data with complete information
        const children = await Promise.all(
            parentGuardianRelations.map(async (relation) => {
                // Calculate progress percentage based on completed sessions vs total scheduled
                const totalSessions = await prisma.therapySession.count({
                    where: { patientId: relation.patient.id }
                });
                const completedSessions = await prisma.therapySession.count({
                    where: {
                        patientId: relation.patient.id,
                        status: 'COMPLETED'
                    }
                });
                
                // Calculate progress percentage (as decimal from 0-100)
                const progressPercentage = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

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

                return {
                    id: relation.patient.id,
                    firstName: relation.patient.firstName,
                    lastName: relation.patient.lastName,
                    dateOfBirth: relation.patient.dateOfBirth?.toISOString() || '',
                    relationship: relation.relationship,
                    isPrimary: relation.isPrimary,
                    upcomingSessions: relation.patient.therapySessions.length,
                    progressReports: relation.patient.assessments.length,
                    progressPercentage,
                    lastSession: lastSession?.scheduledAt
  ? (() => {
      const d = new Date(lastSession.scheduledAt);
      const utc = new Date(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds()
      );
      return utc.toLocaleString('en-US', {
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
        const recentUpdates = notifications.map(notification => ({
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
