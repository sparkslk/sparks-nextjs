import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, UserRole } from "@/lib/auth";
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

        const { role, metadata } = await request.json();

        // Validate role
        if (!Object.values(UserRole).includes(role)) {
            return NextResponse.json(
                { error: "Invalid role" },
                { status: 400 }
            );
        }

        // Check if user exists and get current role
        const existingUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true, accounts: { select: { provider: true } } }
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Only allow role update for Google OAuth users who don't have a role set or have NORMAL_USER role
        const hasGoogleAccount = existingUser.accounts.some(account => account.provider === "google");
        if (!hasGoogleAccount) {
            return NextResponse.json(
                { error: "Role update only allowed for Google OAuth users" },
                { status: 403 }
            );
        }

        // Validate role-specific requirements
        if (role === UserRole.THERAPIST && (!metadata?.licenseNumber)) {
            return NextResponse.json(
                { error: "License number required for therapist role" },
                { status: 400 }
            );
        }

        if (role === UserRole.MANAGER && (!metadata?.organizationCode)) {
            return NextResponse.json(
                { error: "Organization code required for manager role" },
                { status: 400 }
            );
        }

        if (role === UserRole.ADMIN && (!metadata?.adminKey || metadata.adminKey !== process.env.ADMIN_KEY)) {
            return NextResponse.json(
                { error: "Valid admin key required for admin role" },
                { status: 400 }
            );
        }

        // Update the user's role
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                role: role,
                // You could store metadata in a separate table if needed
            },
        });

        return NextResponse.json(
            { message: "Role updated successfully", role },
            { status: 200 }
        );
    } catch (error) {
        console.error("Set role error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
