import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PayHere Payment Cancellation Handler
 * This endpoint is called when a user cancels the payment on PayHere
 *
 * Query params:
 * - order_id: The payment order ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get("order_id");

    if (!order_id) {
      // Redirect to dashboard with error if no order_id
      return NextResponse.redirect(
        new URL('/parent/dashboard?payment=error&message=Missing order ID', request.url)
      );
    }

    console.log('Payment cancelled by user - Order ID:', order_id);

    // Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { orderId: order_id },
      select: {
        id: true,
        orderId: true,
        status: true,
        metadata: true,
      },
    });

    if (!payment) {
      return NextResponse.redirect(
        new URL('/parent/dashboard?payment=error&message=Payment not found', request.url)
      );
    }

    // Update payment status to CANCELLED if it's still PENDING
    if (payment.status === "PENDING") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "CANCELLED",
          statusMessage: "Payment cancelled by user",
          metadata: {
            ...(payment as { metadata: Record<string, unknown> }).metadata,
            cancelledAt: new Date().toISOString(),
            cancelReason: "User cancelled payment on PayHere",
          },
          updatedAt: new Date(),
        },
      });

      console.log('Payment status updated to CANCELLED:', order_id);
    }

    // Redirect to dashboard with cancelled status
    const { origin } = new URL(request.url);
    return NextResponse.redirect(
      `${origin}/parent/dashboard?payment=cancelled&orderId=${order_id}`
    );

  } catch (error) {
    console.error("Error in payment cancel handler:", error);
    return NextResponse.redirect(
      new URL('/parent/dashboard?payment=error&message=Error processing cancellation', request.url)
    );
  }
}
