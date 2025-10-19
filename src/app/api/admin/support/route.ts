import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { SupportTicketStatus, SupportTicketPriority } from "@prisma/client";

/**
 * Admin Support Tickets API
 * GET endpoint with pagination, filtering, and sorting
 *
 * Query parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * - status: OPEN | IN_PROGRESS | RESOLVED | CLOSED | PENDING_USER_RESPONSE
 * - priority: LOW | MEDIUM | HIGH | URGENT
 * - dateFrom: ISO date string
 * - dateTo: ISO date string
 * - email: string (search)
 * - userId: string (filter by user)
 * - search: string (search in title/description)
 * - sortBy: createdAt | priority | status (default: createdAt)
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
    const status = searchParams.get("status") as SupportTicketStatus | null;
    const priority = searchParams.get("priority") as SupportTicketPriority | null;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: Prisma.SupportTicketWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    if (email) {
      where.email = {
        contains: email,
        mode: "insensitive",
      };
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Build orderBy clause
    let orderBy: Prisma.SupportTicketOrderByWithRelationInput = {};
    if (sortBy === "priority") {
      // Priority sorting: URGENT > HIGH > MEDIUM > LOW
      orderBy = {
        priority: sortOrder as Prisma.SortOrder,
      };
    } else if (sortBy === "status") {
      orderBy = {
        status: sortOrder as Prisma.SortOrder,
      };
    } else {
      orderBy = {
        createdAt: sortOrder as Prisma.SortOrder,
      };
    }

    // Get total count
    const total = await prisma.supportTicket.count({ where });

    // Get tickets
    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        resolver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5, // Include only last 5 comments in list view
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching support tickets:", error);

    // Check if error is from requireApiAuth
    if (error instanceof NextResponse) {
      return error;
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch support tickets" },
      { status: 500 }
    );
  }
}
