import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/notifications/mark-read:
 *   post:
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read for the authenticated user
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
 *               - notificationId
 *             properties:
 *               notificationId:
 *                 type: string
 *                 description: ID of the notification to mark as read
 *                 example: "notification_123456"
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notification marked as read"
 *       400:
 *         description: Bad request - missing notification ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Notification not found
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
export async function POST(req: NextRequest) {
    try {
        const session = await requireApiAuth(req);
        const { notificationId } = await req.json();

        if (!notificationId) {
            return NextResponse.json(
                { error: "Notification ID is required" },
                { status: 400 }
            );
        }

        // Update the notification to mark as read
        const notification = await prisma.notification.updateMany({
            where: {
                id: notificationId,
                receiverId: session.user.id // Ensure user can only mark their own notifications
            },
            data: {
                isRead: true
            }
        });

        if (notification.count === 0) {
            return NextResponse.json(
                { error: "Notification not found or access denied" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error marking notification as read:", error);
        return NextResponse.json(
            { error: "Failed to mark notification as read" },
            { status: 500 }
        );
    }
}
