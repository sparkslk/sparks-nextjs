import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { email, role } = await request.json();

        if (!email || !role) {
            return NextResponse.json(
                { error: "Email and role are required" },
                { status: 400 }
            );
        }

        // Update the user's role directly
        const updatedUser = await prisma.user.update({
            where: { email: email },
            data: { role: role },
        });

        return NextResponse.json(
            { message: "Role updated successfully", user: updatedUser },
            { status: 200 }
        );
    } catch (error) {
        console.error("Fix role error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
