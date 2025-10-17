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
        const duration = parseInt(searchParams.get('duration') || '60');

        if (!therapistId || !date) {
            return NextResponse.json(
                { error: "Therapist ID and date are required" },
                { status: 400 }
            );
        }

        const requestedDate = new Date(date);

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

        // Get availability slots from the new table
        const availabilitySlots = await prisma.therapistAvailability.findMany({
            where: {
                therapistId: therapist.id,
                date: {
                    gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
                    lt: new Date(requestedDate.setHours(23, 59, 59, 999))
                },
                isFree: true
            }
        });

        if (availabilitySlots.length === 0) {
            return NextResponse.json({ slots: [] });
        }

        const availableSlots: string[] = [];

        // Process availability slots - each slot represents a single available time
        availabilitySlots.forEach((slot) => {
            // Each availability slot is already a specific time slot
            availableSlots.push(slot.startTime);
        });

        // Get existing sessions for this therapist on this date
        const existingSessions = await prisma.therapySession.findMany({
            where: {
                therapistId,
                scheduledAt: {
                    gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
                    lt: new Date(requestedDate.setHours(23, 59, 59, 999))
                },
                status: {
                    in: ['SCHEDULED', 'APPROVED']
                }
            },
            select: {
                scheduledAt: true,
                duration: true
            }
        });

        // Remove conflicting slots with buffer
        const conflictingSlots = new Set<string>();
        existingSessions.forEach(session => {
            const sessionStart = session.scheduledAt;
            const sessionEnd = new Date(sessionStart.getTime() + session.duration * 60 * 1000);

            // 15-minute buffer before and after
            const bufferStart = new Date(sessionStart.getTime() - 15 * 60 * 1000);
            const bufferEnd = new Date(sessionEnd.getTime() + 15 * 60 * 1000);

            availableSlots.forEach(slot => {
                const slotTime = new Date(`1970-01-01T${slot}:00`);
                const slotEnd = new Date(slotTime.getTime() + duration * 60 * 1000);

                if (slotTime < bufferEnd && slotEnd > bufferStart) {
                    conflictingSlots.add(slot);
                }
            });
        });

        const finalSlots = availableSlots.filter(slot => !conflictingSlots.has(slot));

        return NextResponse.json({ slots: finalSlots });

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