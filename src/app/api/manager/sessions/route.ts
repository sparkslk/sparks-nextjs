import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireApiAuth } from "@/lib/api-auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("API: Sessions endpoint called");

    // Check if user is authenticated and has appropriate role
    await requireApiAuth(request, ["MANAGER"]);

    const { searchParams } = new URL(request.url);

    // Optional query parameters for filtering
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const attendanceStatus = searchParams.get("attendanceStatus");
    const patientId = searchParams.get("patientId");
    const therapistId = searchParams.get("therapistId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause dynamically
    // Build where clause dynamically
    const whereClause: Record<string, unknown> = {};

    if (status && status !== "All Status") {
      whereClause.status = status;
    }

    if (type && type !== "All Types") {
      whereClause.type = type;
    }

    if (attendanceStatus && attendanceStatus !== "All Attendance") {
      whereClause.attendanceStatus = attendanceStatus;
    }

    if (patientId) {
      whereClause.patientId = parseInt(patientId);
    }

    if (therapistId) {
      whereClause.therapistId = parseInt(therapistId);
    }

    if (startDate && endDate) {
      whereClause.scheduledAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      whereClause.scheduledAt = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      whereClause.scheduledAt = {
        lte: new Date(endDate),
      };
    }

    console.log("API: Where clause:", whereClause);

    const sessions = await prisma.therapySession.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        therapist: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: "desc", // Order by most recent first
      },
    });

    console.log(`API: Found ${sessions.length} sessions`);

    // Transform the data to match the frontend interface
    const transformedSessions = sessions.map((session) => ({
      id: session.id,
      patient: {
        id: session.patient.id,
        name: `${session.patient.firstName || ""} ${
          session.patient.lastName || ""
        }`.trim(),
      },
      therapist: {
        id: session.therapist.id,
        name: session.therapist.user?.name
          ? `Dr. ${session.therapist.user.name}`
          : "Dr. Unknown",
      },
      scheduledAt: session.scheduledAt.toISOString(),
      duration: session.duration,
      status: session.status,
      type: session.type,
      attendanceStatus: session.attendanceStatus,
    }));

    console.log("API: Transformed sessions:", transformedSessions.length);
    return NextResponse.json(transformedSessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development"
            ? (error as Error).stack
            : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
