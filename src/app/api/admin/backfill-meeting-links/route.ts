import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSimpleMeetingLink } from "@/lib/google-meet";

/**
 * Backfill meeting links for existing ONLINE/HYBRID sessions
 * This endpoint should be called by an admin to update sessions without meeting links
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    // Only allow admins to run this backfill
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    // Query sessions that need meeting links
    const sessionsToUpdate = await prisma.therapySession.findMany({
      where: {
        sessionType: {
          in: ["ONLINE", "HYBRID"]
        },
        meetingLink: null
      },
      select: {
        id: true,
        sessionType: true,
        scheduledAt: true,
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log(`Found ${sessionsToUpdate.length} sessions without meeting links`);

    // Update each session with a generated meeting link
    const updatePromises = sessionsToUpdate.map(async (session) => {
      const meetingLink = generateSimpleMeetingLink(session.id);

      await prisma.therapySession.update({
        where: { id: session.id },
        data: { meetingLink }
      });

      return {
        sessionId: session.id,
        meetingLink,
        patient: `${session.patient.firstName} ${session.patient.lastName}`,
        scheduledAt: session.scheduledAt
      };
    });

    const updatedSessions = await Promise.all(updatePromises);

    console.log(`✅ Successfully backfilled ${updatedSessions.length} session meeting links`);

    return NextResponse.json({
      success: true,
      message: `Successfully backfilled ${updatedSessions.length} meeting links`,
      updated: updatedSessions.length,
      sessions: updatedSessions
    });

  } catch (error) {
    console.error("Error backfilling meeting links:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * Get statistics about sessions with/without meeting links
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Only allow admins
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    // Count sessions by type and meeting link status
    const [totalSessions, onlineHybridSessions, sessionsWithLinks, sessionsWithoutLinks] = await Promise.all([
      prisma.therapySession.count(),
      prisma.therapySession.count({
        where: {
          sessionType: {
            in: ["ONLINE", "HYBRID"]
          }
        }
      }),
      prisma.therapySession.count({
        where: {
          sessionType: {
            in: ["ONLINE", "HYBRID"]
          },
          meetingLink: {
            not: null
          }
        }
      }),
      prisma.therapySession.count({
        where: {
          sessionType: {
            in: ["ONLINE", "HYBRID"]
          },
          meetingLink: null
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      statistics: {
        totalSessions,
        onlineHybridSessions,
        sessionsWithLinks,
        sessionsWithoutLinks,
        needsBackfill: sessionsWithoutLinks > 0
      }
    });

  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error"
      },
      { status: 500 }
    );
  }
}
