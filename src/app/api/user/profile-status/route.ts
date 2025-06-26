import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/user/profile-status:
 *   get:
 *     summary: Check if user has a patient profile
 *     description: Returns whether the authenticated user has created a patient profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasProfile:
 *                   type: boolean
 *                   description: Whether the user has a patient profile
 *       401:
 *         description: Unauthorized - Invalid or missing authentication
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(req: Request) {
    // Get user id from token (middleware sends as Bearer <userId>)
    const authHeader = req.headers.get('authorization');
    const userId = authHeader?.split(' ')[1];
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if patient profile exists
    const patient = await prisma.patient.findUnique({
        where: { userId },
        select: { id: true },
    });

    return NextResponse.json({ hasProfile: !!patient });
}
