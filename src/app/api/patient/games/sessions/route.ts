import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { GameAssignmentStatus } from "@prisma/client";

/**
 * @swagger
 * /api/patient/games/sessions:
 *   post:
 *     summary: Start a new game session
 *     description: Create a new game session record when patient starts playing a game
 *     tags:
 *       - Patient
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
 *               - assignmentId
 *             properties:
 *               assignmentId:
 *                 type: string
 *                 description: ID of the game assignment
 *     responses:
 *       201:
 *         description: Game session started successfully
 *       400:
 *         description: Bad request - missing or invalid fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a patient
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['PATIENT', 'CHILD']);
        const { assignmentId } = await req.json();

        // Validate required fields
        if (!assignmentId) {
            return NextResponse.json(
                { error: "Missing required field: assignmentId" },
                { status: 400 }
            );
        }

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

        // Verify assignment exists and belongs to this patient
        const assignment = await prisma.gameAssignment.findFirst({
            where: {
                id: assignmentId,
                patientId: patient.id
            },
            include: {
                game: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        if (!assignment) {
            return NextResponse.json(
                { error: "Assignment not found" },
                { status: 404 }
            );
        }

        // Check if assignment is active
        if (assignment.status !== GameAssignmentStatus.ACTIVE) {
            return NextResponse.json(
                { error: "This game assignment is not currently active" },
                { status: 400 }
            );
        }

        // Create the game session
        const gameSession = await prisma.gameSession.create({
            data: {
                assignmentId,
                patientId: patient.id,
                gameId: assignment.game.id
            }
        });

        return NextResponse.json({
            message: "Game session started successfully",
            session: {
                id: gameSession.id,
                assignmentId: gameSession.assignmentId,
                gameId: gameSession.gameId,
                startedAt: gameSession.startedAt
            }
        }, { status: 201 });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error creating game session:", error);
        return NextResponse.json(
            { error: "Failed to start game session" },
            { status: 500 }
        );
    }
}
