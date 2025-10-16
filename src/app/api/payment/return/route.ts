import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PayHere Payment Return Handler
 * This endpoint is called when a user returns from PayHere after payment
 *
 * Note: This is just for redirecting the user back to the application.
 * The actual payment verification and session creation happens in the
 * notify endpoint, which is called asynchronously by PayHere.
 *
 * Query params:
 * - order_id: The payment order ID
 * - payment_id: PayHere payment reference (optional, may not be present on failure)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('=== Payment Return Handler Called ===');
    console.log('Full URL:', request.url);

    const { searchParams, origin } = new URL(request.url);
    const order_id = searchParams.get("order_id");

    console.log('Order ID from params:', order_id);
    console.log('Origin:', origin);

    if (!order_id) {
      console.log('No order_id found, redirecting to error');
      // Redirect to dashboard with error if no order_id
      const redirectUrl = `${origin}/parent/dashboard?payment=error&message=Missing order ID`;
      console.log('Redirect URL:', redirectUrl);
      return NextResponse.redirect(redirectUrl);
    }

    // Find the payment record to check its status
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
      console.log('Payment not found for order:', order_id);
      const redirectUrl = `${origin}/parent/dashboard?payment=error&message=Payment not found`;
      console.log('Redirect URL:', redirectUrl);
      return NextResponse.redirect(redirectUrl);
    }

    console.log('Payment found - Order ID:', order_id, 'Status:', payment.status);

    // Redirect based on payment status
    let redirectUrl: string;

    if (payment.status === "COMPLETED") {
      // Payment successful - redirect to appointments page
      redirectUrl = `${origin}/parent/appointments?payment=success&orderId=${order_id}`;
    } else if (payment.status === "FAILED" || payment.status === "CANCELLED") {
      // Payment failed or was cancelled - redirect to dashboard with error
      redirectUrl = `${origin}/parent/dashboard?payment=failed&orderId=${order_id}`;
    } else {
      // Payment is still pending - redirect to appointments (session will appear when webhook completes)
      redirectUrl = `${origin}/parent/appointments?payment=pending&orderId=${order_id}`;
    }

    console.log('Redirecting to:', redirectUrl);
    console.log('=====================================');

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("Error in payment return handler:", error);
    const { origin } = new URL(request.url);
    const redirectUrl = `${origin}/parent/dashboard?payment=error&message=Internal server error`;
    console.log('Error redirect URL:', redirectUrl);
    return NextResponse.redirect(redirectUrl);
  }
}
