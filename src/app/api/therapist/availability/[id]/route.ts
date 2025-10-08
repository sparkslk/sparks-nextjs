import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/therapist/availability/{id}:
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
 *         description: The ID of the availability slot to delete
 *     responses:
 *       200:
 *         description: Availability slot deleted successfully
 *       400:
 *         description: Bad request - slot is already booked
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Availability slot not found
 *       500:
 *         description: Internal server error
 */

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);
        const slotId = params.id;

        if (!slotId) {
            return NextResponse.json(
                { error: "Slot ID is required" },
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

        // Check if slot exists and belongs to this therapist
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

        // Check if slot is already booked
        if (existingSlot.isBooked) {
            return NextResponse.json(
                { error: "Cannot delete a booked slot. Please cancel the associated session first." },
                { status: 400 }
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
