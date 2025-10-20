import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/password-validation";
import {
    verifyVerificationToken,
    isValidEmail,
    sanitizeEmail
} from "@/lib/otp-utils";

/**
 * @swagger
 * /api/mobile/forgot-password/reset:
 *   post:
 *     summary: Reset password using verification token (Mobile)
 *     description: Resets the user's password after OTP verification
 *     tags:
 *       - Mobile Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - verificationToken
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "user@example.com"
 *               verificationToken:
 *                 type: string
 *                 description: Token received after OTP verification
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: New password (minimum 8 characters)
 *                 example: "NewSecurePassword123!"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *       400:
 *         description: Bad request - invalid input or weak password
 *       401:
 *         description: Invalid or expired verification token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
    try {
        const { email, verificationToken, newPassword } = await request.json();

        // Validate inputs
        if (!email || !isValidEmail(email)) {
            return NextResponse.json(
                { error: "Please provide a valid email address" },
                { status: 400 }
            );
        }

        if (!verificationToken) {
            return NextResponse.json(
                { error: "Verification token is required" },
                { status: 400 }
            );
        }

        if (!newPassword) {
            return NextResponse.json(
                { error: "New password is required" },
                { status: 400 }
            );
        }

        const sanitizedEmail = sanitizeEmail(email);

        // Verify the verification token
        const tokenVerification = verifyVerificationToken(verificationToken);

        if (!tokenVerification.valid) {
            return NextResponse.json(
                { error: "Invalid or expired verification token" },
                { status: 401 }
            );
        }

        // Ensure token email matches provided email
        if (tokenVerification.email !== sanitizedEmail) {
            return NextResponse.json(
                { error: "Email mismatch with verification token" },
                { status: 401 }
            );
        }

        // Validate password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { error: passwordValidation.errors.join(". ") },
                { status: 400 }
            );
        }

        // Check if OTP was verified
        const otpRecord = await prisma.passwordResetOTP.findFirst({
            where: {
                email: sanitizedEmail,
                verified: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!otpRecord) {
            return NextResponse.json(
                { error: "No verified OTP found. Please verify your OTP first" },
                { status: 401 }
            );
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email: sanitizedEmail }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update the user's password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        // Delete the used OTP record
        await prisma.passwordResetOTP.delete({
            where: { id: otpRecord.id }
        });

        // Clean up any other expired OTPs for this email
        await prisma.passwordResetOTP.deleteMany({
            where: {
                email: sanitizedEmail,
                expiresAt: {
                    lt: new Date()
                }
            }
        });

        return NextResponse.json(
            { message: "Password reset successfully. You can now login with your new password." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset password error (mobile):", error);
        return NextResponse.json(
            { error: "An error occurred while resetting your password" },
            { status: 500 }
        );
    }
}
