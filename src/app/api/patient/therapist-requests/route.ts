import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * Get patient's therapist assignment requests
 * Returns all requests (pending, accepted, rejected)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireApiAuth(request);

    if (session.user.role !== "NORMAL_USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get patient profile
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        primaryTherapistId: true,
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Get all assignment requests for this patient
    const requests = await prisma.therapistAssignmentRequest.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        therapist: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format requests for frontend
    const formattedRequests = requests.map(request => ({
      id: request.id,
      therapistId: request.therapistId,
      therapistName: request.therapist.user.name || "Therapist",
      therapistEmail: request.therapist.user.email,
      therapistImage: request.therapist.user.image,
      therapistSpecialization: request.therapist.specialization,
      status: request.status,
      requestMessage: request.requestMessage,
      responseMessage: request.responseMessage,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      isCurrentTherapist: patient.primaryTherapistId === request.therapistId,
    }));

    return NextResponse.json({
      requests: formattedRequests,
      currentTherapistId: patient.primaryTherapistId,
    });

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error fetching therapist requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
