import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

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
          include: { verification: true }
        });

        console.log("Dashboard redirect API: Found therapist:", {
          therapistId: therapist?.id,
          hasVerification: !!therapist?.verification,
          verificationStatus: therapist?.verification?.status,
          reviewNotes: therapist?.verification?.reviewNotes
        });

        if (therapist?.verification) {
          const status = therapist.verification.status;
          
          // If approved, check if they've seen the approval message
          if (status === 'APPROVED') {
            const reviewNotes = therapist.verification.reviewNotes;
            const hasSeenApproval = reviewNotes?.includes('APPROVAL_ACKNOWLEDGED');
            
            console.log("Dashboard redirect API: Approved therapist - hasSeenApproval:", hasSeenApproval);
            
            // If they haven't seen the approval message yet, show it
            if (!hasSeenApproval) {
              redirectUrl = "/therapist/verification/approved";
            } else {
              redirectUrl = "/therapist/dashboard";
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