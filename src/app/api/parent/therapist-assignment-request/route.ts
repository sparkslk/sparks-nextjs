import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { patientId, therapistId, requestMessage, parentId } = await req.json();
    
    if (!patientId || !therapistId) {
      return NextResponse.json({ error: "Missing patientId or therapistId" }, { status: 400 });
    }

    // Get patient details for notification
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Get therapist details to verify and get user ID
    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
      select: { 
        id: true, 
        userId: true,
        user: {
          select: { id: true, name: true }
        }
      }
    });

    if (!therapist) {
      return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
    }

    // Try to find existing request
    const existingRequest = await prisma.therapistAssignmentRequest.findFirst({
      where: {
        patientId,
        therapistId,
      }
    });

    let assignmentRequest;
    
    if (existingRequest) {
      // Update existing request
      assignmentRequest = await prisma.therapistAssignmentRequest.update({
        where: {
          id: existingRequest.id
        },
        data: {
          requestMessage,
          status: "PENDING",
          updatedAt: new Date()
        }
      });
    } else {
      // Create new request
      assignmentRequest = await prisma.therapistAssignmentRequest.create({
        data: {
          patientId,
          therapistId,
          requestMessage,
          status: "PENDING"
        }
      });
    }

    // Send notification to the therapist (only for new requests or when updating to PENDING)
    try {
      const patientFullName = `${patient.firstName} ${patient.lastName}`.trim();
      
      // Check if a similar notification already exists recently (within last 30 seconds)
      const recentNotification = await prisma.notification.findFirst({
        where: {
          receiverId: therapist.userId,
          type: "SYSTEM",
          title: "Therapist Assignment Request",
          message: {
            contains: patientFullName
          },
          createdAt: {
            gte: new Date(Date.now() - 30000) // Within last 30 seconds
          }
        }
      });

      if (!recentNotification) {
        await prisma.notification.create({
          data: {
            senderId: parentId,  // Parent who made the request
            receiverId: therapist.userId,  // Therapist's user ID
            type: "SYSTEM",
            title: "Therapist Assignment Request",
            message: `${patientFullName} has requested you as their primary therapist. Message: ${requestMessage || 'No message provided'} Patient ID: ${patientId}`,
            isRead: false,
            isUrgent: true
          }
        });
        console.log("Assignment request notification sent to therapist:", therapist.userId);
      } else {
        console.log("Similar assignment request notification already exists, skipping duplicate");
      }
    } catch (notificationError) {
      console.error("Failed to create assignment request notification:", notificationError);
      // Continue execution even if notification fails
    }

    return NextResponse.json({ success: true, assignmentRequest });
  } catch (error) {
    console.error("[THERAPIST_ASSIGNMENT_REQUEST]", error);
    return NextResponse.json({ error: "Failed to create/update assignment request" }, { status: 500 });
  }
}