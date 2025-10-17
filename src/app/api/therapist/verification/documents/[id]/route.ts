import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/therapist/verification/documents/{id}:
 *   delete:
 *     summary: Delete a verification document
 *     description: Removes a previously uploaded verification document
 *     tags:
 *       - Therapist Verification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID to delete
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found or access denied
 *       500:
 *         description: Internal server error
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireApiAuth(req, ['THERAPIST']);
    const params = await context.params;

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

    // Find the document and verify ownership
    const document = await prisma.therapistDocument.findFirst({
      where: {
        id: params.id,
        therapistId: therapist.id
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found or access denied" },
        { status: 404 }
      );
    }

    // Delete from database (file data is stored in database, so this removes everything)
    await prisma.therapistDocument.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: "Document deleted successfully"
    });

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}