import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Get all users with THERAPIST role
        const therapistUsers = await prisma.user.findMany({
            where: { role: 'THERAPIST' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        // Get all therapist profiles
        const therapistProfiles = await prisma.therapist.findMany({
            include: {
                user: {
                    select: {
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
            userCount: therapistUsers.length,
            profileCount: therapistProfiles.length
        });
    } catch (error) {
        console.error("Error checking therapists:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
