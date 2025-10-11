import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Build where clause
    type PaymentStatusType = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
    interface WhereClause {
      paymentStatus?: PaymentStatusType;
    }
    const where: WhereClause = {};
    if (status && status !== 'all') {
      where.paymentStatus = status as PaymentStatusType;
    }

    // Fetch donations with pagination
    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          amount: true,
          currency: true,
          frequency: true,
          paymentMethod: true,
          paymentStatus: true,
          payHereOrderId: true,
          payHerePaymentId: true,
          donorName: true,
          donorEmail: true,
          donorPhone: true,
          isAnonymous: true,
          message: true,
          receiptSent: true,
          source: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.donation.count({ where }),
    ]);

    // Calculate statistics
    const stats = await prisma.donation.aggregate({
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      where: {
        paymentStatus: 'COMPLETED',
      },
    });

    return NextResponse.json({
      donations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalDonations: stats._count.id,
        totalAmount: stats._sum.amount || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}
