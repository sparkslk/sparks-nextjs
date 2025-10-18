import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  isBooked: boolean;
  isFree: boolean;
}

/**
 * @swagger
 * /api/therapist/availability:
 *   get:
 *     summary: Get therapist availability
 *     description: Retrieve the authenticated therapist's availability slots
 *     tags:
 *       - Therapist
 *       - Availability
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering slots (optional)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering slots (optional)
 *     responses:
 *       200:
 *         description: Availability retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 slots:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Therapist profile not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete all availability slots
 *     description: Delete all availability slots for the authenticated therapist
 *     tags:
 *       - Therapist
 *       - Availability
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: All slots deleted successfully
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
        
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

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

        // Build query filters
        const whereClause: {
            therapistId: string;
            date?: {
                gte?: Date;
                lte?: Date;
            };
        } = {
            therapistId: therapist.id
        };

        if (startDate || endDate) {
            whereClause.date = {};
            if (startDate) {
                whereClause.date.gte = new Date(startDate);
            }
            if (endDate) {
                whereClause.date.lte = new Date(endDate);
            }
        }

        // Get availability slots from the database
        const availabilitySlots = await prisma.therapistAvailability.findMany({
            where: whereClause,
            orderBy: [
                { date: 'asc' },
                { startTime: 'asc' }
            ]
        });

        // Convert database records to frontend format
        const slots: AvailabilitySlot[] = availabilitySlots.map((slot) => ({
            id: slot.id,
            date: slot.date.toISOString().split('T')[0],
            startTime: slot.startTime,
            isBooked: slot.isBooked,
            isFree: slot.isFree
        }));

        return NextResponse.json({
            slots,
            count: slots.length
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

// Delete all therapist availability
export async function DELETE(req: NextRequest) {
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

        // Get current date and time
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;

        // Delete only upcoming unbooked availability slots
        // This includes:
        // 1. All slots with future dates
        // 2. Today's slots that haven't started yet
        const result = await prisma.therapistAvailability.deleteMany({
            where: {
                therapistId: therapist.id,
                isBooked: false,
                OR: [
                    // Future dates
                    {
                        date: {
                            gt: new Date(currentDate)
                        }
                    },
                    // Today's future slots
                    {
                        date: new Date(currentDate),
                        startTime: {
                            gt: currentTime
                        }
                    }
                ]
            }
        });

        return NextResponse.json({
            message: "Upcoming availability deleted successfully",
            deletedCount: result.count
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error deleting therapist availability:", error);
        return NextResponse.json(
            { error: "Failed to delete availability" },
            { status: 500 }
        );
    }
} 