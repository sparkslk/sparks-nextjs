import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";

/**
 * Refund a Donation
 * POST /api/admin/donations/[id]/refund
 *
 * Marks a COMPLETED donation as REFUNDED
 * Only COMPLETED donations can be refunded
 *
 * NOTE: This is a manual refund marker only - does not actually
 * process refund through PayHere API (out of scope).
 * Admin must manually process the refund through PayHere dashboard.
 *
 * Request body:
 * - reason?: string (optional reason for refund)
 * - notes?: string (optional admin notes)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require ADMIN role
    const session = await requireApiAuth(req, ["ADMIN"]);

    const { id } = await params;
    const body = await req.json();
    const { reason, notes } = body;

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

    // Only COMPLETED donations can be refunded
    if (donation.paymentStatus !== "COMPLETED") {
      return NextResponse.json(
        {
          error: `Cannot refund donation with status ${donation.paymentStatus}. Only COMPLETED donations can be refunded.`,
        },
        { status: 400 }
      );
    }

    // Update donation to REFUNDED
    const updatedDonation = await prisma.donation.update({
      where: { id },
      data: {
        paymentStatus: "REFUNDED",
        updatedAt: new Date(),
      },
    });

    console.log(`Donation ${id} marked as refunded by admin:`, {
      previousStatus: donation.paymentStatus,
      newStatus: "REFUNDED",
      amount: donation.amount.toString(),
      reason: reason || "No reason provided",
      notes: notes || "No notes",
      adminEmail: session.user?.email,
    });

    // Create notification for donor if they have a userId
    if (donation.userId) {
      try {
        await prisma.notification.create({
          data: {
            receiverId: donation.userId,
            type: "PAYMENT",
            title: "Donation Refunded",
            message: `Your donation of LKR ${donation.amount} has been refunded. ${
              reason ? `Reason: ${reason}` : ""
            }`,
            isRead: false,
          },
        });
      } catch (notifError) {
        console.error("Failed to create refund notification:", notifError);
        // Don't fail the refund if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Donation marked as refunded. Please process the actual refund through PayHere dashboard.",
      data: {
        id: updatedDonation.id,
        paymentStatus: updatedDonation.paymentStatus,
        amount: parseFloat(updatedDonation.amount.toString()),
      },
    });
  } catch (error) {
    console.error("Error refunding donation:", error);

    // Check if error is from requireApiAuth
    if (error instanceof NextResponse) {
      return error;
    }

    return NextResponse.json(
      { error: "Failed to refund donation" },
      { status: 500 }
    );
  }
}
