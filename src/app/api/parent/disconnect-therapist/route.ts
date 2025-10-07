import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { therapistId, childName, parentId } = await req.json();
    
    if (!therapistId || !childName) {
      return NextResponse.json({ error: "Missing therapistId or childName" }, { status: 400 });
    }

    // Find the patient by name
    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { firstName: childName },
          { firstName: childName.split(' ')[0] }
        ],
        primaryTherapistId: therapistId
      }
    });

    if (!patient) {
      console.log("Patient not found or not assigned to therapist:", { childName, therapistId });
      return NextResponse.json({ error: "Patient not found or not assigned to this therapist" }, { status: 404 });
    }

    console.log("Found patient:", patient.id, "assigned to therapist:", therapistId);

    // Remove the therapist assignment from the patient
    await prisma.patient.update({
      where: { id: patient.id },
      data: { primaryTherapistId: null }
    });
    console.log("Removed therapist assignment from patient:", patient.id);

    // Update any pending assignment requests to CANCELLED
    const updatedRequests = await prisma.therapistAssignmentRequest.updateMany({
      where: {
        patientId: patient.id,
        therapistId: therapistId,
        status: "ACCEPTED"
      },
      data: { status: "CANCELLED" }
    });
    console.log("Updated assignment requests:", updatedRequests.count);

    // Verify therapist exists and get the associated user ID
    const therapistExists = await prisma.therapist.findUnique({
      where: { id: therapistId },
      select: { 
        id: true, 
        userId: true,  // Get the user ID associated with this therapist
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!therapistExists) {
      console.error("Therapist not found:", therapistId);
      return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
    }

    console.log("Found therapist:", therapistExists.id, "User ID:", therapistExists.userId);

    // Send notification to the therapist's user account
    try {
      console.log("Creating notification for user:", therapistExists.userId);
      
      // Check if a similar notification already exists recently (within last 10 seconds)
      const recentNotification = await prisma.notification.findFirst({
        where: {
          receiverId: therapistExists.userId,
          type: "SYSTEM",
          title: "Patient Disconnection",
          message: {
            contains: childName
          },
          createdAt: {
            gte: new Date(Date.now() - 10000) // Within last 10 seconds
          }
        }
      });

      if (recentNotification) {
        console.log("Similar notification already exists, skipping duplicate:", recentNotification.id);
      } else {
        const notification = await prisma.notification.create({
          data: {
            senderId: parentId,  // Add the parent as the sender
            receiverId: therapistExists.userId,  // Use the user ID, not therapist ID
            type: "SYSTEM",
            title: "Patient Disconnection",
            message: `You have been disconnected from patient ${childName}. The parent has decided to end the therapeutic relationship.`,
            isRead: false,
            isUrgent: true
          }
        });
        console.log("Notification created successfully:", notification.id);
      }
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError);
      console.error("Notification error details:", JSON.stringify(notificationError, null, 2));
      // Continue execution even if notification fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[THERAPIST_DISCONNECT]", error);
    return NextResponse.json({ error: "Failed to disconnect therapist" }, { status: 500 });
  }
}