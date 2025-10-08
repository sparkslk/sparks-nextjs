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
            isFreeSession: slot.isFree,
            createdAt: slot.createdAt.toISOString()
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

            // Validate for overlaps before creating
            const validateOverlaps = (slots: TimeSlotData[]) => {
                for (let i = 0; i < slots.length; i++) {
                    for (let j = i + 1; j < slots.length; j++) {
                        const slot1 = slots[i];
                        const slot2 = slots[j];
                        
                        // Get applicable days for each slot
                        const getDays = (slot: TimeSlotData) => {
                            if (slot.recurrencePattern?.days && slot.recurrencePattern.days.length > 0) {
                                return slot.recurrencePattern.days;
                            }
                            return [slot.dayOfWeek];
                        };
                        
                        const days1 = getDays(slot1);
                        const days2 = getDays(slot2);
                        
                        // Check if they share any common days
                        const commonDays = days1.filter(day => days2.includes(day));
                        
                        if (commonDays.length > 0) {
                            // Convert times to minutes for comparison
                            const [s1h, s1m] = slot1.startTime.split(':').map(Number);
                            const [e1h, e1m] = slot1.endTime.split(':').map(Number);
                            const [s2h, s2m] = slot2.startTime.split(':').map(Number);
                            const [e2h, e2m] = slot2.endTime.split(':').map(Number);
                            
                            const start1 = s1h * 60 + s1m;
                            const end1 = e1h * 60 + e1m;
                            const start2 = s2h * 60 + s2m;
                            const end2 = e2h * 60 + e2m;
                            
                            // Check for time overlap
                            if (!(end1 <= start2 || end2 <= start1)) {
                                const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                                const dayName = dayNames[commonDays[0]];
                                throw new Error(`Overlapping availability blocks detected on ${dayName} between ${slot1.startTime}-${slot1.endTime} and ${slot2.startTime}-${slot2.endTime}`);
                            }
                        }
                    }
                }
            };
            
            // Validate before creating
            validateOverlaps(availability);

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
                        isActive: slot.isActive,
                        isFree: slot.isFreeSession || false
                    };
                    
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
            isFreeSession: slot.isFree,
            createdAt: slot.createdAt.toISOString()
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