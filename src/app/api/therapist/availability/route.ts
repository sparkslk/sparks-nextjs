import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

interface TimeSlotData {
  id: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  isRecurring: boolean;
  recurrencePattern?: {
    type: "daily" | "weekly" | "custom";
    days?: number[];
    endDate?: string;
  };
  isActive: boolean;
  isFreeSession?: boolean;
}

/**
 * @swagger
 * /api/therapist/availability:
 *   get:
 *     summary: Get therapist availability
 *     description: Retrieve the authenticated therapist's availability schedule
 *     tags:
 *       - Therapist
 *       - Availability
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Availability retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 availability:
 *                   type: object
 *                   description: Therapist availability schedule
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Therapist profile not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update therapist availability
 *     description: Update the authenticated therapist's availability schedule
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
 *             properties:
 *               availability:
 *                 type: object
 *                 description: Updated availability schedule
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Therapist profile not found
 *       500:
 *         description: Internal server error
 */

// Get therapist availability
export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);

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

        // Get availability slots from the new table
        const availabilitySlots = await prisma.therapistAvailability.findMany({
            where: { therapistId: therapist.id },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });

        // Convert database records to frontend format
        const availability = availabilitySlots.map((slot) => ({
            id: slot.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            dayOfWeek: slot.dayOfWeek,
            isRecurring: slot.isRecurring,
            recurrencePattern: slot.isRecurring && slot.recurrenceType ? {
                type: slot.recurrenceType.toLowerCase() as "daily" | "weekly" | "custom",
                days: slot.recurrenceDays.length > 0 ? slot.recurrenceDays : undefined,
                endDate: slot.recurrenceEndDate?.toISOString() || undefined
            } : undefined,
            isActive: slot.isActive,
            isFreeSession: slot.rate !== null && slot.rate.toNumber() === 0
        }));

        return NextResponse.json({
            availability: availability
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching therapist availability:", error);
        return NextResponse.json(
            { error: "Failed to fetch availability" },
            { status: 500 }
        );
    }
}

// Update therapist availability
export async function PUT(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);
        const { availability } = await req.json();

        if (!availability || !Array.isArray(availability)) {
            return NextResponse.json(
                { error: "Availability data must be an array" },
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

        // Use transaction to update availability slots
        const result = await prisma.$transaction(async (tx) => {
            // Delete existing availability slots for this therapist
            await tx.therapistAvailability.deleteMany({
                where: { therapistId: therapist.id }
            });

            // Create new availability slots with fixed 45-minute sessions and 15-minute breaks
            const createdSlots = await Promise.all(
                availability.map(async (slot: TimeSlotData) => {
                    const recurrenceType = slot.recurrencePattern?.type?.toUpperCase() as "DAILY" | "WEEKLY" | "CUSTOM" | undefined;
                    
                    const createData: any = {
                        therapistId: therapist.id,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        dayOfWeek: slot.dayOfWeek,
                        isRecurring: slot.isRecurring,
                        recurrenceType: recurrenceType,
                        recurrenceDays: slot.recurrencePattern?.days || [],
                        recurrenceEndDate: slot.recurrencePattern?.endDate 
                            ? new Date(slot.recurrencePattern.endDate) 
                            : null,
                        sessionDuration: 45, // Fixed 45-minute sessions
                        breakBetweenSessions: 15, // Fixed 15-minute breaks
                        isActive: slot.isActive
                    };
                    
                    if (slot.isFreeSession) {
                        createData.rate = 0;
                    }
                    
                    return tx.therapistAvailability.create({
                        data: createData
                    });
                })
            );

            return createdSlots;
        });

        // Convert created slots back to frontend format
        const formattedAvailability = result.map((slot) => ({
            id: slot.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            dayOfWeek: slot.dayOfWeek,
            isRecurring: slot.isRecurring,
            recurrencePattern: slot.isRecurring ? {
                type: slot.recurrenceType?.toLowerCase() as "daily" | "weekly" | "custom",
                days: slot.recurrenceDays || undefined,
                endDate: slot.recurrenceEndDate?.toISOString() || undefined
            } : undefined,
            isActive: slot.isActive,
            isFreeSession: slot.rate !== null && slot.rate.toNumber() === 0
        }));

        return NextResponse.json({
            message: "Availability updated successfully",
            availability: formattedAvailability
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error updating therapist availability:", error);
        return NextResponse.json(
            { error: "Failed to update availability" },
            { status: 500 }
        );
    }
} 