import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    verifyOTP,
    isOTPExpired,
    generateVerificationToken,
    isValidEmail,
    sanitizeEmail,
    OTP_CONFIG
} from "@/lib/otp-utils";

/**
 * @swagger
 * /api/mobile/forgot-password/verify:
 *   post:
 *     summary: Verify OTP for password reset (Mobile)
 *     description: Verifies the OTP code and returns a verification token for password reset
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
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "user@example.com"
 *               otp:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 description: 6-digit OTP code
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP verified successfully"
 *                 verificationToken:
 *                   type: string
 *                   description: Token to use for password reset
 *       400:
 *         description: Bad request - invalid input
 *       401:
 *         description: Invalid or expired OTP
 *       429:
 *         description: Too many attempts
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json();

        // Validate inputs
        if (!email || !isValidEmail(email)) {
            return NextResponse.json(
                { error: "Please provide a valid email address" },
                { status: 400 }
            );
        }

        if (!otp || !/^\d{6}$/.test(otp)) {
            return NextResponse.json(
                { error: "Please provide a valid 6-digit OTP code" },
                { status: 400 }
            );
        }

        const sanitizedEmail = sanitizeEmail(email);

        // Find the OTP record
        const otpRecord = await prisma.passwordResetOTP.findFirst({
            where: {
                email: sanitizedEmail,
                verified: false
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!otpRecord) {
            return NextResponse.json(
                { error: "No verification request found. Please request a new OTP" },
                { status: 401 }
            );
        }

        // Check if OTP has expired
        if (isOTPExpired(otpRecord.expiresAt)) {
            await prisma.passwordResetOTP.delete({
                where: { id: otpRecord.id }
            });

            return NextResponse.json(
                { error: "OTP has expired. Please request a new one" },
                { status: 401 }
            );
        }

        // Check if max attempts exceeded
        if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
            await prisma.passwordResetOTP.delete({
                where: { id: otpRecord.id }
            });

            return NextResponse.json(
                { error: "Maximum attempts exceeded. Please request a new OTP" },
                { status: 429 }
            );
        }

        // Verify OTP
        const isValid = await verifyOTP(otp, otpRecord.otp);

        if (!isValid) {
            // Increment attempts
            await prisma.passwordResetOTP.update({
                where: { id: otpRecord.id },
                data: { attempts: otpRecord.attempts + 1 }
            });

            const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - (otpRecord.attempts + 1);

            return NextResponse.json(
                {
                    error: `Invalid OTP code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining`,
                    remainingAttempts
                },
                { status: 401 }
            );
        }

        // OTP is valid - mark as verified
        await prisma.passwordResetOTP.update({
            where: { id: otpRecord.id },
            data: { verified: true }
        });

        // Generate verification token for password reset
        const verificationToken = generateVerificationToken(sanitizedEmail);

        return NextResponse.json(
            {
                message: "OTP verified successfully",
                verificationToken
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Verify OTP error (mobile):", error);
        return NextResponse.json(
            { error: "An error occurred while verifying your code" },
            { status: 500 }
        );
    }
}
