import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// Get all session requests for a therapist
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

        // Get all session requests for this therapist
        const sessionRequests = await prisma.therapySession.findMany({
            where: {
                therapistId: therapist.id,
                status: { in: ['REQUESTED', 'APPROVED', 'SCHEDULED'] }
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            requests: sessionRequests.map(request => ({
                id: request.id,
                patient: {
                    name: `${request.patient.firstName} ${request.patient.lastName}`,
                    email: request.patient.email,
                    phone: request.patient.phone
                },
                scheduledAt: request.scheduledAt,
                duration: request.duration,
                type: request.type,
                status: request.status,
                notes: request.notes,
                createdAt: request.createdAt
            }))
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching session requests:", error);
        return NextResponse.json(
            { error: "Failed to fetch session requests" },
            { status: 500 }
        );
    }
}

// Update session request status (approve/decline)
export async function PATCH(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);
        const { sessionId, action, notes } = await req.json();

        if (!sessionId || !action) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (!['approve', 'decline'].includes(action)) {
            return NextResponse.json(
                { error: "Invalid action. Must be 'approve' or 'decline'" },
                { status: 400 }
            );
        }

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

        // Verify the session belongs to this therapist
        const therapySession = await prisma.therapySession.findFirst({
            where: {
                id: sessionId,
                therapistId: therapist.id,
                status: 'REQUESTED'
            },
            include: {
                patient: {
                    include: {
                        user: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        });

        if (!therapySession) {
            return NextResponse.json(
                { error: "Session request not found or already processed" },
                { status: 404 }
            );
        }

        // Update the session status
        const newStatus = action === 'approve' ? 'APPROVED' : 'DECLINED';
        const updatedSession = await prisma.therapySession.update({
            where: { id: sessionId },
            data: {
                status: newStatus,
                notes: notes || therapySession.notes
            }
        });

        // Create notification for the patient
        await prisma.notification.create({
            data: {
                senderId: session.user.id,
                receiverId: therapySession.patient.user!.id,
                type: 'APPOINTMENT',
                title: `Session Request ${action === 'approve' ? 'Approved' : 'Declined'}`,
                message: `Your ${therapySession.type} session request for ${new Date(therapySession.scheduledAt).toLocaleDateString()} has been ${action}d${notes ? `. Note: ${notes}` : '.'}`,
                isUrgent: true
            }
        });

        return NextResponse.json({
            message: `Session request ${action}d successfully`,
            session: {
                id: updatedSession.id,
                status: updatedSession.status,
                notes: updatedSession.notes
            }
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error updating session request:", error);
        return NextResponse.json(
            { error: "Failed to update session request" },
            { status: 500 }
        );
    }
}
