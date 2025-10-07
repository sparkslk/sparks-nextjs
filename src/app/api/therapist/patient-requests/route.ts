import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/therapist/patient-requests:
 *   get:
 *     summary: Get patient requests for therapist
 *     description: Retrieve all pending requests from patients who want to be assigned to this therapist
 *     tags:
 *       - Therapist
 *       - Patient Requests
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Patient requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Request ID
 *                       patientId:
 *                         type: string
 *                         description: Patient ID
 *                       firstName:
 *                         type: string
 *                         description: Patient first name
 *                       lastName:
 *                         type: string
 *                         description: Patient last name
 *                       dateOfBirth:
 *                         type: string
 *                         format: date
 *                         description: Patient date of birth
 *                       gender:
 *                         type: string
 *                         description: Patient gender
 *                       phone:
 *                         type: string
 *                         description: Patient phone number
 *                       email:
 *                         type: string
 *                         description: Patient email
 *                       image:
 *                         type: string
 *                         nullable: true
 *                         description: Patient profile image URL
 *                       requestedAt:
 *                         type: string
 *                         format: date-time
 *                         description: When the request was made
 *                       status:
 *                         type: string
 *                         enum: [pending, accepted, rejected]
 *                         description: Request status
 *                       age:
 *                         type: number
 *                         description: Patient age
 *                       message:
 *                         type: string
 *                         description: Request message from patient
 *                       preferredSessionType:
 *                         type: string
 *                         enum: [in-person, online, both]
 *                         description: Patient preferred session type
 *                       urgencyLevel:
 *                         type: string
 *                         enum: [low, medium, high]
 *                         description: Request urgency level
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - user is not a therapist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden: Therapist access required"
 *       404:
 *         description: Therapist profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Therapist profile not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
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
      include: { therapistProfile: true }
    });

    if (!user || user.role !== "THERAPIST") {
      return NextResponse.json(
        { error: "Forbidden: Therapist access required" },
        { status: 403 }
      );
    }

    if (!user.therapistProfile) {
      return NextResponse.json(
        { error: "Therapist profile not found" },
        { status: 404 }
      );
    }

    // Get patient requests for this therapist
    const assignmentRequests = await prisma.therapistAssignmentRequest.findMany({
      where: {
        therapistId: user.therapistProfile.id,
        status: "PENDING" // Only get pending requests
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                image: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate age from date of birth
    const calculateAge = (dateOfBirth: Date): number => {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    };

    // Format the requests for the frontend
    const formattedRequests = assignmentRequests.map((request: typeof assignmentRequests[number]) => ({
      id: request.id,
      patientId: request.patientId,
      firstName: request.patient.firstName,
      lastName: request.patient.lastName,
      dateOfBirth: request.patient.dateOfBirth.toISOString().split('T')[0],
      gender: request.patient.gender,
      phone: request.patient.phone || request.patient.emergencyContact,
      email: request.patient.user?.email || request.patient.email,
      image: request.patient.user?.image || null,
      requestedAt: request.createdAt.toISOString(),
      status: request.status.toLowerCase(),
      age: calculateAge(request.patient.dateOfBirth),
      message: request.requestMessage || "No message provided",
      // These might need to be added to the schema if they don't exist
      preferredSessionType: "online", // Default value for now
      urgencyLevel: "medium" // Default value for now
    }));

    return NextResponse.json({
      requests: formattedRequests
    });

  } catch (error) {
    console.error("Error fetching patient requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/therapist/patient-requests:
 *   post:
 *     summary: Respond to patient request
 *     description: Accept or reject a patient assignment request
 *     tags:
 *       - Therapist
 *       - Patient Requests
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *               - action
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: ID of the assignment request
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *                 description: Action to take on the request
 *               message:
 *                 type: string
 *                 description: Optional response message
 *     responses:
 *       200:
 *         description: Request processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Request accepted successfully"
 *                 requestId:
 *                   type: string
 *                   description: ID of the processed request
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
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
      include: { therapistProfile: true }
    });

    if (!user || user.role !== "THERAPIST") {
      return NextResponse.json(
        { error: "Forbidden: Therapist access required" },
        { status: 403 }
      );
    }

    if (!user.therapistProfile) {
      return NextResponse.json(
        { error: "Therapist profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { requestId, action, message } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Request ID and action are required" },
        { status: 400 }
      );
    }

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    // Find the assignment request
    const assignmentRequest = await prisma.therapistAssignmentRequest.findUnique({
      where: { id: requestId },
      include: { patient: true }
    });

    if (!assignmentRequest) {
      return NextResponse.json(
        { error: "Assignment request not found" },
        { status: 404 }
      );
    }

    if (assignmentRequest.therapistId !== user.therapistProfile.id) {
      return NextResponse.json(
        { error: "Unauthorized to access this request" },
        { status: 403 }
      );
    }

    if (assignmentRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "Request has already been processed" },
        { status: 400 }
      );
    }

    // Update the request status
    await prisma.therapistAssignmentRequest.update({
      where: { id: requestId },
      data: {
        status: action === "accept" ? "ACCEPTED" : "REJECTED",
        responseMessage: message || null,
        updatedAt: new Date()
      }
    });

    // If accepted, assign the therapist to the patient
    if (action === "accept") {
      await prisma.patient.update({
        where: { id: assignmentRequest.patientId },
        data: {
          primaryTherapistId: user.therapistProfile.id
        }
      });
    }

    // Send notifications to patient and parent
    try {
      const patient = assignmentRequest.patient;
      const patientFullName = `${patient.firstName} ${patient.lastName}`.trim();
      const therapistName = user.name || "Therapist";
      
      // Get patient's user ID for notification
      const patientUser = await prisma.user.findFirst({
        where: {
          patientProfile: {
            id: patient.id
          }
        },
        select: { id: true }
      });

      // Get parent/guardian information
      const parentGuardian = await prisma.parentGuardian.findFirst({
        where: { patientId: patient.id },
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      });

      const notificationTitle = action === "accept" 
        ? "Therapist Assignment Approved" 
        : "Therapist Assignment Declined";
      
      const notificationMessage = action === "accept"
        ? `Good news! ${therapistName} has accepted your therapist assignment request for ${patientFullName}. You can now schedule sessions and begin therapy.${message ? ` Therapist message: ${message}` : ''}`
        : `${therapistName} has declined your therapist assignment request for ${patientFullName}.${message ? ` Therapist message: ${message}` : ''}`;

      // Send notification to patient (if patient has a user account)
      if (patientUser) {
        try {
          await prisma.notification.create({
            data: {
              senderId: user.id, // Therapist's user ID
              receiverId: patientUser.id, // Patient's user ID
              type: "SYSTEM",
              title: notificationTitle,
              message: notificationMessage,
              isRead: false,
              isUrgent: action === "accept" // Acceptance is more urgent than rejection
            }
          });
          console.log(`Notification sent to patient (${patientUser.id}) for ${action} action`);
        } catch (patientNotificationError) {
          console.error("Failed to send notification to patient:", patientNotificationError);
        }
      }

      // Send notification to parent/guardian
      if (parentGuardian?.user) {
        try {
          await prisma.notification.create({
            data: {
              senderId: user.id, // Therapist's user ID
              receiverId: parentGuardian.user.id, // Parent's user ID
              type: "SYSTEM",
              title: notificationTitle,
              message: notificationMessage,
              isRead: false,
              isUrgent: action === "accept" // Acceptance is more urgent than rejection
            }
          });
          console.log(`Notification sent to parent (${parentGuardian.user.id}) for ${action} action`);
        } catch (parentNotificationError) {
          console.error("Failed to send notification to parent:", parentNotificationError);
        }
      }

    } catch (notificationError) {
      console.error("Error sending notifications:", notificationError);
      // Continue execution even if notifications fail
    }

    return NextResponse.json({
      message: `Request ${action}ed successfully`,
      requestId: requestId
    });

  } catch (error) {
    console.error("Error processing patient request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
