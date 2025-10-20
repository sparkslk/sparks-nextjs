import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Get patient's assessment assignments
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
        assessments: [],
        total: 0,
      });
    }

    // Fetch assessment assignments for the patient
    const assessmentAssignments = await prisma.assessmentAssignment.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        Assessment: {
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            link: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format assessment assignments for mobile
    const formattedAssessments = assessmentAssignments.map((assignment) => ({
      id: assignment.id,
      status: assignment.status,
      completedAt: assignment.completedAt,
      assignedAt: assignment.createdAt,
      assessment: {
        id: assignment.Assessment.id,
        type: assignment.Assessment.type,
        title: assignment.Assessment.title || "Assessment",
        description: assignment.Assessment.description,
        link: assignment.Assessment.link,
        image: assignment.Assessment.image,
      },
    }));

    return NextResponse.json({
      success: true,
      assessments: formattedAssessments,
      total: formattedAssessments.length,
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
