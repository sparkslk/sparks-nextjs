import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Initiate a payment for a therapy session booking
 * Mobile API endpoint - uses JWT token authentication
 *
 * This endpoint creates a Payment record with booking details and returns
 * the details needed to initialize PayHere payment gateway.
 * The session is NOT created until payment is completed.
 *
 * Body (JSON):
 * - bookingDetails: { date, timeSlot, therapistId, sessionType }
 * - amount: Payment amount in LKR
 * - firstName: Customer first name
 * - lastName: Customer last name
 * - email: Customer email
 * - phone: Customer phone number
 * - address: Customer address (optional)
 * - city: Customer city (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyMobileToken(token);

    if (!payload || payload.role !== "NORMAL_USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      bookingDetails,
      amount,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
    } = await request.json();

    // Validate required fields
    if (!bookingDetails || !amount || !firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required payment information" },
        { status: 400 }
      );
    }

    const { date, timeSlot, therapistId, sessionType } = bookingDetails;

    if (!date || !timeSlot || !therapistId) {
      return NextResponse.json(
        { error: "Missing required booking details" },
        { status: 400 }
      );
    }

    // Get the patient
    const patient = await prisma.patient.findUnique({
      where: { userId: payload.userId },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Verify therapist exists
    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    // Parse the date and validate availability
    const inputDate = new Date(date);
    if (isNaN(inputDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Extract start time from slot
    const [timeSlotStart] = timeSlot.split("-");
    const cleanTimeSlot = timeSlotStart.trim();

    // Create target date for availability check
    const dateStr = `${inputDate.getFullYear()}-${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getDate().toString().padStart(2, '0')}`;
    const targetDate = new Date(dateStr + 'T00:00:00.000Z');
    const nextDay = new Date(dateStr + 'T00:00:00.000Z');
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    // Check if slot is available
    const availabilitySlot = await prisma.therapistAvailability.findFirst({
      where: {
        therapistId: therapistId,
        startTime: cleanTimeSlot,
        isBooked: false,
        date: {
          gte: targetDate,
          lt: nextDay
        }
      }
    });

    if (!availabilitySlot) {
      return NextResponse.json(
        { error: "This time slot is not available or has already been booked" },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Create payment record with booking details in metadata
    const payment = await prisma.payment.create({
      data: {
        orderId,
        sessionId: null, // No session yet - will be created after payment
        patientId: patient.id,
        amount: parseFloat(amount),
        currency: "LKR",
        status: "PENDING",
        metadata: {
          // Customer info
          firstName,
          lastName,
          email,
          phone,
          address: address || "",
          city: city || "",
          // Booking details to create session after payment
          bookingDetails: {
            date,
            timeSlot,
            therapistId,
            sessionType: sessionType || "Individual",
            availabilitySlotId: availabilitySlot.id,
          },
          initiatedAt: new Date().toISOString(),
        },
      },
    });

    // Format amount with 2 decimal places (required by PayHere)
    const formattedAmount = parseFloat(amount).toFixed(2);

    // Generate PayHere hash for security
    // Formula: MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase()).toUpperCase()
    // Use mobile-specific credentials for mobile app payments
    const merchantId = process.env.PAYHERE_MERCHANT_ID_MOBILE || "";
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET_MOBILE || "";

    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();

    const hash = crypto
      .createHash("md5")
      .update(
        merchantId +
        payment.orderId +
        formattedAmount +
        payment.currency +
        hashedSecret
      )
      .digest("hex")
      .toUpperCase();

    // Prepare payment details for PayHere
    // IMPORTANT: DO NOT send merchantSecret to mobile app!
    const paymentDetails = {
      orderId: payment.orderId,
      amount: formattedAmount,
      currency: payment.currency,
      merchantId: merchantId,
      hash: hash, // Security hash generated server-side
      returnUrl: `${process.env.BASE_URL}/api/payment/return`,
      cancelUrl: `${process.env.BASE_URL}/api/payment/cancel`,
      notifyUrl: `${process.env.BASE_URL}/api/payment/notify`,
      items: `Therapy Session Booking - ${therapist.user.name}`,
      customerFirstName: firstName,
      customerLastName: lastName,
      customerEmail: email,
      customerPhone: phone,
      customerAddress: address || "",
      customerCity: city || "",
    };

    console.log('DEBUG: Payment initiated for order:', payment.orderId);
    console.log('DEBUG: BASE_URL:', process.env.BASE_URL);
    console.log('DEBUG: Notify URL:', paymentDetails.notifyUrl);
    console.log('DEBUG: Merchant ID:', paymentDetails.merchantId);
    console.log('DEBUG: Amount:', paymentDetails.amount, paymentDetails.currency);
    console.log('DEBUG: Hash generated successfully');

    return NextResponse.json(paymentDetails);

  } catch (error) {
    console.error("Error initiating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
