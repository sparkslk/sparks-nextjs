import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Initiate a payment for reschedule fee
 * Mobile API endpoint - uses JWT token authentication
 *
 * This endpoint creates a Payment record for a reschedule fee
 * and returns the details needed to initialize PayHere payment gateway.
 *
 * Body (JSON):
 * - sessionId: ID of the session being rescheduled
 * - amount: Reschedule fee amount in LKR
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
      sessionId,
      amount,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
    } = await request.json();

    // Validate required fields
    if (!sessionId || !amount || !firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required payment information" },
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

    // Verify session exists and belongs to patient
    const session = await prisma.therapySession.findUnique({
      where: { id: sessionId },
      include: {
        therapist: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.patientId !== patient.id) {
      return NextResponse.json(
        { error: "Session does not belong to this patient" },
        { status: 403 }
      );
    }

    // Generate unique order ID
    const orderId = `RESCHEDULE_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Create payment record for reschedule fee
    const payment = await prisma.payment.create({
      data: {
        orderId,
        sessionId: sessionId,
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
          // Reschedule fee metadata
          paymentType: "reschedule_fee",
          sessionId,
          therapistName: session.therapist.user.name,
          initiatedAt: new Date().toISOString(),
        },
      },
    });

    // Prepare payment details for PayHere
    const paymentDetails = {
      orderId: payment.orderId,
      amount: payment.amount.toString(),
      currency: payment.currency,
      merchantId: process.env.PAYHERE_MERCHANT_ID || "",
      merchantSecret: process.env.PAYHERE_MERCHANT_SECRET || "",
      returnUrl: `${process.env.BASE_URL}/api/payment/return`,
      cancelUrl: `${process.env.BASE_URL}/api/payment/cancel`,
      notifyUrl: `${process.env.BASE_URL}/api/payment/notify`,
      items: `Reschedule Fee - Session with ${session.therapist.user.name}`,
      customerFirstName: firstName,
      customerLastName: lastName,
      customerEmail: email,
      customerPhone: phone,
      customerAddress: address || "",
      customerCity: city || "",
    };

    console.log('DEBUG: Reschedule fee payment initiated for order:', payment.orderId);
    console.log('DEBUG: Session ID:', sessionId);
    console.log('DEBUG: Amount:', paymentDetails.amount, paymentDetails.currency);

    return NextResponse.json(paymentDetails);

  } catch (error) {
    console.error("Error initiating reschedule fee payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
