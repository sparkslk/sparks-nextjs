import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";

/**
 * Manually mark a donation as COMPLETED (accepted)
 * POST /api/admin/donations/[id]/complete
 *
 * Only PENDING or PROCESSING donations can be marked as COMPLETED.
 *
 * Request body (optional):
 * - paymentId?: string
 * - statusMessage?: string (stored in payHereStatusCode)
 * - method?: string
 * - notes?: string (ignored here but useful for audit logs)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Require ADMIN role
        const session = await requireApiAuth(req, ["ADMIN"]);

        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const { paymentId, statusMessage, method } = body ?? {};

        // Find the donation
        const donation = await prisma.donation.findUnique({ where: { id } });
        if (!donation) {
            return NextResponse.json({ error: "Donation not found" }, { status: 404 });
        }

        // Only allow if currently PENDING or PROCESSING
        if (["COMPLETED", "REFUNDED", "CANCELLED"].includes(donation.paymentStatus)) {
            return NextResponse.json(
                {
                    error: `Cannot complete a donation with status ${donation.paymentStatus}. Only PENDING or PROCESSING can be completed.`,
                },
                { status: 400 }
            );
        }

        const updated = await prisma.donation.update({
            where: { id },
            data: {
                paymentStatus: "COMPLETED",
                payHerePaymentId: paymentId ?? donation.payHerePaymentId,
                payHereStatusCode: statusMessage ?? donation.payHereStatusCode,
                paymentMethod: method ?? donation.paymentMethod,
                updatedAt: new Date(),
            },
        });

        // Optional: notify donor if they have a userId
        if (updated.userId) {
            try {
                await prisma.notification.create({
                    data: {
                        receiverId: updated.userId,
                        type: "PAYMENT",
                        title: "Donation Confirmed",
                        message: `Your donation of LKR ${updated.amount.toString()} has been confirmed. Thank you!`,
                        isRead: false,
                    },
                });
            } catch (e) {
                console.error("Failed to create donation completion notification", e);
            }
        }

        console.log("Donation marked COMPLETED by admin", {
            id,
            adminEmail: session.user?.email,
        });

        return NextResponse.json({
            success: true,
            data: {
                id: updated.id,
                paymentStatus: updated.paymentStatus,
                amount: parseFloat(updated.amount.toString()),
            },
        });
    } catch (error) {
        console.error("Error completing donation:", error);
        if (error instanceof NextResponse) return error;
        return NextResponse.json({ error: "Failed to complete donation" }, { status: 500 });
    }
}


