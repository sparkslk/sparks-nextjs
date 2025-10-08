import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/therapist/verification/mark-approval-seen:
 *   post:
 *     summary: Mark approval message as seen
 *     description: Updates the therapist verification record to indicate they've seen the approval message
 *     tags:
 *       - Therapist Verification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Approval message marked as seen
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Therapist or verification not found
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireApiAuth(req, ['THERAPIST']);

    // Get therapist ID
    const therapist = await prisma.therapist.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist profile not found" },
        { status: 404 }
      );
    }

    // Update verification record to mark approval as seen
    await prisma.therapistVerification.updateMany({
      where: { 
        therapistId: therapist.id,
        status: 'APPROVED'
      },
      data: {
        // Add a timestamp to track when approval was acknowledged
        reviewNotes: `Approval acknowledged at ${new Date().toISOString()}`
      }
    });

    return NextResponse.json({
      message: "Approval message marked as seen"
    });

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error marking approval as seen:", error);
    return NextResponse.json(
      { error: "Failed to mark approval as seen" },
      { status: 500 }
    );
  }
}