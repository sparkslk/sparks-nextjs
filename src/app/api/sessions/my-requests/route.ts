import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/sessions/my-requests:
 *   get:
 *     summary: Get user's session requests
 *     description: Retrieve all therapy session requests for the authenticated patient
 *     tags:
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
 *                     description: Additional notes
 *                   therapist:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: Therapist name
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
// Get all session requests for the logged-in patient
export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req);

        // Get patient profile for the logged-in user
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
