import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { sessionId, newDate, newTime } = await request.json();

    if (!sessionId || !newDate || !newTime) {
      return NextResponse.json({ error: "Session ID, new date, and new time are required" }, { status: 400 });
    }

    // Find the therapy session and verify the user has permission to reschedule it
    const therapySession = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        patient: {
          parentGuardians: {
            some: {
              userId: user.id
            }
          }
        }
      },
      include: {
        patient: true,
        therapist: {
          include: {
            user: true
          }
        }
      }
    });

    if (!therapySession) {
      return NextResponse.json({ error: "Session not found or unauthorized" }, { status: 404 });
    }

    // Check if session can be rescheduled
    if (therapySession.status === "CANCELLED") {
      return NextResponse.json({ error: "Cannot reschedule a cancelled session" }, { status: 400 });
    }

    if (therapySession.status === "COMPLETED") {
      return NextResponse.json({ error: "Cannot reschedule a completed session" }, { status: 400 });
    }

    // Parse the new date and time
    const newDateTime = new Date(`${newDate} ${newTime}`);
    
    // Check if the new time is in the future
    if (newDateTime <= new Date()) {
      return NextResponse.json({ error: "New session time must be in the future" }, { status: 400 });
    }

    // Update the session with new date and time
    const updatedSession = await prisma.therapySession.update({
      where: {
        id: sessionId
      },
      data: {
        scheduledAt: newDateTime,
        status: "SCHEDULED",
        updatedAt: new Date(),
        sessionNotes: `Rescheduled by parent from ${therapySession.scheduledAt.toLocaleString()} to ${newDateTime.toLocaleString()}`
      }
    });

    // Create a notification for the therapist
    await prisma.notification.create({
      data: {
        receiverId: therapySession.therapist.userId,
        senderId: user.id,
        type: "APPOINTMENT",
        title: "Session Rescheduled",
        message: `A therapy session has been rescheduled to ${newDateTime.toLocaleDateString()} at ${newDateTime.toLocaleTimeString()}.`,
        isUrgent: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Session rescheduled successfully",
      session: {
        id: updatedSession.id,
        scheduledAt: updatedSession.scheduledAt,
        status: updatedSession.status,
        updatedAt: updatedSession.updatedAt
      }
    });

  } catch (error) {
    console.error("Error rescheduling session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}