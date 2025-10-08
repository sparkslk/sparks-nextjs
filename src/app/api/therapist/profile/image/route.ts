import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/therapist/profile/image:
 *   post:
 *     summary: Upload therapist profile image
 *     description: Uploads and saves a profile image for the authenticated therapist
 *     tags:
 *       - Therapist Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *       400:
 *         description: Invalid file or request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireApiAuth(req, ['THERAPIST']);
    // Get therapist ID
    const therapist = await prisma.therapist.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });
    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist profile not found" },
        { status: 404 }
      );
    }
    const formData = await req.formData();
    const file = formData.get('image') as File;
    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image." },
        { status: 400 }
      );
    }
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // Update or create therapist profile with image
    await prisma.therapistProfile.upsert({
      where: { therapistId: therapist.id },
      update: {
        profileImage: buffer,
        profileImageName: file.name,
        profileImageMimeType: file.type,
      },
      create: {
        therapistId: therapist.id,
        profileImage: buffer,
        profileImageName: file.name,
        profileImageMimeType: file.type,
      }
    });
    return NextResponse.json({
      message: "Profile image updated successfully",
      imageUrl: "/api/therapist/profile/image"
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return NextResponse.json(
      { error: "Failed to upload profile image" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/therapist/profile/image/{therapistId}:
 *   get:
 *     summary: Get therapist profile image
 *     description: Retrieves the profile image for a specific therapist
 *     tags:
 *       - Therapist Profile
 *     parameters:
 *       - in: path
 *         name: therapistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Therapist ID
 *     responses:
 *       200:
 *         description: Profile image retrieved successfully
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireApiAuth(req, ['THERAPIST']);
    // Get therapist profile with image
    const therapist = await prisma.therapist.findUnique({
      where: { userId: session.user.id },
      include: {
        profile: {
          select: {
            profileImage: true,
            profileImageMimeType: true,
            profileImageName: true
          }
        },
        user: {
          select: {
            image: true
          }
        }
      }
    });
    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }
    // Check if profile image exists in database
    if (therapist.profile?.profileImage) {
      const imageBuffer = Buffer.from(therapist.profile.profileImage);
      const mimeType = therapist.profile.profileImageMimeType || 'image/jpeg';

      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000',
          'Content-Disposition': `inline; filename="${therapist.profile.profileImageName || 'profile-image'}"`,
        },
      });
    }
    // Check if user has an external image URL
    if (therapist.user.image) {
      // Redirect to external image
      return NextResponse.redirect(therapist.user.image);
    }
    // Return 404 if no image found
    return NextResponse.json(
      { error: "Profile image not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching profile image:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile image" },
      { status: 500 }
    );
  }
}