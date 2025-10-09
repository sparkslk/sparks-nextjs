import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

interface TherapistWithRelations {
  id: string;
  userId: string;
  bio: string | null;
  session_rate: number | { toNumber(): number } | null;
  user?: {
    name?: string | null;
    email?: string | null;
  };
  profile?: {
    phone?: string | null;
    dateOfBirth?: Date | null;
    gender?: string | null;
    city?: string | null;
  } | null;
  verification?: {
    licenseNumber?: string | null;
    primarySpecialty?: string | null;
    yearsOfExperience?: string | null;
    highestEducation?: string | null;
    institution?: string | null;
  } | null;
}

// Helper function to check if therapist profile is complete
async function checkProfileCompletion(therapist: TherapistWithRelations): Promise<boolean> {
  // Get all verification data
  const verification = await prisma.therapistVerification.findUnique({
    where: { therapistId: therapist.id }
  });

  // Check required fields for profile completion
  const requiredFields = [
    // Basic info
    therapist.user?.name,
    therapist.user?.email,
    therapist.profile?.phone,
    therapist.profile?.dateOfBirth,
    therapist.profile?.gender,
    therapist.profile?.city,
    therapist.bio,
    // Professional info
    verification?.licenseNumber,
    verification?.primarySpecialty,
    verification?.yearsOfExperience,
    verification?.highestEducation,
    verification?.institution,
    // Business info
    therapist.session_rate !== null && (typeof therapist.session_rate === 'number' ? therapist.session_rate > 0 : therapist.session_rate.toNumber() > 0),
  ];

  // Check basic completion (profile image and bank details can be optional initially)
  const completedFields = requiredFields.filter(field => {
    if (typeof field === 'boolean') return field;
    return field && field.toString().trim() !== '';
  }).length;

  const completionPercentage = (completedFields / requiredFields.length) * 100;
  return completionPercentage >= 80; // Consider 80%+ as completed for basic requirements
}

/**
 * @swagger
 * /api/auth/dashboard-redirect:
 *   get:
 *     summary: Get dashboard redirect URL based on user role and verification status
 *     description: Returns the appropriate dashboard URL for the authenticated user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard URL retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 redirectUrl:
 *                   type: string
 *                   description: The URL to redirect the user to
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireApiAuth(req);
    const userRole = session.user.role;
    const userId = session.user.id;

    console.log("Dashboard redirect API: Got session data:", { userRole, userId });

    if (!userRole) {
      return NextResponse.json({ redirectUrl: "/confirm-role" });
    }

    let redirectUrl: string;

    switch (userRole) {
      case 'NORMAL_USER':
        redirectUrl = "/dashboard";
        break;
      case 'PARENT_GUARDIAN':
        redirectUrl = "/parent/dashboard";
        break;
      case 'THERAPIST':
        // Check therapist verification status
        console.log("Dashboard redirect API: Checking therapist verification for userId:", userId);
        
        const therapist = await prisma.therapist.findUnique({
          where: { userId },
          include: { 
            verification: true,
            profile: true
          }
        });

        console.log("Dashboard redirect API: Found therapist:", {
          therapistId: therapist?.id,
          hasVerification: !!therapist?.verification,
          verificationStatus: therapist?.verification?.status,
          reviewNotes: therapist?.verification?.reviewNotes,
          hasProfile: !!therapist?.profile
        });

        if (therapist?.verification) {
          const status = therapist.verification.status;
          
          // If approved, check if they've seen the approval message and completed profile
          if (status === 'APPROVED') {
            const reviewNotes = therapist.verification.reviewNotes;
            const hasSeenApproval = reviewNotes?.includes('APPROVAL_ACKNOWLEDGED');
            
            console.log("Dashboard redirect API: Approved therapist - hasSeenApproval:", hasSeenApproval);
            
            // If they haven't seen the approval message yet, show it
            if (!hasSeenApproval) {
              redirectUrl = "/therapist/verification/approved";
            } else {
              // Check if profile is completed
              const isProfileComplete = await checkProfileCompletion(therapist);
              console.log("Dashboard redirect API: Profile completion check:", isProfileComplete);
              
              if (!isProfileComplete) {
                redirectUrl = "/therapist/profile?complete=true";
              } else {
                redirectUrl = "/therapist/dashboard";
              }
            }
          } else if (status === 'PENDING') {
            console.log("Dashboard redirect API: Pending verification");
            redirectUrl = "/therapist/verification/success";
          } else if (status === 'REJECTED' || status === 'REQUIRES_RESUBMISSION') {
            console.log("Dashboard redirect API: Rejected or needs resubmission");
            redirectUrl = "/therapist/verification";
          } else {
            redirectUrl = "/therapist/dashboard";
          }
        } else {
          // No verification found, go to verification page
          console.log("Dashboard redirect API: No verification found");
          redirectUrl = "/therapist/verification";
        }
        break;
      case 'MANAGER':
        redirectUrl = "/manager/dashboard";
        break;
      case 'ADMIN':
        redirectUrl = "/admin/dashboard";
        break;
      default:
        redirectUrl = "/dashboard";
    }

    console.log("Dashboard redirect API: Returning redirectUrl:", redirectUrl);
    return NextResponse.json({ redirectUrl });

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Dashboard redirect API: Error:", error);
    return NextResponse.json(
      { error: "Failed to determine redirect URL" },
      { status: 500 }
    );
  }
}