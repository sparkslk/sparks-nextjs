import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Get patient's active medications
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyMobileToken(token);

    if (!payload || payload.role !== "NORMAL_USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get patient
    const patient = await prisma.patient.findUnique({
      where: { userId: payload.userId },
    });

    if (!patient) {
      return NextResponse.json({
        success: true,
        medications: [],
        total: 0,
      });
    }

    // Fetch active medications for the patient
    const medications = await prisma.medication.findMany({
      where: {
        patientId: patient.id,
        isActive: true,
        isDiscontinued: false,
      },
      include: {
        Therapist: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format medications for mobile
    const formattedMedications = medications.map((medication) => ({
      id: medication.id,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      customFrequency: medication.customFrequency,
      instructions: medication.instructions,
      mealTiming: medication.mealTiming,
      startDate: medication.startDate,
      endDate: medication.endDate,
      isActive: medication.isActive,
      prescribedBy: {
        name: medication.Therapist.user.name || "Therapist",
        email: medication.Therapist.user.email,
      },
      createdAt: medication.createdAt,
    }));

    return NextResponse.json({
      success: true,
      medications: formattedMedications,
      total: formattedMedications.length,
    });
  } catch (error) {
    console.error("Error fetching medications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
