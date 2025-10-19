import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Donation Payment Initiation Handler
 * Creates a donation record and returns PayHere payment form fields
 *
 * This endpoint is publicly accessible (no auth required)
 *
 * Expected request body:
 * - amount: number (donation amount in LKR)
 * - donorName?: string (optional, can be anonymous)
 * - donorEmail?: string (optional)
 * - donorPhone?: string (optional)
 * - isAnonymous: boolean
 * - message?: string (optional message from donor)
 * - userId?: string (if logged in user is donating)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      donorName,
      donorEmail,
      donorPhone,
      isAnonymous = false,
      message,
      userId,
    } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid donation amount is required" },
        { status: 400 }
      );
    }

    // For non-anonymous donations, we should have at least name or email
    if (!isAnonymous && !donorName && !donorEmail) {
      return NextResponse.json(
        { error: "Donor name or email is required for non-anonymous donations" },
        { status: 400 }
      );
    }

    // Generate unique order ID for PayHere
    const timestamp = Date.now();
    const randomHex = crypto.randomBytes(4).toString("hex");
    const payHereOrderId = `DONATION_${timestamp}_${randomHex}`;

    // Get client IP address for fraud prevention
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Create donation record with PENDING status
    const donation = await prisma.donation.create({
      data: {
        id: crypto.randomBytes(16).toString("hex"),
        amount: amount,
        currency: "LKR",
        frequency: "ONE_TIME",
        paymentStatus: "PENDING",
        payHereOrderId: payHereOrderId,
        donorName: isAnonymous ? null : donorName,
        donorEmail: isAnonymous ? null : donorEmail,
        donorPhone: isAnonymous ? null : donorPhone,
        isAnonymous: isAnonymous,
        message: message || null,
        userId: userId || null,
        source: "WEB",
        ipAddress: ipAddress,
        receiptSent: false,
        updatedAt: new Date(),
      },
    });

    console.log("Donation record created:", {
      id: donation.id,
      orderId: payHereOrderId,
      amount: amount,
      isAnonymous: isAnonymous,
    });

    // Generate PayHere payment hash
    const merchantId = process.env.PAYHERE_MERCHANT_ID || "";
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "";
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";

    if (!merchantId || !merchantSecret) {
      console.error("PayHere credentials not configured");
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    // Format amount to 2 decimal places
    const formattedAmount = parseFloat(amount.toString()).toFixed(2);

    // Calculate MD5 hash for PayHere
    // Format: MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase()).toUpperCase()
    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();

    const hash = crypto
      .createHash("md5")
      .update(
        merchantId + payHereOrderId + formattedAmount + "LKR" + hashedSecret
      )
      .digest("hex")
      .toUpperCase();

    // Prepare PayHere payment details
    const paymentDetails = {
      merchant_id: merchantId,
      return_url: `${baseUrl}/donate/success`,
      cancel_url: `${baseUrl}/donate/cancel`,
      notify_url: `${baseUrl}/api/donation/notify`,
      order_id: payHereOrderId,
      items: "Donation to SPARKS Platform",
      currency: "LKR",
      amount: formattedAmount,
      first_name: isAnonymous ? "Anonymous" : (donorName?.split(" ")[0] || "Donor"),
      last_name: isAnonymous ? "Donor" : (donorName?.split(" ").slice(1).join(" ") || ""),
      email: isAnonymous ? "donor@sparks.lk" : (donorEmail || "donor@sparks.lk"),
      phone: isAnonymous ? "" : (donorPhone || ""),
      address: "",
      city: "Colombo",
      country: "Sri Lanka",
      hash: hash,
      // Custom fields to pass through PayHere (will be returned in notify)
      custom_1: donation.id, // Our internal donation ID
      custom_2: isAnonymous ? "anonymous" : "public",
    };

    console.log("PayHere payment details prepared:", {
      orderId: payHereOrderId,
      amount: formattedAmount,
      hash: hash.substring(0, 10) + "...",
    });

    return NextResponse.json({
      success: true,
      donationId: donation.id,
      paymentDetails: paymentDetails,
      // PayHere sandbox URL (use production URL in production)
      payhereUrl:
        process.env.NODE_ENV === "production"
          ? "https://www.payhere.lk/pay/checkout"
          : "https://sandbox.payhere.lk/pay/checkout",
    });
  } catch (error) {
    console.error("Error initiating donation:", error);
    return NextResponse.json(
      { error: "Failed to initiate donation" },
      { status: 500 }
    );
  }
}
