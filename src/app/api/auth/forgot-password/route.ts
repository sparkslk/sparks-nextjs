import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    generateOTP,
    hashOTP,
    generateOTPExpiry,
    isValidEmail,
    sanitizeEmail,
    OTP_CONFIG
} from "@/lib/otp-utils";
import { emailService } from "@/lib/email-service";

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request OTP for password reset
 *     description: Sends a 6-digit OTP to the user's email for password reset verification
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully (or generic success for security)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "If an account exists with this email, you will receive a verification code"
 *                 expiresIn:
 *                   type: number
 *                   example: 600
 *                   description: OTP expiry time in seconds
 *       400:
 *         description: Bad request - invalid email format
 *       429:
 *         description: Too many requests - rate limit exceeded
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Validate email format
        if (!email || !isValidEmail(email)) {
            return NextResponse.json(
                { error: "Please provide a valid email address" },
                { status: 400 }
            );
        }

        const sanitizedEmail = sanitizeEmail(email);

        // Check for rate limiting - prevent spam requests
        const recentOTP = await prisma.passwordResetOTP.findFirst({
            where: {
                email: sanitizedEmail,
                createdAt: {
                    gte: new Date(Date.now() - OTP_CONFIG.RESEND_COOLDOWN_SECONDS * 1000)
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (recentOTP) {
            const secondsSinceCreation = Math.floor((Date.now() - recentOTP.createdAt.getTime()) / 1000);
            const remainingSeconds = OTP_CONFIG.RESEND_COOLDOWN_SECONDS - secondsSinceCreation;

            return NextResponse.json(
                {
                    error: `Please wait ${remainingSeconds} seconds before requesting a new code`,
                    remainingSeconds
                },
                { status: 429 }
            );
        }

        // Check if user exists (but don't reveal this information in the response for security)
        const user = await prisma.user.findUnique({
            where: { email: sanitizedEmail },
            select: { id: true, name: true, email: true }
        });

        // Always proceed as if the email exists (security measure to prevent user enumeration)
        if (user) {
            // Delete any existing OTPs for this email
            await prisma.passwordResetOTP.deleteMany({
                where: { email: sanitizedEmail }
            });

            // Generate new OTP
            const otp = generateOTP();
            const hashedOTP = await hashOTP(otp);
            const expiresAt = generateOTPExpiry();

            // Store OTP in database
            await prisma.passwordResetOTP.create({
                data: {
                    email: sanitizedEmail,
                    otp: hashedOTP,
                    expiresAt,
                    verified: false,
                    attempts: 0
                }
            });

            // Send OTP email
            const firstName = user.name?.split(' ')[0];
            const emailSent = await emailService.sendPasswordResetOTP(
                sanitizedEmail,
                otp,
                firstName
            );

            if (!emailSent) {
                // Log error but don't reveal to user
                console.error(`Failed to send OTP email to ${sanitizedEmail}`);
            }
        }

        // Always return the same response for security (prevents email enumeration)
        return NextResponse.json(
            {
                message: "If an account exists with this email, you will receive a verification code",
                expiresIn: OTP_CONFIG.EXPIRY_MINUTES * 60
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Request OTP error:", error);
        return NextResponse.json(
            { error: "An error occurred while processing your request" },
            { status: 500 }
        );
    }
}
