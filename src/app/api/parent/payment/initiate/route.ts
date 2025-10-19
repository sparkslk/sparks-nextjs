import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { createGoogleMeetEvent, generateSimpleMeetingLink } from "@/lib/google-meet";

/**
 * Initiate a payment for a therapy session booking (Parent Web Interface)
 *
 * This endpoint creates a Payment record with booking details and returns
 * the details needed to initialize PayHere payment gateway.
 * The session is NOT created until payment is completed.
 *
 * Body (JSON):
 * - childId: Patient ID
 * - date: Session date (YYYY-MM-DD)
 * - timeSlot: Time slot (e.g., "09:00-10:00")
 * - sessionType: Type of session (default: "Individual")
 * - amount: Payment amount in LKR
 * - customerInfo: { firstName, lastName, email, phone, address?, city? }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate parent user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      childId,
      date,
      timeSlot,
      sessionType = "Individual",
      amount,
      customerInfo,
    } = await request.json();

    // Validate required fields
    if (!childId || !date || !timeSlot || !amount || !customerInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, address, city } = customerInfo;

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required customer information" },
        { status: 400 }
      );
    }

    // Get the child and verify parent ownership
    const child = await prisma.patient.findFirst({
      where: {
        id: childId,
        parentGuardians: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        primaryTherapist: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!child || !child.primaryTherapist) {
      return NextResponse.json(
        { error: "Child not found or no therapist assigned" },
        { status: 404 }
      );
    }

    // Parse the date
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
        therapistId: child.primaryTherapistId!,
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

    // Parse time to create session datetime
    let sessionDate: Date;
    try {
      const [timeSlotStart] = timeSlot.split("-");
      const cleanTimeSlot = timeSlotStart.trim();

      let hours: number, minutes: number;
      const time24Match = cleanTimeSlot.match(/^(\d{1,2}):(\d{2})$/);
      if (time24Match) {
        hours = parseInt(time24Match[1]);
        minutes = parseInt(time24Match[2]);
      } else {
        const time12Match = cleanTimeSlot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (time12Match) {
          const h = parseInt(time12Match[1]);
          minutes = parseInt(time12Match[2]);
          const period = time12Match[3].toUpperCase();
          hours = period === "AM" ? (h === 12 ? 0 : h) : (h === 12 ? 12 : h + 12);
        } else {
          throw new Error(`Invalid time format: "${cleanTimeSlot}"`);
        }
      }

      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      sessionDate = new Date(`${dateStr}T${timeStr}.000Z`);
    } catch (error) {
      console.error("Failed to parse time:", error);
      return NextResponse.json(
        { error: "Invalid time format" },
        { status: 400 }
      );
    }

    // Get session rate
    const sessionRate = availabilitySlot.isFree ? 0 : (child.primaryTherapist.session_rate || 0);

    // Generate unique order ID
    const orderId = `PARENT_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Create payment record with session details to be created after successful payment
    const payment = await prisma.payment.create({
      data: {
        orderId,
        patientId: child.id,
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
            therapistId: child.primaryTherapistId,
            sessionType,
            availabilitySlotId: availabilitySlot.id,
            patientId: child.id,
            sessionDate: sessionDate.toISOString(), // Store computed session date
            sessionRate: sessionRate,
          },
          // Track who initiated the payment
          initiatedBy: {
            userId: session.user.id,
            userName: session.user.name,
            userEmail: session.user.email,
          },
          initiatedAt: new Date().toISOString(),
          paymentSource: "parent_web",
        },
      },
    });

    // Format amount with 2 decimal places (required by PayHere)
    const formattedAmount = parseFloat(amount).toFixed(2);

    // Generate PayHere hash for security
    // Formula: MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase()).toUpperCase()
    const merchantId = process.env.PAYHERE_MERCHANT_ID || "";
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "";

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
    // IMPORTANT: DO NOT send merchantSecret to frontend!
    // Note: Using localhost for return/cancel URLs to avoid ngrok interstitial
    // Webhooks (notify_url) still use BASE_URL for external access
    const paymentDetails = {
      orderId: payment.orderId,
      amount: formattedAmount,
      currency: payment.currency,
      merchantId: merchantId,
      hash: hash, // Security hash generated server-side
      returnUrl: `http://localhost:3000/api/payment/return`,
      cancelUrl: `http://localhost:3000/api/payment/cancel`,
      notifyUrl: `${process.env.BASE_URL}/api/payment/notify`,
      items: `Therapy Session - ${child.firstName} ${child.lastName} with Dr. ${child.primaryTherapist.user.name}`,
      customerFirstName: firstName,
      customerLastName: lastName,
      customerEmail: email,
      customerPhone: phone,
      customerAddress: address || "",
      customerCity: city || "",
    };

    console.log('DEBUG: Parent payment initiated for order:', payment.orderId);
    console.log('DEBUG: Child:', child.firstName, child.lastName);
    console.log('DEBUG: Therapist:', child.primaryTherapist.user.name);
    console.log('DEBUG: Date:', date, 'Time:', timeSlot);
    console.log('DEBUG: Amount:', paymentDetails.amount, paymentDetails.currency);
    console.log('DEBUG: Hash generated successfully');

    return NextResponse.json(paymentDetails);

  } catch (error) {
    console.error("Error initiating parent payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
