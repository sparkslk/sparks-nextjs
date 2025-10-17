import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/therapist/assessments/{assessmentId}/assignments:
 *   get:
 *     summary: Get patients assigned to an assessment
 *     description: Retrieve all patients assigned to a specific assessment
 *     tags:
 *       - Therapist
 *       - Assessment Assignments
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Assignment data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assignments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       completedAt:
 *                         type: string
 *                         nullable: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assessment not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ assessmentId: string }> }
) {
  const { assessmentId } = await context.params;

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

    // Check if assessment exists and belongs to this therapist
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Get all assignment records for this assessment
    const assignmentRecords = await prisma.assessmentAssignment.findMany({
      where: {
        assessmentId: assessmentId
      },
      include: {
        Patient: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });

    // Format the assignments for the frontend
    const assignments = assignmentRecords.map((record) => ({
      id: record.patientId,
      name: `${record.Patient.firstName} ${record.Patient.lastName}`.trim(),
      email: record.Patient.user?.email || record.Patient.email || undefined,
      completedAt: record.completedAt ? record.completedAt.toISOString() : undefined
    }));

    return NextResponse.json({
      assignments
    });

  } catch (error) {
    console.error("Error fetching assessment assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/therapist/assessments/{assessmentId}/assignments:
 *   post:
 *     summary: Assign patient to assessment
 *     description: Assign a patient to a specific assessment
 *     tags:
 *       - Therapist
 *       - Assessment Assignments
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Assessment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *             properties:
 *               patientId:
 *                 type: string
 *                 description: Patient ID to assign
 *     responses:
 *       201:
 *         description: Patient assigned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assessment or patient not found
 *       409:
 *         description: Patient already assigned
 *       500:
 *         description: Internal server error
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ assessmentId: string }> }
) {
  const { assessmentId } = await context.params;

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
    const { patientId } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Check if assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check if patient exists and is under this therapist
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Check if patient is already assigned to this assessment
    const existingAssignment = await prisma.assessmentAssignment.findFirst({
      where: {
        assessmentId: assessmentId,
        patientId: patientId
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Patient is already assigned to this assessment" },
        { status: 409 }
      );
    }

    // Create the assignment
    await prisma.assessmentAssignment.create({
      data: {
        assessmentId: assessmentId,
        patientId: patientId,
        status: "PENDING"
      }
    });

    // Send notification to patient and parent
    try {
      const patientFullName = `${patient.firstName} ${patient.lastName}`.trim();
      const therapistName = user.name || "Your therapist";
      
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

      const notificationTitle = "New Assessment Assignment";
      
      // Message for patient (without patient name)
      const patientNotificationMessage = `${therapistName} has assigned you a new assessment: "${assessment.title}". Please complete it at your earliest convenience.`;

      // Message for parent (with patient name)
      const parentNotificationMessage = `${therapistName} has assigned a new assessment "${assessment.title}" to ${patientFullName}. Please help them complete it.`;

      // Send notification to patient (if patient has a user account)
      if (patientUser) {
        try {
          await prisma.notification.create({
            data: {
              senderId: user.id,
              receiverId: patientUser.id,
              type: "SYSTEM",
              title: notificationTitle,
              message: patientNotificationMessage,
              isRead: false,
              isUrgent: false
            }
          });
        } catch (error) {
          console.error("Failed to send notification to patient:", error);
        }
      }

      // Send notification to parent/guardian
      if (parentGuardian?.user) {
        try {
          await prisma.notification.create({
            data: {
              senderId: user.id,
              receiverId: parentGuardian.user.id,
              type: "SYSTEM",
              title: notificationTitle,
              message: parentNotificationMessage,
              isRead: false,
              isUrgent: false
            }
          });
        } catch (error) {
          console.error("Failed to send notification to parent:", error);
        }
      }

    } catch (notificationError) {
      console.error("Error sending notifications:", notificationError);
      // Continue execution even if notifications fail
    }

    return NextResponse.json(
      { message: "Patient assigned successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error assigning patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/therapist/assessments/{assessmentId}/assignments:
 *   delete:
 *     summary: Unassign patient from assessment
 *     description: Remove a patient assignment from a specific assessment
 *     tags:
 *       - Therapist
 *       - Assessment Assignments
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Assessment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *             properties:
 *               patientId:
 *                 type: string
 *                 description: Patient ID to unassign
 *     responses:
 *       200:
 *         description: Patient unassigned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ assessmentId: string }> }
) {
  const { assessmentId } = await context.params;

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
    const { patientId } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Check if assignment exists
    const existingAssignment = await prisma.assessmentAssignment.findFirst({
      where: {
        assessmentId: assessmentId,
        patientId: patientId
      }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Delete the assignment
    await prisma.assessmentAssignment.delete({
      where: {
        id: existingAssignment.id
      }
    });

    return NextResponse.json({
      message: "Patient unassigned successfully"
    });

  } catch (error) {
    console.error("Error unassigning patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
