import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Upload profile image
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyMobileToken(token);

    if (!payload || payload.role !== "NORMAL_USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { image } = data;

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    // Validate image is a data URL (base64)
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: "Invalid image format. Must be a base64 data URL" },
        { status: 400 }
      );
    }

    // Update user's image
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: { image }
    });

    return NextResponse.json({
      success: true,
      message: "Profile image updated successfully",
      image: updatedUser.image,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image
      }
    });

  } catch (error) {
    console.error("Error uploading profile image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
