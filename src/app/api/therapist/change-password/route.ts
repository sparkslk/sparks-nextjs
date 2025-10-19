import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/password-validation";

/**
 * @swagger
 * /api/therapist/change-password:
 *   post:
 *     summary: Change therapist password
 *     description: Change password for authenticated therapist user
 *     tags:
 *       - Therapist
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password for verification
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: New password (minimum 8 characters)
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmation of new password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized or invalid current password
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
        // Require authentication and THERAPIST role
        const session = await requireApiAuth(request, ["THERAPIST"]);

        const { currentPassword, newPassword, confirmPassword } = await request.json();

        // Validate required fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                { error: "New passwords do not match" },
                { status: 400 }
            );
        }

        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { error: passwordValidation.errors.join(". ") },
                { status: 400 }
            );
        }

        // Get user from database using user ID from session
        const userId = session.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, password: true, role: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Verify current password
        if (!user.password) {
            return NextResponse.json(
                { error: "No password set for this account" },
                { status: 400 }
            );
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return NextResponse.json(
                { error: "Current password is incorrect" },
                { status: 401 }
            );
        }

        // Check if new password is different from current password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return NextResponse.json(
                { error: "New password must be different from current password" },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Update the user's password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedNewPassword },
        });

        return NextResponse.json(
            { message: "Password changed successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error changing password:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
