import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Retrieve notifications for the authenticated user
 *     tags:
 *       - Notifications
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Filter to show only unread notifications
 *         example: true
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Notification ID
 *                   title:
 *                     type: string
 *                     description: Notification title
 *                   message:
 *                     type: string
 *                     description: Notification message
 *                   type:
 *                     type: string
 *                     enum: ["INFO", "WARNING", "ERROR", "SUCCESS"]
 *                     description: Notification type
 *                   isRead:
 *                     type: boolean
 *                     description: Whether the notification has been read
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Creation timestamp
 *                   sender:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Sender's name
 *       401:
 *         description: Unauthorized
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

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification
 *     description: Create and send a notification to a user
 *     tags:
 *       - Notifications
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - type
 *               - receiverId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Notification title
 *               message:
 *                 type: string
 *                 description: Notification message
 *               type:
 *                 type: string
 *                 enum: ["INFO", "WARNING", "ERROR", "SUCCESS", "APPOINTMENT", "TASK", "REMINDER", "EMERGENCY", "SYSTEM"]
 *                 description: Notification type
 *               receiverId:
 *                 type: string
 *                 description: ID of the user who will receive the notification
 *               isUrgent:
 *                 type: boolean
 *                 description: Whether this is an urgent notification
 *                 default: false
 *               metadata:
 *                 type: object
 *                 description: Additional metadata for the notification
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 notification:
 *                   type: object
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
    try {
        const session = await requireApiAuth(req);
        const { title, message, type, receiverId, isUrgent = false, metadata } = await req.json();

        // Validate required fields
        if (!title || !message || !type || !receiverId) {
            return NextResponse.json(
                { error: "Missing required fields: title, message, type, receiverId" },
                { status: 400 }
            );
        }

        // Create the notification
        const notification = await createNotification({
            title,
            message,
            type,
            receiverId,
            senderId: session.user.id,
            isUrgent
        });

        return NextResponse.json({
            message: "Notification created successfully",
            notification: {
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                isUrgent: notification.isUrgent,
                createdAt: notification.createdAt
            }
        }, { status: 201 });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error creating notification:", error);
        return NextResponse.json(
            { error: "Failed to create notification" },
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
