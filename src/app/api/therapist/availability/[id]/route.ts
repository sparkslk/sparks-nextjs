import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

interface UpdateAvailabilitySlotData {
  startTime?: string;
  endTime?: string;
  dayOfWeek?: number;
  isRecurring?: boolean;
  recurrencePattern?: {
    type: "daily" | "weekly" | "custom";
    days?: number[];
    endDate?: string;
  };
  sessionDuration?: number;
  breakBetweenSessions?: number;
  isActive?: boolean;
  isFreeSession?: boolean;
}

/**
 * @swagger
 * /api/therapist/availability/{id}:
 *   put:
 *     summary: Update an availability slot
 *     description: Update an existing availability slot for the authenticated therapist
 *     tags:
 *       - Therapist
 *       - Availability
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The availability slot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *               isRecurring:
 *                 type: boolean
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
 *               breakBetweenSessions:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               rate:
 *                 type: number
 *     responses:
 *       200:
 *         description: Availability slot updated successfully
 *       400:
 *         description: Bad request - invalid data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Availability slot not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete an availability slot
 *     description: Delete an existing availability slot for the authenticated therapist
 *     tags:
 *       - Therapist
 *       - Availability
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The availability slot ID
 *     responses:
 *       200:
 *         description: Availability slot deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Availability slot not found
 *       500:
 *         description: Internal server error
 */

export async function PUT(
    req: NextRequest, 
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);
        const data: UpdateAvailabilitySlotData = await req.json();
        const params = await context.params;
        const slotId = params.id;

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

        // Check if the slot exists and belongs to this therapist
        const existingSlot = await prisma.therapistAvailability.findFirst({
            where: {
                id: slotId,
                therapistId: therapist.id
            }
        });

        if (!existingSlot) {
            return NextResponse.json(
                { error: "Availability slot not found" },
                { status: 404 }
            );
        }

        // Validate time format if provided
        if (data.startTime || data.endTime) {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (data.startTime && !timeRegex.test(data.startTime)) {
                return NextResponse.json(
                    { error: "Invalid startTime format. Use HH:MM format" },
                    { status: 400 }
                );
            }
            if (data.endTime && !timeRegex.test(data.endTime)) {
                return NextResponse.json(
                    { error: "Invalid endTime format. Use HH:MM format" },
                    { status: 400 }
                );
            }
        }

        // Validate dayOfWeek if provided
        if (data.dayOfWeek !== undefined && (data.dayOfWeek < 0 || data.dayOfWeek > 6)) {
            return NextResponse.json(
                { error: "dayOfWeek must be between 0 (Sunday) and 6 (Saturday)" },
                { status: 400 }
            );
        }

        // Prepare update data
        const updateData: Record<string, unknown> = {};
        
        if (data.startTime !== undefined) updateData.startTime = data.startTime;
        if (data.endTime !== undefined) updateData.endTime = data.endTime;
        if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek;
        if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;
        if (data.sessionDuration !== undefined) updateData.sessionDuration = data.sessionDuration;
        if (data.breakBetweenSessions !== undefined) updateData.breakBetweenSessions = data.breakBetweenSessions;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.isFreeSession !== undefined) updateData.isFree = data.isFreeSession;

        if (data.recurrencePattern) {
            updateData.recurrenceType = data.recurrencePattern.type?.toUpperCase() as "DAILY" | "WEEKLY" | "CUSTOM";
            updateData.recurrenceDays = data.recurrencePattern.days || [];
            updateData.recurrenceEndDate = data.recurrencePattern.endDate 
                ? new Date(data.recurrencePattern.endDate) 
                : null;
        }

        // Update the slot
        const updatedSlot = await prisma.therapistAvailability.update({
            where: { id: slotId },
            data: updateData
        });

        // Convert to frontend format
        const formattedSlot = {
            id: updatedSlot.id,
            startTime: updatedSlot.startTime,
            endTime: updatedSlot.endTime,
            dayOfWeek: updatedSlot.dayOfWeek,
            isRecurring: updatedSlot.isRecurring,
            recurrencePattern: updatedSlot.isRecurring ? {
                type: updatedSlot.recurrenceType?.toLowerCase() as "daily" | "weekly" | "custom",
                days: updatedSlot.recurrenceDays || undefined,
                endDate: updatedSlot.recurrenceEndDate?.toISOString() || undefined
            } : undefined,
            sessionDuration: updatedSlot.sessionDuration,
            breakBetweenSessions: updatedSlot.breakBetweenSessions,
            isActive: updatedSlot.isActive,
            isFreeSession: updatedSlot.isFree
        };

        return NextResponse.json({
            message: "Availability slot updated successfully",
            slot: formattedSlot
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error updating availability slot:", error);
        return NextResponse.json(
            { error: "Failed to update availability slot" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest, 
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);
        const params = await context.params;
        const slotId = params.id;

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

        // Check if the slot exists and belongs to this therapist
        const existingSlot = await prisma.therapistAvailability.findFirst({
            where: {
                id: slotId,
                therapistId: therapist.id
            }
        });

        if (!existingSlot) {
            return NextResponse.json(
                { error: "Availability slot not found" },
                { status: 404 }
            );
        }

        // Delete the slot
        await prisma.therapistAvailability.delete({
            where: { id: slotId }
        });

        return NextResponse.json({
            message: "Availability slot deleted successfully"
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error deleting availability slot:", error);
        return NextResponse.json(
            { error: "Failed to delete availability slot" },
            { status: 500 }
        );
    }
}
