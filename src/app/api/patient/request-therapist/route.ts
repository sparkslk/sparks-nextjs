import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {prisma} from "@/lib/prisma";

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

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { therapistId, message } = await request.json();

    if (!therapistId) {
      return NextResponse.json(
        { error: "Therapist ID is required" },
        { status: 400 }
      );
    }

    // Get patient profile
    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found. Please create your profile first." },
        { status: 404 }
      );
    }

    // Check if patient already has an assigned therapist
    if (patient.primaryTherapistId) {
      return NextResponse.json(
        { error: "You already have an assigned therapist. Please contact support to change therapists." },
        { status: 400 }
      );
    }

    // Get therapist details
    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    // Check if there's already a pending request to this therapist
    const existingRequest = await prisma.notification.findFirst({
      where: {
        senderId: user.id,
        receiverId: therapist.userId,
        type: "SYSTEM",
        title: { contains: "Therapist Assignment Request" },
        isRead: false,
      },
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
        senderId: user.id,
        receiverId: therapist.userId,
        type: "SYSTEM",
        title: "Therapist Assignment Request",
        message: `${patient.firstName} ${patient.lastName} has requested you as their primary therapist. ${message ? `Message: ${message}` : ''} Patient ID: ${patient.id}`,
        isUrgent: false,
      },
    });

    // Create a notification for the patient as confirmation
    await prisma.notification.create({
      data: {
        senderId: therapist.userId,
        receiverId: user.id,
        type: "SYSTEM",
        title: "Assignment Request Sent",
        message: `Your request to ${therapist.user.name || therapist.user.email} has been sent. You will be notified once they respond.`,
        isUrgent: false,
      },
    });

    return NextResponse.json({
      message: "Therapist assignment request sent successfully",
      notification: {
        id: notification.id,
        therapistName: therapist.user.name || therapist.user.email,
      },
    });
  } catch (error) {
    console.error("Error requesting therapist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get available therapists
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const therapists = await prisma.therapist.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            patients: true,
            therapySessions: true,
          },
        },
      },
      orderBy: {
        rating: 'desc',
      },
    });

    return NextResponse.json({
      therapists: therapists.map(therapist => ({
        id: therapist.id,
        name: therapist.user.name,
        email: therapist.user.email,
        image: therapist.user.image,
        specialization: therapist.specialization,
        experience: therapist.experience,
        bio: therapist.bio,
        rating: therapist.rating,
        patientCount: therapist._count.patients,
        sessionCount: therapist._count.therapySessions,
      })),
    });
  } catch (error) {
    console.error("Error fetching therapists:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}