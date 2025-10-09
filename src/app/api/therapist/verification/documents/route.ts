import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { documentCategorySchema, fileValidationSchema } from "@/lib/validation/therapist-verification";

/**
 * @swagger
 * /api/therapist/verification/documents:
 *   post:
 *     summary: Upload therapist verification documents
 *     description: Uploads documents for therapist verification (licenses, certificates, etc.)
 *     tags:
 *       - Therapist Verification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               category:
 *                 type: string
 *                 enum: [PROFESSIONAL_LICENSE, EDUCATIONAL_CERTIFICATE, ADDITIONAL_CERTIFICATION]
 *     responses:
 *       201:
 *         description: Documents uploaded successfully
 *       400:
 *         description: Invalid files or missing category
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Therapist not found
 *       413:
 *         description: File too large
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

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const category = formData.get('category') as string;

    // Validate category
    const categoryValidation = documentCategorySchema.safeParse(category);
    if (!categoryValidation.success) {
      return NextResponse.json(
        { error: "Invalid document category" },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Validate each file
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    for (const file of files) {
      const fileValidation = fileValidationSchema.safeParse({
        name: file.name,
        size: file.size,
        type: file.type
      });

      if (!fileValidation.success) {
        validationErrors.push(`${file.name}: ${fileValidation.error.errors.map(e => e.message).join(', ')}`);
      } else {
        validFiles.push(file);
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "File validation failed", details: validationErrors },
        { status: 400 }
      );  
    }

    // Process and save files directly to database
    const uploadedDocuments = [];

    for (const file of validFiles) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename for reference
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `${therapist.id}_${category}_${timestamp}.${extension}`;

      // Save document record with file data to database
      const document = await prisma.therapistDocument.create({
        data: {
          therapistId: therapist.id,
          category: categoryValidation.data,
          fileName: fileName,
          originalName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          fileData: buffer // Store file content directly in database
        }
      });

      uploadedDocuments.push({
        id: document.id,
        category: document.category,
        originalName: document.originalName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        uploadedAt: document.uploadedAt
      });
    }

    return NextResponse.json(
      {
        message: "Documents uploaded successfully",
        documents: uploadedDocuments
      },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error uploading documents:", error);
    return NextResponse.json(
      { error: "Failed to upload documents" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/therapist/verification/documents:
 *   get:
 *     summary: Get uploaded verification documents
 *     description: Retrieves list of documents uploaded by the therapist for verification
 *     tags:
 *       - Therapist Verification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [PROFESSIONAL_LICENSE, EDUCATIONAL_CERTIFICATE, ADDITIONAL_CERTIFICATION]
 *         description: Filter by document category
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       category:
 *                         type: string
 *                       originalName:
 *                         type: string
 *                       fileSize:
 *                         type: integer
 *                       mimeType:
 *                         type: string
 *                       uploadedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Therapist not found
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireApiAuth(req, ['THERAPIST']);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

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

    // Build where clause
    const whereClause: Record<string, unknown> = { therapistId: therapist.id };
    if (category) {
      const categoryValidation = documentCategorySchema.safeParse(category);
      if (categoryValidation.success) {
        whereClause.category = categoryValidation.data;
      }
    }

    // Get documents
    const documents = await prisma.therapistDocument.findMany({
      where: whereClause,
      select: {
        id: true,
        category: true,
        originalName: true,
        fileSize: true,
        mimeType: true,
        uploadedAt: true
      },
      orderBy: { uploadedAt: 'desc' }
    });

    return NextResponse.json({ documents });

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}