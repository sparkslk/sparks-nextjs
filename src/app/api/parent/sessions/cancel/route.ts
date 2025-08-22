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

    const { sessionId, cancelReason } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Find the therapy session and verify the user has permission to cancel it
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

    // Check if session is already cancelled or completed
    if (therapySession.status === "CANCELLED") {
      return NextResponse.json({ error: "Session is already cancelled" }, { status: 400 });
    }

    if (therapySession.status === "COMPLETED") {
      return NextResponse.json({ error: "Cannot cancel a completed session" }, { status: 400 });
    }

    // Update the session status to CANCELLED
    const updatedSession = await prisma.therapySession.update({
      where: {
        id: sessionId
      },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
        sessionNotes: cancelReason ? `Cancelled by parent. Reason: ${cancelReason}` : "Cancelled by parent"
      }
    });

    // Create a notification for the therapist
    await prisma.notification.create({
      data: {
        receiverId: therapySession.therapist.userId,
        senderId: user.id,
        type: "APPOINTMENT",
        title: "Session Cancelled",
        message: `A therapy session scheduled for ${therapySession.scheduledAt.toLocaleDateString()} has been cancelled by the parent.`,
        isUrgent: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Session cancelled successfully",
      session: {
        id: updatedSession.id,
        status: updatedSession.status,
        updatedAt: updatedSession.updatedAt
      }
    });

  } catch (error) {
    console.error("Error cancelling session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}