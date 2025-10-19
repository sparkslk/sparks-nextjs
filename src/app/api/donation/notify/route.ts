import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * PayHere Donation Payment Notification Handler
 * This endpoint receives payment notifications from PayHere for donations
 *
 * PayHere sends POST requests with form data when payment status changes
 * We verify the MD5 signature and update donation status accordingly
 *
 * Expected form fields from PayHere:
 * - merchant_id: PayHere merchant ID
 * - order_id: Our generated donation order ID
 * - payhere_amount: Payment amount
 * - payhere_currency: Currency (LKR)
 * - status_code: Payment status code (2 = success, 0 = pending, -1, -2, -3 = failed)
 * - md5sig: MD5 signature for verification
 * - payment_id: PayHere payment reference
 * - status_message: Human-readable status message
 * - method: Payment method used
 * - custom_1: Our internal donation ID
 * - custom_2: Donation type (anonymous/public)
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
    const custom_1 = formData.get("custom_1")?.toString() || ""; // Our donation ID
    const custom_2 = formData.get("custom_2")?.toString() || ""; // anonymous/public

    console.log("PayHere donation notification received:", {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      payment_id,
      status_message,
      method,
      custom_1,
      custom_2,
    });

    // Validate required fields
    if (!merchant_id || !order_id || !payhere_amount || !status_code || !md5sig) {
      console.error("Missing required fields in PayHere donation notification");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify merchant ID
    if (merchant_id !== process.env.PAYHERE_MERCHANT_ID) {
      console.error("Invalid merchant ID:", merchant_id);
      return NextResponse.json(
        { error: "Invalid merchant ID" },
        { status: 400 }
      );
    }

    // Verify MD5 signature
    // Format: MD5(merchant_id + order_id + amount + currency + status_code + MD5(merchant_secret).toUpperCase()).toUpperCase()
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
      console.error("MD5 signature verification failed for donation");
      console.error("Expected:", local_md5sig);
      console.error("Received:", md5sig);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log("MD5 signature verified successfully for donation");

    // Find the donation record
    const donation = await prisma.donation.findUnique({
      where: { payHereOrderId: order_id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!donation) {
      console.error("Donation not found for order ID:", order_id);
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    // Map PayHere status code to our DonationPaymentStatus enum
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
        paymentStatus = "FAILED"; // We don't have CHARGEDBACK status for donations, use FAILED
        break;
      default:
        paymentStatus = "FAILED";
    }

    // Update donation record
    const updatedDonation = await prisma.donation.update({
      where: { id: donation.id },
      data: {
        payHerePaymentId: payment_id,
        paymentStatus: paymentStatus as
          | "PENDING"
          | "PROCESSING"
          | "COMPLETED"
          | "FAILED"
          | "REFUNDED"
          | "CANCELLED",
        paymentMethod: method,
        payHereStatusCode: status_code,
        updatedAt: new Date(),
      },
    });

    console.log("Donation updated successfully:", {
      orderId: order_id,
      status: paymentStatus,
      paymentId: payment_id,
    });

    // If payment is completed, create notifications
    if (paymentStatus === "COMPLETED") {
      const notificationData = [];

      // Notification for donor (if they have a userId and not anonymous)
      if (donation.userId && !donation.isAnonymous) {
        notificationData.push({
          receiverId: donation.userId,
          type: "PAYMENT" as const,
          title: "Donation Successful",
          message: `Thank you for your generous donation of LKR ${payhere_amount}. Your support makes a difference!`,
          isRead: false,
        });
      }

      // Notification for admin (system notification)
      // Get any admin user to send notification
      const adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      if (adminUser) {
        const donorDisplay = donation.isAnonymous
          ? "Anonymous"
          : donation.donorName || donation.donorEmail || "A donor";

        notificationData.push({
          receiverId: adminUser.id,
          type: "PAYMENT" as const,
          title: "New Donation Received",
          message: `${donorDisplay} donated LKR ${payhere_amount}. ${
            donation.message ? `Message: "${donation.message}"` : ""
          }`,
          isRead: false,
        });
      }

      if (notificationData.length > 0) {
        await prisma.notification.createMany({
          data: notificationData,
        });

        console.log("Donation notifications created");
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error processing PayHere donation notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
