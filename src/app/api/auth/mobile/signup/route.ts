import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { $Enums } from "@prisma/client";

const UserRole = $Enums.UserRole;

// JWT signing function for mobile tokens
function signMobileToken(payload: any): string {
    return jwt.sign(
        payload,
        process.env.NEXTAUTH_SECRET!,
        {
            expiresIn: '24h',
            issuer: 'sparks-mobile-api',
            audience: 'sparks-mobile-app'
        }
    );
}

/**
 * @swagger
 * /api/auth/mobile/signup:
 *   post:
 *     summary: Mobile user registration
 *     description: Register a new user account and return a JWT token for mobile app usage
 *     tags:
 *       - Mobile Authentication
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
 *                 example: "NORMAL_USER"
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
 *                   adminKey:
 *                     type: string
 *                     description: Required for admin registration
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - missing or invalid fields
 *       409:
 *         description: Conflict - user already exists
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
    try {
        const { name, email, password, role, metadata } = await request.json();

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Name, email, and password are required"
                },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 8) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Password must be at least 8 characters long"
                },
                { status: 400 }
            );
        }

        // Role-specific validation
        if (role === UserRole.THERAPIST) {
            if (!metadata?.licenseNumber) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "License number is required for therapist registration"
                    },
                    { status: 400 }
                );
            }
        }

        if (role === UserRole.MANAGER) {
            if (!metadata?.organizationCode) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Organization code is required for manager registration"
                    },
                    { status: 400 }
                );
            }
        }

        if (role === UserRole.ADMIN) {
            if (!metadata?.adminKey || metadata.adminKey !== process.env.ADMIN_KEY) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Invalid admin key"
                    },
                    { status: 403 }
                );
            }
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: "User already exists with this email"
                },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user with metadata if provided
        const user = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
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
                },
            });
        }

        // Create JWT payload
        const tokenPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
            type: 'mobile-access'
        };

        // Generate JWT token
        const token = signMobileToken(tokenPayload);

        // Calculate expiration time (24 hours from now)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully",
                token,
                user: userWithoutPassword,
                expiresAt: expiresAt.toISOString()
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Mobile signup error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error"
            },
            { status: 500 }
        );
    }
}
