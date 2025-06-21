import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

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
