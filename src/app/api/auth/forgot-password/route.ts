import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/password-validation";

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Reset password using User ID
 *     description: Allows users to reset their password by providing their User ID and a new password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - newPassword
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The user's unique ID (available in their dashboard)
 *                 example: "clx1234567890abcdefgh"
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
 *         description: Bad request - missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
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
        const { userId, newPassword } = await request.json();

        // Validate required fields
        if (!userId || !newPassword) {
            return NextResponse.json(
                { error: "User ID and new password are required" },
                { status: 400 }
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

        // Try to find user by ID - could be either User ID or Patient ID
        let user = await prisma.user.findUnique({
            where: { id: userId },
        });

        // If not found, try to find by Patient ID
        if (!user) {
            const patient = await prisma.patient.findUnique({
                where: { id: userId },
                include: {
                    user: true
                }
            });

            if (patient) {
                user = patient.user;
            }
        }

        if (!user) {
            return NextResponse.json(
                { error: "Invalid User ID or Patient ID. Please check your ID and try again." },
                { status: 404 }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update the user's password (use user.id, not userId which could be Patient ID)
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return NextResponse.json(
            { message: "Password reset successfully. You can now login with your new password." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
