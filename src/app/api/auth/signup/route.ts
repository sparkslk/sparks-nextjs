import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { $Enums } from "../../../../../generated/prisma";

const UserRole = $Enums.UserRole;

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, role, metadata } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Role-specific validation
        if (role === UserRole.THERAPIST) {
            if (!metadata?.licenseNumber) {
                return NextResponse.json(
                    { error: "License number is required for therapist registration" },
                    { status: 400 }
                );
            }
        }

        if (role === UserRole.MANAGER) {
            if (!metadata?.organizationCode) {
                return NextResponse.json(
                    { error: "Organization code is required for manager registration" },
                    { status: 400 }
                );
            }
        }

        if (role === UserRole.ADMIN) {
            if (!metadata?.adminKey || metadata.adminKey !== process.env.ADMIN_KEY) {
                return NextResponse.json(
                    { error: "Invalid admin key" },
                    { status: 403 }
                );
            }
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

        // Create user with metadata if provided
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || UserRole.NORMAL_USER,
                ...(metadata ? { metadata } : {})
            },
        });

        // Remove password from response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(
            { user: userWithoutPassword },
            { status: 201 }
        );
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
