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
 * /api/therapist/games/assignments/{id}:
 *   get:
 *     summary: Get specific game assignment details
 *     description: Retrieve detailed information about a specific game assignment including progress
 *     tags:
 *       - Therapist
 *       - Games
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game assignment ID
 *     responses:
 *       200:
 *         description: Game assignment details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a therapist
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);
        const { id } = await params;

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

        // Get the assignment with all related data
        const assignment = await prisma.gameAssignment.findFirst({
            where: {
                id,
                therapistId: therapist.id
            },
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
                    select: {
                        id: true,
                        startedAt: true,
                        endedAt: true,
                        gameData: true,
                        duration: true
                    },
                    orderBy: {
                        startedAt: 'desc'
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

        // Calculate statistics
        const completedSessions = assignment.sessions.filter(s => s.endedAt).length;
        const totalPlayTime = assignment.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const averageScore = assignment.sessions.length > 0
            ? assignment.sessions.reduce((sum, s) => {
                const data = s.gameData as GameData | null;
                return sum + (data?.score || 0);
            }, 0) / assignment.sessions.length
            : 0;

        return NextResponse.json({
            assignment: {
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
                completedSessions,
                progressPercentage: assignment.targetSessions > 0
                    ? Math.min(100, Math.round((completedSessions / assignment.targetSessions) * 100))
                    : 0,
                therapistNotes: assignment.therapistNotes,
                assignedAt: assignment.assignedAt,
                completedAt: assignment.completedAt,
                statistics: {
                    totalSessions: assignment.sessions.length,
                    completedSessions,
                    totalPlayTime,
                    averageScore: Math.round(averageScore)
                },
                sessions: assignment.sessions
            }
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching game assignment:", error);
        return NextResponse.json(
            { error: "Failed to fetch game assignment" },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/therapist/games/assignments/{id}:
 *   put:
 *     summary: Update game assignment
 *     description: Update assignment details, notes, or status
 *     tags:
 *       - Therapist
 *       - Games
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetSessions:
 *                 type: integer
 *                 description: Update target number of sessions
 *                 minimum: 1
 *               therapistNotes:
 *                 type: string
 *                 description: Update therapist notes
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETED, PAUSED]
 *                 description: Update assignment status
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *       400:
 *         description: Bad request - invalid fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a therapist
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);
        const { id } = await params;
        const { targetSessions, therapistNotes, status } = await req.json();

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

        // Verify assignment exists and belongs to this therapist
        const existingAssignment = await prisma.gameAssignment.findFirst({
            where: {
                id,
                therapistId: therapist.id
            },
            include: {
                patient: {
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
        });

        if (!existingAssignment) {
            return NextResponse.json(
                { error: "Assignment not found" },
                { status: 404 }
            );
        }

        // Build update data
        const updateData: Prisma.GameAssignmentUpdateInput = {};

        if (targetSessions !== undefined) {
            if (typeof targetSessions !== 'number' || targetSessions < 1) {
                return NextResponse.json(
                    { error: "targetSessions must be a positive number" },
                    { status: 400 }
                );
            }
            updateData.targetSessions = targetSessions;
        }

        if (therapistNotes !== undefined) {
            updateData.therapistNotes = therapistNotes;
        }

        if (status !== undefined) {
            if (!Object.values(GameAssignmentStatus).includes(status as GameAssignmentStatus)) {
                return NextResponse.json(
                    { error: "Invalid status value" },
                    { status: 400 }
                );
            }
            updateData.status = status;

            // Set completedAt when marking as completed
            if (status === GameAssignmentStatus.COMPLETED && !existingAssignment.completedAt) {
                updateData.completedAt = new Date();
            }
            // Clear completedAt if status is changed from completed
            if (status !== GameAssignmentStatus.COMPLETED && existingAssignment.completedAt) {
                updateData.completedAt = null;
            }
        }

        // Update the assignment
        const updatedAssignment = await prisma.gameAssignment.update({
            where: { id },
            data: updateData
        });

        // Send notification to patient if status changed to completed
        if (status === GameAssignmentStatus.COMPLETED && existingAssignment.patient.user?.id) {
            await prisma.notification.create({
                data: {
                    senderId: session.user.id,
                    receiverId: existingAssignment.patient.user.id,
                    type: "SYSTEM",
                    title: "Game Assignment Completed",
                    message: `Congratulations! You have completed the game assignment: ${existingAssignment.game.title}`,
                    isUrgent: false
                }
            });
        }

        return NextResponse.json({
            message: "Assignment updated successfully",
            assignment: {
                id: updatedAssignment.id,
                targetSessions: updatedAssignment.targetSessions,
                therapistNotes: updatedAssignment.therapistNotes,
                status: updatedAssignment.status,
                completedAt: updatedAssignment.completedAt
            }
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error updating game assignment:", error);
        return NextResponse.json(
            { error: "Failed to update game assignment" },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/therapist/games/assignments/{id}:
 *   delete:
 *     summary: Cancel/deactivate game assignment
 *     description: Marks a game assignment as cancelled
 *     tags:
 *       - Therapist
 *       - Games
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game assignment ID
 *     responses:
 *       200:
 *         description: Assignment cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a therapist
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);
        const { id } = await params;

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

        // Verify assignment exists and belongs to this therapist
        const assignment = await prisma.gameAssignment.findFirst({
            where: {
                id,
                therapistId: therapist.id
            },
            include: {
                patient: {
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
        });

        if (!assignment) {
            return NextResponse.json(
                { error: "Assignment not found" },
                { status: 404 }
            );
        }

        // We don't actually delete, just mark as paused/cancelled
        // This preserves the history and session data
        await prisma.gameAssignment.update({
            where: { id },
            data: {
                status: GameAssignmentStatus.PAUSED
            }
        });

        // Notify patient
        if (assignment.patient.user?.id) {
            await prisma.notification.create({
                data: {
                    senderId: session.user.id,
                    receiverId: assignment.patient.user.id,
                    type: "SYSTEM",
                    title: "Game Assignment Paused",
                    message: `Your game assignment for "${assignment.game.title}" has been paused by your therapist.`,
                    isUrgent: false
                }
            });
        }

        return NextResponse.json({
            message: "Assignment cancelled successfully"
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error deleting game assignment:", error);
        return NextResponse.json(
            { error: "Failed to cancel game assignment" },
            { status: 500 }
        );
    }
}
