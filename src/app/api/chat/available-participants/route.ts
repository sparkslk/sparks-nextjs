/**
 * API: Get available patients and parents for a therapist to message
 * 
 * GET /api/chat/available-participants
 * 
 * Returns: List of patients and their parents that the therapist can message
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

    // Only therapists can use this endpoint
    if (userRole !== UserRole.THERAPIST) {
      return NextResponse.json(
        { success: false, error: 'Only therapists can access this endpoint' },
        { status: 403 }
      );
    }

    // Get therapist profile
    const therapist = await prisma.therapist.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!therapist) {
      return NextResponse.json(
        { success: false, error: 'Therapist profile not found' },
        { status: 404 }
      );
    }

    // Get all patients assigned to this therapist
    const patients = await prisma.patient.findMany({
      where: { primaryTherapistId: therapist.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        parentGuardians: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Format the response - Group parents by userId to avoid duplicates
    const participantMap = new Map<string, any>();

    patients.forEach((patient) => {
      // Add patient if they have a user account
      if (patient.user) {
        participantMap.set(`patient-${patient.user.id}`, {
          type: 'PATIENT',
          userId: patient.user.id,
          patientId: patient.id,
          name: patient.user.name || `${patient.firstName} ${patient.lastName}`,
          avatar: patient.user.image,
          patientName: `${patient.firstName} ${patient.lastName}`,
          patientNames: [`${patient.firstName} ${patient.lastName}`],
        });
      }

      // Add all parents/guardians (group by userId)
      patient.parentGuardians.forEach((guardian) => {
        const parentKey = `parent-${guardian.user.id}`;
        const patientFullName = `${patient.firstName} ${patient.lastName}`;
        
        if (participantMap.has(parentKey)) {
          // Parent already exists, add this patient to their list
          const existing = participantMap.get(parentKey);
          if (!existing.patientNames.includes(patientFullName)) {
            existing.patientNames.push(patientFullName);
            existing.patientIds.push(patient.id);
          }
        } else {
          // New parent entry
          participantMap.set(parentKey, {
            type: 'PARENT',
            userId: guardian.user.id,
            patientId: patient.id, // First patient (for backward compatibility)
            patientIds: [patient.id], // All patient IDs
            name: guardian.user.name || 'Parent/Guardian',
            avatar: guardian.user.image,
            patientName: patientFullName, // First patient (for backward compatibility)
            patientNames: [patientFullName], // All patient names
            relationship: guardian.relationship,
          });
        }
      });
    });

    const participants = Array.from(participantMap.values());

    return NextResponse.json({
      success: true,
      participants,
    });
  } catch (error) {
    console.error('Error fetching available participants:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
