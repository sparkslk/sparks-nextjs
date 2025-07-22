import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { SessionStatus, NotificationType } from "@prisma/client";

/**
 * @swagger
 * /api/sessions/request:
 *   post:
 *     summary: Request a therapy session
 *     description: Create a new therapy session request
 *     tags:
 *       - Sessions
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - therapistId
 *               - sessionType
 *               - preferredDateTime
 *             properties:
 *               therapistId:
 *                 type: string
 *                 description: ID of the requested therapist
 *                 example: "therapist_123456"
 *               sessionType:
 *                 type: string
 *                 enum: ["INITIAL_CONSULTATION", "INDIVIDUAL_THERAPY", "GROUP_THERAPY", "FOLLOW_UP"]
 *                 description: Type of therapy session
 *                 example: "INDIVIDUAL_THERAPY"
 *               preferredDateTime:
 *                 type: string
 *                 format: date-time
 *                 description: Preferred date and time for the session
 *                 example: "2025-07-01T10:00:00Z"
 *               notes:
 *                 type: string
 *                 description: Additional notes or specific requests
 *                 example: "Prefer morning sessions"
 *     responses:
 *       201:
 *         description: Session request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Session request created successfully"
 *                 sessionId:
 *                   type: string
 *                   example: "session_123456"
 *       400:
 *         description: Bad request - missing or invalid fields
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
 *         description: Patient profile not found
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
            where: { userId: session.user.id },
            include: {
                primaryTherapist: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!patient) {
            return NextResponse.json(
                { error: "Patient profile not found. Please create your profile first." },
                { status: 404 }
            );
        }

        // Check if patient has an assigned therapist
        if (!patient.primaryTherapistId) {
            return NextResponse.json(
                { error: "You don't have an assigned therapist. Please contact administration to get a therapist assigned." },
                { status: 400 }
            );
        }

        // Verify the requested therapist is the assigned therapist
        if (therapistId !== patient.primaryTherapistId) {
            return NextResponse.json(
                { error: `You can only book sessions with your assigned therapist: ${patient.primaryTherapist?.user.name || patient.primaryTherapist?.user.email}` },
                { status: 400 }
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

        // Check therapist availability
        const availabilityCheck = await fetch(`${request.nextUrl.origin}/api/therapist/availability/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify({
                therapistId,
                dateTime: preferredDateTime,
                duration: 60 // Default session duration
            })
        });

        if (availabilityCheck.ok) {
            const availabilityData = await availabilityCheck.json();
            
            if (!availabilityData.available) {
                return NextResponse.json(
                    { 
                        error: availabilityData.message,
                        suggestedSlots: availabilityData.suggestedSlots 
                    },
                    { status: 400 }
                );
            }
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
                sessionNotes: notes || null // Use sessionNotes field from schema
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
                sessionNotes: therapySession.sessionNotes
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
