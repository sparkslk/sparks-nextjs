import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Get detailed therapist information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ therapistId: string }> }
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

    const { therapistId } = await params;

    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        _count: {
          select: {
            patients: true,
            therapySessions: true
          }
        }
      }
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    // Check if this is the patient's current therapist
    const patient = await prisma.patient.findUnique({
      where: { userId: payload.userId },
      select: {
        primaryTherapistId: true
      }
    });

    // Get therapist's average session duration
    const sessions = await prisma.therapySession.findMany({
      where: {
        therapistId: therapist.id,
        status: "COMPLETED"
      },
      select: {
        scheduledAt: true,
        duration: true
      },
      take: 10,
      orderBy: {
        scheduledAt: 'desc'
      }
    });

    // Get available time slots for the next 7 days
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const bookedSlots = await prisma.therapySession.findMany({
      where: {
        therapistId: therapist.id,
        scheduledAt: {
          gte: today,
          lte: nextWeek
        },
        status: {
          in: ["SCHEDULED", "APPROVED"]
        }
      },
      select: {
        scheduledAt: true,
        duration: true
      }
    });

    return NextResponse.json({
      therapist: {
        id: therapist.id,
        userId: therapist.userId,
        name: therapist.user.name || "Therapist",
        email: therapist.user.email,
        image: therapist.user.image,
        bio: therapist.bio,
        specialization: therapist.specialization,
        experience: therapist.experience,
        rating: therapist.rating?.toNumber() || 0,
        availability: therapist.availability,
        patientCount: therapist._count.patients,
        sessionCount: therapist._count.therapySessions,
        isMyTherapist: patient?.primaryTherapistId === therapist.id,
        averageSessionDuration: sessions.length > 0 
          ? sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length 
          : 60,
        bookedSlots: bookedSlots.map(slot => ({
          date: slot.scheduledAt,
          duration: slot.duration
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching therapist details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}