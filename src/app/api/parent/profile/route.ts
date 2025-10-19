import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Require authentication and PARENT_GUARDIAN role
    const sessionUser = await requireApiAuth(request, ["PARENT_GUARDIAN"]);
    const userId = sessionUser.user.id;

    // Fetch user from User table
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        parentGuardianRel: {
          select: {
            id: true,
            relationship: true,
            isPrimary: true,
            canMakeDecisions: true,
            createdAt: true,
            updatedAt: true,
            contact_no: true, // Ensure this matches the schema
          },
        },
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // For demo, just return the first guardian relationship (if multiple children)
    const guardian = user?.parentGuardianRel?.[0] || null;
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      guardianRelationship: guardian?.relationship || null,
      isPrimary: guardian?.isPrimary ?? null,
      canMakeDecisions: guardian?.canMakeDecisions ?? null,
      contactNo: guardian?.contact_no ?? null,
      createdAt: guardian?.createdAt ?? null,
      updatedAt: guardian?.updatedAt ?? null,
    });
  } catch (error) {
    console.error("Error fetching parent profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Require authentication and PARENT_GUARDIAN role
    const sessionUser = await requireApiAuth(request, ["PARENT_GUARDIAN"]);
    const userId = sessionUser.user.id;

    const body = await request.json();
    const { name, email, contactNo } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (email !== sessionUser.user.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
          id: { not: userId },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already taken" },
          { status: 400 }
        );
      }
    }

    // Update user information
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name,
        email: email,
      },
    });

    // Update contact number in ParentGuardian relationship if it exists
    if (contactNo !== undefined) {
      await prisma.parentGuardian.updateMany({
        where: { userId: userId },
        data: { contact_no: contactNo },
      });
    }

    // Fetch updated data to return
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        parentGuardianRel: {
          select: {
            id: true,
            relationship: true,
            isPrimary: true,
            canMakeDecisions: true,
            createdAt: true,
            updatedAt: true,
            contact_no: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const guardian = user?.parentGuardianRel?.[0] || null;

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      guardianRelationship: guardian?.relationship || null,
      isPrimary: guardian?.isPrimary ?? null,
      canMakeDecisions: guardian?.canMakeDecisions ?? null,
      contactNo: guardian?.contact_no ?? null,
      createdAt: guardian?.createdAt ?? null,
      updatedAt: guardian?.updatedAt ?? null,
    });
  } catch (error) {
    console.error("Error updating parent profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
