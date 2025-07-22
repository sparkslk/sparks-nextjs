import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const sessionUser = await requireApiAuth(request, ['PARENT_GUARDIAN']);
    const { id } = await context.params; // Await params before destructuring

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
    // Fetch patient name from Patient table
    // Fetch patient name from Patient table (combine firstName and lastName)
    let patientName = '';
    if (session.patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: session.patientId },
        select: { firstName: true, lastName: true },
      });
      if (patient) {
        patientName = [patient.firstName, patient.lastName].filter(Boolean).join(' ');
      }
    }
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
    // Format time in 'Asia/Colombo' timezone using UTC conversion (like sessions list)
    const utcDate = new Date(
      sessionDate.getUTCFullYear(),
      sessionDate.getUTCMonth(),
      sessionDate.getUTCDate(),
      sessionDate.getUTCHours(),
      sessionDate.getUTCMinutes(),
      sessionDate.getUTCSeconds()
    );
    const formattedTime = utcDate.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Colombo'
    });
    const responseSession = {
      id: session.id,
      childId: session.patientId,
      patient: patientName,
      date: sessionDate.toISOString().split('T')[0],
      time: formattedTime, // Localized time
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