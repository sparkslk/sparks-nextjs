import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
// Define UserRole enum manually since it's not being exported from generated client
enum UserRole {
    NORMAL_USER = "NORMAL_USER",
    PARENT_GUARDIAN = "PARENT_GUARDIAN",
    THERAPIST = "THERAPIST",
    MANAGER = "MANAGER",
    ADMIN = "ADMIN"
}

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, role } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || UserRole.NORMAL_USER,
            },
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(
            { user: userWithoutPassword },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
