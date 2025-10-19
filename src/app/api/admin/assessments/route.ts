import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET handler to fetch all assessments
export async function GET() {
  try {
    const assessments = await prisma.assessment.findMany({
      orderBy: {
        createdAt: 'desc', // Show the newest assessments first
      },
    });
    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while fetching assessments." },
      { status: 500 }
    );
  }
}

// POST handler to create a new assessment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, assessmentUrl, description, category: type } = body;

    // --- Basic Validation ---
    if (!title || !assessmentUrl || !description || !type) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }
    
    // --- Database Operation ---
    const newAssessment = await prisma.assessment.create({
      data: {
        title,
        link: assessmentUrl,
        description,
        type,
      },
    });

    return NextResponse.json(newAssessment, { status: 201 });

  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

// DELETE handler to remove an assessment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('id');

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required." },
        { status: 400 }
      );
    }

    // Check if assessment exists
    const existingAssessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!existingAssessment) {
      return NextResponse.json(
        { error: "Assessment not found." },
        { status: 404 }
      );
    }

    // Delete related assessment assignments first
    await prisma.assessmentAssignment.deleteMany({
      where: { assessmentId: assessmentId },
    });

    // Then delete the assessment
    await prisma.assessment.delete({
      where: { id: assessmentId },
    });

    return NextResponse.json(
      { message: "Assessment deleted successfully." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting assessment:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while deleting the assessment." },
      { status: 500 }
    );
  }
}

