import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateSupportTicketInput } from "@/types/support";

/**
 * Public Support Ticket Submission API
 * POST endpoint to create a new support ticket
 *
 * Accepts both authenticated and unauthenticated requests
 * If authenticated, auto-populates userId and user details
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, title, description }: CreateSupportTicketInput = body;

    // Validation
    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!title || !title.trim() || title.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Title must be at least 5 characters" },
        { status: 400 }
      );
    }

    if (!description || !description.trim() || description.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Description must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    let userId: string | null = null;
    let userName: string | null = null;
    let userRole: string | null = null;

    if (session?.user) {
      userId = session.user.id;
      userName = session.user.name || null;
      userRole = session.user.role || null;
    }

    // Create support ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        email: email.trim().toLowerCase(),
        title: title.trim(),
        description: description.trim(),
        userId,
        userName,
        userRole,
        status: "OPEN",
        priority: "MEDIUM",
      },
      include: {
        user: userId ? {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        } : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: ticket.id,
        email: ticket.email,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
      },
      message: "Support ticket submitted successfully",
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit support ticket. Please try again later.",
      },
      { status: 500 }
    );
  }
}
