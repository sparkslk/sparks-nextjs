import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";

/**
 * Toggle Receipt Sent Status
 * PATCH /api/admin/donations/[id]/receipt
 *
 * Toggles the receiptSent flag for a donation
 * If setting to true, also sets receiptSentAt timestamp
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require ADMIN role
    await requireApiAuth(req, ["ADMIN"]);

    const { id } = await params;

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

    // Toggle receiptSent status
    const newReceiptSent = !donation.receiptSent;

    // Update donation
    const updatedDonation = await prisma.donation.update({
      where: { id },
      data: {
        receiptSent: newReceiptSent,
        receiptSentAt: newReceiptSent ? new Date() : null,
        updatedAt: new Date(),
      },
    });

    console.log(`Receipt status toggled for donation ${id}:`, {
      receiptSent: newReceiptSent,
      receiptSentAt: updatedDonation.receiptSentAt,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDonation.id,
        receiptSent: updatedDonation.receiptSent,
        receiptSentAt: updatedDonation.receiptSentAt,
      },
    });
  } catch (error) {
    console.error("Error toggling receipt status:", error);

    // Check if error is from requireApiAuth
    if (error instanceof NextResponse) {
      return error;
    }

    return NextResponse.json(
      { error: "Failed to toggle receipt status" },
      { status: 500 }
    );
  }
}
