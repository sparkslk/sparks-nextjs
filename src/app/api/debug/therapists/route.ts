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

        // Get all users with THERAPIST role
        const therapistUsers = await prisma.user.findMany({
            where: { role: "THERAPIST" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                therapistProfile: {
                    select: {
                        id: true,
                        licenseNumber: true,
                        specialization: true,
                        experience: true
                    }
                }
            }
        });

        // Get all therapist profiles
        const therapistProfiles = await prisma.therapist.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        return NextResponse.json({
            therapistUsers,
            therapistProfiles,
            counts: {
                therapistUsers: therapistUsers.length,
                therapistProfiles: therapistProfiles.length
            }
        });

    } catch (error) {
        console.error("Error debugging therapists:", error);
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 });
    }
}
