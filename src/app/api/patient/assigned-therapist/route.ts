import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
      include: {
        primaryTherapist: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    if (!patient.primaryTherapist) {
      return NextResponse.json({
        message: "No therapist assigned",
        therapist: null,
      });
    }

    return NextResponse.json({
      therapist: {
        id: patient.primaryTherapist.id,
        name: patient.primaryTherapist.user.name,
        email: patient.primaryTherapist.user.email,
        image: patient.primaryTherapist.user.image,
        specialization: patient.primaryTherapist.specialization,
        experience: patient.primaryTherapist.experience,
        bio: patient.primaryTherapist.bio,
      },
    });
  } catch (error) {
    console.error("Error fetching assigned therapist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}