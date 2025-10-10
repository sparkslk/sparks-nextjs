import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/therapist/availability/slots:
 *   get:
 *     summary: Get available time slots for a therapist
 *     description: Get available time slots for a therapist on a specific date
 *     tags:
 *       - Therapist
 *       - Availability
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: therapistId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the therapist
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to get slots for (YYYY-MM-DD)
 *       - in: query
 *         name: duration
 *         schema:
 *           type: number
 *           default: 60
 *         description: Session duration in minutes
 *     responses:
 *       200:
 *         description: Available slots retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 slots:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Available time slots
 *       400:
 *         description: Bad request - missing parameters
 *       404:
 *         description: Therapist not found
 *       500:
 *         description: Internal server error
 */

export async function GET(req: NextRequest) {
    try {
        await requireApiAuth(req);
        const { searchParams } = new URL(req.url);

        const therapistId = searchParams.get('therapistId');
        const date = searchParams.get('date');

        if (!therapistId || !date) {
            return NextResponse.json(
                { error: "Therapist ID and date are required" },
                { status: 400 }
            );
        }

        const requestedDate = new Date(date);
        requestedDate.setHours(0, 0, 0, 0);

        // Get therapist and their availability from the new table
        const therapist = await prisma.therapist.findUnique({
            where: { id: therapistId },
            select: { id: true }
        });

        if (!therapist) {
            return NextResponse.json(
                { error: "Therapist not found" },
                { status: 404 }
            );
        }

        // Get availability slots for the requested date
        // TherapistAvailability model has: id, therapistId, date, startTime, isBooked, isFree
        const availabilitySlots = await prisma.therapistAvailability.findMany({
            where: {
                therapistId: therapist.id,
                date: {
                    gte: requestedDate,
                    lt: new Date(requestedDate.getTime() + 24 * 60 * 60 * 1000)
                },
                isBooked: false
            }
        });

        if (availabilitySlots.length === 0) {
            return NextResponse.json({ slots: [] });
        }

        // Extract time slots from availability records
        const slots = availabilitySlots.map(slot => slot.startTime);

        return NextResponse.json({ slots });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error getting available slots:", error);
        return NextResponse.json(
            { error: "Failed to get available slots" },
            { status: 500 }
        );
    }
}