import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { SessionStatus } from "@prisma/client";

// Get count of pending session requests for a therapist
export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);

        // Get therapist profile
        const therapist = await prisma.therapist.findUnique({
            where: { userId: session.user.id }
        });

        if (!therapist) {
            return NextResponse.json(
                { error: "Therapist profile not found" },
                { status: 404 }
            );
        }

        // Count pending session requests
        const count = await prisma.therapySession.count({
            where: {
                therapistId: therapist.id,
                status: SessionStatus.REQUESTED
            }
        });

        return NextResponse.json({ count });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error counting session requests:", error);
        return NextResponse.json(
            { error: "Failed to count session requests" },
            { status: 500 }
        );
    }
}
