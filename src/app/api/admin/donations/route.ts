import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";
import { Prisma } from "@prisma/client";

/**
 * Admin Donations List API
 * GET endpoint with pagination and filters
 *
 * Query parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * - status: PENDING | PROCESSING | COMPLETED | FAILED | REFUNDED | CANCELLED
 * - dateFrom: ISO date string
 * - dateTo: ISO date string
 * - donorEmail: string (search)
 * - donorName: string (search)
 * - minAmount: number
 * - maxAmount: number
 * - anonymousOnly: boolean
 * - sortBy: createdAt | amount (default: createdAt)
 * - sortOrder: asc | desc (default: desc)
 */
export async function GET(req: NextRequest) {
  try {
    // Require ADMIN role
    await requireApiAuth(req, ["ADMIN"]);

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const donorEmail = searchParams.get("donorEmail");
    const donorName = searchParams.get("donorName");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const anonymousOnly = searchParams.get("anonymousOnly") === "true";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: Prisma.DonationWhereInput = {};

    if (status) {
      where.paymentStatus = status as Prisma.DonationWhereInput['paymentStatus'];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Include the entire end date
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    if (donorEmail) {
      where.donorEmail = {
        contains: donorEmail,
        mode: "insensitive",
      };
    }

    if (donorName) {
      where.donorName = {
        contains: donorName,
        mode: "insensitive",
      };
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) {
        where.amount.gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        where.amount.lte = parseFloat(maxAmount);
      }
    }

    if (anonymousOnly) {
      where.isAnonymous = true;
    }

    // Build orderBy clause
    const orderBy: Prisma.DonationOrderByWithRelationInput = {};
    if (sortBy === "amount") {
      orderBy.amount = sortOrder as Prisma.SortOrder;
    } else {
      orderBy.createdAt = sortOrder as Prisma.SortOrder;
    }

    // Get total count for pagination
    const total = await prisma.donation.count({ where });

    // Get donations
    const donations = await prisma.donation.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Format response
    const formattedDonations = donations.map((donation) => ({
      id: donation.id,
      amount: parseFloat(donation.amount.toString()),
      currency: donation.currency,
      paymentStatus: donation.paymentStatus,
      paymentMethod: donation.paymentMethod,
      donorName: donation.isAnonymous ? "Anonymous" : donation.donorName,
      donorEmail: donation.isAnonymous ? null : donation.donorEmail,
      donorPhone: donation.isAnonymous ? null : donation.donorPhone,
      isAnonymous: donation.isAnonymous,
      message: donation.message,
      receiptSent: donation.receiptSent,
      receiptSentAt: donation.receiptSentAt,
      payHereOrderId: donation.payHereOrderId,
      payHerePaymentId: donation.payHerePaymentId,
      payHereStatusCode: donation.payHereStatusCode,
      userId: donation.userId,
      user: donation.User
        ? {
            id: donation.User.id,
            name: donation.User.name,
            email: donation.User.email,
          }
        : null,
      source: donation.source,
      ipAddress: donation.ipAddress,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedDonations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching donations:", error);

    // Check if error is from requireApiAuth
    if (error instanceof NextResponse) {
      return error;
    }

    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}
