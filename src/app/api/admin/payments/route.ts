import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

/**
 * @swagger
 * /api/admin/payments:
 *   get:
 *     summary: Get all payments with optional filters
 *     description: Retrieve all payment records with optional filtering by status, date range, and patient
 *     tags:
 *       - Admin
 *       - Payments
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, CANCELLED, CHARGEDBACK, UNKNOWN]
 *         description: Filter by payment status
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by patient ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments until this date (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

export async function GET(req: NextRequest) {
    try {
        await requireApiAuth(req, ['ADMIN', 'MANAGER']);

        const { searchParams } = new URL(req.url);

        // Parse query parameters
        const status = searchParams.get('status') as PaymentStatus | null;
        const patientId = searchParams.get('patientId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build where clause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (patientId) {
            where.patientId = patientId;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                const endDateTime = new Date(endDate);
                endDateTime.setHours(23, 59, 59, 999);
                where.createdAt.lte = endDateTime;
            }
        }

        // Fetch payments with pagination
        const [payments, totalCount] = await Promise.all([
            prisma.payment.findMany({
                where,
                include: {
                    patient: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true
                        }
                    },
                    TherapySession: {
                        include: {
                            therapist: {
                                include: {
                                    user: {
                                        select: {
                                            name: true,
                                            email: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                skip: offset
            }),
            prisma.payment.count({ where })
        ]);

        // Format payments for response
        const formattedPayments = payments.map(payment => ({
            id: payment.id,
            orderId: payment.orderId,
            paymentId: payment.paymentId,
            amount: Number(payment.amount),
            currency: payment.currency,
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            sessionId: payment.sessionId,
            patientId: payment.patientId,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            statusMessage: payment.statusMessage,
            cardHolderName: payment.cardHolderName,
            maskedCardNumber: payment.maskedCardNumber,
            patient: payment.patient ? {
                id: payment.patient.id,
                name: `${payment.patient.firstName} ${payment.patient.lastName}`,
                email: payment.patient.email,
                phone: payment.patient.phone
            } : null,
            session: payment.TherapySession ? {
                id: payment.TherapySession.id,
                type: payment.TherapySession.type,
                scheduledAt: payment.TherapySession.scheduledAt,
                status: payment.TherapySession.status,
                therapist: {
                    id: payment.TherapySession.therapist.id,
                    name: payment.TherapySession.therapist.user.name,
                    email: payment.TherapySession.therapist.user.email
                }
            } : null
        }));

        // Calculate summary statistics
        const summary = await prisma.payment.groupBy({
            by: ['status'],
            where,
            _count: {
                id: true
            },
            _sum: {
                amount: true
            }
        });

        const summaryStats = {
            totalPayments: totalCount,
            byStatus: summary.map(item => ({
                status: item.status,
                count: item._count.id,
                totalAmount: Number(item._sum.amount || 0)
            })),
            totalRevenue: summary
                .filter(item => item.status === 'COMPLETED')
                .reduce((sum, item) => sum + Number(item._sum.amount || 0), 0)
        };

        return NextResponse.json({
            payments: formattedPayments,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount
            },
            summary: summaryStats
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching payments:", error);
        return NextResponse.json(
            { error: "Failed to fetch payments" },
            { status: 500 }
        );
    }
}
