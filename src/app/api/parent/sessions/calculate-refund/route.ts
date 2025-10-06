import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { calculateRefund, getRefundPolicy } from "@/lib/refund-utils";

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

        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        // Find the therapy session and verify the user has permission to view it
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
        const refundPolicy = getRefundPolicy();

        return NextResponse.json({
            success: true,
            session: {
                id: therapySession.id,
                scheduledAt: therapySession.scheduledAt,
                patientName: `${therapySession.patient.firstName} ${therapySession.patient.lastName}`,
                therapistName: therapySession.therapist.user.name
            },
            refund: {
                originalAmount: refundCalculation.originalAmount,
                refundAmount: refundCalculation.refundAmount,
                refundPercentage: refundCalculation.refundPercentage,
                hoursBeforeSession: refundCalculation.hoursBeforeSession.toFixed(1),
                canRefund: refundCalculation.canRefund,
                refundPolicy: refundPolicy
            }
        });

    } catch (error) {
        console.error("Error calculating refund:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}