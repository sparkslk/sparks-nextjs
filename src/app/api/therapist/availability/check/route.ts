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
        const requestedDate = new Date(requestedDateTime);
        requestedDate.setHours(0, 0, 0, 0); // Start of day
        const nextDate = new Date(requestedDate);
        nextDate.setDate(nextDate.getDate() + 1); // End of day
        const timeString = requestedDateTime.toTimeString().slice(0, 5); // HH:MM format

        // Get availability slots for the requested date
        const availabilitySlots = await prisma.therapistAvailability.findMany({
            where: {
                therapistId: therapist.id,
                date: {
                    gte: requestedDate,
                    lt: nextDate
                },
                isBooked: false // Only consider unbooked slots
            }
        });

        if (availabilitySlots.length === 0) {
            return NextResponse.json({
                available: false,
                message: "Therapist has not set their availability for this day",
                suggestedSlots: []
            });
        }

        // Check if the requested time matches any available slot
        const matchingSlot = availabilitySlots.find((slot) => {
            return slot.startTime === timeString;
        });

        const isAvailable = !!matchingSlot;

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
                suggestedSlots: getSuggestedSlotsFromDB(availabilitySlots)
            });
        }

        if (hasConflict) {
            return NextResponse.json({
                available: false,
                message: "Therapist has a conflicting appointment at this time",
                suggestedSlots: getSuggestedSlotsFromDB(availabilitySlots)
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
    id: string;
    therapistId: string;
    date: Date;
    startTime: string;
    isBooked: boolean;
    isFree: boolean;
}>): string[] {
    // Return available (unbooked) time slots as suggestions
    const suggestions = availability
        .filter(slot => !slot.isBooked)
        .map(slot => slot.startTime)
        .slice(0, 5); // Return up to 5 suggestions

    return suggestions;
}

 