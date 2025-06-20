import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// Get notifications for the authenticated user
export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req);
        const url = new URL(req.url);
        const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

        const notifications = await prisma.notification.findMany({
            where: {
                receiverId: session.user.id,
                ...(unreadOnly ? { isRead: false } : {})
            },
            include: {
                sender: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50 // Limit to 50 notifications
        });

        return NextResponse.json({
            notifications: notifications.map(notification => ({
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                isRead: notification.isRead,
                isUrgent: notification.isUrgent,
                sender: notification.sender ? {
                    name: notification.sender.name || notification.sender.email,
                    email: notification.sender.email
                } : null,
                createdAt: notification.createdAt
            })),
            unreadCount: unreadOnly ? notifications.length : undefined
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

// Mark notifications as read
export async function PATCH(req: NextRequest) {
    try {
        const session = await requireApiAuth(req);
        const { notificationIds, markAllAsRead } = await req.json();

        if (markAllAsRead) {
            // Mark all notifications as read for this user
            await prisma.notification.updateMany({
                where: {
                    receiverId: session.user.id,
                    isRead: false
                },
                data: {
                    isRead: true
                }
            });
        } else if (notificationIds && Array.isArray(notificationIds)) {
            // Mark specific notifications as read
            await prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                    receiverId: session.user.id
                },
                data: {
                    isRead: true
                }
            });
        } else {
            return NextResponse.json(
                { error: "Invalid request. Provide either notificationIds array or markAllAsRead: true" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            message: "Notifications marked as read successfully"
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error updating notifications:", error);
        return NextResponse.json(
            { error: "Failed to update notifications" },
            { status: 500 }
        );
    }
}
