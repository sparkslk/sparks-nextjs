import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reviewRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNotes: z.string().optional()
});

/**
 * @swagger
 * /api/manager/verification-requests/{id}/review:
 *   put:
 *     summary: Review therapist verification request
 *     description: Approve, reject, or mark as under review a therapist verification request
 *     tags:
 *       - Manager
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The verification request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               reviewNotes:
 *                 type: string
 *                 description: Optional notes for the review (required for rejection)
 *     responses:
 *       200:
 *         description: Verification request reviewed successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions (manager role required)
 *       404:
 *         description: Verification request not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiAuth(req, ['MANAGER']);
    const body = await req.json();
    
    // Validate request body
    const validationResult = reviewRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { status, reviewNotes } = validationResult.data;
    const verificationId = params.id;

    // Check if verification exists
    const verification = await prisma.therapistVerification.findUnique({
      where: { id: verificationId },
      include: {
        therapist: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Verification request not found" },
        { status: 404 }
      );
    }

    // If rejecting, require review notes
    if (status === 'REJECTED' && !reviewNotes?.trim()) {
      return NextResponse.json(
        { error: "Review notes are required when rejecting an application" },
        { status: 400 }
      );
    }

    // Update verification status
    const updatedVerification = await prisma.therapistVerification.update({
      where: { id: verificationId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        reviewNotes: reviewNotes || null
      }
    });

    // Create notification for the therapist
    await prisma.notification.create({
      data: {
        senderId: session.user.id,
        receiverId: verification.therapist.user.id,
        type: 'SYSTEM',
        title: `Verification ${status.toLowerCase()}`,
        message: status === 'APPROVED' 
          ? 'Congratulations! Your therapist verification has been approved.'
          : status === 'REJECTED'
          ? `Your therapist verification has been rejected. Reason: ${reviewNotes}`
          : 'Your therapist verification is now under review.',
        isRead: false
      }
    });

    // If approved, we could also update the therapist's profile or send welcome email
    // This could be handled by a background job or webhook

    return NextResponse.json({
      message: `Verification ${status.toLowerCase()} successfully`,
      status: updatedVerification.status,
      reviewedAt: updatedVerification.reviewedAt
    });

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error reviewing verification request:", error);
    return NextResponse.json(
      { error: "Failed to review verification request" },
      { status: 500 }
    );
  }
}