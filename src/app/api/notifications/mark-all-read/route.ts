import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   post:
 *     summary: Mark all notifications as read
 *     description: Mark all unread notifications as read for the authenticated user
 *     tags:
 *       - Notifications
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All notifications marked as read"
 *                 count:
 *                   type: number
 *                   description: Number of notifications that were marked as read
 *                   example: 5
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
export async function POST(req: NextRequest) {
    try {
        const session = await requireApiAuth(req);

        // Mark all notifications as read for the current user
        await prisma.notification.updateMany({
            where: {
                receiverId: session.user.id,
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error marking all notifications as read:", error);
        return NextResponse.json(
            { error: "Failed to mark all notifications as read" },
            { status: 500 }
        );
    }
}
