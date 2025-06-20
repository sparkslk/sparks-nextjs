import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all therapists with their details
        const therapists = await prisma.therapist.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                organization: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                user: {
                    name: "asc"
                }
            }
        });

        // Format therapists data for the frontend
        const formattedTherapists = therapists.map(therapist => ({
            id: therapist.id,
            name: therapist.user.name || "Unknown",
            email: therapist.user.email,
            specialization: therapist.specialization,
            experience: therapist.experience,
            bio: therapist.bio,
            organization: therapist.organization?.name,
            // For now, we'll provide sample available slots
            // In a real app, this would be calculated based on their schedule
            availableSlots: [
                "09:00",
                "10:00",
                "11:00",
                "14:00",
                "15:00",
                "16:00"
            ]
        }));

        return NextResponse.json({
            therapists: formattedTherapists
        });

    } catch (error) {
        console.error("Error fetching therapists:", error);
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 });
    }
}
