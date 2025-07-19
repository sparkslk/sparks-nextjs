import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { patientId, therapistId } = await req.json();
    if (!patientId || !therapistId) {
      return NextResponse.json({ error: "Missing patientId or therapistId" }, { status: 400 });
    }

    // Update the patient's primary therapist
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: { primaryTherapistId: therapistId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        primaryTherapistId: true
      }
    });

    return NextResponse.json({ success: true, patient: updatedPatient });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to assign therapist" }, { status: 500 });
  }
}
