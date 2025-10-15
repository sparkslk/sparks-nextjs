import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get payment status for parent user
 * Used to display payment summary after returning from PayHere
 *
 * Query params:
 * - orderId: The payment order ID
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate parent user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId parameter" }, { status: 400 }
      );
    }

    // Find the payment record with session details
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: {
        patient: {
          select: {
            id: true,
            parentGuardians: {
              select: {
                userId: true,
              },
            },
          },
        },
        TherapySession: {
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
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify the payment belongs to this parent
    const isParent = payment.patient?.parentGuardians.some(
      (pg) => pg.userId === session.user.id
    );

    if (!isParent) {
      return NextResponse.json(
        { error: "Unauthorized - payment does not belong to you" },
        { status: 403 }
      );
    }

    // Return payment status and details
    return NextResponse.json({
      orderId: payment.orderId,
      paymentId: payment.paymentId,
      amount: payment.amount.toString(),
      currency: payment.currency,
      status: payment.status,
      statusMessage: payment.statusMessage,
      paymentMethod: payment.paymentMethod,
      session: payment.TherapySession
        ? {
            id: payment.TherapySession.id,
            scheduledAt: payment.TherapySession.scheduledAt,
            duration: payment.TherapySession.duration,
            status: payment.TherapySession.status,
            therapist: {
              name: payment.TherapySession.therapist.user.name,
            },
          }
        : null,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
