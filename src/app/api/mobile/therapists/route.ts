import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Get available therapists with filtering
export async function GET(request: NextRequest) {
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

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const specialty = searchParams.get("specialty");
    const minRating = searchParams.get("minRating");
    const maxCost = searchParams.get("maxCost");
    const availability = searchParams.get("availability");
    const search = searchParams.get("search");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (specialty) {
      where.specialization = {
        has: specialty
      };
    }

    if (minRating) {
      where.rating = {
        gte: parseFloat(minRating)
      };
    }

    if (maxCost) {
      where.session_rate = {
        lte: parseFloat(maxCost)
      };
    }

    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          bio: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Get the patient to check if they already have a therapist
    const patient = await prisma.patient.findUnique({
      where: { userId: payload.userId },
      include: {
        primaryTherapist: {
          include: {
            user: true,
            profile: {
              select: {
                profileImage: true
              }
            }
          }
        }
      }
    });

    // Get therapists
    const therapists = await prisma.therapist.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        profile: {
          select: {
            profileImage: true,
            profileImageMimeType: true,
            profileImageName: true
          }
        },
        _count: {
          select: {
            patients: true,
            therapySessions: true
          }
        }
      },
      orderBy: {
        rating: 'desc'
      }
    });

    // Format therapist data for mobile
    const formattedTherapists = therapists.map(therapist => {
      // Generate profile image URL if profile image exists
      const profileImageUrl = therapist.profile?.profileImage
        ? `/api/mobile/therapists/${therapist.id}/profile-image`
        : null;

      return {
        id: therapist.id,
        userId: therapist.userId,
        name: therapist.user.name || "Therapist",
        email: therapist.user.email,
        image: therapist.user.image, // Fallback image
        profileImageUrl, // Profile image from TherapistProfile table
        bio: therapist.bio,
        specialization: therapist.specialization,
        experience: therapist.experience,
        rating: therapist.rating?.toNumber() || 0,
        patientCount: therapist._count.patients,
        sessionCount: therapist._count.therapySessions,
        isMyTherapist: patient?.primaryTherapistId === therapist.id
      };
    });

    // Sort: Current therapist first, then by rating descending
    formattedTherapists.sort((a, b) => {
      if (a.isMyTherapist) return -1;
      if (b.isMyTherapist) return 1;
      return b.rating - a.rating;
    });

    // If availability filter is set, check available slots
    if (availability === "today" || availability === "thisWeek") {
      // This would require checking therapist availability slots
      // For now, returning all therapists
    }

    return NextResponse.json({
      therapists: formattedTherapists,
      currentTherapist: patient?.primaryTherapist ? {
        id: patient.primaryTherapist.id,
        name: patient.primaryTherapist.user.name || "Your Therapist",
        email: patient.primaryTherapist.user.email,
        image: patient.primaryTherapist.user.image,
        profileImageUrl: patient.primaryTherapist.profile?.profileImage
          ? `/api/mobile/therapists/${patient.primaryTherapist.id}/profile-image`
          : null
      } : null,
      hasTherapist: !!patient?.primaryTherapistId
    });

  } catch (error) {
    console.error("Error fetching therapists:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}