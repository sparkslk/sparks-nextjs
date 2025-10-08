import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { verificationSubmissionSchema } from "@/lib/validation/therapist-verification";
import { Gender } from "@prisma/client";

/**
 * @swagger
 * /api/therapist/verification:
 *   get:
 *     summary: Get therapist verification status
 *     description: Retrieves the authenticated therapist's verification status and submitted data
 *     tags:
 *       - Therapist Verification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [PENDING, UNDER_REVIEW, APPROVED, REJECTED, REQUIRES_RESUBMISSION]
 *                 profile:
 *                   type: object
 *                   description: Personal profile information
 *                 verification:
 *                   type: object
 *                   description: Professional verification data
 *                 documents:
 *                   type: array
 *                   description: Uploaded documents
 *                 reference:
 *                   type: object
 *                   description: Professional reference information
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

    // Get verification data
    const [profile, verification, documents, reference] = await Promise.all([
      prisma.therapistProfile.findUnique({
        where: { therapistId: therapist.id }
      }),
      prisma.therapistVerification.findUnique({
        where: { therapistId: therapist.id }
      }),
      prisma.therapistDocument.findMany({
        where: { therapistId: therapist.id },
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
        where: { therapistId: therapist.id }
      })
    ]);

    return NextResponse.json({
      status: verification?.status || 'PENDING',
      profile,
      verification,
      documents,
      reference,
      submittedAt: verification?.submittedAt,
      reviewedAt: verification?.reviewedAt,
      reviewNotes: verification?.reviewNotes
    });

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error fetching verification status:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification status" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/therapist/verification:
 *   post:
 *     summary: Submit therapist verification data
 *     description: Submits verification information including personal details, professional info, and references
 *     tags:
 *       - Therapist Verification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personalInfo
 *               - professionalInfo
 *               - referenceInfo
 *               - agreements
 *             properties:
 *               personalInfo:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   houseNumber:
 *                     type: string
 *                   streetName:
 *                     type: string
 *                   city:
 *                     type: string
 *                   gender:
 *                     type: string
 *                     enum: [MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY]
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *               professionalInfo:
 *                 type: object
 *                 properties:
 *                   licenseNumber:
 *                     type: string
 *                   primarySpecialty:
 *                     type: string
 *                   yearsOfExperience:
 *                     type: string
 *                   highestEducation:
 *                     type: string
 *                   institution:
 *                     type: string
 *                   adhdExperience:
 *                     type: string
 *               referenceInfo:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   professionalTitle:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   email:
 *                     type: string
 *               agreements:
 *                 type: object
 *                 properties:
 *                   backgroundCheck:
 *                     type: boolean
 *                   termsAndPrivacy:
 *                     type: boolean
 *                   accurateInfo:
 *                     type: boolean
 *     responses:
 *       201:
 *         description: Verification submitted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Therapist not found
 *       409:
 *         description: Verification already submitted
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireApiAuth(req, ['THERAPIST']);
    const body = await req.json();

    // Validate the request data
    const validationResult = verificationSubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { personalInfo, professionalInfo, referenceInfo, agreements } = validationResult.data;

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

    // Check if verification already exists
    const existingVerification = await prisma.therapistVerification.findUnique({
      where: { therapistId: therapist.id }
    });

    if (existingVerification && existingVerification.status !== 'REQUIRES_RESUBMISSION') {
      return NextResponse.json(
        { error: "Verification already submitted" },
        { status: 409 }
      );
    }

    // Start transaction to create all records
    const result = await prisma.$transaction(async (tx) => {
      // Create or update therapist profile
      const profile = await tx.therapistProfile.upsert({
        where: { therapistId: therapist.id },
        create: {
          therapistId: therapist.id,
          phone: personalInfo.phone,
          houseNumber: personalInfo.houseNumber,
          streetName: personalInfo.streetName,
          city: personalInfo.city,
          gender: personalInfo.gender as Gender,
          dateOfBirth: new Date(personalInfo.dateOfBirth)
        },
        update: {
          phone: personalInfo.phone,
          houseNumber: personalInfo.houseNumber,
          streetName: personalInfo.streetName,
          city: personalInfo.city,
          gender: personalInfo.gender as Gender,
          dateOfBirth: new Date(personalInfo.dateOfBirth)
        }
      });

      // Create or update verification record
      const verification = await tx.therapistVerification.upsert({
        where: { therapistId: therapist.id },
        create: {
          therapistId: therapist.id,
          status: 'PENDING',
          licenseNumber: professionalInfo.licenseNumber,
          primarySpecialty: professionalInfo.primarySpecialty,
          yearsOfExperience: professionalInfo.yearsOfExperience,
          highestEducation: professionalInfo.highestEducation,
          institution: professionalInfo.institution,
          adhdExperience: professionalInfo.adhdExperience,
          backgroundCheckConsent: agreements.backgroundCheck,
          termsAccepted: agreements.termsAndPrivacy,
          accurateInfoCertified: agreements.accurateInfo,
          submittedAt: new Date()
        },
        update: {
          status: 'PENDING',
          licenseNumber: professionalInfo.licenseNumber,
          primarySpecialty: professionalInfo.primarySpecialty,
          yearsOfExperience: professionalInfo.yearsOfExperience,
          highestEducation: professionalInfo.highestEducation,
          institution: professionalInfo.institution,
          adhdExperience: professionalInfo.adhdExperience,
          backgroundCheckConsent: agreements.backgroundCheck,
          termsAccepted: agreements.termsAndPrivacy,
          accurateInfoCertified: agreements.accurateInfo,
          submittedAt: new Date(),
          reviewedAt: null,
          reviewedBy: null,
          reviewNotes: null
        }
      });

      // Create or update reference
      const reference = await tx.therapistReference.upsert({
        where: { therapistId: therapist.id },
        create: {
          therapistId: therapist.id,
          firstName: referenceInfo.firstName,
          lastName: referenceInfo.lastName,
          professionalTitle: referenceInfo.professionalTitle,
          phoneNumber: referenceInfo.phoneNumber,
          email: referenceInfo.email
        },
        update: {
          firstName: referenceInfo.firstName,
          lastName: referenceInfo.lastName,
          professionalTitle: referenceInfo.professionalTitle,
          phoneNumber: referenceInfo.phoneNumber,
          email: referenceInfo.email,
          verificationStatus: 'PENDING',
          contactedAt: null,
          verificationNotes: null
        }
      });

      return { profile, verification, reference };
    });

    return NextResponse.json(
      { 
        message: "Verification submitted successfully",
        status: result.verification.status,
        submittedAt: result.verification.submittedAt
      },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error submitting verification:", error);
    return NextResponse.json(
      { error: "Failed to submit verification" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/therapist/verification:
 *   put:
 *     summary: Update therapist verification data
 *     description: Updates existing verification information (only allowed if status is REQUIRES_RESUBMISSION)
 *     tags:
 *       - Therapist Verification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerificationSubmission'
 *     responses:
 *       200:
 *         description: Verification updated successfully
 *       400:
 *         description: Invalid request data or verification cannot be updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Therapist or verification not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await requireApiAuth(req, ['THERAPIST']);
    const body = await req.json();

    // Validate the request data
    const validationResult = verificationSubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

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

    // Check if verification exists and can be updated
    const existingVerification = await prisma.therapistVerification.findUnique({
      where: { therapistId: therapist.id }
    });

    if (!existingVerification) {
      return NextResponse.json(
        { error: "No verification found to update" },
        { status: 404 }
      );
    }

    if (existingVerification.status !== 'REQUIRES_RESUBMISSION') {
      return NextResponse.json(
        { error: "Verification cannot be updated in current status" },
        { status: 400 }
      );
    }

    const { personalInfo, professionalInfo, referenceInfo, agreements } = validationResult.data;

    // Update verification data using the same logic as POST
    const result = await prisma.$transaction(async (tx) => {
      // Update profile
      const profile = await tx.therapistProfile.update({
        where: { therapistId: therapist.id },
        data: {
          phone: personalInfo.phone,
          houseNumber: personalInfo.houseNumber,
          streetName: personalInfo.streetName,
          city: personalInfo.city,
          gender: personalInfo.gender as Gender,
          dateOfBirth: new Date(personalInfo.dateOfBirth)
        }
      });

      // Update verification
      const verification = await tx.therapistVerification.update({
        where: { therapistId: therapist.id },
        data: {
          status: 'PENDING',
          licenseNumber: professionalInfo.licenseNumber,
          primarySpecialty: professionalInfo.primarySpecialty,
          yearsOfExperience: professionalInfo.yearsOfExperience,
          highestEducation: professionalInfo.highestEducation,
          institution: professionalInfo.institution,
          adhdExperience: professionalInfo.adhdExperience,
          backgroundCheckConsent: agreements.backgroundCheck,
          termsAccepted: agreements.termsAndPrivacy,
          accurateInfoCertified: agreements.accurateInfo,
          submittedAt: new Date(),
          reviewedAt: null,
          reviewedBy: null,
          reviewNotes: null
        }
      });

      // Update reference
      const reference = await tx.therapistReference.update({
        where: { therapistId: therapist.id },
        data: {
          firstName: referenceInfo.firstName,
          lastName: referenceInfo.lastName,
          professionalTitle: referenceInfo.professionalTitle,
          phoneNumber: referenceInfo.phoneNumber,
          email: referenceInfo.email,
          verificationStatus: 'PENDING',
          contactedAt: null,
          verificationNotes: null
        }
      });

      return { profile, verification, reference };
    });

    return NextResponse.json({
      message: "Verification updated successfully",
      status: result.verification.status,
      submittedAt: result.verification.submittedAt
    });

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error updating verification:", error);
    return NextResponse.json(
      { error: "Failed to update verification" },
      { status: 500 }
    );
  }
}