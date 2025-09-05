import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        therapistProfile: true,
        parentGuardianRel: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the user has permission to view this session's reschedule history
    const therapySession = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        OR: [
          // Therapist owns the session
          { therapistId: user.therapistProfile?.id },
          // Parent/guardian has access to the patient
          {
            patient: {
              parentGuardians: {
                some: {
                  userId: user.id
                }
              }
            }
          },
          // Patient owns the session (if direct user)
          { patient: { userId: user.id } }
        ]
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        therapist: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!therapySession) {
      return NextResponse.json({ error: "Session not found or unauthorized" }, { status: 404 });
    }

    // Get reschedule history for this session
    const rescheduleHistory = await prisma.sessionReschedule.findMany({
      where: {
        sessionId: sessionId
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        rescheduledAt: 'desc'
      }
    });

    return NextResponse.json({
      sessionId,
      sessionDetails: {
        patientName: `${therapySession.patient.firstName} ${therapySession.patient.lastName}`,
        therapistName: therapySession.therapist.user.name || therapySession.therapist.user.email,
        currentScheduledAt: therapySession.scheduledAt,
        status: therapySession.status
      },
      rescheduleHistory: rescheduleHistory.map(reschedule => ({
        id: reschedule.id,
        previousScheduledAt: reschedule.previousScheduledAt,
        newScheduledAt: reschedule.newScheduledAt,
        rescheduledAt: reschedule.rescheduledAt,
        rescheduledBy: {
          id: reschedule.User.id,
          name: reschedule.User.name,
          email: reschedule.User.email,
          role: reschedule.rescheduledByRole
        },
        reason: reschedule.rescheduleReason,
        createdAt: reschedule.createdAt
      }))
    });

  } catch (error) {
    console.error("Error fetching reschedule history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
