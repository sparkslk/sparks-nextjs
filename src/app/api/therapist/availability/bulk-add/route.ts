import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

interface BulkAddAvailabilityData {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  recurrenceType: "None" | "Daily" | "Weekly" | "Monthly" | "Custom";
  selectedDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  isFree: boolean;
}

/**
 * @swagger
 * /api/therapist/availability/bulk-add:
 *   post:
 *     summary: Bulk add availability slots with recurrence
 *     description: Create multiple availability slots for the authenticated therapist based on recurrence pattern
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
 *               - startDate
 *               - endDate
 *               - startTime
 *               - endTime
 *               - recurrenceType
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-08"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-31"
 *               startTime:
 *                 type: string
 *                 format: time
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 format: time
 *                 example: "12:00"
 *               recurrenceType:
 *                 type: string
 *                 enum: ["None", "Daily", "Weekly", "Monthly", "Custom"]
 *               selectedDays:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3, 5]
 *               isFree:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Availability slots created successfully
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
        const data: BulkAddAvailabilityData = await req.json();

        // Validate required fields
        if (!data.startDate || !data.endDate || !data.startTime || !data.endTime || !data.recurrenceType) {
            return NextResponse.json(
                { error: "Missing required fields" },
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

        // Validate dates
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        
        if (startDate > endDate) {
            return NextResponse.json(
                { error: "Start date must be before or equal to end date" },
                { status: 400 }
            );
        }

        // Validate Custom recurrence has selectedDays
        if (data.recurrenceType === "Custom" && (!data.selectedDays || data.selectedDays.length === 0)) {
            return NextResponse.json(
                { error: "Custom recurrence requires selectedDays" },
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

        // Generate slots based on recurrence type
        const slots = generateSlots(data, therapist.id);

        if (slots.length === 0) {
            return NextResponse.json(
                { error: "No slots generated. Check your date range and recurrence settings." },
                { status: 400 }
            );
        }

        // Check for overlaps with existing slots
        const existingSlots = await prisma.therapistAvailability.findMany({
            where: {
                therapistId: therapist.id,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        // Check for conflicts
        const conflicts: string[] = [];
        for (const slot of slots) {
            const conflict = existingSlots.find(existing => {
                const existingDate = new Date(existing.date).toISOString().split('T')[0];
                const slotDate = new Date(slot.date).toISOString().split('T')[0];
                return existingDate === slotDate && existing.startTime === slot.startTime;
            });
            
            if (conflict) {
                const dateStr = new Date(slot.date).toLocaleDateString();
                conflicts.push(`${dateStr} at ${slot.startTime}`);
            }
        }

        if (conflicts.length > 0) {
            return NextResponse.json(
                { 
                    error: "Some slots conflict with existing availability", 
                    conflicts: conflicts.slice(0, 5), // Show first 5 conflicts
                    totalConflicts: conflicts.length
                },
                { status: 409 }
            );
        }

        // Create all slots in a transaction
        const createdSlots = await prisma.therapistAvailability.createMany({
            data: slots
        });

        return NextResponse.json({
            message: "Availability slots created successfully",
            slotsCreated: createdSlots.count,
            dateRange: {
                start: data.startDate,
                end: data.endDate
            }
        }, { status: 201 });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error creating availability slots:", error);
        return NextResponse.json(
            { error: "Failed to create availability slots" },
            { status: 500 }
        );
    }
}

// Helper function to generate slots based on recurrence
function generateSlots(data: BulkAddAvailabilityData, therapistId: string) {
    const slots: Array<{
        therapistId: string;
        date: Date;
        startTime: string;
        isBooked: boolean;
        isFree: boolean;
    }> = [];

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Parse time to generate 45-minute slots
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;

    // Generate time slots (45-minute sessions)
    const timeSlots: string[] = [];
    let currentMinutes = startTimeMinutes;
    
    // Only start on the hour
    if (currentMinutes % 60 !== 0) {
        currentMinutes = Math.ceil(currentMinutes / 60) * 60;
    }

    while (currentMinutes + 45 <= endTimeMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;
        timeSlots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
        currentMinutes += 60; // Next hour (45 min session + 15 min break)
    }

    if (timeSlots.length === 0) {
        return slots;
    }

    // Get applicable dates based on recurrence type
    const applicableDates = getApplicableDates(startDate, endDate, data.recurrenceType, data.selectedDays);

    // Generate slots for each applicable date and time
    for (const date of applicableDates) {
        for (const time of timeSlots) {
            slots.push({
                therapistId,
                date: new Date(date),
                startTime: time,
                isBooked: false,
                isFree: data.isFree || false
            });
        }
    }

    return slots;
}

// Helper function to get applicable dates based on recurrence
function getApplicableDates(
    startDate: Date,
    endDate: Date,
    recurrenceType: string,
    selectedDays?: number[]
): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    switch (recurrenceType) {
        case "None":
            // Only the start date
            dates.push(new Date(startDate));
            break;

        case "Daily":
            // Every day between start and end
            while (currentDate <= endDate) {
                dates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
            break;

        case "Weekly":
            // Same day of week until end date
            const targetDay = startDate.getDay();
            while (currentDate <= endDate) {
                if (currentDate.getDay() === targetDay) {
                    dates.push(new Date(currentDate));
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            break;

        case "Monthly":
            // Same day of month until end date
            const dayOfMonth = startDate.getDate();
            while (currentDate <= endDate) {
                if (currentDate.getDate() === dayOfMonth) {
                    dates.push(new Date(currentDate));
                }
                // Move to next month
                currentDate.setMonth(currentDate.getMonth() + 1);
                // Handle cases where the day doesn't exist in the next month
                if (currentDate.getDate() !== dayOfMonth) {
                    currentDate.setDate(0); // Set to last day of previous month
                }
            }
            break;

        case "Custom":
            // Specific days of the week
            if (selectedDays && selectedDays.length > 0) {
                while (currentDate <= endDate) {
                    if (selectedDays.includes(currentDate.getDay())) {
                        dates.push(new Date(currentDate));
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
            break;
    }

    return dates;
}
