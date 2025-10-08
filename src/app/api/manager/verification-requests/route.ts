import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/manager/verification-requests:
 *   get:
 *     summary: Get all therapist verification requests
 *     description: Retrieves all therapist verification requests for manager review
 *     tags:
 *       - Manager
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, UNDER_REVIEW, APPROVED, REJECTED, REQUIRES_RESUBMISSION]
 *         description: Filter by verification status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by therapist name, email, or license number
 *     responses:
 *       200:
 *         description: Verification requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   therapist:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                   profile:
 *                     type: object
 *                   verification:
 *                     type: object
 *                   documents:
 *                     type: array
 *                   reference:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions (manager role required)
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireApiAuth(req, ['MANAGER']);
    const url = new URL(req.url);
    
    const statusFilter = url.searchParams.get('status');
    const searchTerm = url.searchParams.get('search');

    // Build where clause
    const whereClause: any = {};
    
    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    // Get all therapist verification requests with related data
    let verifications = await prisma.therapistVerification.findMany({
      where: whereClause,
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
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // Get additional data for each verification
    const verificationsWithData = await Promise.all(
      verifications.map(async (verification) => {
        const [profile, documents, reference] = await Promise.all([
          prisma.therapistProfile.findUnique({
            where: { therapistId: verification.therapistId }
          }),
          prisma.therapistDocument.findMany({
            where: { therapistId: verification.therapistId },
            select: {
              id: true,
              category: true,
              fileName: true,
              originalName: true,
              fileSize: true,
              mimeType: true,
              uploadedAt: true
            }
          }),
          prisma.therapistReference.findUnique({
            where: { therapistId: verification.therapistId }
          })
        ]);

        return {
          ...verification,
          profile,
          documents,
          reference
        };
      })
    );

    // Apply search filter if provided
    let filteredVerifications = verificationsWithData;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredVerifications = verificationsWithData.filter(verification => 
        verification.therapist.user.name?.toLowerCase().includes(searchLower) ||
        verification.therapist.user.email?.toLowerCase().includes(searchLower) ||
        verification.licenseNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Transform data to match frontend interface
    const applications = filteredVerifications.map(verification => ({
      id: verification.id,
      therapistId: verification.therapistId,
      name: verification.therapist.user.name || 'Unknown',
      email: verification.therapist.user.email || '',
      phone: verification.profile?.phone || '',
      dateOfBirth: verification.profile?.dateOfBirth?.toISOString() || '',
      address: {
        houseNumber: verification.profile?.houseNumber || '',
        streetName: verification.profile?.streetName || '',
        city: verification.profile?.city || ''
      },
      gender: verification.profile?.gender?.toLowerCase() || '',
      licenseNumber: verification.licenseNumber || '',
      primarySpecialty: verification.primarySpecialty || '',
      yearsOfExperience: verification.yearsOfExperience || '',
      highestEducation: verification.highestEducation || '',
      institution: verification.institution || '',
      adhdExperience: verification.adhdExperience || '',
      documents: {
        professionalLicense: verification.documents
          .filter(doc => doc.category === 'PROFESSIONAL_LICENSE')
          .map(doc => ({
            id: doc.id,
            name: doc.fileName,
            originalName: doc.originalName,
            url: `/api/therapist/verification/documents/${doc.id}/download`
          })),
        educationalCertificates: verification.documents
          .filter(doc => doc.category === 'EDUCATIONAL_CERTIFICATE')
          .map(doc => ({
            id: doc.id,
            name: doc.fileName,
            originalName: doc.originalName,
            url: `/api/therapist/verification/documents/${doc.id}/download`
          })),
        additionalCertifications: verification.documents
          .filter(doc => doc.category === 'ADDITIONAL_CERTIFICATION')
          .map(doc => ({
            id: doc.id,
            name: doc.fileName,
            originalName: doc.originalName,
            url: `/api/therapist/verification/documents/${doc.id}/download`
          }))
      },
      reference: verification.reference ? {
        firstName: verification.reference.firstName,
        lastName: verification.reference.lastName,
        professionalTitle: verification.reference.professionalTitle,
        phoneNumber: verification.reference.phoneNumber,
        email: verification.reference.email
      } : null,
      status: verification.status.toLowerCase() as 'pending' | 'approved' | 'rejected',
      submittedAt: verification.submittedAt?.toISOString() || '',
      reviewedAt: verification.reviewedAt?.toISOString(),
      reviewedBy: verification.reviewedBy,
      rejectionReason: verification.reviewNotes
    }));

    return NextResponse.json(applications);

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error fetching verification requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification requests" },
      { status: 500 }
    );
  }
}