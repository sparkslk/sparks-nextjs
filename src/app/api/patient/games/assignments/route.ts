import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { GameAssignmentStatus, Prisma } from "@prisma/client";

/**
 * @swagger
 * /api/patient/games/assignments:
 *   get:
 *     summary: Get patient's game assignments
 *     description: Retrieve all game assignments for the authenticated patient
 *     tags:
 *       - Patient
 *       - Games
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, COMPLETED, PAUSED]
 *         description: Filter by assignment status
 *     responses:
 *       200:
 *         description: Game assignments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a patient
 *       404:
 *         description: Patient profile not found
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['PATIENT', 'CHILD']);

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

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

        // Build where clause
        const where: Prisma.GameAssignmentWhereInput = {
            patientId: patient.id,
        };

        if (status && Object.values(GameAssignmentStatus).includes(status as GameAssignmentStatus)) {
            where.status = status as GameAssignmentStatus;
        } else {
            // By default, only show active assignments
            where.status = GameAssignmentStatus.ACTIVE;
        }

        // Get all game assignments
        const assignments = await prisma.gameAssignment.findMany({
            where,
            include: {
                game: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        thumbnailUrl: true,
                        category: true,
                        difficulty: true,
                        targetSkills: true,
                        ageRange: true,
                        estimatedTime: true
                    }
                },
                therapist: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                sessions: {
                    where: {
                        endedAt: { not: null }
                    },
                    select: {
                        id: true
                    }
                }
            },
            orderBy: {
                assignedAt: 'desc'
            }
        });

        return NextResponse.json({
            assignments: assignments.map(assignment => ({
                id: assignment.id,
                game: assignment.game,
                therapist: {
                    name: assignment.therapist.user?.name || "Unknown Therapist"
                },
                status: assignment.status,
                targetSessions: assignment.targetSessions,
                completedSessions: assignment.sessions.length,
                progressPercentage: assignment.targetSessions > 0
                    ? Math.min(100, Math.round((assignment.sessions.length / assignment.targetSessions) * 100))
                    : 0,
                therapistNotes: assignment.therapistNotes,
                assignedAt: assignment.assignedAt,
                completedAt: assignment.completedAt
            }))
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching game assignments:", error);
        return NextResponse.json(
            { error: "Failed to fetch game assignments" },
            { status: 500 }
        );
    }
}
