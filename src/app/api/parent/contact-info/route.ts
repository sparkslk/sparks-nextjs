import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const childId = searchParams.get("childId");

        if (!childId) {
            return NextResponse.json(
                { error: "Missing childId parameter" },
                { status: 400 }
            );
        }

        // Get parent contact information through the parent-guardian relationship
        const parentGuardian = await prisma.parentGuardian.findFirst({
            where: {
                userId: session.user.id,
                patientId: childId,
            },
            select: {
                contact_no: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!parentGuardian) {
            return NextResponse.json(
                { error: "Parent-child relationship not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            contact_no: parentGuardian.contact_no,
            address: "N/A", // Default address since we don't have it in the schema
            name: parentGuardian.user.name,
            email: parentGuardian.user.email,
        });

    } catch (error) {
        console.error("Error fetching parent contact info:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}