import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/therapist/verification/documents/{id}/download:
 *   get:
 *     summary: Download a verification document
 *     description: Downloads a previously uploaded verification document
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
 *         description: Document ID to download
 *     responses:
 *       200:
 *         description: Document file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found or access denied
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireApiAuth(req, ['THERAPIST', 'ADMIN', 'MANAGER']);
    const { id: documentId } = await params;

    // Get therapist ID (if user is therapist, only allow their own documents)
    let therapistId: string | undefined;
    if (session.user.role === 'THERAPIST') {
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
      therapistId = therapist.id;
    }

    // Find the document and verify access
    const whereClause: Record<string, unknown> = { id: documentId };
    // Only restrict to therapist's own documents if user is a therapist
    if (therapistId) {
      whereClause.therapistId = therapistId;
    }

    const document = await prisma.therapistDocument.findFirst({
      where: whereClause,
      select: {
        originalName: true,
        mimeType: true,
        fileData: true,
        fileSize: true
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found or access denied" },
        { status: 404 }
      );
    }

    // Return the file with appropriate headers
    return new NextResponse(Buffer.from(document.fileData), {
      status: 200,
      headers: {
        'Content-Type': document.mimeType,
        'Content-Length': document.fileSize.toString(),
        'Content-Disposition': `attachment; filename="${document.originalName}"`,
        'Cache-Control': 'private, no-cache'
      }
    });

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error downloading document:", error);
    return NextResponse.json(
      { error: "Failed to download document" },
      { status: 500 }
    );
  }
}