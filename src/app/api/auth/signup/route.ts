import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { $Enums } from "@prisma/client";
import { validatePassword } from "@/lib/password-validation";

const UserRole = $Enums.UserRole;

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User registration
 *     description: Register a new user account with role-specific metadata
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Password (minimum 8 characters)
 *                 example: "securePassword123"
 *               role:
 *                 type: string
 *                 enum: ["NORMAL_USER", "PARENT_GUARDIAN", "THERAPIST", "MANAGER", "ADMIN"]
 *                 description: User role in the system
 *                 example: "THERAPIST"
 *               metadata:
 *                 type: object
 *                 description: Role-specific metadata
 *                 properties:
 *                   licenseNumber:
 *                     type: string
 *                     description: Required for therapist registration
 *                     example: "LIC123456"
 *                   organizationCode:
 *                     type: string
 *                     description: Required for manager registration
 *                     example: "ORG001"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 userId:
 *                   type: string
 *                   example: "user_123456"
 *       400:
 *         description: Bad request - missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
    try {
        const { name, email, password, role, metadata } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { error: passwordValidation.errors.join(". ") },
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

        // Create role-specific profiles
        if (role === UserRole.THERAPIST) {
            // Ensure specialization is an array
            const specializationArray = metadata.specialization
                ? (Array.isArray(metadata.specialization)
                    ? metadata.specialization
                    : metadata.specialization.split(',').map((s: string) => s.trim()).filter(Boolean))
                : [];

            await prisma.therapist.create({
                data: {
                    userId: user.id,
                    licenseNumber: metadata.licenseNumber,
                    specialization: specializationArray,
                    experience: metadata.experience || 0,
                    bio: metadata.bio || '',
                    // Note: organizationId will need to be set later by an admin
                },
            });
        }
        // Do NOT create ParentGuardian record at signup. This should be done when a parent adds a child (patient) later.

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
