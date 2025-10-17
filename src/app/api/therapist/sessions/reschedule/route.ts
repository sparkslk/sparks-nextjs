import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { therapistProfile: true }
    });

    if (!user || user.role !== "THERAPIST") {
      return NextResponse.json(
        { error: "Forbidden: Therapist access required" },
        { status: 403 }
      );
    }

    if (!user.therapistProfile) {
      return NextResponse.json(
        { error: "Therapist profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Find the therapy session
    const therapySession = await prisma.therapySession.findUnique({
      where: { id: sessionId },
      include: { 
        patient: {
          include: {
            user: {
              select: { id: true }
            }
          }
        }
      }
    });

    if (!therapySession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (therapySession.therapistId !== user.therapistProfile.id) {
      return NextResponse.json(
        { error: "Unauthorized to reschedule this session" },
        { status: 403 }
      );
    }

    if (!['SCHEDULED', 'APPROVED', 'CONFIRMED'].includes(therapySession.status)) {
      return NextResponse.json(
        { error: "Only scheduled sessions can be rescheduled" },
        { status: 400 }
      );
    }

    // Update session status to RESCHEDULED
    await prisma.therapySession.update({
      where: { id: sessionId },
      data: {
        status: "RESCHEDULED",
        updatedAt: new Date()
      }
    });

    // Send notifications
    try {
      const patient = therapySession.patient;
      const patientFullName = `${patient.firstName} ${patient.lastName}`.trim();
      const therapistName = user.name || "Your therapist";
      
      const sessionDateTime = new Date(therapySession.scheduledAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Get parent/guardian information
      const parentGuardian = await prisma.parentGuardian.findFirst({
        where: { patientId: patient.id },
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      });

      const notificationTitle = "Session Reschedule Request";
      
      // Message for patient (without patient name)
      const patientNotificationMessage = `${therapistName} has requested to reschedule your session scheduled for ${sessionDateTime}. Please visit your sessions page to select a new time slot from the available options.`;

      // Message for parent (with patient name)
      const parentNotificationMessage = `${therapistName} has requested to reschedule ${patientFullName}'s session scheduled for ${sessionDateTime}. Please visit your sessions page to select a new time slot from the available options.`;

      // Send notification to patient (if patient has a user account)
      if (therapySession.patient.user) {
        try {
          await prisma.notification.create({
            data: {
              senderId: user.id,
              receiverId: therapySession.patient.user.id,
              type: "APPOINTMENT",
              title: notificationTitle,
              message: patientNotificationMessage,
              isRead: false,
              isUrgent: true
            }
          });
          console.log(`Reschedule notification sent to patient (${therapySession.patient.user.id})`);
        } catch (patientNotificationError) {
          console.error("Failed to send notification to patient:", patientNotificationError);
        }
      }

      // Send notification to parent/guardian
      if (parentGuardian?.user) {
        try {
          await prisma.notification.create({
            data: {
              senderId: user.id,
              receiverId: parentGuardian.user.id,
              type: "APPOINTMENT",
              title: notificationTitle,
              message: parentNotificationMessage,
              isRead: false,
              isUrgent: true
            }
          });
          console.log(`Reschedule notification sent to parent (${parentGuardian.user.id})`);
        } catch (parentNotificationError) {
          console.error("Failed to send notification to parent:", parentNotificationError);
        }
      }

    } catch (notificationError) {
      console.error("Error sending reschedule notifications:", notificationError);
      // Continue execution even if notifications fail
    }

    return NextResponse.json({
      message: "Reschedule request sent successfully",
      sessionId: sessionId
    });

  } catch (error) {
    console.error("Error processing reschedule request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
