import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { createGoogleMeetEvent, generateSimpleMeetingLink } from "@/lib/google-meet";

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

    // If payment is completed, create therapy session and notifications
    if (paymentStatus === "COMPLETED") {
      // Check if booking details exist in metadata (for new bookings)
      const metadata = payment.metadata as Record<string, unknown>;
      const bookingDetails = metadata?.bookingDetails as {
        date: string;
        timeSlot: string;
        therapistId: string;
        sessionType: string;
        meetingType?: string;
        availabilitySlotId: string;
        patientId: string;
      } | undefined;

      // If we have booking details and no session created yet, create the session
      if (bookingDetails && !payment.TherapySession) {
        console.log("Creating therapy session from payment notification...");
        console.log("Booking details:", bookingDetails);

        try {
          // Parse the date and time
          const inputDate = new Date(bookingDetails.date);
          const [timeSlotStart] = bookingDetails.timeSlot.split("-");
          const cleanTimeSlot = timeSlotStart.trim();

          // Parse time
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

          // Create session datetime
          const dateStr = `${inputDate.getFullYear()}-${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getDate().toString().padStart(2, '0')}`;
          const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
          const sessionDate = new Date(`${dateStr}T${timeStr}.000Z`);

          // Get therapist info to determine session rate
          const therapist = await prisma.therapist.findUnique({
            where: { id: bookingDetails.therapistId },
            select: { session_rate: true },
          });

          // Get availability slot to check if it's free
          const availabilitySlot = await prisma.therapistAvailability.findUnique({
            where: { id: bookingDetails.availabilitySlotId },
            select: { isFree: true, isBooked: true },
          });

          const sessionRate = availabilitySlot?.isFree ? 0 : (therapist?.session_rate || 0);

          // Generate meeting link for online/hybrid sessions
          const meetingType = bookingDetails.meetingType || "IN_PERSON";
          let meetingLink: string | null = null;
          let calendarEventId: string | null = null;

          if (meetingType === "ONLINE" || meetingType === "HYBRID") {
            try {
              // Get therapist info for Google Meet creation
              const therapistWithUser = await prisma.therapist.findUnique({
                where: { id: bookingDetails.therapistId },
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              });

              // Get patient info
              const patient = await prisma.patient.findUnique({
                where: { id: bookingDetails.patientId },
                select: {
                  userId: true,
                  firstName: true,
                  lastName: true,
                },
              });

              // Get parent/user info
              const initiatedBy = (metadata?.initiatedBy as { userId?: string, userName?: string, userEmail?: string }) || {};
              const parentUser = initiatedBy.userId ? await prisma.user.findUnique({
                where: { id: initiatedBy.userId },
                select: { email: true, name: true },
              }) : null;

              // Get therapist's Google OAuth tokens
              if (therapistWithUser?.user?.id) {
                const therapistAccount = await prisma.account.findFirst({
                  where: {
                    userId: therapistWithUser.user.id,
                    provider: "google",
                  },
                  select: {
                    access_token: true,
                    refresh_token: true,
                  },
                });

                if (therapistAccount?.access_token && therapistAccount?.refresh_token) {
                  // Calculate session end time (45 minutes after start)
                  const sessionEnd = new Date(sessionDate);
                  sessionEnd.setMinutes(sessionEnd.getMinutes() + 45);

                  // Create Google Meet event
                  const meetingResponse = await createGoogleMeetEvent(
                    {
                      summary: `Therapy Session - ${patient?.firstName || ''} ${patient?.lastName || ''}`,
                      description: `Online therapy session\nSession Type: ${bookingDetails.sessionType}\nPatient: ${patient?.firstName} ${patient?.lastName}\nTherapist: ${therapistWithUser.user.name || 'Therapist'}\nParent: ${parentUser?.name || 'Guardian'}`,
                      startDateTime: sessionDate.toISOString(),
                      endDateTime: sessionEnd.toISOString(),
                      attendeeEmails: [
                        ...(parentUser?.email ? [parentUser.email] : []),
                        ...(therapistWithUser.user.email ? [therapistWithUser.user.email] : []),
                      ].filter(Boolean),
                      timezone: "Asia/Colombo",
                    },
                    therapistAccount.access_token,
                    therapistAccount.refresh_token,
                    therapistWithUser.user.id
                  );

                  meetingLink = meetingResponse.meetingLink;
                  calendarEventId = meetingResponse.eventId;

                  console.log(`✅ Google Meet event created for payment webhook: ${meetingResponse.meetingLink}`);
                } else {
                  // Fallback to simple meeting link if therapist hasn't connected Google account
                  meetingLink = generateSimpleMeetingLink(`${bookingDetails.patientId}-${Date.now()}`);
                  console.log(`⚠️ Using fallback meeting link (therapist not connected to Google)`);
                }
              }
            } catch (meetError) {
              // If Google Meet creation fails, fall back to simple meeting link
              console.error("Failed to create Google Meet event in payment webhook:", meetError);
              meetingLink = generateSimpleMeetingLink(`${bookingDetails.patientId}-${Date.now()}`);
              console.log(`⚠️ Using fallback meeting link (Google Meet creation failed)`);
            }
          }

          // Create session and mark availability slot as booked in a transaction
          await prisma.$transaction(async (tx) => {
            // Mark the availability slot as booked (only if not already booked)
            if (availabilitySlot && !availabilitySlot.isBooked) {
              await tx.therapistAvailability.update({
                where: { id: bookingDetails.availabilitySlotId },
                data: { isBooked: true },
              });
            }

            // Create therapy session
            const therapySession = await tx.therapySession.create({
              data: {
                patientId: bookingDetails.patientId,
                therapistId: bookingDetails.therapistId,
                scheduledAt: sessionDate,
                duration: 45,
                status: "SCHEDULED",
                type: bookingDetails.sessionType || "Individual",
                bookedRate: sessionRate,
                sessionType: meetingType as "IN_PERSON" | "ONLINE" | "HYBRID",
                meetingLink: meetingLink,
                calendarEventId: calendarEventId,
              },
            });

            // Link session to payment
            await tx.payment.update({
              where: { id: payment.id },
              data: { sessionId: therapySession.id },
            });

            console.log("Therapy session created successfully:", therapySession.id);
          });

          // Get the created session for notifications
          const updatedPayment = await prisma.payment.findUnique({
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

          // Create notifications if session was created successfully
          if (updatedPayment?.TherapySession) {
            const session = updatedPayment.TherapySession;
            const patientUserId = session.patient.userId;
            const initiatedBy = (metadata?.initiatedBy as { userId?: string }) || {};

            const notificationData = [];

            // Notification for patient (if they have a userId)
            if (patientUserId) {
              notificationData.push({
                receiverId: patientUserId,
                type: "PAYMENT" as const,
                title: "Payment Successful",
                message: `Your payment of LKR ${payhere_amount} for the therapy session has been confirmed.`,
                isRead: false,
              });
            }

            // Notification for parent (if different from patient)
            if (initiatedBy.userId && initiatedBy.userId !== patientUserId) {
              notificationData.push({
                receiverId: initiatedBy.userId,
                type: "APPOINTMENT" as const,
                title: "Booking Confirmed",
                message: `Session booking for ${session.patient.firstName} ${session.patient.lastName} on ${sessionDate.toLocaleDateString()} has been confirmed. Payment of LKR ${payhere_amount} received.`,
                isRead: false,
              });
            }

            // Notification for therapist
            notificationData.push({
              receiverId: session.therapist.user.id,
              type: "APPOINTMENT" as const,
              title: "New Session Booked",
              message: `New session booked with ${session.patient.firstName} ${session.patient.lastName} on ${sessionDate.toLocaleDateString()}. Payment of LKR ${payhere_amount} received.`,
              isRead: false,
            });

            await prisma.notification.createMany({
              data: notificationData,
            });

            console.log("Notifications created for completed booking");
          }

        } catch (sessionError) {
          console.error("Error creating therapy session:", sessionError);
          // Don't fail the payment notification - the payment is still successful
          // Admin can manually create the session or we can retry
        }

      } else if (payment.TherapySession) {
        // Session already exists (for reschedule fees, etc.), just send notifications
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
