import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

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
