import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/therapist/patients/{id}/assessments/unassigned:
 *   get:
 *     summary: Get unassigned assessments for a patient
 *     description: Retrieve all assessments that are not yet assigned to a specific patient
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
 *         description: Unassigned assessments retrieved successfully
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

    // Get all assessments that are NOT assigned to this patient
    const assignedAssessmentIds = await prisma.assessmentAssignment.findMany({
      where: {
        patientId: patientId
      },
      select: {
        assessmentId: true
      }
    });

    const assignedIds = assignedAssessmentIds.map(a => a.assessmentId);

    const unassignedAssessments = await prisma.assessment.findMany({
      where: {
        id: {
          notIn: assignedIds
        }
      },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        link: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the assessments for the frontend
    const assessments = unassignedAssessments.map((assessment) => ({
      id: assessment.id,
      title: assessment.title || assessment.type,
      type: assessment.type,
      description: assessment.description || '',
      link: assessment.link,
      image: assessment.image,
      typeColor: getTypeColor(assessment.type)
    }));

    return NextResponse.json({
      assessments
    });

  } catch (error) {
    console.error("Error fetching unassigned assessments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to get type color based on assessment type
function getTypeColor(type: string): string {
  const typeColors: { [key: string]: string } = {
    'LISTENING_TASK': 'bg-blue-100 text-blue-700',
    'PICTURE_DESCRIPTION': 'bg-green-100 text-green-700',
    'COGNITIVE_ASSESSMENT': 'bg-purple-100 text-purple-700',
    'MEMORY_TEST': 'bg-orange-100 text-orange-700',
    'VERBAL_FLUENCY': 'bg-pink-100 text-pink-700',
    'ATTENTION_TEST': 'bg-red-100 text-red-700',
    'LANGUAGE_ASSESSMENT': 'bg-indigo-100 text-indigo-700',
    'MOTOR_SKILLS': 'bg-yellow-100 text-yellow-700',
    'SOCIAL_SKILLS': 'bg-teal-100 text-teal-700',
    'BEHAVIORAL_ASSESSMENT': 'bg-cyan-100 text-cyan-700',
  };
  
  return typeColors[type] || 'bg-gray-100 text-gray-700';
}