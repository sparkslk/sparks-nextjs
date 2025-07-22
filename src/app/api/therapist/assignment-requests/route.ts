import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {prisma} from "@/lib/prisma";

// Get assignment requests for therapist
export async function GET(request: NextRequest) {
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
    });

    if (!user || user.role !== "THERAPIST") {
      return NextResponse.json(
        { error: "Forbidden: Therapist access required" },
        { status: 403 }
      );
    }

    // Get therapist profile
    const therapist = await prisma.therapist.findUnique({
      where: { userId: user.id },
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist profile not found" },
        { status: 404 }
      );
    }

    // Get assignment request notifications
    const requests = await prisma.notification.findMany({
      where: {
        receiverId: user.id,
        type: "SYSTEM",
        title: "Therapist Assignment Request",
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Extract patient IDs from messages
    const assignmentRequests = await Promise.all(
      requests.map(async (request) => {
        // Extract patient ID from message
        const patientIdMatch = request.message.match(/Patient ID: ([a-zA-Z0-9]+)/);
        const patientId = patientIdMatch ? patientIdMatch[1] : null;
        
        if (!patientId) return null;
        
        const patient = await prisma.patient.findUnique({
          where: { id: patientId },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        });
        
        if (!patient) return null;
        
        return {
          id: request.id,
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          patientEmail: patient.user?.email || patient.email,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          message: request.message.replace(/Patient ID: [a-zA-Z0-9]+/, '').trim(),
          requestedAt: request.createdAt,
        };
      })
    );

    return NextResponse.json({
      requests: assignmentRequests.filter(req => req !== null),
    });
  } catch (error) {
    console.error("Error fetching assignment requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Accept or reject assignment request
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
    });

    if (!user || user.role !== "THERAPIST") {
      return NextResponse.json(
        { error: "Forbidden: Therapist access required" },
        { status: 403 }
      );
    }

    const { notificationId, patientId, action, message } = await request.json();

    if (!notificationId || !patientId || !action) {
      return NextResponse.json(
        { error: "Notification ID, Patient ID, and action are required" },
        { status: 400 }
      );
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Action must be either 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    // Get therapist profile
    const therapist = await prisma.therapist.findUnique({
      where: { userId: user.id },
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist profile not found" },
        { status: 404 }
      );
    }

    // Get the notification
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.receiverId !== user.id) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    // Get patient
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Mark the request notification as read
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    if (action === 'accept') {
      // Check if patient already has a therapist assigned
      if (patient.primaryTherapistId) {
        await prisma.notification.create({
          data: {
            senderId: user.id,
            receiverId: patient.userId!,
            type: "SYSTEM",
            title: "Assignment Request Update",
            message: `${user.name || user.email} tried to accept your request, but you already have an assigned therapist.`,
            isUrgent: false,
          },
        });

        return NextResponse.json(
          { error: "Patient already has an assigned therapist" },
          { status: 400 }
        );
      }

      // Assign therapist to patient
      await prisma.patient.update({
        where: { id: patientId },
        data: { primaryTherapistId: therapist.id },
      });

      // Notify patient of acceptance
      await prisma.notification.create({
        data: {
          senderId: user.id,
          receiverId: patient.userId!,
          type: "SYSTEM",
          title: "Therapist Assignment Accepted",
          message: `Great news! ${user.name || user.email} has accepted your assignment request. You can now book sessions with your therapist. ${message ? `Message from therapist: ${message}` : ''}`,
          isUrgent: true,
        },
      });

      return NextResponse.json({
        message: "Assignment request accepted successfully",
        patient: {
          id: patient.id,
          name: `${patient.firstName} ${patient.lastName}`,
        },
      });
    } else {
      // Notify patient of rejection
      await prisma.notification.create({
        data: {
          senderId: user.id,
          receiverId: patient.userId!,
          type: "SYSTEM",
          title: "Therapist Assignment Declined",
          message: `${user.name || user.email} has declined your assignment request. ${message ? `Reason: ${message}` : 'You may request another therapist.'}`,
          isUrgent: false,
        },
      });

      return NextResponse.json({
        message: "Assignment request declined",
      });
    }
  } catch (error) {
    console.error("Error processing assignment request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}