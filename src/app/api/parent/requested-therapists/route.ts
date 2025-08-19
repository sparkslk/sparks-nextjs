import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get("parentId");

  if (!parentId) {
    return NextResponse.json({ error: "Parent ID is required" }, { status: 400 });
  }

  try {
    // First get all patients (children) associated with this parent
    const parentGuardians = await prisma.parentGuardian.findMany({
      where: {
        userId: parentId
      },
      select: {
        patientId: true,
        patient: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    if (!parentGuardians || parentGuardians.length === 0) {
      return NextResponse.json({ requests: [] });
    }

    // Get child IDs
    const childIds = parentGuardians.map(pg => pg.patientId);

    // Get all pending therapist assignment requests for these children
    const requests = await prisma.therapistAssignmentRequest.findMany({
      where: {
        patientId: {
          in: childIds
        },
        status: "PENDING"
      },
      include: {
        patient: true,
        therapist: {
          include: {
            user: true
          }
        }
      }
    });

    // Format the response
    const formattedRequests = requests.map(req => ({
      id: req.id,
      childName: `${req.patient.firstName}${req.patient.lastName ? ' ' + req.patient.lastName : ''}`,
      therapist: {
        id: req.therapist.id,
        name: req.therapist.user.name, // Get actual name from User table
        licenseNumber: req.therapist.licenseNumber,
        specialization: req.therapist.specialization,
        experience: req.therapist.experience,
        bio: req.therapist.bio,
        rating: req.therapist.rating?.toNumber() || null
      },
      status: req.status,
      requestMessage: req.requestMessage,
      responseMessage: req.responseMessage,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt
    }));

    console.log("Formatted requests:" , formattedRequests);

    return NextResponse.json({ requests: formattedRequests });

  } catch (error) {
    console.error("Error fetching requested therapists:", error);
    return NextResponse.json({ error: "Failed to fetch requested therapists" }, { status: 500 });
  }
}