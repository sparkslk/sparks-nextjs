import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Authenticate parent and get user id
    const session = await requireApiAuth(req, ['PARENT_GUARDIAN']);

    // Get all patient IDs for this parent/guardian
    const parentGuardianRelations = await prisma.parentGuardian.findMany({
      where: { userId: session.user.id },
      select: { patientId: true }
    });
    const patientIds = parentGuardianRelations.map(r => r.patientId);

    if (patientIds.length === 0) {
      return NextResponse.json({ connections: [] });
    }

    // Fetch only this parent's patients with their primary therapist
    const patients = await prisma.patient.findMany({
      where: {
        id: { in: patientIds },
        primaryTherapistId: { not: null },
      },
      select: {
        firstName: true,
        lastName: true,
        primaryTherapist: {
          select: {
            id: true,
            specialization: true,
            experience: true,
            bio: true,
            rating: true, // Added therapist rating
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    console.log(patients);

    // Count patients per therapist (only for this parent's children)
    const therapistPatientCount: Record<string, number> = {};
    for (const p of patients) {
      if (p.primaryTherapist?.id) {
        therapistPatientCount[p.primaryTherapist.id] = (therapistPatientCount[p.primaryTherapist.id] || 0) + 1;
      }
    }

    // Build connections array
    const connections = patients.map((p) => ({
      childName: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
      therapist: {
        id: p.primaryTherapist?.id || "",
        name: p.primaryTherapist?.user?.name || "Unknown Therapist",
        specialization: p.primaryTherapist?.specialization || ["General Psychology"],
        experience: p.primaryTherapist?.experience || 0,
        image: p.primaryTherapist?.user?.image || null,
        bio: p.primaryTherapist?.bio || "",
        rating: p.primaryTherapist?.rating || null, // Include rating in response
        patientsCount: p.primaryTherapist?.id ? (therapistPatientCount[p.primaryTherapist.id] || 0) : 0,
      },
    }));

    console.log("Child-Therapist connections:", connections);

    return NextResponse.json({ connections });
  } catch (error) {
    console.error("Error fetching child-therapist connections:", error);
    return NextResponse.json({ connections: [] }, { status: 500 });
  }
}
