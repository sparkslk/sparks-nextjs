import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

interface GameData {
    score?: number;
    notes?: string;
    [key: string]: unknown;
}

/**
 * @swagger
 * /api/patient/games/assignments/{id}:
 *   get:
 *     summary: Get specific game assignment to play
 *     description: Retrieve detailed information about a game assignment including game URL and instructions
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
 *         description: Game assignment ID
 *     responses:
 *       200:
 *         description: Game assignment details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a patient
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

        // Get the assignment with all related data
        const assignment = await prisma.gameAssignment.findFirst({
            where: {
                id,
                patientId: patient.id
            },
            include: {
                game: true,
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
                    select: {
                        id: true,
                        startedAt: true,
                        endedAt: true,
                        gameData: true,
                        duration: true
                    },
                    orderBy: {
                        startedAt: 'desc'
                    },
                    take: 10  // Only get last 10 sessions for history
                }
            }
        });

        if (!assignment) {
            return NextResponse.json(
                { error: "Assignment not found" },
                { status: 404 }
            );
        }

        // Calculate progress statistics
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
                game: {
                    ...assignment.game,
                    // Include play URL/embed info
                    playUrl: assignment.game.embedUrl
                },
                therapist: {
                    name: assignment.therapist.user?.name || "Unknown Therapist"
                },
                status: assignment.status,
                targetSessions: assignment.targetSessions,
                completedSessions,
                progressPercentage: assignment.targetSessions > 0
                    ? Math.min(100, Math.round((completedSessions / assignment.targetSessions) * 100))
                    : 0,
                therapistNotes: assignment.therapistNotes,
                assignedAt: assignment.assignedAt,
                statistics: {
                    totalSessions: assignment.sessions.length,
                    completedSessions,
                    totalPlayTime,
                    averageScore: Math.round(averageScore)
                },
                recentSessions: assignment.sessions
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
