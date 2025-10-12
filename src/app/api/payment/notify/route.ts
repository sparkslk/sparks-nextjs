import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * PayHere Payment Notification Handler
 * This endpoint receives payment notifications from PayHere
 *
 * PayHere sends POST requests with form data when payment status changes
 * We verify the MD5 signature and update payment status accordingly
 *
 * Expected form fields from PayHere:
 * - merchant_id: PayHere merchant ID
 * - order_id: Our generated order ID
 * - payhere_amount: Payment amount
 * - payhere_currency: Currency (LKR)
 * - status_code: Payment status code (2 = success, 0 = pending, -1, -2, -3 = failed)
 * - md5sig: MD5 signature for verification
 * - payment_id: PayHere payment reference
 * - status_message: Human-readable status message
 * - method: Payment method used
 * - card_holder_name: Cardholder name (if card payment)
 * - card_no: Masked card number (if card payment)
 * - card_expiry: Card expiry (if card payment)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data from PayHere
    const formData = await request.formData();

    const merchant_id = formData.get("merchant_id")?.toString() || "";
    const order_id = formData.get("order_id")?.toString() || "";
    const payhere_amount = formData.get("payhere_amount")?.toString() || "";
    const payhere_currency = formData.get("payhere_currency")?.toString() || "";
    const status_code = formData.get("status_code")?.toString() || "";
    const md5sig = formData.get("md5sig")?.toString() || "";
    const payment_id = formData.get("payment_id")?.toString() || "";
    const status_message = formData.get("status_message")?.toString() || "";
    const method = formData.get("method")?.toString() || "";
    const card_holder_name = formData.get("card_holder_name")?.toString() || null;
    const card_no = formData.get("card_no")?.toString() || null;
    const card_expiry = formData.get("card_expiry")?.toString() || null;

    console.log("PayHere notification received:", {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      payment_id,
      status_message,
      method,
    });

    // Validate required fields
    if (!merchant_id || !order_id || !payhere_amount || !status_code || !md5sig) {
      console.error("Missing required fields in PayHere notification");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify merchant ID
    if (merchant_id !== process.env.PAYHERE_MERCHANT_ID) {
      console.error("Invalid merchant ID:", merchant_id);
      return NextResponse.json({ error: "Invalid merchant ID" }, { status: 400 });
    }

    // Verify MD5 signature
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET || "";
    const local_md5sig = crypto
      .createHash("md5")
      .update(
        merchant_id +
        order_id +
        payhere_amount +
        payhere_currency +
        status_code +
        crypto.createHash("md5").update(merchant_secret).digest("hex").toUpperCase()
      )
      .digest("hex")
      .toUpperCase();

    if (local_md5sig !== md5sig.toUpperCase()) {
      console.error("MD5 signature verification failed");
      console.error("Expected:", local_md5sig);
      console.error("Received:", md5sig);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("MD5 signature verified successfully");

    // Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { orderId: order_id },
      include: {
        TherapySession: {
          include: {
            patient: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
              },
            },
            therapist: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      console.error("Payment not found for order ID:", order_id);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Map PayHere status code to our PaymentStatus enum
    let paymentStatus: string;
    switch (status_code) {
      case "2": // Success
        paymentStatus = "COMPLETED";
        break;
      case "0": // Pending
        paymentStatus = "PENDING";
        break;
      case "-1": // Canceled
        paymentStatus = "CANCELLED";
        break;
      case "-2": // Failed
        paymentStatus = "FAILED";
        break;
      case "-3": // Chargedback
        paymentStatus = "CHARGEDBACK";
        break;
      default:
        paymentStatus = "UNKNOWN";
    }

    // Update payment record
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentId: payment_id,
        status: paymentStatus as "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "CHARGEDBACK" | "UNKNOWN",
        paymentMethod: method,
        statusMessage: status_message,
        payhereStatusCode: status_code,
        cardHolderName: card_holder_name,
        maskedCardNumber: card_no,
        cardExpiry: card_expiry,
        metadata: {
          ...(payment.metadata as Record<string, unknown>),
          notificationReceivedAt: new Date().toISOString(),
          payhereResponse: {
            merchant_id,
            payment_id,
            status_code,
            status_message,
            method,
          },
        },
        updatedAt: new Date(),
      },
    });

    console.log("Payment updated successfully:", {
      orderId: order_id,
      status: paymentStatus,
      paymentId: payment_id,
    });

    // If payment is completed, create notifications
    if (paymentStatus === "COMPLETED" && payment.TherapySession) {
      const session = payment.TherapySession;
      const patientUserId = session.patient.userId;

      // Only create notifications if patient has a userId
      if (patientUserId) {
        await prisma.notification.createMany({
          data: [
            // Notification for patient
            {
              receiverId: patientUserId,
              type: "PAYMENT",
              title: "Payment Successful",
              message: `Your payment of LKR ${payhere_amount} for the therapy session has been confirmed.`,
              isRead: false,
            },
            // Notification for therapist
            {
              receiverId: session.therapist.user.id,
              type: "PAYMENT",
              title: "Payment Received",
              message: `Payment of LKR ${payhere_amount} received for session with ${session.patient.firstName} ${session.patient.lastName}.`,
              isRead: false,
            },
          ],
        });

        console.log("Notifications created for completed payment");
      }
    }

    return NextResponse.json({ status: "success" });

  } catch (error) {
    console.error("Error processing PayHere notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
