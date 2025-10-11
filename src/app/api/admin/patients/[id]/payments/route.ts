import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/admin/patients/{id}/payments:
 *   get:
 *     summary: Get patient payment history
 *     description: Retrieve all payment records for a specific patient
 *     tags:
 *       - Admin
 *       - Payments
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       orderId:
 *                         type: string
 *                       paymentId:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       status:
 *                         type: string
 *                       paymentMethod:
 *                         type: string
 *                       sessionId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       session:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           type:
 *                             type: string
 *                           scheduledAt:
 *                             type: string
 *                             format: date-time
 *                           therapist:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               user:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                 totalAmount:
 *                   type: number
 *                   description: Total amount paid by patient
 *                 totalPayments:
 *                   type: number
 *                   description: Total number of payments
 *       400:
 *         description: Invalid patient ID
 *       404:
 *         description: Patient not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await requireApiAuth(req, ['ADMIN', 'MANAGER']);

        const params = await context.params;
        const patientId = params.id;

        if (!patientId) {
            return NextResponse.json(
                { error: "Patient ID is required" },
                { status: 400 }
            );
        }

        // Verify patient exists
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            select: {
                id: true,
                firstName: true,
                lastName: true
            }
        });

        if (!patient) {
            return NextResponse.json(
                { error: "Patient not found" },
                { status: 404 }
            );
        }

        // Fetch all payments for this patient
        const payments = await prisma.payment.findMany({
            where: { patientId },
            include: {
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
            }
        });

        // Calculate summary statistics
        const completedPayments = payments.filter(p => p.status === 'COMPLETED');
        const totalAmount = completedPayments.reduce((sum, payment) => {
            return sum + Number(payment.amount);
        }, 0);

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
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            statusMessage: payment.statusMessage,
            cardHolderName: payment.cardHolderName,
            maskedCardNumber: payment.maskedCardNumber,
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

        return NextResponse.json({
            patient: {
                id: patient.id,
                name: `${patient.firstName} ${patient.lastName}`
            },
            payments: formattedPayments,
            summary: {
                totalPayments: payments.length,
                completedPayments: completedPayments.length,
                totalAmount: totalAmount,
                pendingPayments: payments.filter(p => p.status === 'PENDING').length,
                failedPayments: payments.filter(p => p.status === 'FAILED').length
            }
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching patient payment history:", error);
        return NextResponse.json(
            { error: "Failed to fetch payment history" },
            { status: 500 }
        );
    }
}
