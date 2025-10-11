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
        const requestedDateOnly = new Date(requestedDate.toDateString()); // Normalize to date only

        // Get therapist
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
        const availabilitySlots = await prisma.therapistAvailability.findMany({
            where: {
                therapistId: therapist.id,
                date: requestedDateOnly,
                isBooked: false
            },
            orderBy: {
                startTime: 'asc'
            }
        });

        if (availabilitySlots.length === 0) {
            return NextResponse.json({ slots: [] });
        }

        // Extract start times from available slots
        const availableSlots = availabilitySlots.map(slot => slot.startTime);

        // Get existing sessions for this therapist on this date to check for conflicts
        const startOfDay = new Date(requestedDateOnly);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(requestedDateOnly);
        endOfDay.setHours(23, 59, 59, 999);

        const existingSessions = await prisma.therapySession.findMany({
            where: {
                therapistId,
                scheduledAt: {
                    gte: startOfDay,
                    lte: endOfDay
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
                const slotDateTime = new Date(`${requestedDateOnly.toISOString().split('T')[0]}T${slot}:00`);
                const slotEnd = new Date(slotDateTime.getTime() + duration * 60 * 1000);

                if (slotDateTime < bufferEnd && slotEnd > bufferStart) {
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