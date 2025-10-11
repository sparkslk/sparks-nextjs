import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

interface CreateAvailabilitySlotData {
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  isRecurring: boolean;
  recurrencePattern?: {
    type: "daily" | "weekly" | "custom";
    days?: number[];
    endDate?: string;
  };
  sessionDuration: number;
  breakBetweenSessions: number;
  isActive: boolean;
  isFreeSession?: boolean;
}

/**
 * @swagger
 * /api/therapist/availability/add:
 *   post:
 *     summary: Add a new availability slot
 *     description: Create a new availability slot for the authenticated therapist
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
 *               - startTime
 *               - endTime
 *               - dayOfWeek
 *               - sessionDuration
 *               - breakBetweenSessions
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: time
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 format: time
 *                 example: "17:00"
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *                 example: 1
 *               isRecurring:
 *                 type: boolean
 *                 example: true
 *               recurrencePattern:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: ["daily", "weekly", "custom"]
 *                   days:
 *                     type: array
 *                     items:
 *                       type: integer
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *               sessionDuration:
 *                 type: integer
 *                 example: 60
 *               breakBetweenSessions:
 *                 type: integer
 *                 example: 15
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               rate:
 *                 type: number
 *                 example: 120.00
 *     responses:
 *       201:
 *         description: Availability slot created successfully
 *       400:
 *         description: Bad request - invalid data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Therapist profile not found
 *       500:
 *         description: Internal server error
 */

export async function POST(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);
        const data: CreateAvailabilitySlotData = await req.json();

        // Validate required fields
        if (!data.startTime || !data.endTime || data.dayOfWeek === undefined) {
            return NextResponse.json(
                { error: "Missing required fields: startTime, endTime, and dayOfWeek are required" },
                { status: 400 }
            );
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
            return NextResponse.json(
                { error: "Invalid time format. Use HH:MM format" },
                { status: 400 }
            );
        }

        // Validate dayOfWeek (0-6)
        if (data.dayOfWeek < 0 || data.dayOfWeek > 6) {
            return NextResponse.json(
                { error: "dayOfWeek must be between 0 (Sunday) and 6 (Saturday)" },
                { status: 400 }
            );
        }

        // Validate start time is before end time
        const startMinutes = timeToMinutes(data.startTime);
        const endMinutes = timeToMinutes(data.endTime);
        if (startMinutes >= endMinutes) {
            return NextResponse.json(
                { error: "Start time must be before end time" },
                { status: 400 }
            );
        }

        // Get therapist profile
        const therapist = await prisma.therapist.findUnique({
            where: { userId: session.user.id }
        });

        if (!therapist) {
            return NextResponse.json(
                { error: "Therapist profile not found" },
                { status: 404 }
            );
        }

        // Create the availability slot
        // Note: Using date field to store the day, startTime for the time slot
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + ((data.dayOfWeek + 7 - today.getDay()) % 7));

        const newSlot = await prisma.therapistAvailability.create({
            data: {
                therapistId: therapist.id,
                date: targetDate,
                startTime: data.startTime,
                isBooked: false,
                isFree: data.isFreeSession || false
            }
        });

        // Convert to frontend format
        const formattedSlot = {
            id: newSlot.id,
            date: newSlot.date.toISOString(),
            startTime: newSlot.startTime,
            dayOfWeek: data.dayOfWeek,
            isBooked: newSlot.isBooked,
            isFreeSession: newSlot.isFree
        };

        return NextResponse.json({
            message: "Availability slot created successfully",
            slot: formattedSlot
        }, { status: 201 });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error creating availability slot:", error);
        return NextResponse.json(
            { error: "Failed to create availability slot" },
            { status: 500 }
        );
    }
}

// Helper function to convert time string to minutes
function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}
