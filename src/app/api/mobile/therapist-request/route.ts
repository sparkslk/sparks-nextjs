import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Request a therapist assignment
export async function POST(request: NextRequest) {
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

    const { therapistId, message } = await request.json();

    if (!therapistId) {
      return NextResponse.json(
        { error: "Therapist ID is required" },
        { status: 400 }
      );
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { userId: payload.userId },
      include: {
        primaryTherapist: {
          include: {
            user: true
          }
        },
        user: true
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found. Please create your profile first." },
        { status: 404 }
      );
    }

    // Check if patient already has a therapist
    if (patient.primaryTherapistId) {
      return NextResponse.json({
        error: "You already have an assigned therapist",
        currentTherapist: {
          id: patient.primaryTherapist!.id,
          name: patient.primaryTherapist!.user.name || "Your Therapist",
          email: patient.primaryTherapist!.user.email
        }
      }, { status: 400 });
    }

    // Check if therapist exists and is active
    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
      include: {
        user: true
      }
    });

    if (!therapist || !therapist.user.isActive) {
      return NextResponse.json(
        { error: "Therapist not found or inactive" },
        { status: 404 }
      );
    }

    // Check if there's already a pending request to this therapist
    const existingRequest = await prisma.notification.findFirst({
      where: {
        senderId: payload.userId,
        receiverId: therapist.userId,
        type: "SYSTEM",
        title: "Therapist Assignment Request",
        isRead: false
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request with this therapist" },
        { status: 400 }
      );
    }

    // Create notification for therapist
    const notification = await prisma.notification.create({
      data: {
        senderId: payload.userId,
        receiverId: therapist.userId,
        type: "SYSTEM",
        title: "Therapist Assignment Request",
        message: `${patient.user.name || patient.firstName + ' ' + patient.lastName} has requested you as their therapist. Patient ID: ${patient.id}${message ? `. Message: ${message}` : ''}`,
        isUrgent: false
      }
    });

    // Create notification for patient to track the request
    await prisma.notification.create({
      data: {
        senderId: payload.userId,
        receiverId: payload.userId,
        type: "SYSTEM",
        title: "Assignment Request Sent",
        message: `Your therapist assignment request has been sent to ${therapist.user.name || therapist.user.email}. You will be notified once they respond.`,
        isUrgent: false
      }
    });

    return NextResponse.json({
      success: true,
      message: "Therapist assignment request sent successfully",
      requestId: notification.id,
      therapist: {
        id: therapist.id,
        name: therapist.user.name || "Therapist",
        email: therapist.user.email
      }
    });

  } catch (error) {
    console.error("Error requesting therapist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get current therapist assignment status
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

    const patient = await prisma.patient.findUnique({
      where: { userId: payload.userId },
      include: {
        primaryTherapist: {
          include: {
            user: true
          }
        }
      }
    });

    if (!patient) {
      return NextResponse.json({
        hasProfile: false,
        hasTherapist: false,
        pendingRequests: []
      });
    }

    // Get pending requests
    const pendingRequests = await prisma.notification.findMany({
      where: {
        senderId: payload.userId,
        type: "SYSTEM",
        title: "Therapist Assignment Request",
        isRead: false
      },
      include: {
        receiver: {
          include: {
            therapist: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedRequests = pendingRequests.map(req => ({
      id: req.id,
      therapistId: req.receiver.therapist?.id,
      therapistName: req.receiver.name || req.receiver.email,
      requestedAt: req.createdAt,
      status: "pending"
    }));

    return NextResponse.json({
      hasProfile: true,
      hasTherapist: !!patient.primaryTherapistId,
      currentTherapist: patient.primaryTherapist ? {
        id: patient.primaryTherapist.id,
        name: patient.primaryTherapist.user.name || "Your Therapist",
        email: patient.primaryTherapist.user.email,
        image: patient.primaryTherapist.user.image,
        specializations: patient.primaryTherapist.specializations,
        assignedAt: patient.updatedAt
      } : null,
      pendingRequests: formattedRequests
    });

  } catch (error) {
    console.error("Error fetching therapist status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}