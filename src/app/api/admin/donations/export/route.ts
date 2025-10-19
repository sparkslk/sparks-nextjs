import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";
import { Prisma } from "@prisma/client";

/**
 * Admin Donations CSV Export API
 * GET endpoint that exports donations as CSV
 *
 * Accepts same filters as the list endpoint:
 * - status, dateFrom, dateTo, donorEmail, donorName, minAmount, maxAmount, anonymousOnly
 */
export async function GET(req: NextRequest) {
  try {
    // Require ADMIN role
    await requireApiAuth(req, ["ADMIN"]);

    const { searchParams } = new URL(req.url);

    // Filters (same as list endpoint)
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const donorEmail = searchParams.get("donorEmail");
    const donorName = searchParams.get("donorName");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const anonymousOnly = searchParams.get("anonymousOnly") === "true";

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

    // Get all matching donations (no pagination for export)
    const donations = await prisma.donation.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Generate CSV content
    const headers = [
      "Donation ID",
      "Date",
      "Amount (LKR)",
      "Status",
      "Payment Method",
      "Donor Name",
      "Donor Email",
      "Donor Phone",
      "Is Anonymous",
      "Message",
      "Receipt Sent",
      "Receipt Sent Date",
      "PayHere Order ID",
      "PayHere Payment ID",
      "User ID",
      "User Name",
      "User Email",
      "Source",
      "IP Address",
    ];

    const csvRows = [headers.join(",")];

    for (const donation of donations) {
      const row = [
        donation.id,
        donation.createdAt.toISOString(),
        parseFloat(donation.amount.toString()).toFixed(2),
        donation.paymentStatus,
        donation.paymentMethod || "",
        donation.isAnonymous ? "Anonymous" : (donation.donorName || ""),
        donation.isAnonymous ? "" : (donation.donorEmail || ""),
        donation.isAnonymous ? "" : (donation.donorPhone || ""),
        donation.isAnonymous ? "Yes" : "No",
        donation.message ? `"${donation.message.replace(/"/g, '""')}"` : "",
        donation.receiptSent ? "Yes" : "No",
        donation.receiptSentAt ? donation.receiptSentAt.toISOString() : "",
        donation.payHereOrderId || "",
        donation.payHerePaymentId || "",
        donation.userId || "",
        donation.User?.name || "",
        donation.User?.email || "",
        donation.source || "",
        donation.ipAddress || "",
      ];

      csvRows.push(row.join(","));
    }

    const csvContent = csvRows.join("\n");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `donations_export_${timestamp}.csv`;

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error exporting donations:", error);

    // Check if error is from requireApiAuth
    if (error instanceof NextResponse) {
      return error;
    }

    return NextResponse.json(
      { error: "Failed to export donations" },
      { status: 500 }
    );
  }
}
