import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileUpdateSchema = z.object({
  // Basic profile info
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(), 
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  houseNumber: z.string().optional(),
  streetName: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  
  // Bank details
  accountHolderName: z.string().optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  branchName: z.string().optional(),
  
  // Business info
  hourlyRate: z.string().optional(),
  
  // Profile completion status
  markProfileCompleted: z.boolean().optional()
});

/**
 * @swagger
 * /api/therapist/profile/complete:
 *   post:
 *     summary: Update therapist profile completion data
 *     description: Updates therapist profile with completion data including bank details and profile image
 *     tags:
 *       - Therapist Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               houseNumber:
 *                 type: string
 *               streetName:
 *                 type: string
 *               city:
 *                 type: string
 *               bio:
 *                 type: string
 *               accountHolderName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               bankName:
 *                 type: string
 *               branchName:
 *                 type: string
 *               hourlyRate:
 *                 type: string
 *               markProfileCompleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Therapist not found
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  return PUT(req); // Delegate to PUT handler
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireApiAuth(req, ['THERAPIST']);
    const body = await req.json();
    
    // Validate request data
    const validation = profileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const data = validation.data;

    // Get therapist
    const therapist = await prisma.therapist.findUnique({
      where: { userId: session.user.id },
      include: { 
        user: {
          select: {
            name: true,
            email: true
          }
        },
        profile: true,
        verification: {
          select: {
            status: true,
            licenseNumber: true,
            primarySpecialty: true,
            yearsOfExperience: true,
            highestEducation: true,
            institution: true,
            adhdExperience: true,
            reviewedAt: true
          }
        }
      }
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    // Prepare therapist updates
    const therapistUpdates: Record<string, unknown> = {};
    if (data.bio !== undefined) therapistUpdates.bio = data.bio;
    if (data.hourlyRate !== undefined) {
      const rate = parseFloat(data.hourlyRate);
      if (!isNaN(rate) && rate >= 0) {
        therapistUpdates.session_rate = rate;
      }
    }

    // Prepare profile updates
    const profileUpdates: Record<string, unknown> = {};
    if (data.phone !== undefined) profileUpdates.phone = data.phone;
    if (data.dateOfBirth !== undefined) {
      profileUpdates.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    }
    if (data.gender !== undefined) profileUpdates.gender = data.gender;
    if (data.houseNumber !== undefined) profileUpdates.houseNumber = data.houseNumber;
    if (data.streetName !== undefined) profileUpdates.streetName = data.streetName; 
    if (data.city !== undefined) profileUpdates.city = data.city;
    
    // Bank details
    if (data.accountHolderName !== undefined) profileUpdates.accountHolderName = data.accountHolderName;
    if (data.accountNumber !== undefined) profileUpdates.accountNumber = data.accountNumber;
    if (data.bankName !== undefined) profileUpdates.bankName = data.bankName;
    if (data.branchName !== undefined) profileUpdates.branchName = data.branchName;
    
    // Profile completion status
    if (data.markProfileCompleted !== undefined) {
      profileUpdates.profileCompleted = data.markProfileCompleted;
      if (data.markProfileCompleted) {
        profileUpdates.profileCompletedAt = new Date();
      }
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update therapist data
      if (Object.keys(therapistUpdates).length > 0) {
        await tx.therapist.update({
          where: { id: therapist.id },
          data: therapistUpdates
        });
      }

      // Update or create profile
      let updatedProfile;
      if (therapist.profile) {
        updatedProfile = await tx.therapistProfile.update({
          where: { id: therapist.profile.id },
          data: profileUpdates
        });
      } else {
        updatedProfile = await tx.therapistProfile.create({
          data: {
            therapistId: therapist.id,
            ...profileUpdates
          }
        });
      }

      return updatedProfile;
    });

    // Calculate completion percentage
    const requiredFields = [
      // Basic info
      therapist.user?.name,
      therapist.user?.email,
      data.phone || therapist.profile?.phone,
      data.dateOfBirth || therapist.profile?.dateOfBirth,
      data.gender || therapist.profile?.gender,
      data.city || therapist.profile?.city,
      data.bio || therapist.bio,
      // Professional info
      therapist.verification?.licenseNumber,
      therapist.verification?.primarySpecialty,
      therapist.verification?.yearsOfExperience,
      therapist.verification?.highestEducation,
      therapist.verification?.institution,
      // Business info
      data.hourlyRate !== undefined ? parseFloat(data.hourlyRate) >= 0 : therapist.session_rate !== null,
      data.accountHolderName || therapist.profile?.accountHolderName,
      data.accountNumber || therapist.profile?.accountNumber,
      data.bankName || therapist.profile?.bankName,
      data.branchName || therapist.profile?.branchName,
    ];

    const completedFields = requiredFields.filter(field => {
      if (typeof field === 'boolean') return field;
      return field && field.toString().trim() !== '';
    }).length;

    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

    return NextResponse.json({
      message: "Profile updated successfully",
      profileId: result.id,
      completedAt: result.profileCompletedAt?.toISOString() || null,
      completionPercentage
    });

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error updating therapist profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}