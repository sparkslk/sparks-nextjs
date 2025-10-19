import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { AddCommentInput } from "@/types/support";

/**
 * Admin Support Ticket Comment API
 * POST - Add a comment to a support ticket
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireApiAuth(req, ["ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const { comment, isInternal = true }: AddCommentInput & { isInternal?: boolean } = body;

    // Validation
    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { success: false, error: "Comment is required" },
        { status: 400 }
      );
    }

    if (comment.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Comment must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Check if ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Create comment
    const newComment = await prisma.supportTicketComment.create({
      data: {
        ticketId: id,
        userId: session.user.id,
        comment: comment.trim(),
        isInternal,
      },
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
    });

    return NextResponse.json({
      success: true,
      data: newComment,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Error adding comment to support ticket:", error);

    if (error instanceof NextResponse) {
      return error;
    }

    return NextResponse.json(
      { success: false, error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
