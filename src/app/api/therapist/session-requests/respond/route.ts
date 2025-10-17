import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { SessionStatus, NotificationType } from "@prisma/client";

export async function POST(request: NextRequest) {
    try {
        const session = await requireApiAuth(request, ['THERAPIST']);
        const { requestId, action } = await request.json();

        if (!requestId || !action) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (!["approve", "decline"].includes(action)) {
            return NextResponse.json(
                { error: "Invalid action. Must be 'approve' or 'decline'" },
                { status: 400 }
            );
        }

        // Get therapist profile
        const therapist = await prisma.therapist.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!therapist) {
            return NextResponse.json(
                { error: "Therapist profile not found" },
                { status: 404 }
            );
        }

        // Get the therapy session and verify it belongs to this therapist
        const therapySession = await prisma.therapySession.findFirst({
            where: {
                id: requestId,
                therapistId: therapist.id,
                status: SessionStatus.REQUESTED // Look for REQUESTED status
            },
            include: {
                patient: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
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

        // Update session status
        const newStatus = action === "approve" ? SessionStatus.APPROVED : SessionStatus.CANCELLED;

        await prisma.therapySession.update({
            where: { id: requestId },
            data: { status: newStatus }
        });

        // Create notification for the patient
        const therapistName = therapist.user.name || therapist.user.email;
        const notificationMessage = action === "approve"
            ? `Your session request for ${therapySession.type} on ${new Date(therapySession.scheduledAt).toLocaleDateString()} has been approved by ${therapistName}`
            : `Your session request for ${therapySession.type} on ${new Date(therapySession.scheduledAt).toLocaleDateString()} has been declined by ${therapistName}`;

        // Get patient's user ID safely
        const patientUserId = therapySession.patient.user?.id;
        if (patientUserId) {
            await prisma.notification.create({
                data: {
                    title: `Session Request ${action === "approve" ? "Approved" : "Declined"}`,
                    message: notificationMessage,
                    type: NotificationType.APPOINTMENT,
                    receiverId: patientUserId,
                    senderId: session.user.id,
                    isRead: false,
                    isUrgent: false
                }
            });
        }

        return NextResponse.json({
            message: `Session request ${action}d successfully`,
            sessionId: therapySession.id,
            status: newStatus
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error responding to session request:", error);
        return NextResponse.json(
            { error: "Failed to respond to session request" },
            { status: 500 }
        );
    }
}
