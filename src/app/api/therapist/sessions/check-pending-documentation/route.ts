import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * API endpoint to check for sessions that need documentation
 * and send reminder notifications to the therapist
 */
export async function POST(request: NextRequest) {
    try {
        const session = await requireApiAuth(request, ['THERAPIST']);

        // Get therapist profile
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { therapistProfile: true }
        });

        if (!user?.therapistProfile) {
            return NextResponse.json(
                { error: "Therapist profile not found" },
                { status: 404 }
            );
        }

        const therapistId = user.therapistProfile.id;
        const now = new Date();

        // Find sessions that need documentation:
        // 1. Session end time has passed
        // 2. Status is still SCHEDULED or APPROVED (not completed)
        // 3. Session happened in the last 7 days (don't send notifications for very old sessions)
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const sessionsNeedingDocumentation = await prisma.therapySession.findMany({
            where: {
                therapistId: therapistId,
                status: {
                    in: ['SCHEDULED', 'APPROVED']
                },
                scheduledAt: {
                    gte: sevenDaysAgo, // Only sessions from last 7 days
                    lt: now // Session start time has passed
                }
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        user: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                scheduledAt: 'desc'
            }
        });

        // Filter sessions where end time has passed
        const overdueDocumentationSessions = sessionsNeedingDocumentation.filter(s => {
            const sessionEndTime = new Date(s.scheduledAt.getTime() + s.duration * 60 * 1000);
            return sessionEndTime < now;
        });

        // Check which sessions already have recent notifications (sent in last 24 hours)
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recentNotifications = await prisma.notification.findMany({
            where: {
                receiverId: user.id,
                type: 'REMINDER',
                title: 'Session Documentation Reminder',
                createdAt: {
                    gte: oneDayAgo
                }
            },
            select: {
                message: true
            }
        });

        // Extract session IDs from recent notification messages
        const notifiedSessionIds = new Set<string>();
        recentNotifications.forEach(notif => {
            // Parse session ID from message if it contains one
            const match = notif.message.match(/session ID: ([a-zA-Z0-9]+)/);
            if (match) {
                notifiedSessionIds.add(match[1]);
            }
        });

        // Send notifications for sessions that don't have recent notifications
        const notificationPromises = overdueDocumentationSessions
            .filter(s => !notifiedSessionIds.has(s.id))
            .map(async (therapySession) => {
                const patientName = `${therapySession.patient.firstName} ${therapySession.patient.lastName}`;
                const sessionDate = therapySession.scheduledAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // Create notification
                return prisma.notification.create({
                    data: {
                        senderId: user.id, // System notification from themselves
                        receiverId: user.id,
                        type: 'REMINDER',
                        title: 'Session Documentation Reminder',
                        message: `Please complete documentation for your session with ${patientName} (${sessionDate}). Session ID: ${therapySession.id}`,
                        isRead: false,
                        isUrgent: false
                    }
                });
            });

        const createdNotifications = await Promise.all(notificationPromises);

        return NextResponse.json(
            {
                message: "Documentation check completed",
                sessionsNeedingDocumentation: overdueDocumentationSessions.length,
                notificationsSent: createdNotifications.length,
                sessions: overdueDocumentationSessions.map(s => ({
                    id: s.id,
                    patientName: `${s.patient.firstName} ${s.patient.lastName}`,
                    scheduledAt: s.scheduledAt,
                    duration: s.duration
                }))
            },
            { status: 200 }
        );
    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error checking pending documentation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
