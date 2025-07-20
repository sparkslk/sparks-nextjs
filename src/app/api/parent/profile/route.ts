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
