import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { GameAssignmentStatus, Prisma } from "@prisma/client";

/**
 * @swagger
 * /api/therapist/games/assignments:
 *   get:
 *     summary: Get therapist's game assignments
 *     description: Retrieve all game assignments created by the authenticated therapist
 *     tags:
 *       - Therapist
 *       - Games
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by specific patient ID
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
 *         description: Forbidden - user is not a therapist
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const patientId = searchParams.get('patientId');
        const status = searchParams.get('status');

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

        // Build where clause
        const where: Prisma.GameAssignmentWhereInput = {
            therapistId: therapist.id,
        };

        if (patientId) {
            where.patientId = patientId;
        }

        if (status && Object.values(GameAssignmentStatus).includes(status as GameAssignmentStatus)) {
            where.status = status as GameAssignmentStatus;
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
                        ageRange: true
                    }
                },
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        dateOfBirth: true
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
                patient: {
                    id: assignment.patient.id,
                    name: `${assignment.patient.firstName} ${assignment.patient.lastName}`,
                    age: assignment.patient.dateOfBirth
                        ? Math.floor((Date.now() - assignment.patient.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                        : null
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

/**
 * @swagger
 * /api/therapist/games/assignments:
 *   post:
 *     summary: Create a new game assignment
 *     description: Assign a game to a patient
 *     tags:
 *       - Therapist
 *       - Games
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *               - patientId
 *               - targetSessions
 *             properties:
 *               gameId:
 *                 type: string
 *                 description: ID of the game to assign
 *               patientId:
 *                 type: string
 *                 description: ID of the patient
 *               targetSessions:
 *                 type: integer
 *                 description: Target number of sessions
 *                 minimum: 1
 *               therapistNotes:
 *                 type: string
 *                 description: Notes from therapist about this assignment
 *     responses:
 *       201:
 *         description: Game assignment created successfully
 *       400:
 *         description: Bad request - missing or invalid fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a therapist
 *       404:
 *         description: Game or patient not found
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);
        const { gameId, patientId, targetSessions, therapistNotes } = await req.json();

        // Validate required fields
        if (!gameId || !patientId || !targetSessions) {
            return NextResponse.json(
                { error: "Missing required fields: gameId, patientId, targetSessions" },
                { status: 400 }
            );
        }

        if (typeof targetSessions !== 'number' || targetSessions < 1) {
            return NextResponse.json(
                { error: "targetSessions must be a positive number" },
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

        // Verify game exists and is active
        const game = await prisma.game.findUnique({
            where: { id: gameId, isActive: true }
        });

        if (!game) {
            return NextResponse.json(
                { error: "Game not found or is inactive" },
                { status: 404 }
            );
        }

        // Verify patient exists and is assigned to this therapist
        const patient = await prisma.patient.findFirst({
            where: {
                id: patientId,
                primaryTherapistId: therapist.id
            }
        });

        if (!patient) {
            return NextResponse.json(
                { error: "Patient not found or not assigned to you" },
                { status: 404 }
            );
        }

        // Check if there's already an active assignment for this game and patient
        const existingAssignment = await prisma.gameAssignment.findFirst({
            where: {
                gameId,
                patientId,
                therapistId: therapist.id,
                status: GameAssignmentStatus.ACTIVE
            }
        });

        if (existingAssignment) {
            return NextResponse.json(
                { error: "An active assignment already exists for this patient and game" },
                { status: 400 }
            );
        }

        // Create the game assignment
        const assignment = await prisma.gameAssignment.create({
            data: {
                gameId,
                patientId,
                therapistId: therapist.id,
                targetSessions,
                therapistNotes: therapistNotes || null,
                status: GameAssignmentStatus.ACTIVE
            },
            include: {
                game: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        thumbnailUrl: true,
                        category: true,
                        difficulty: true
                    }
                },
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        user: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        });

        // Create notification for the patient
        if (assignment.patient.user?.id) {
            await prisma.notification.create({
                data: {
                    senderId: session.user.id,
                    receiverId: assignment.patient.user.id,
                    type: "SYSTEM",
                    title: "New Game Assigned",
                    message: `Your therapist has assigned you a new game: ${assignment.game.title}. Target: ${targetSessions} sessions.`,
                    isUrgent: false
                }
            });
        }

        return NextResponse.json({
            message: "Game assignment created successfully",
            assignment: {
                id: assignment.id,
                game: assignment.game,
                patient: {
                    id: assignment.patient.id,
                    name: `${assignment.patient.firstName} ${assignment.patient.lastName}`
                },
                targetSessions: assignment.targetSessions,
                therapistNotes: assignment.therapistNotes,
                status: assignment.status,
                assignedAt: assignment.assignedAt
            }
        }, { status: 201 });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error creating game assignment:", error);
        return NextResponse.json(
            { error: "Failed to create game assignment" },
            { status: 500 }
        );
    }
}
