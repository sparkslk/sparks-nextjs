import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

/**
 * Assign a therapist to a patient
 * Mobile API endpoint - uses JWT token authentication
 *
 * ALWAYS assigns this therapist as the patient's primary therapist
 * If patient already has a primary therapist, it will be REPLACED with this one
 *
 * Body (JSON):
 * - therapistId: ID of the therapist to assign
 */
export async function POST(request: NextRequest) {
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

    const { therapistId } = await request.json();

    if (!therapistId) {
      return NextResponse.json(
        { error: "Therapist ID is required" },
        { status: 400 }
      );
    }

    // Get the patient
    const patient = await prisma.patient.findUnique({
      where: { userId: payload.userId },
      include: {
        primaryTherapist: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Verify therapist exists
    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    // Check if this is a replacement or new assignment
    const previousTherapistId = patient.primaryTherapistId;
    const isReplacement = previousTherapistId && previousTherapistId !== therapistId;
    const isSameTherapist = previousTherapistId === therapistId;

    let updatedPatient = patient;

    // ALWAYS assign/replace the primary therapist (unless it's the same therapist)
    if (!isSameTherapist) {
      updatedPatient = await prisma.patient.update({
        where: { id: patient.id },
        data: { primaryTherapistId: therapistId },
        include: {
          primaryTherapist: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          }
        }
      });

      // Create notification for the new therapist
      const therapistMessage = isReplacement
        ? `${patient.firstName} ${patient.lastName} has switched to you as their primary therapist.`
        : `${patient.firstName} ${patient.lastName} has selected you as their primary therapist and may book sessions with you.`;

      await prisma.notification.create({
        data: {
          senderId: payload.userId,
          receiverId: therapist.user.id,
          type: "SYSTEM",
          title: isReplacement ? "Patient Switched to You" : "New Patient Assignment",
          message: therapistMessage,
          isUrgent: false
        }
      });

      // Create notification for patient
      const patientMessage = isReplacement
        ? `You have switched to ${therapist.user.name || "your new therapist"} as your primary therapist.`
        : `${therapist.user.name || "Your therapist"} has been assigned as your primary therapist. You can now book sessions.`;

      await prisma.notification.create({
        data: {
          receiverId: payload.userId,
          type: "SYSTEM",
          title: isReplacement ? "Therapist Changed" : "Therapist Assigned",
          message: patientMessage,
          isUrgent: false
        }
      });

      // If replacing, notify the previous therapist
      if (isReplacement && previousTherapistId) {
        const previousTherapist = await prisma.therapist.findUnique({
          where: { id: previousTherapistId },
          select: { userId: true }
        });

        if (previousTherapist) {
          await prisma.notification.create({
            data: {
              senderId: payload.userId,
              receiverId: previousTherapist.userId,
              type: "SYSTEM",
              title: "Patient Reassignment",
              message: `${patient.firstName} ${patient.lastName} has switched to a different primary therapist.`,
              isUrgent: false
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      assigned: !isSameTherapist,
      replaced: isReplacement,
      message: isSameTherapist
        ? "This therapist is already your primary therapist"
        : isReplacement
        ? "Primary therapist has been changed"
        : "Therapist assigned as your primary therapist",
      therapist: {
        id: therapist.id,
        name: therapist.user.name,
        email: therapist.user.email,
        image: therapist.user.image,
        specialization: therapist.specialization,
        rating: therapist.rating,
        isPrimary: updatedPatient.primaryTherapistId === therapist.id
      }
    });

  } catch (error) {
    console.error("Error assigning therapist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
