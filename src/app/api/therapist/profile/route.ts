import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// Get therapist profile information
export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);

        // Get therapist profile with user information
        const therapist = await prisma.therapist.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                organization: {
                    select: {
                        name: true,
                        code: true
                    }
                }
            }
        });

        if (!therapist) {
            return NextResponse.json(
                { error: "Therapist profile not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: therapist.id,
            licenseNumber: therapist.licenseNumber,
            specialization: therapist.specialization,
            experience: therapist.experience,
            bio: therapist.bio,
            availability: therapist.availability,
            user: therapist.user,
            organization: therapist.organization,
            createdAt: therapist.createdAt,
            updatedAt: therapist.updatedAt
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching therapist profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch therapist profile" },
            { status: 500 }
        );
    }
}
