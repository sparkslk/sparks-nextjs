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
        const session = await requireApiAuth(req);
        const { therapistId, dateTime, duration = 60 } = await req.json();

        if (!therapistId || !dateTime) {
            return NextResponse.json(
                { error: "Therapist ID and date/time are required" },
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

        const requestedDateTime = new Date(dateTime);
        const dayOfWeek = requestedDateTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const timeString = requestedDateTime.toTimeString().slice(0, 5); // HH:MM format

        // Check if therapist has availability set
        if (!therapist.availability || !Array.isArray(therapist.availability)) {
            return NextResponse.json({
                available: false,
                message: "Therapist has not set their availability",
                suggestedSlots: []
            });
        }

        // Check if the requested time falls within any availability slot
        const isAvailable = therapist.availability.some((slot: any) => {
            // Check if the day matches
            if (slot.recurrencePattern?.days) {
                if (!slot.recurrencePattern.days.includes(dayOfWeek)) {
                    return false;
                }
            } else if (slot.dayOfWeek !== dayOfWeek) {
                return false;
            }

            // Check if the time falls within the slot
            const slotStart = slot.startTime;
            const slotEnd = slot.endTime;

            // Calculate the end time of the requested session
            const sessionEndTime = new Date(requestedDateTime);
            sessionEndTime.setMinutes(sessionEndTime.getMinutes() + duration);
            const sessionEndTimeString = sessionEndTime.toTimeString().slice(0, 5);

            // Check if the requested time and session duration fit within the slot
            return timeString >= slotStart && sessionEndTimeString <= slotEnd && slot.isActive;
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
                    in: ['SCHEDULED', 'APPROVED', 'IN_PROGRESS']
                }
            }
        });

        const hasConflict = existingSessions.length > 0;

        if (!isAvailable) {
            return NextResponse.json({
                available: false,
                message: "Therapist is not available at this time",
                suggestedSlots: getSuggestedSlots(therapist.availability, dayOfWeek, duration)
            });
        }

        if (hasConflict) {
            return NextResponse.json({
                available: false,
                message: "Therapist has a conflicting appointment at this time",
                suggestedSlots: getSuggestedSlots(therapist.availability, dayOfWeek, duration)
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

// Helper function to get suggested time slots
function getSuggestedSlots(availability: any[], dayOfWeek: number, duration: number): string[] {
    const suggestions: string[] = [];

    availability.forEach((slot: any) => {
        if (!slot.isActive) return;

        // Check if this slot applies to the requested day
        const appliesToDay = slot.recurrencePattern?.days
            ? slot.recurrencePattern.days.includes(dayOfWeek)
            : slot.dayOfWeek === dayOfWeek;

        if (!appliesToDay) return;

        // Generate suggestions within this slot
        const startTime = new Date(`1970-01-01T${slot.startTime}:00`);
        const endTime = new Date(`1970-01-01T${slot.endTime}:00`);

        let currentTime = new Date(startTime);
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