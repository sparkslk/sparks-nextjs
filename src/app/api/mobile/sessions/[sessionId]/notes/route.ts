import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Update session notes (patient's personal notes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
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
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    const { sessionId } = await params;
    const body = await request.json();
    const { sessionNotes } = body;

    if (sessionNotes === undefined) {
      return NextResponse.json(
        { error: "sessionNotes field is required" },
        { status: 400 }
      );
    }

    // Verify session exists and belongs to this patient
    const session = await prisma.therapySession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.patientId !== patient.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this session" },
        { status: 403 }
      );
    }

    // Update session notes
    const updatedSession = await prisma.therapySession.update({
      where: { id: sessionId },
      data: {
        sessionNotes: sessionNotes,
      },
      select: {
        id: true,
        sessionNotes: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Session notes updated successfully",
      session: updatedSession,
    });
  } catch (error) {
    console.error("Error updating session notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
