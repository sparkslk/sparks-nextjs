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
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { patientId, therapistId } = await request.json();

    if (!patientId || !therapistId) {
      return NextResponse.json(
        { error: "Patient ID and Therapist ID are required" },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: { primaryTherapistId: therapistId },
      include: {
        primaryTherapist: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (patient.userId) {
      await prisma.notification.create({
        data: {
          receiverId: patient.userId,
          type: "SYSTEM",
          title: "Therapist Assigned",
          message: `You have been assigned to therapist ${updatedPatient.primaryTherapist?.user.name}`,
          isUrgent: false,
        },
      });
    }

    return NextResponse.json({
      message: "Therapist assigned successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("Error assigning therapist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { patientId } = await request.json();

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: { primaryTherapistId: null },
    });

    if (patient.userId) {
      await prisma.notification.create({
        data: {
          receiverId: patient.userId,
          type: "SYSTEM",
          title: "Therapist Unassigned",
          message: "Your primary therapist has been unassigned. Please contact administration for more information.",
          isUrgent: false,
        },
      });
    }

    return NextResponse.json({
      message: "Therapist unassigned successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("Error unassigning therapist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}