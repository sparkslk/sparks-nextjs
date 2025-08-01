import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const session = await requireApiAuth(request, ['PARENT_GUARDIAN']);
    const { childId } = await params;

    // Verify that the parent has access to this child
    const parentGuardianRelation = await prisma.parentGuardian.findFirst({
      where: {
        userId: session.user.id,
        patientId: childId
      }
    });

    if (!parentGuardianRelation) {
      return NextResponse.json(
        { error: "You don't have access to this child's sessions" },
        { status: 403 }
      );
    }

    // Fetch sessions for the child
    const sessions = await prisma.therapySession.findMany({
      where: {
        patientId: childId
      },
      orderBy: {
        scheduledAt: 'desc'
      }
    });

    // Get unique therapist IDs
    const therapistIds = [...new Set(sessions.map(session => session.therapistId).filter(Boolean))];
    
    // Fetch therapist details
    const therapists = await prisma.therapist.findMany({
      where: {
        id: { in: therapistIds }
      },
      select: {
        id: true,
        userId: true,
        licenseNumber: true,
        specialization: true,
      }
    });

    // Fetch user details for therapists
    const userIds = therapists.map(t => t.userId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    // Create therapist lookup map
    const therapistMap = new Map();
    therapists.forEach(therapist => {
      const user = users.find(u => u.id === therapist.userId);
      if (user) {
        therapistMap.set(therapist.id, {
          ...therapist,
          name: user.name,
          email: user.email,
        });
      }
    });

    console.log(`Fetched ${sessions.length} sessions for child ${childId}`);

    // Transform database data to match frontend interface
    const transformedSessions = sessions.map(session => {
      const sessionDate = new Date(session.scheduledAt);
      const status = session.status;
      // Get therapist details
      const therapist = therapistMap.get(session.therapistId);
      const therapistName = therapist?.name || 'Assigned Therapist';
      console.log(`Processing session for therapist: ${therapistName}`);
      // Format time in 'Asia/Colombo' timezone using UTC conversion (like dashboard/route)
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
      return {
        id: session.id,
        childId: session.patientId,
        date: sessionDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        time: formattedTime, // Localized time
        therapist: therapistName,
        therapistEmail: therapist?.email || '',
        therapistPhone: '', // Phone not available in current schema
        specializations: Array.isArray(therapist?.specialization) ? therapist.specialization : [therapist?.specialization].filter(Boolean),
        mode: 'Video Call', // Default mode - adjust based on your session type logic
        status: status,
        duration: session.duration || 60,
        sessionType: session.type || 'Therapy Session',
        notes: '', // No progressNotes property exists on session
        objectives: [],
      };
    });

    return NextResponse.json({
      success: true,
      sessions: transformedSessions,
      message: 'Sessions retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch sessions',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}