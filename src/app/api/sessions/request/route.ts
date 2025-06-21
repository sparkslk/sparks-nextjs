import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { SessionStatus, NotificationType } from "@prisma/client";

export async function POST(request: NextRequest) {
    try {
        const session = await requireApiAuth(request);

        const {
            therapistId,
            sessionType,
            preferredDateTime,
            notes
        } = await request.json();

        // Validate required fields
        if (!therapistId || !sessionType || !preferredDateTime) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get the patient profile for the logged-in user
        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id }
        });

        if (!patient) {
            return NextResponse.json(
                { error: "Patient profile not found. Please create your profile first." },
                { status: 404 }
            );
        }

        // Verify the therapist exists
        const therapist = await prisma.therapist.findUnique({
            where: { id: therapistId },
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
                { error: "Therapist not found" },
                { status: 404 }
            );
        }

        // Create the therapy session as a pending request
        const therapySession = await prisma.therapySession.create({
            data: {
                patientId: patient.id,
                therapistId: therapist.id,
                scheduledAt: new Date(preferredDateTime),
                duration: 60, // Default 60 minutes
                type: sessionType,
                status: SessionStatus.REQUESTED, // Use proper enum value
                notes: notes || null,
                objectives: [] // Default empty objectives
            }
        });

        // Create notification for the therapist
        await prisma.notification.create({
            data: {
                senderId: session.user.id,
                receiverId: therapist.userId,
                type: NotificationType.APPOINTMENT,
                title: 'New Session Request',
                message: `${patient.firstName} ${patient.lastName} has requested a ${sessionType} session on ${new Date(preferredDateTime).toLocaleDateString()}. Session ID: ${therapySession.id}`,
                isUrgent: true
            }
        });

        return NextResponse.json({
            message: "Session request submitted successfully",
            session: {
                id: therapySession.id,
                scheduledAt: therapySession.scheduledAt,
                duration: therapySession.duration,
                type: therapySession.type,
                status: therapySession.status,
                therapistName: therapist.user.name || therapist.user.email,
                notes: therapySession.notes
            }
        });

    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error creating session request:", error);
        return NextResponse.json(
            { error: "Failed to submit session request" },
            { status: 500 }
        );
    }
}
