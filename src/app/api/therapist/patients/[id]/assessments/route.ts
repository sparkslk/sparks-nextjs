import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/therapist/patients/{id}/assessments:
 *   get:
 *     summary: Get assessments assigned to a patient
 *     description: Retrieve all assessments assigned to a specific patient
 *     tags:
 *       - Therapist
 *       - Patient Assessments
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient assessments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assessments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       type:
 *                         type: string
 *                       description:
 *                         type: string
 *                       link:
 *                         type: string
 *                       status:
 *                         type: string
 *                       completedAt:
 *                         type: string
 *                         nullable: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await context.params;

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

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Get all assessment assignments for this patient
    const assessmentAssignments = await prisma.assessmentAssignment.findMany({
      where: {
        patientId: patientId
      },
      include: {
        Assessment: {
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            link: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the assessments for the frontend
    const assessments = assessmentAssignments.map((assignment) => ({
      id: assignment.Assessment.id,
      title: assignment.Assessment.title || assignment.Assessment.type,
      type: assignment.Assessment.type,
      description: assignment.Assessment.description || '',
      link: assignment.Assessment.link,
      image: assignment.Assessment.image,
      status: assignment.status,
      completedAt: assignment.completedAt ? assignment.completedAt.toISOString() : null,
      assignedAt: assignment.createdAt.toISOString(),
      assignmentId: assignment.id
    }));

    return NextResponse.json({
      assessments
    });

  } catch (error) {
    console.error("Error fetching patient assessments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/therapist/patients/{id}/assessments:
 *   post:
 *     summary: Assign assessment to patient
 *     description: Assign a specific assessment to a patient
 *     tags:
 *       - Therapist
 *       - Patient Assessments
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assessmentId
 *             properties:
 *               assessmentId:
 *                 type: string
 *                 description: Assessment ID to assign
 *     responses:
 *       201:
 *         description: Assessment assigned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Patient or assessment not found
 *       409:
 *         description: Assessment already assigned
 *       500:
 *         description: Internal server error
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await context.params;

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
    const { assessmentId } = body;

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
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

    // Check if assessment is already assigned to this patient
    const existingAssignment = await prisma.assessmentAssignment.findFirst({
      where: {
        assessmentId: assessmentId,
        patientId: patientId
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Assessment is already assigned to this patient" },
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
      const patientNotificationMessage = `${therapistName} has assigned you a new assessment: "${assessment.title || assessment.type}". Please complete it at your earliest convenience.`;

      // Message for parent (with patient name)
      const parentNotificationMessage = `${therapistName} has assigned a new assessment "${assessment.title || assessment.type}" to ${patientFullName}. Please help them complete it.`;

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
      { message: "Assessment assigned successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error assigning assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/therapist/patients/{id}/assessments:
 *   delete:
 *     summary: Unassign assessment from patient
 *     description: Remove an assessment assignment from a patient
 *     tags:
 *       - Therapist
 *       - Patient Assessments
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assessmentId
 *             properties:
 *               assessmentId:
 *                 type: string
 *                 description: Assessment ID to unassign
 *     responses:
 *       200:
 *         description: Assessment unassigned successfully
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
  context: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await context.params;

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
    const { assessmentId } = body;

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
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
      message: "Assessment unassigned successfully"
    });

  } catch (error) {
    console.error("Error unassigning assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}