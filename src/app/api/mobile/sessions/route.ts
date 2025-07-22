import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Get patient's sessions
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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const timeframe = searchParams.get("timeframe"); // upcoming, past, all
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get patient
    const patient = await prisma.patient.findUnique({
      where: { userId: payload.userId }
    });

    if (!patient) {
      return NextResponse.json({
        sessions: [],
        total: 0,
        hasMore: false
      });
    }

    // Build where clause
    const where: Record<string, unknown> = {
      patientId: patient.id
    };

    if (status) {
      where.status = status;
    }

    const now = new Date();
    if (timeframe === "upcoming") {
      where.scheduledAt = { gte: now };
      where.status = { in: ["PENDING", "SCHEDULED"] };
    } else if (timeframe === "past") {
      where.OR = [
        { scheduledAt: { lt: now } },
        { status: { in: ["COMPLETED", "CANCELLED", "NO_SHOW"] } }
      ];
    }

    // Get sessions with pagination
    const [sessions, total] = await Promise.all([
      prisma.therapySession.findMany({
        where,
        include: {
          therapist: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          }
        },
        orderBy: {
          scheduledAt: timeframe === "past" ? "desc" : "asc"
        },
        take: limit,
        skip: offset
      }),
      prisma.therapySession.count({ where })
    ]);

    // Format sessions for mobile
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      type: session.type,
      status: session.status,
      scheduledAt: session.scheduledAt,
      duration: session.duration,
      sessionNotes: session.sessionNotes,
      therapist: {
        id: session.therapist.id,
        name: session.therapist.user.name || "Therapist",
        email: session.therapist.user.email,
        image: session.therapist.user.image
      },
      isPast: session.scheduledAt < now,
      canCancel: session.status === "SCHEDULED" && session.scheduledAt > new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours before
    }));

    // Get session statistics
    const stats = await prisma.therapySession.groupBy({
      by: ['status'],
      where: { patientId: patient.id },
      _count: true
    });

    const statistics = {
      total: total,
      requested: stats.find(s => s.status === "REQUESTED")?._count || 0,
      scheduled: stats.find(s => s.status === "SCHEDULED")?._count || 0,
      completed: stats.find(s => s.status === "COMPLETED")?._count || 0,
      cancelled: stats.find(s => s.status === "CANCELLED")?._count || 0,
      noShow: stats.find(s => s.status === "NO_SHOW")?._count || 0
    };

    return NextResponse.json({
      sessions: formattedSessions,
      total,
      hasMore: offset + limit < total,
      statistics
    });

  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}