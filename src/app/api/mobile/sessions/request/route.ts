import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Create a new session request
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

    const { 
      sessionType, 
      preferredDate, 
      preferredTime, 
      duration = 60, 
      notes,
      isUrgent = false 
    } = await request.json();

    if (!sessionType || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { error: "Session type, preferred date, and time are required" },
        { status: 400 }
      );
    }

    // Validate session type
    const validSessionTypes = [
      "INDIVIDUAL_THERAPY",
      "GROUP_THERAPY",
      "FAMILY_THERAPY",
      "COUPLES_THERAPY",
      "CHILD_THERAPY",
      "CONSULTATION"
    ];

    if (!validSessionTypes.includes(sessionType)) {
      return NextResponse.json(
        { error: "Invalid session type" },
        { status: 400 }
      );
    }

    // Get patient with therapist
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
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    if (!patient.primaryTherapistId) {
      return NextResponse.json(
        { error: "You need to have an assigned therapist before requesting sessions" },
        { status: 400 }
      );
    }

    // Combine date and time
    const scheduledAt = new Date(`${preferredDate}T${preferredTime}`);
    
    // Check if the time slot is available
    const existingSession = await prisma.session.findFirst({
      where: {
        therapistId: patient.primaryTherapistId,
        scheduledAt: {
          gte: new Date(scheduledAt.getTime() - duration * 60000),
          lt: new Date(scheduledAt.getTime() + duration * 60000)
        },
        status: {
          in: ["SCHEDULED", "IN_PROGRESS"]
        }
      }
    });

    if (existingSession) {
      return NextResponse.json(
        { error: "This time slot is not available" },
        { status: 400 }
      );
    }

    // Create session request
    const session = await prisma.session.create({
      data: {
        patientId: patient.id,
        therapistId: patient.primaryTherapistId,
        type: sessionType,
        scheduledAt,
        duration,
        status: "PENDING",
        notes,
        location: patient.primaryTherapist!.consultationMode === "ONLINE" ? "Online" : "In-Person",
        isUrgent
      }
    });

    // Create notification for therapist
    await prisma.notification.create({
      data: {
        senderId: payload.userId,
        receiverId: patient.primaryTherapist!.userId,
        type: "SESSION_REQUEST",
        title: isUrgent ? "Urgent Session Request" : "New Session Request",
        message: `${patient.firstName} ${patient.lastName} has requested a ${sessionType.toLowerCase().replace('_', ' ')} session on ${new Date(scheduledAt).toLocaleDateString()} at ${new Date(scheduledAt).toLocaleTimeString()}.${notes ? ` Notes: ${notes}` : ''}`,
        isUrgent,
        relatedId: session.id
      }
    });

    // Create confirmation notification for patient
    await prisma.notification.create({
      data: {
        senderId: payload.userId,
        receiverId: payload.userId,
        type: "SYSTEM",
        title: "Session Request Sent",
        message: `Your session request for ${new Date(scheduledAt).toLocaleDateString()} at ${new Date(scheduledAt).toLocaleTimeString()} has been sent to ${patient.primaryTherapist!.user.name || 'your therapist'}. You will be notified once they respond.`,
        isUrgent: false,
        relatedId: session.id
      }
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        type: session.type,
        scheduledAt: session.scheduledAt,
        duration: session.duration,
        status: session.status,
        therapist: {
          id: patient.primaryTherapist!.id,
          name: patient.primaryTherapist!.user.name || "Your Therapist",
          email: patient.primaryTherapist!.user.email
        }
      }
    });

  } catch (error) {
    console.error("Error creating session request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get available time slots for a specific date
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

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const therapistId = searchParams.get("therapistId");

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    let therapistIdToUse = therapistId;

    // If no therapist ID provided, get patient's assigned therapist
    if (!therapistIdToUse) {
      const patient = await prisma.patient.findUnique({
        where: { userId: payload.userId },
        select: { primaryTherapistId: true }
      });

      if (!patient?.primaryTherapistId) {
        return NextResponse.json(
          { error: "No therapist assigned" },
          { status: 400 }
        );
      }

      therapistIdToUse = patient.primaryTherapistId;
    }

    // Get therapist's working hours (assuming 9 AM to 5 PM for now)
    const startHour = 9;
    const endHour = 17;
    const slotDuration = 60; // minutes

    // Get all booked sessions for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedSessions = await prisma.session.findMany({
      where: {
        therapistId: therapistIdToUse,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ["PENDING", "SCHEDULED", "IN_PROGRESS"]
        }
      },
      select: {
        scheduledAt: true,
        duration: true
      }
    });

    // Generate available time slots
    const availableSlots = [];
    const currentDate = new Date();

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);

        // Skip past times
        if (slotTime <= currentDate) {
          continue;
        }

        // Check if slot is available
        const isBooked = bookedSessions.some(session => {
          const sessionEnd = new Date(session.scheduledAt.getTime() + session.duration * 60000);
          const slotEnd = new Date(slotTime.getTime() + slotDuration * 60000);
          
          return (
            (slotTime >= session.scheduledAt && slotTime < sessionEnd) ||
            (slotEnd > session.scheduledAt && slotEnd <= sessionEnd) ||
            (slotTime <= session.scheduledAt && slotEnd >= sessionEnd)
          );
        });

        if (!isBooked) {
          availableSlots.push({
            time: slotTime.toISOString(),
            displayTime: slotTime.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })
          });
        }
      }
    }

    return NextResponse.json({
      date,
      therapistId: therapistIdToUse,
      availableSlots,
      workingHours: {
        start: `${startHour}:00`,
        end: `${endHour}:00`
      }
    });

  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}