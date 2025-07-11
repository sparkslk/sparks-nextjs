import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await requireApiAuth(request, ['PARENT_GUARDIAN']);
    const { id } = params;

    // Fetch the session by id
    const session = await prisma.therapySession.findUnique({
      where: { id },
    });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check parent access to the child
    const parentGuardianRelation = await prisma.parentGuardian.findFirst({
      where: {
        userId: sessionUser.user.id,
        patientId: session.patientId,
      },
    });
    if (!parentGuardianRelation) {
      return NextResponse.json({ error: "You don't have access to this session" }, { status: 403 });
    }

    // Fetch therapist info
    let therapistName = 'Assigned Therapist';
    let therapistEmail = '';
    let specializations: string[] = [];
    if (session.therapistId) {
      const therapist = await prisma.therapist.findUnique({
        where: { id: session.therapistId },
        select: { userId: true, specialization: true },
      });
      if (therapist) {
        const user = await prisma.user.findUnique({
          where: { id: therapist.userId },
          select: { name: true, email: true },
        });
        therapistName = user?.name || therapistName;
        therapistEmail = user?.email || '';
        specializations = Array.isArray(therapist.specialization)
          ? therapist.specialization
          : [therapist.specialization].filter(Boolean);
      }
    }

    // Format session data for frontend
    const sessionDate = new Date(session.scheduledAt);
    const responseSession = {
      id: session.id,
      childId: session.patientId,
      date: sessionDate.toISOString().split('T')[0],
      time: sessionDate.toTimeString().slice(0, 5),
      therapist: therapistName,
      therapistEmail,
      therapistPhone: '',
      specializations,
      mode: 'Video Call', // Adjust if you have a mode field
      status: session.status,
      duration: session.duration || 60,
      sessionType: session.type || 'Therapy Session',
      notes: session.sessionNotes || '',
    //   objectives: session.objectives || [],
      attendance: session.attendanceStatus || '',
      engagement: session.patientEngagement || '',
      progress: session.overallProgress || '',
    //   feedback: session.feedback || '',
    //   review: session.review || '',
    };

    return NextResponse.json({ session: responseSession });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
