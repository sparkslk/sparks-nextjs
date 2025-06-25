import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { createNotification } from "@/lib/notifications";

// Test endpoint to create notifications for testing purposes
export async function POST(req: NextRequest) {
    try {
        const session = await requireApiAuth(req);
        const { title, message, type, isUrgent } = await req.json();

        const notification = await createNotification({
            title: title || 'Test Notification',
            message: message || 'This is a test notification',
            type: type || 'SYSTEM',
            receiverId: session.user.id,
            isUrgent: isUrgent || false
        });

        return NextResponse.json({
            success: true,
            notification: {
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                isUrgent: notification.isUrgent,
                createdAt: notification.createdAt
            }
        });

    } catch (error) {
        console.error("Error creating test notification:", error);
        if (error instanceof NextResponse) {
            return error;
        }
        return NextResponse.json(
            { error: "Failed to create test notification" },
            { status: 500 }
        );
    }
}
