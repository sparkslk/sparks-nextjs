import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Find the therapy session and verify the user has permission
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
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        therapist: {
          select: {
            session_rate: true,
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!therapySession) {
      return NextResponse.json({ error: "Session not found or unauthorized" }, { status: 404 });
    }

    // Check if session can be rescheduled
    if (therapySession.status === "CANCELLED") {
      return NextResponse.json({ 
        canReschedule: false,
        reason: "CANCELLED",
        message: "Cannot reschedule a cancelled session"
      });
    }

    if (therapySession.status === "COMPLETED") {
      return NextResponse.json({ 
        canReschedule: false,
        reason: "COMPLETED",
        message: "Cannot reschedule a completed session"
      });
    }

    // Get the current therapist rate and the rate at time of booking
    const currentTherapistRate = therapySession.therapist.session_rate || 0;
    // Use type assertion to access bookedRate until Prisma types are updated
    const bookedRate = (therapySession as typeof therapySession & { bookedRate?: number }).bookedRate || 0;
    
    // Check if therapist rate has changed since booking
    const hasRateChanged = bookedRate > 0 && bookedRate.toString() !== currentTherapistRate.toString();

    if (hasRateChanged) {
      // Rate has changed - cannot reschedule
      return NextResponse.json({ 
        canReschedule: false,
        reason: "RATE_CHANGED",
        message: `The therapist has changed their rates since your original booking. If you can't attend the scheduled session, please cancel this appointment and make a new schedule at the current rate.`,
        originalRate: bookedRate,
        currentRate: currentTherapistRate,
        therapistName: therapySession.therapist.user.name || "Your therapist",
        patientName: `${therapySession.patient.firstName} ${therapySession.patient.lastName}`
      });
    }

    // All checks passed - can reschedule
    return NextResponse.json({
      canReschedule: true,
      message: "Session can be rescheduled"
    });

  } catch (error) {
    console.error("Error checking reschedule eligibility:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
