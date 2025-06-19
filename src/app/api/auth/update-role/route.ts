import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions) as any;

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { role } = await request.json();

        if (!role || !["NORMAL_USER", "PARENT_GUARDIAN", "THERAPIST", "MANAGER", "ADMIN"].includes(role)) {
            return NextResponse.json(
                { error: "Invalid role" },
                { status: 400 }
            );
        }

        // Update the user's role
        await prisma.user.update({
            where: { email: session.user.email },
            data: { role: role },
        });

        return NextResponse.json(
            { message: "Role updated successfully", role },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update role error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
