import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { calculateRefund, validateBankDetails } from "@/lib/refund-utils";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { sessionId, cancelReason, bankDetails } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Find the therapy session and verify the user has permission to cancel it
    const therapySession = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        patient: {
          parentGuardians: {
            some: {
              userId: user.id
            }
          }
        }
      },
      include: {
        patient: true,
        therapist: {
          include: {
            user: true
          }
        }
      }
    });

    if (!therapySession) {
      return NextResponse.json({ error: "Session not found or unauthorized" }, { status: 404 });
    }

    // Check if session is already cancelled or completed
    if (therapySession.status === "CANCELLED") {
      return NextResponse.json({ error: "Session is already cancelled" }, { status: 400 });
    }

    if (therapySession.status === "COMPLETED") {
      return NextResponse.json({ error: "Cannot cancel a completed session" }, { status: 400 });
    }

    // Calculate refund details
    const cancellationTime = new Date();
    const sessionTime = new Date(therapySession.scheduledAt);
    const originalAmount = Number(therapySession.bookedRate || 0);

    const refundCalculation = calculateRefund(sessionTime, originalAmount, cancellationTime);

    // If refund is due and bank details are provided, create refund request
    if (refundCalculation.canRefund && bankDetails) {
      const { bankAccountName, bankName, accountNumber, branchCode, swiftCode } = bankDetails;

      // Validate bank details
      const validation = validateBankDetails({
        bankAccountName,
        bankName,
        accountNumber,
        branchCode,
        swiftCode
      });

      if (!validation.isValid) {
        return NextResponse.json({
          error: "Invalid bank details: " + validation.errors.join(", ")
        }, { status: 400 });
      }

      // Create refund record
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).cancelRefund.create({
        data: {
          sessionId: sessionId,
          parentUserId: user.id,
          originalAmount: originalAmount,
          refundAmount: refundCalculation.refundAmount,
          refundPercentage: refundCalculation.refundPercentage,
          cancellationTime: cancellationTime,
          sessionTime: sessionTime,
          hoursBeforeSession: refundCalculation.hoursBeforeSession,
          cancelReason: cancelReason,
          bankAccountName: bankAccountName,
          bankName: bankName,
          accountNumber: accountNumber,
          branchCode: branchCode,
          swiftCode: swiftCode,
          refundStatus: "PENDING"
        }
      });
    }

    // Update the session status to CANCELLED and free up the therapist's availability slot
    const [updatedSession] = await prisma.$transaction(async (tx) => {
      // Update the session status to CANCELLED
      const session = await tx.therapySession.update({
        where: {
          id: sessionId
        },
        data: {
          status: "CANCELLED",
          updatedAt: new Date(),
          sessionNotes: cancelReason ? `Cancelled by parent. Reason: ${cancelReason}` : "Cancelled by parent"
        }
      });

      // Find and update the corresponding therapist availability slot to make it available again
      const sessionDate = new Date(therapySession.scheduledAt);

      // Extract time in HH:mm format from the session date
      // Use UTC methods to ensure consistent timezone handling
      const hours = sessionDate.getUTCHours().toString().padStart(2, '0');
      const minutes = sessionDate.getUTCMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      // Create date range for matching (same logic as booking)
      const year = sessionDate.getUTCFullYear();
      const month = (sessionDate.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = sessionDate.getUTCDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const targetDate = new Date(dateStr + 'T00:00:00.000Z');
      const nextDay = new Date(dateStr + 'T00:00:00.000Z');
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      const updateResult = await tx.therapistAvailability.updateMany({
        where: {
          therapistId: therapySession.therapistId,
          startTime: timeString,
          date: {
            gte: targetDate,
            lt: nextDay
          },
          isBooked: true
        },
        data: {
          isBooked: false
        }
      });

      console.log(`Availability update result for cancellation: updated ${updateResult.count} slots`);
      console.log(`Looking for therapistId: ${therapySession.therapistId}, startTime: ${timeString}, date between ${targetDate.toISOString()} and ${nextDay.toISOString()}`);

      // If no slots were updated, try to find what availability slots exist for debugging
      if (updateResult.count === 0) {
        const availableSlots = await tx.therapistAvailability.findMany({
          where: {
            therapistId: therapySession.therapistId,
            date: {
              gte: targetDate,
              lt: nextDay
            }
          }
        });
        console.log(`Available slots for therapist ${therapySession.therapistId} on ${dateStr}:`, availableSlots);

        // Try alternative time formats in case the original format doesn't match
        const alternativeTimeFormats = [
          sessionDate.toISOString().substr(11, 5), // Extract HH:mm from ISO string
          sessionDate.getHours().toString().padStart(2, '0') + ':' + sessionDate.getMinutes().toString().padStart(2, '0'), // Local time
        ];

        for (const altTime of alternativeTimeFormats) {
          if (altTime !== timeString) {
            const altUpdateResult = await tx.therapistAvailability.updateMany({
              where: {
                therapistId: therapySession.therapistId,
                startTime: altTime,
                date: {
                  gte: targetDate,
                  lt: nextDay
                },
                isBooked: true
              },
              data: {
                isBooked: false
              }
            });

            if (altUpdateResult.count > 0) {
              console.log(`Successfully updated availability using alternative time format ${altTime}: updated ${altUpdateResult.count} slots`);
              break;
            }
          }
        }
      }

      return [session];
    });

    // Create a notification for the therapist
    await prisma.notification.create({
      data: {
        receiverId: therapySession.therapist.userId,
        senderId: user.id,
        type: "APPOINTMENT",
        title: "Session Cancelled",
        message: `A therapy session scheduled for ${therapySession.scheduledAt.toLocaleDateString()} has been cancelled by the parent.${refundCalculation.canRefund ? ` Refund of Rs.${refundCalculation.refundAmount.toFixed(2)} (${refundCalculation.refundPercentage}%) has been requested.` : ''}`,
        isUrgent: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Session cancelled successfully",
      session: {
        id: updatedSession.id,
        status: updatedSession.status,
        updatedAt: updatedSession.updatedAt
      },
      refund: {
        originalAmount: refundCalculation.originalAmount,
        refundAmount: refundCalculation.refundAmount,
        refundPercentage: refundCalculation.refundPercentage,
        hoursBeforeSession: refundCalculation.hoursBeforeSession.toFixed(1),
        refundRequested: refundCalculation.canRefund && bankDetails ? true : false
      }
    });

  } catch (error) {
    console.error("Error cancelling session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}