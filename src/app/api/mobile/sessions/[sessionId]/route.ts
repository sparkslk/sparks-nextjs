import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Get specific session details
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
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

    const session = await prisma.session.findUnique({
      where: { id: params.sessionId },
      include: {
        patient: {
          select: {
            userId: true,
            firstName: true,
            lastName: true
          }
        },
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
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Verify the session belongs to the patient
    if (session.patient.userId !== payload.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const now = new Date();
    const canCancel = session.status === "SCHEDULED" && 
                     session.scheduledAt > new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return NextResponse.json({
      session: {
        id: session.id,
        type: session.type,
        status: session.status,
        scheduledAt: session.scheduledAt,
        duration: session.duration,
        location: session.location,
        notes: session.notes,
        isUrgent: session.isUrgent,
        cancelReason: session.cancelReason,
        completedAt: session.completedAt,
        therapistNotes: session.status === "COMPLETED" ? session.therapistNotes : null,
        therapist: {
          id: session.therapist.id,
          name: session.therapist.user.name || "Therapist",
          email: session.therapist.user.email,
          image: session.therapist.user.image,
          specializations: session.therapist.specializations,
          sessionRate: session.therapist.sessionRate
        },
        isPast: session.scheduledAt < now,
        canCancel,
        canReschedule: session.status === "SCHEDULED" && !session.isPast
      }
    });

  } catch (error) {
    console.error("Error fetching session details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Cancel a session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
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

    const { reason } = await request.json();

    const session = await prisma.session.findUnique({
      where: { id: params.sessionId },
      include: {
        patient: true,
        therapist: {
          include: {
            user: true
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Verify the session belongs to the patient
    if (session.patient.userId !== payload.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if session can be cancelled
    if (session.status !== "SCHEDULED" && session.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only scheduled or pending sessions can be cancelled" },
        { status: 400 }
      );
    }

    const now = new Date();
    const hoursUntilSession = (session.scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilSession < 24 && session.status === "SCHEDULED") {
      return NextResponse.json(
        { error: "Sessions must be cancelled at least 24 hours in advance" },
        { status: 400 }
      );
    }

    // Update session status
    await prisma.session.update({
      where: { id: params.sessionId },
      data: {
        status: "CANCELLED",
        cancelReason: reason || "Cancelled by patient"
      }
    });

    // Notify therapist
    await prisma.notification.create({
      data: {
        senderId: payload.userId,
        receiverId: session.therapist.userId,
        type: "SESSION_UPDATE",
        title: "Session Cancelled",
        message: `${session.patient.firstName} ${session.patient.lastName} has cancelled their ${session.type.toLowerCase().replace('_', ' ')} session scheduled for ${session.scheduledAt.toLocaleDateString()} at ${session.scheduledAt.toLocaleTimeString()}.${reason ? ` Reason: ${reason}` : ''}`,
        isUrgent: hoursUntilSession < 48,
        relatedId: session.id
      }
    });

    return NextResponse.json({
      success: true,
      message: "Session cancelled successfully"
    });

  } catch (error) {
    console.error("Error cancelling session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Reschedule a session
export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
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

    const { newDate, newTime, reason } = await request.json();

    if (!newDate || !newTime) {
      return NextResponse.json(
        { error: "New date and time are required" },
        { status: 400 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: params.sessionId },
      include: {
        patient: true,
        therapist: {
          include: {
            user: true
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Verify the session belongs to the patient
    if (session.patient.userId !== payload.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if session can be rescheduled
    if (session.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Only scheduled sessions can be rescheduled" },
        { status: 400 }
      );
    }

    const newScheduledAt = new Date(`${newDate}T${newTime}`);
    
    // Check if the new time slot is available
    const existingSession = await prisma.session.findFirst({
      where: {
        id: { not: params.sessionId },
        therapistId: session.therapistId,
        scheduledAt: {
          gte: new Date(newScheduledAt.getTime() - session.duration * 60000),
          lt: new Date(newScheduledAt.getTime() + session.duration * 60000)
        },
        status: {
          in: ["SCHEDULED", "IN_PROGRESS"]
        }
      }
    });

    if (existingSession) {
      return NextResponse.json(
        { error: "The new time slot is not available" },
        { status: 400 }
      );
    }

    // Update session
    const updatedSession = await prisma.session.update({
      where: { id: params.sessionId },
      data: {
        scheduledAt: newScheduledAt,
        status: "PENDING" // Change to pending for therapist approval
      }
    });

    // Notify therapist
    await prisma.notification.create({
      data: {
        senderId: payload.userId,
        receiverId: session.therapist.userId,
        type: "SESSION_UPDATE",
        title: "Session Reschedule Request",
        message: `${session.patient.firstName} ${session.patient.lastName} has requested to reschedule their session from ${session.scheduledAt.toLocaleDateString()} at ${session.scheduledAt.toLocaleTimeString()} to ${newScheduledAt.toLocaleDateString()} at ${newScheduledAt.toLocaleTimeString()}.${reason ? ` Reason: ${reason}` : ''}`,
        isUrgent: true,
        relatedId: session.id
      }
    });

    return NextResponse.json({
      success: true,
      message: "Reschedule request sent successfully",
      session: {
        id: updatedSession.id,
        newScheduledAt: updatedSession.scheduledAt,
        status: updatedSession.status
      }
    });

  } catch (error) {
    console.error("Error rescheduling session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}