/**
 * API: Get list of available therapists to start a chat with
 * 
 * GET /api/chat/available-therapists
 * 
 * Returns therapists the current user (parent/patient) can message
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userRole = session.user.role as UserRole;

    // Only parents and patients can start new chats
    if (userRole !== UserRole.PARENT_GUARDIAN && userRole !== UserRole.NORMAL_USER) {
      return NextResponse.json(
        { success: false, error: 'Only parents and patients can start new chats' },
        { status: 403 }
      );
    }

    // Get user's therapists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: {
          include: {
            primaryTherapist: {
              include: {
                user: true,
              },
            },
          },
        },
        parentGuardianRel: {
          include: {
            patient: {
              include: {
                primaryTherapist: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Collect all available therapists
    const therapists: any[] = [];
    const therapistIds = new Set<string>();

    // Patient's own therapist
    if (user.patientProfile?.primaryTherapist) {
      const therapist = user.patientProfile.primaryTherapist;
      if (!therapistIds.has(therapist.id)) {
        therapistIds.add(therapist.id);
        therapists.push({
          id: therapist.id,
          userId: therapist.userId,
          name: therapist.user.name,
          avatar: therapist.user.image,
          patientId: user.patientProfile.id,
          patientName: `${user.patientProfile.firstName} ${user.patientProfile.lastName}`,
        });
      }
    }

    // Children's therapists (for parents)
    user.parentGuardianRel.forEach((rel) => {
      if (rel.patient.primaryTherapist) {
        const therapist = rel.patient.primaryTherapist;
        if (!therapistIds.has(therapist.id)) {
          therapistIds.add(therapist.id);
          therapists.push({
            id: therapist.id,
            userId: therapist.userId,
            name: therapist.user.name,
            avatar: therapist.user.image,
            patientId: rel.patient.id,
            patientName: `${rel.patient.firstName} ${rel.patient.lastName}`,
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      therapists,
    });
  } catch (error) {
    console.error('Error fetching available therapists:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
