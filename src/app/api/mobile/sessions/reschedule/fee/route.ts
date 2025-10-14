import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

/**
 * Calculate reschedule fee for a therapy session
 * Mobile API endpoint - uses JWT token authentication
 *
 * Query Parameters:
 * - sessionId: ID of the session to reschedule - REQUIRED
 *
 * Returns fee information:
 * - fee: Amount in LKR (0 or 30)
 * - requiresPayment: boolean
 * - daysUntilSession: number
 * - currentSessionDate: ISO string
 */
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

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId parameter" },
        { status: 400 }
      );
    }

    // Get the patient
    const patient = await prisma.patient.findUnique({
      where: { userId: payload.userId }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Get the session
    const session = await prisma.therapySession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Verify session belongs to this patient
    if (session.patientId !== patient.id) {
      return NextResponse.json(
        { error: "Session does not belong to this patient" },
        { status: 403 }
      );
    }

    // Check if session can be rescheduled
    if (!["SCHEDULED", "APPROVED", "REQUESTED"].includes(session.status)) {
      return NextResponse.json(
        { error: `Cannot reschedule session with status: ${session.status}` },
        { status: 400 }
      );
    }

    // Calculate days until session
    const now = new Date();
    const sessionDate = new Date(session.scheduledAt);
    const daysUntilSession = Math.ceil((sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Determine fee
    // If 5 or more days until session: Free reschedule
    // If less than 5 days: Rs. 30 fee
    const fee = daysUntilSession >= 5 ? 0 : 30;
    const requiresPayment = fee > 0;

    return NextResponse.json({
      fee,
      requiresPayment,
      daysUntilSession,
      currentSessionDate: session.scheduledAt.toISOString(),
      message: requiresPayment
        ? `Rescheduling within ${daysUntilSession} day(s) requires a Rs. ${fee} fee`
        : "Free rescheduling available"
    });

  } catch (error) {
    console.error("Error calculating reschedule fee:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
