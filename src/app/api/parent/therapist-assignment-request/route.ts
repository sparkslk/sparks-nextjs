import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { patientId, therapistId, requestMessage } = await req.json();
    
    if (!patientId || !therapistId) {
      return NextResponse.json({ error: "Missing patientId or therapistId" }, { status: 400 });
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

    return NextResponse.json({ success: true, assignmentRequest });
  } catch (error) {
    console.error("[THERAPIST_ASSIGNMENT_REQUEST]", error);
    return NextResponse.json({ error: "Failed to create/update assignment request" }, { status: 500 });
  }
}