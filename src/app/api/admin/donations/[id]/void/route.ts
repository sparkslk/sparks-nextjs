import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";

/**
 * Void a Donation
 * POST /api/admin/donations/[id]/void
 *
 * Voids a PENDING donation by marking it as CANCELLED
 * Only PENDING donations can be voided
 *
 * Request body:
 * - reason?: string (optional reason for voiding)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require ADMIN role
    const session = await requireApiAuth(req, ["ADMIN"]);

    const { id } = params;
    const body = await req.json();
    const { reason } = body;

    // Find the donation
    const donation = await prisma.donation.findUnique({
      where: { id },
    });

    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    // Only PENDING donations can be voided
    if (donation.paymentStatus !== "PENDING") {
      return NextResponse.json(
        {
          error: `Cannot void donation with status ${donation.paymentStatus}. Only PENDING donations can be voided.`,
        },
        { status: 400 }
      );
    }

    // Update donation to CANCELLED
    const updatedDonation = await prisma.donation.update({
      where: { id },
      data: {
        paymentStatus: "CANCELLED",
        updatedAt: new Date(),
      },
    });

    console.log(`Donation ${id} voided by admin:`, {
      previousStatus: donation.paymentStatus,
      newStatus: "CANCELLED",
      reason: reason || "No reason provided",
      adminEmail: session.user?.email,
    });

    return NextResponse.json({
      success: true,
      message: "Donation voided successfully",
      data: {
        id: updatedDonation.id,
        paymentStatus: updatedDonation.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Error voiding donation:", error);

    // Check if error is from requireApiAuth
    if (error instanceof NextResponse) {
      return error;
    }

    return NextResponse.json(
      { error: "Failed to void donation" },
      { status: 500 }
    );
  }
}
