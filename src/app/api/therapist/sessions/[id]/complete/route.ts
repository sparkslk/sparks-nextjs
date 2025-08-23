import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const { markAsCompleted } = await request.json();

        // Verify the session belongs to this therapist
        const existingSession = await prisma.therapySession.findFirst({
            where: {
                id: id,
                therapistId: user.therapistProfile.id
            }
        });

        if (!existingSession) {
            return NextResponse.json(
                { error: "Session not found or not authorized" },
                { status: 404 }
            );
        }

        // Determine new status based on completion choice
        let newStatus = existingSession.status;
        
        if (markAsCompleted) {
            // Only mark as completed if attendance allows it
            const attendanceStatus = (existingSession as unknown as Record<string, unknown>).attendanceStatus;
            if (attendanceStatus === 'PRESENT' || attendanceStatus === 'LATE') {
                newStatus = 'COMPLETED';
            } else {
                return NextResponse.json(
                    { error: "Cannot mark session as completed with current attendance status" },
                    { status: 400 }
                );
            }
        }
        // If not marking as completed, keep current status (session remains documented but not completed)

        // Update session status
        await prisma.therapySession.update({
            where: { id: id },
            data: {
                status: newStatus,
                updatedAt: new Date()
            }
        });

        return NextResponse.json(
            {
                message: markAsCompleted 
                    ? "Session marked as completed successfully" 
                    : "Session status updated successfully",
                status: newStatus
            },
            { status: 200 }
        );

    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error updating session completion:", error);
        
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
