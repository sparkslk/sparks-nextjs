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
        // const session = await requireApiAuth(req);
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

        // Get therapist and their availability
        const therapist = await prisma.therapist.findUnique({
            where: { id: therapistId },
            select: { availability: true }
        });

        if (!therapist) {
            return NextResponse.json(
                { error: "Therapist not found" },
                { status: 404 }
            );
        }

        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Check if therapist has availability set
        if (!therapist.availability || !Array.isArray(therapist.availability)) {
            return NextResponse.json({
                slots: []
            });
        }

        // Get all available slots for this day
        const availableSlots: string[] = [];

        const availabilityData = therapist.availability as Array<{
            isActive?: boolean;
            recurrencePattern?: {days?: number[]};
            dayOfWeek?: number;
            startTime: string;
            endTime: string;
            sessionDuration?: number;
            breakBetweenSessions?: number;
        }>;

        availabilityData.forEach((slot) => {
            if (!slot.isActive) return;

            // Check if this slot applies to the requested day
            const appliesToDay = slot.recurrencePattern?.days
                ? slot.recurrencePattern.days.includes(dayOfWeek)
                : slot.dayOfWeek === dayOfWeek;

            if (!appliesToDay) return;

            // Generate slots within this availability window
            const startTime = new Date(`1970-01-01T${slot.startTime}:00`);
            const endTime = new Date(`1970-01-01T${slot.endTime}:00`);

            const currentTime = new Date(startTime);
            const sessionDuration = slot.sessionDuration || 60;
            const breakDuration = slot.breakBetweenSessions || 15;
            const totalSlotDuration = sessionDuration + breakDuration;

            while (currentTime < endTime) {
                const sessionEnd = new Date(currentTime);
                sessionEnd.setMinutes(currentTime.getMinutes() + sessionDuration);

                if (sessionEnd <= endTime) {
                    availableSlots.push(currentTime.toTimeString().slice(0, 5));
                }

                currentTime.setMinutes(currentTime.getMinutes() + totalSlotDuration);
            }
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

        // Filter out slots that conflict with existing sessions
        const conflictingSlots = new Set<string>();
        existingSessions.forEach(session => {
            const sessionStart = session.scheduledAt;
            const sessionEnd = new Date(sessionStart.getTime() + session.duration * 60 * 1000);

            // Check for conflicts with 30-minute buffer
            const bufferStart = new Date(sessionStart.getTime() - 30 * 60 * 1000);
            const bufferEnd = new Date(sessionEnd.getTime() + 30 * 60 * 1000);

            availableSlots.forEach(slot => {
                const slotTime = new Date(`1970-01-01T${slot}:00`);
                const slotEnd = new Date(slotTime.getTime() + duration * 60 * 1000);

                if (slotTime < bufferEnd && slotEnd > bufferStart) {
                    conflictingSlots.add(slot);
                }
            });
        });

        // Remove conflicting slots
        const finalSlots = availableSlots.filter(slot => !conflictingSlots.has(slot));

        return NextResponse.json({
            slots: finalSlots
        });

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