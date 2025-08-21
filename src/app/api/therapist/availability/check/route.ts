import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/therapist/availability/check:
 *   post:
 *     summary: Check therapist availability
 *     description: Check if a therapist is available at a specific date and time
 *     tags:
 *       - Therapist
 *       - Availability
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - therapistId
 *               - dateTime
 *               - duration
 *             properties:
 *               therapistId:
 *                 type: string
 *                 description: ID of the therapist to check
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time to check availability for
 *               duration:
 *                 type: number
 *                 description: Duration in minutes
 *     responses:
 *       200:
 *         description: Availability check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                   description: Whether the therapist is available
 *                 message:
 *                   type: string
 *                   description: Additional information about availability
 *                 suggestedSlots:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Suggested alternative time slots
 *       400:
 *         description: Bad request - missing or invalid fields
 *       404:
 *         description: Therapist not found
 *       500:
 *         description: Internal server error
 */

export async function POST(req: NextRequest) {
    try {
        await requireApiAuth(req);
        const { therapistId, dateTime, duration = 60 } = await req.json();

        if (!therapistId || !dateTime) {
            return NextResponse.json(
                { error: "Therapist ID and date/time are required" },
                { status: 400 }
            );
        }

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

        const requestedDateTime = new Date(dateTime);
        const dayOfWeek = requestedDateTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const timeString = requestedDateTime.toTimeString().slice(0, 5); // HH:MM format

        // Get availability slots from the new table
        const availabilitySlots = await prisma.therapistAvailability.findMany({
            where: {
                therapistId: therapist.id,
                isActive: true,
                OR: [
                    // Direct day match
                    { dayOfWeek: dayOfWeek },
                    // Recurrence pattern match
                    {
                        isRecurring: true,
                        recurrenceDays: {
                            has: dayOfWeek
                        }
                    }
                ]
            }
        });

        if (availabilitySlots.length === 0) {
            return NextResponse.json({
                available: false,
                message: "Therapist has not set their availability for this day",
                suggestedSlots: []
            });
        }

        // Check if the requested time falls within any availability slot
        const isAvailable = availabilitySlots.some((slot) => {
            // Check if the time falls within the slot
            const slotStart = slot.startTime;
            const slotEnd = slot.endTime;

            // Calculate the end time of the requested session
            const sessionEndTime = new Date(requestedDateTime);
            sessionEndTime.setMinutes(sessionEndTime.getMinutes() + duration);
            const sessionEndTimeString = sessionEndTime.toTimeString().slice(0, 5);

            // Check if the requested time and session duration fit within the slot
            return timeString >= slotStart && sessionEndTimeString <= slotEnd;
        });

        // Check for existing sessions that might conflict
        const existingSessions = await prisma.therapySession.findMany({
            where: {
                therapistId,
                scheduledAt: {
                    gte: new Date(requestedDateTime.getTime() - 30 * 60 * 1000), // 30 minutes before
                    lte: new Date(requestedDateTime.getTime() + duration * 60 * 1000 + 30 * 60 * 1000) // 30 minutes after session ends
                },
                status: {
                    in: ['SCHEDULED', 'APPROVED']
                }
            }
        });

        const hasConflict = existingSessions.length > 0;

        if (!isAvailable) {
            return NextResponse.json({
                available: false,
                message: "Therapist is not available at this time",
                suggestedSlots: getSuggestedSlotsFromDB(availabilitySlots, dayOfWeek)
            });
        }

        if (hasConflict) {
            return NextResponse.json({
                available: false,
                message: "Therapist has a conflicting appointment at this time",
                suggestedSlots: getSuggestedSlotsFromDB(availabilitySlots, dayOfWeek)
            });
        }

        return NextResponse.json({
            available: true,
            message: "Therapist is available at this time",
            suggestedSlots: []
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error checking therapist availability:", error);
        return NextResponse.json(
            { error: "Failed to check availability" },
            { status: 500 }
        );
    }
}

// Helper function to get suggested time slots from database records
function getSuggestedSlotsFromDB(availability: Array<{
    therapistId: string;
    id: string;
    startTime: string;
    endTime: string;
    dayOfWeek: number | null;
    isRecurring: boolean;
    recurrenceType: any;
    recurrenceDays: number[];
    sessionDuration: number;
    breakBetweenSessions: number;
    isActive: boolean;
}>, dayOfWeek: number): string[] {
    const suggestions: string[] = [];

    availability.forEach((slot) => {
        if (!slot.isActive) return;

        // Check if this slot applies to the requested day
        const appliesToDay = slot.isRecurring && slot.recurrenceDays.includes(dayOfWeek)
            || slot.dayOfWeek === dayOfWeek;

        if (!appliesToDay) return;

        // Generate suggestions within this slot
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
                suggestions.push(currentTime.toTimeString().slice(0, 5));
            }

            currentTime.setMinutes(currentTime.getMinutes() + totalSlotDuration);
        }
    });

    return suggestions.slice(0, 5); // Return up to 5 suggestions
}

// Helper function to get suggested time slots (legacy function for compatibility)
function getSuggestedSlots(availability: Array<{isActive?: boolean; recurrencePattern?: {days?: number[]}; dayOfWeek?: number; startTime: string; endTime: string; sessionDuration?: number; breakBetweenSessions?: number}>, dayOfWeek: number): string[] {
    const suggestions: string[] = [];

    availability.forEach((slot) => {
        if (!slot.isActive) return;

        // Check if this slot applies to the requested day
        const appliesToDay = slot.recurrencePattern?.days
            ? slot.recurrencePattern.days.includes(dayOfWeek)
            : slot.dayOfWeek === dayOfWeek;

        if (!appliesToDay) return;

        // Generate suggestions within this slot
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
                suggestions.push(currentTime.toTimeString().slice(0, 5));
            }

            currentTime.setMinutes(currentTime.getMinutes() + totalSlotDuration);
        }
    });

    return suggestions.slice(0, 5); // Return up to 5 suggestions
} 