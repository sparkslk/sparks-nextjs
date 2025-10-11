import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { GameAssignmentStatus, Prisma } from "@prisma/client";

interface GameData {
    score?: number;
    notes?: string;
    [key: string]: unknown;
}

/**
 * @swagger
 * /api/patient/games/sessions/{id}:
 *   put:
 *     summary: Complete or update a game session
 *     description: Update game session with score, duration, and completion status
 *     tags:
 *       - Patient
 *       - Games
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: integer
 *                 description: Score achieved in the game
 *                 minimum: 0
 *               duration:
 *                 type: integer
 *                 description: Duration of play session in seconds
 *                 minimum: 0
 *               notes:
 *                 type: string
 *                 description: Optional notes or feedback from patient
 *               completed:
 *                 type: boolean
 *                 description: Whether the session is completed
 *     responses:
 *       200:
 *         description: Game session updated successfully
 *       400:
 *         description: Bad request - invalid fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a patient
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireApiAuth(req, ['PATIENT', 'CHILD']);
        const { id } = await params;
        const { score, duration, notes, completed } = await req.json();

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

        // Verify session exists and belongs to this patient
        const existingSession = await prisma.gameSession.findFirst({
            where: {
                id,
                patientId: patient.id
            },
            include: {
                assignment: {
                    include: {
                        therapist: {
                            select: {
                                user: {
                                    select: {
                                        id: true
                                    }
                                }
                            }
                        },
                        game: {
                            select: {
                                title: true
                            }
                        }
                    }
                }
            }
        });

        if (!existingSession) {
            return NextResponse.json(
                { error: "Session not found" },
                { status: 404 }
            );
        }

        // Build update data
        const updateData: Prisma.GameSessionUpdateInput = {};

        // Build gameData object if score or notes are provided
        const currentGameData = (existingSession.gameData as GameData | null) || {};
        const gameDataUpdate: GameData = { ...currentGameData };
        let hasGameDataUpdate = false;

        if (score !== undefined) {
            if (typeof score !== 'number' || score < 0) {
                return NextResponse.json(
                    { error: "score must be a non-negative number" },
                    { status: 400 }
                );
            }
            gameDataUpdate.score = score;
            hasGameDataUpdate = true;
        }

        if (notes !== undefined) {
            gameDataUpdate.notes = notes;
            hasGameDataUpdate = true;
        }

        if (hasGameDataUpdate) {
            updateData.gameData = gameDataUpdate as Prisma.InputJsonValue;
        }

        if (duration !== undefined) {
            if (typeof duration !== 'number' || duration < 0) {
                return NextResponse.json(
                    { error: "duration must be a non-negative number" },
                    { status: 400 }
                );
            }
            updateData.duration = duration;
        }

        if (completed === true && !existingSession.endedAt) {
            updateData.endedAt = new Date();
        }

        // Update the session
        const updatedSession = await prisma.gameSession.update({
            where: { id },
            data: updateData
        });

        // If session is completed, check if assignment target is reached
        if (completed && existingSession.assignment && existingSession.assignment.status === GameAssignmentStatus.ACTIVE) {
            const completedSessions = await prisma.gameSession.count({
                where: {
                    assignmentId: existingSession.assignmentId,
                    endedAt: { not: null }
                }
            });

            // If target sessions reached, mark assignment as completed
            if (completedSessions >= existingSession.assignment.targetSessions) {
                await prisma.gameAssignment.update({
                    where: { id: existingSession.assignment.id },
                    data: {
                        status: GameAssignmentStatus.COMPLETED,
                        completedAt: new Date()
                    }
                });

                // Notify therapist about completion
                if (existingSession.assignment.therapist.user?.id) {
                    await prisma.notification.create({
                        data: {
                            senderId: session.user.id,
                            receiverId: existingSession.assignment.therapist.user.id,
                            type: "SYSTEM",
                            title: "Patient Completed Game Assignment",
                            message: `Your patient has completed all ${existingSession.assignment.targetSessions} sessions for "${existingSession.assignment.game.title}"`,
                            isUrgent: false
                        }
                    });
                }
            }
        }

        const sessionData = updatedSession.gameData as GameData | null;
        return NextResponse.json({
            message: "Game session updated successfully",
            session: {
                id: updatedSession.id,
                score: sessionData?.score,
                duration: updatedSession.duration,
                notes: sessionData?.notes,
                startedAt: updatedSession.startedAt,
                endedAt: updatedSession.endedAt
            }
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error updating game session:", error);
        return NextResponse.json(
            { error: "Failed to update game session" },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/patient/games/sessions/{id}:
 *   get:
 *     summary: Get game session details
 *     description: Retrieve details about a specific game session
 *     tags:
 *       - Patient
 *       - Games
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game session ID
 *     responses:
 *       200:
 *         description: Game session retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a patient
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireApiAuth(req, ['PATIENT', 'CHILD']);
        const { id } = await params;

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

        // Get session details
        const gameSession = await prisma.gameSession.findFirst({
            where: {
                id,
                patientId: patient.id
            },
            include: {
                game: {
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true
                    }
                },
                assignment: {
                    select: {
                        id: true,
                        targetSessions: true,
                        therapistNotes: true
                    }
                }
            }
        });

        if (!gameSession) {
            return NextResponse.json(
                { error: "Session not found" },
                { status: 404 }
            );
        }

        const sessionData = gameSession.gameData as GameData | null;
        return NextResponse.json({
            session: {
                id: gameSession.id,
                game: gameSession.game,
                assignment: gameSession.assignment,
                score: sessionData?.score,
                duration: gameSession.duration,
                notes: sessionData?.notes,
                startedAt: gameSession.startedAt,
                endedAt: gameSession.endedAt
            }
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching game session:", error);
        return NextResponse.json(
            { error: "Failed to fetch game session" },
            { status: 500 }
        );
    }
}
