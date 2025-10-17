import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { SessionStatus, NotificationType } from "@prisma/client";

/**
 * @swagger
 * /api/therapist/session-requests:
 *   get:
 *     summary: Get therapist's session requests
 *     description: Retrieve all therapy session requests for the authenticated therapist
 *     tags:
 *       - Therapist
 *       - Sessions
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Session requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Session request ID
 *                   sessionType:
 *                     type: string
 *                     description: Type of therapy session
 *                   preferredDateTime:
 *                     type: string
 *                     format: date-time
 *                     description: Requested date and time
 *                   status:
 *                     type: string
 *                     enum: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"]
 *                     description: Current status of the request
 *                   notes:
 *                     type: string
 *                     description: Additional notes from patient
 *                   patient:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: Patient name
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Request creation time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - user is not a therapist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Therapist profile not found
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
                status: { in: [SessionStatus.REQUESTED, SessionStatus.APPROVED, SessionStatus.SCHEDULED] }
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
                notes: request.sessionNotes,
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

/**
 * @swagger
 * /api/therapist/session-requests:
 *   patch:
 *     summary: Update session request status
 *     description: Approve or decline a therapy session request
 *     tags:
 *       - Therapist
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
 *               - sessionId
 *               - action
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: ID of the session request to update
 *                 example: "session_123456"
 *               action:
 *                 type: string
 *                 enum: ["approve", "decline"]
 *                 description: Action to take on the session request
 *                 example: "approve"
 *               notes:
 *                 type: string
 *                 description: Additional notes from therapist
 *                 example: "Looking forward to our session"
 *     responses:
 *       200:
 *         description: Session request status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Session request approved"
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
 *       403:
 *         description: Forbidden - user is not a therapist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Session request not found
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
                status: SessionStatus.REQUESTED
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
        const newStatus = action === 'approve' ? SessionStatus.APPROVED : SessionStatus.CANCELLED;
        const updatedSession = await prisma.therapySession.update({
            where: { id: sessionId },
            data: {
                status: newStatus,
                sessionNotes: notes || therapySession.sessionNotes
            }
        });

        // Create notification for the patient
        await prisma.notification.create({
            data: {
                senderId: session.user.id,
                receiverId: therapySession.patient.user!.id,
                type: NotificationType.APPOINTMENT,
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
                notes: updatedSession.sessionNotes
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
