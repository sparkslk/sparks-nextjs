import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * Get patient's own therapy sessions
 * Web API endpoint - uses session authentication
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireApiAuth(request);

    if (session.user.role !== "NORMAL_USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the patient and verify they exist
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Get all therapy sessions for this patient
    const sessions = await prisma.therapySession.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        therapist: {
          include: {
            user: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        scheduledAt: 'desc'
      }
    });

    // Format sessions for frontend
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      scheduledAt: session.scheduledAt.toISOString(),
      duration: session.duration,
      type: session.type,
      status: session.status,
      bookedRate: session.bookedRate,
      sessionType: session.sessionType,
      meetingLink: session.meetingLink,
      calendarEventId: session.calendarEventId,
      therapist: {
        id: session.therapist.id,
        name: session.therapist.user.name || "Therapist"
      },
      sessionNotes: session.sessionNotes,
    }));

    return NextResponse.json({
      sessions: formattedSessions
    });

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error fetching patient sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
