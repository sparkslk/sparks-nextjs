import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Get patient's game assignments
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyMobileToken(token);

    if (!payload || payload.role !== "NORMAL_USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get patient
    const patient = await prisma.patient.findUnique({
      where: { userId: payload.userId },
    });

    if (!patient) {
      return NextResponse.json({
        success: true,
        gameAssignments: [],
        total: 0,
      });
    }

    // Fetch game assignments for the patient
    const gameAssignments = await prisma.gameAssignment.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        Game: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            difficulty: true,
            estimatedTime: true,
            targetSkills: true,
          },
        },
        Therapist: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        GameSession: {
          select: {
            id: true,
            startedAt: true,
            endedAt: true,
            duration: true,
            gameData: true,
          },
          orderBy: {
            startedAt: "desc",
          },
          take: 1, // Get most recent session
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format game assignments for mobile
    const formattedAssignments = gameAssignments.map((assignment) => ({
      id: assignment.id,
      status: assignment.status,
      assignedAt: assignment.assignedAt,
      completedAt: assignment.completedAt,
      targetSessions: assignment.targetSessions,
      therapistNotes: assignment.therapistNotes,
      game: {
        id: assignment.Game.id,
        title: assignment.Game.title,
        description: assignment.Game.description,
        category: assignment.Game.category,
        difficulty: assignment.Game.difficulty,
        estimatedTime: assignment.Game.estimatedTime,
        targetSkills: assignment.Game.targetSkills,
      },
      assignedBy: {
        name: assignment.Therapist.user.name || "Therapist",
        email: assignment.Therapist.user.email,
      },
      lastSession: assignment.GameSession[0] || null,
      sessionsCompleted: assignment.GameSession.length,
    }));

    return NextResponse.json({
      success: true,
      gameAssignments: formattedAssignments,
      total: formattedAssignments.length,
    });
  } catch (error) {
    console.error("Error fetching game assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
