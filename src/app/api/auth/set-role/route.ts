import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { $Enums } from "@prisma/client";

const UserRole = $Enums.UserRole;

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { role, metadata } = await request.json();

        // Validate role
        if (!role || !Object.values(UserRole).includes(role)) {
            return NextResponse.json(
                { error: "Invalid role" },
                { status: 400 }
            );
        }

        // Role-specific validation

        if (role === UserRole.ADMIN) {
            if (!metadata?.adminKey || metadata.adminKey !== process.env.ADMIN_KEY) {
                return NextResponse.json(
                    { error: "Invalid admin key" },
                    { status: 403 }
                );
            }
        }

        // Update the user's role and metadata
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                role,
                ...(metadata ? { metadata } : {})
            },
        });

        return NextResponse.json(
            { message: "Role set successfully", role },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
