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
                                    gte: new Date()
                                }
                            }
                        },
                        assessments: {
                            where: {
                                assessmentDate: {
                                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                                }
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

        // Format children data
        const children = parentGuardianRelations.map(relation => ({
            id: relation.patient.id,
            firstName: relation.patient.firstName,
            lastName: relation.patient.lastName,
            upcomingSessions: relation.patient.therapySessions.length,
            progressReports: relation.patient.assessments.length
        }));

        // Calculate total upcoming sessions
        const totalUpcomingSessions = children.reduce((sum, child) => sum + child.upcomingSessions, 0);

        // Format recent updates
        const recentUpdates = notifications.map(notification => ({
            id: notification.id,
            message: notification.message,
            timestamp: new Date(notification.createdAt).toLocaleString(),
            type: notification.isUrgent ? "warning" as const : "info" as const
        }));

        const parentData = {
            children,
            totalUpcomingSessions,
            unreadMessages,
            recentUpdates
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
