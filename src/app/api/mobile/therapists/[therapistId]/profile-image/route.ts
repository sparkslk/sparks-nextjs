import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Get therapist profile image
 * Returns the profile image stored in TherapistProfile table
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ therapistId: string }> }
) {
  try {
    const { therapistId } = await params;

    if (!therapistId) {
      return NextResponse.json(
        { error: "Therapist ID is required" },
        { status: 400 }
      );
    }

    // Fetch therapist profile with image
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { therapistId },
      select: {
        profileImage: true,
        profileImageMimeType: true,
        profileImageName: true
      }
    });

    // If no profile or no image, return 404
    if (!therapistProfile || !therapistProfile.profileImage) {
      return NextResponse.json(
        { error: "Profile image not found" },
        { status: 404 }
      );
    }

    // Determine content type
    const contentType = therapistProfile.profileImageMimeType || "image/jpeg";

    // Convert Buffer to Uint8Array for NextResponse
    const imageBuffer = Buffer.from(therapistProfile.profileImage);

    // Return image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Content-Disposition": `inline; filename="${therapistProfile.profileImageName || 'profile.jpg'}"`,
      },
    });

  } catch (error) {
    console.error("Error fetching therapist profile image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
