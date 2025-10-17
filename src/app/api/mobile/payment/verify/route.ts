import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

/**
 * Verify payment status for a therapy session
 * Mobile API endpoint - uses JWT token authentication
 *
 * The mobile app calls this after returning from PayHere to check
 * if the payment was successfully processed
 *
 * Query params:
 * - orderId: The payment order ID to verify
 *
 * OR Body (JSON):
 * - orderId: The payment order ID to verify
 * - sessionId: (Optional) TherapySession ID to verify payment for
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId parameter" },
        { status: 400 }
      );
    }

    // Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: {
        patient: {
          select: {
            id: true,
            userId: true,
          },
        },
        TherapySession: {
          select: {
            id: true,
            scheduledAt: true,
            duration: true,
            status: true,
            therapist: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
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

    // Verify the payment belongs to this patient
    if (payment.patient?.userId !== payload.userId) {
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
      session: payment.TherapySession ? {
        id: payment.TherapySession.id,
        scheduledAt: payment.TherapySession.scheduledAt,
        duration: payment.TherapySession.duration,
        status: payment.TherapySession.status,
        therapist: {
          id: payment.TherapySession.therapist.id,
          name: payment.TherapySession.therapist.user.name,
          email: payment.TherapySession.therapist.user.email,
        },
      } : null,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const { orderId, sessionId } = await request.json();

    if (!orderId && !sessionId) {
      return NextResponse.json(
        { error: "Either orderId or sessionId is required" },
        { status: 400 }
      );
    }

    // Find payment by orderId or sessionId
    let payment;
    if (orderId) {
      payment = await prisma.payment.findUnique({
        where: { orderId },
        include: {
          patient: {
            select: {
              id: true,
              userId: true,
            },
          },
          TherapySession: {
            select: {
              id: true,
              scheduledAt: true,
              duration: true,
              status: true,
              therapist: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } else if (sessionId) {
      payment = await prisma.payment.findFirst({
        where: { sessionId },
        include: {
          patient: {
            select: {
              id: true,
              userId: true,
            },
          },
          TherapySession: {
            select: {
              id: true,
              scheduledAt: true,
              duration: true,
              status: true,
              therapist: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify the payment belongs to this patient
    if (payment.patient?.userId !== payload.userId) {
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
      session: payment.TherapySession ? {
        id: payment.TherapySession.id,
        scheduledAt: payment.TherapySession.scheduledAt,
        duration: payment.TherapySession.duration,
        status: payment.TherapySession.status,
        therapist: {
          id: payment.TherapySession.therapist.id,
          name: payment.TherapySession.therapist.user.name,
          email: payment.TherapySession.therapist.user.email,
        },
      } : null,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
