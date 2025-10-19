import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { UpdateSupportTicketInput, isValidSupportTicketStatus, isValidSupportTicketPriority } from "@/types/support";

/**
 * Admin Single Support Ticket API
 * GET - Fetch single ticket with full details
 * PATCH - Update ticket status, priority, etc.
 * DELETE - Delete/archive a ticket
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiAuth(req, ["ADMIN"]);
    const { id } = await params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
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
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Error fetching support ticket:", error);

    if (error instanceof NextResponse) {
      return error;
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch support ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireApiAuth(req, ["ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const { status, priority }: UpdateSupportTicketInput = body;

    // Validate inputs
    if (status && !isValidSupportTicketStatus(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    if (priority && !isValidSupportTicketPriority(priority)) {
      return NextResponse.json(
        { success: false, error: "Invalid priority value" },
        { status: 400 }
      );
    }

    // Check if ticket exists
    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: UpdateSupportTicketInput & { resolvedBy?: string | null; resolvedAt?: Date | null } = {};

    if (status) {
      updateData.status = status;

      // If status is RESOLVED or CLOSED, set resolvedBy and resolvedAt
      if ((status === "RESOLVED" || status === "CLOSED") && !existingTicket.resolvedAt) {
        updateData.resolvedBy = session.user.id;
        updateData.resolvedAt = new Date();
      }

      // If reopening a ticket, clear resolved fields
      if (status === "OPEN" || status === "IN_PROGRESS" || status === "PENDING_USER_RESPONSE") {
        updateData.resolvedBy = null;
        updateData.resolvedAt = null;
      }
    }

    if (priority) {
      updateData.priority = priority;
    }

    // Update ticket
    const updatedTicket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
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
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: "Ticket updated successfully",
    });
  } catch (error) {
    console.error("Error updating support ticket:", error);

    if (error instanceof NextResponse) {
      return error;
    }

    return NextResponse.json(
      { success: false, error: "Failed to update support ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiAuth(req, ["ADMIN"]);
    const { id } = await params;

    // Check if ticket exists
    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Delete ticket (cascade will delete comments)
    await prisma.supportTicket.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting support ticket:", error);

    if (error instanceof NextResponse) {
      return error;
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete support ticket" },
      { status: 500 }
    );
  }
}
