import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireApiAuth(request, ["ADMIN"]);

    const therapistId = params.id;

    // Find therapist record by therapist.id
    const therapistRecord = await prisma.therapist.findUnique({
      where: { id: therapistId },
      include: {
        profile: true,
        user: true,
      },
    });

    if (!therapistRecord) {
      return NextResponse.json(
        { error: "Therapist not found for given user" },
        { status: 404 }
      );
    }

    // Fetch availability slots for the therapist (by Therapist.id)
    const availabilitySlots = await prisma.therapistAvailability.findMany({
      where: {
        therapistId: therapistRecord.id,
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
      ],
    });

    // Transform the data to match the expected format
    const slots = availabilitySlots.map((slot) => ({
      id: slot.id,
      date: slot.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
      startTime: slot.startTime,
      isBooked: slot.isBooked,
      isFree: slot.isFree,
    }));

    return NextResponse.json({
      success: true,
      slots,
      therapist: {
        id: therapistRecord.id,
        name: therapistRecord.user?.name ?? "",
        email: therapistRecord.user?.email ?? "",
        specialization: therapistRecord.specialization?.join(", ") ?? undefined,
        licenseNumber: therapistRecord.licenseNumber ?? undefined,
      },
    });
  } catch (error) {
    console.error("Error fetching therapist availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch therapist availability" },
      { status: 500 }
    );
  }
}
