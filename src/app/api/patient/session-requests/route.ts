import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/patient/session-requests:
 *   get:
 *     summary: Get patient's session requests
 *     description: Retrieves all therapy session requests for the authenticated patient
 *     tags:
 *       - Patient
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Session request unique identifier
 *                       therapist:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: Therapist name
 *                           email:
 *                             type: string
 *                             format: email
 *                             description: Therapist email
 *                           specialization:
 *                             type: string
 *                             description: Therapist specialization
 *                       scheduledAt:
 *                         type: string
 *                         format: date-time
 *                         description: Scheduled session date and time
 *                       duration:
 *                         type: integer
 *                         description: Session duration in minutes
 *                       type:
 *                         type: string
 *                         description: Type of therapy session
 *                       status:
 *                         type: string
 *                         enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *                         description: Current status of the session request
 *                       notes:
 *                         type: string
 *                         nullable: true
 *                         description: Additional notes for the session
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Request creation timestamp
 *       401:
 *         description: Unauthorized - Invalid authentication
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
// Get all session requests for a patient
export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req);

        // Get patient profile
        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id }
        });

        if (!patient) {
            return NextResponse.json(
                { error: "Patient profile not found" },
                { status: 404 }
            );
        }

        // Get all session requests for this patient
        const sessionRequests = await prisma.therapySession.findMany({
            where: {
                patientId: patient.id
            },
            include: {
                therapist: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
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
                therapist: {
                    name: request.therapist.user.name || request.therapist.user.email,
                    email: request.therapist.user.email,
                    specialization: request.therapist.specialization
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
