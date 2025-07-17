import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  UpdateMedicationData, 
  DiscontinueMedicationData,
  MedicationFrequency
} from '@/types/medications';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; medicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: patientId, medicationId } = params;
    const body: UpdateMedicationData = await request.json();

    // Verify therapist has access to this patient
    const therapist = await prisma.therapist.findUnique({
      where: { userId: session.user.id },
    });

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Verify medication belongs to this patient and therapist
    const existingMedication = await prisma.medication.findFirst({
      where: {
        id: medicationId,
        patientId: patientId,
        therapistId: therapist.id,
      },
    });

    if (!existingMedication) {
      return NextResponse.json({ error: 'Medication not found or access denied' }, { status: 404 });
    }

    // Validate custom frequency if updating frequency
    if (body.frequency === MedicationFrequency.CUSTOM && !body.customFrequency) {
      return NextResponse.json(
        { error: 'Custom frequency description is required when frequency is CUSTOM' },
        { status: 400 }
      );
    }

    // Track changes for logging
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    if (body.name && body.name !== existingMedication.name) {
      changes.name = { from: existingMedication.name, to: body.name };
    }
    if (body.dosage && body.dosage !== existingMedication.dosage) {
      changes.dosage = { from: existingMedication.dosage, to: body.dosage };
    }
    if (body.frequency && body.frequency !== existingMedication.frequency) {
      changes.frequency = { from: existingMedication.frequency, to: body.frequency };
    }
    if (body.customFrequency !== existingMedication.customFrequency) {
      changes.customFrequency = { from: existingMedication.customFrequency, to: body.customFrequency };
    }
    if (body.instructions !== existingMedication.instructions) {
      changes.instructions = { from: existingMedication.instructions, to: body.instructions };
    }
    if (body.mealTiming && body.mealTiming !== existingMedication.mealTiming) {
      changes.mealTiming = { from: existingMedication.mealTiming, to: body.mealTiming };
    }

    const updatedMedication = await prisma.medication.update({
      where: { id: medicationId },
      data: {
        name: body.name,
        dosage: body.dosage,
        frequency: body.frequency,
        customFrequency: body.customFrequency,
        instructions: body.instructions,
        mealTiming: body.mealTiming,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
      include: {
        Patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        Therapist: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Log the update action
    if (Object.keys(changes).length > 0) {
      console.log(`Medication updated: ${medicationId} for patient ${patientId} by therapist ${therapist.id}`, {
        action: 'UPDATED',
        changes: changes,
        changeLog: (body as unknown as Record<string, unknown>).changeLog // From frontend tracking
      });
    }

    return NextResponse.json(updatedMedication);
  } catch (error) {
    console.error('Error updating medication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; medicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: patientId, medicationId } = params;

    // Verify therapist has access to this patient
    const therapist = await prisma.therapist.findUnique({
      where: { userId: session.user.id },
    });

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Verify medication belongs to this patient and therapist
    const existingMedication = await prisma.medication.findFirst({
      where: {
        id: medicationId,
        patientId: patientId,
        therapistId: therapist.id,
      },
    });

    if (!existingMedication) {
      return NextResponse.json({ error: 'Medication not found or access denied' }, { status: 404 });
    }

    // Soft delete by marking as discontinued
    const discontinuedMedication = await prisma.medication.update({
      where: { id: medicationId },
      data: {
        isActive: false,
        isDiscontinued: true,
        discontinuedAt: new Date(),
        discontinuedBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true, medication: discontinuedMedication });
  } catch (error) {
    console.error('Error deleting medication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; medicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: patientId, medicationId } = params;
    const body: DiscontinueMedicationData = await request.json();

    // Verify therapist has access to this patient
    const therapist = await prisma.therapist.findUnique({
      where: { userId: session.user.id },
    });

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Verify medication belongs to this patient and therapist
    const existingMedication = await prisma.medication.findFirst({
      where: {
        id: medicationId,
        patientId: patientId,
        therapistId: therapist.id,
      },
    });

    if (!existingMedication) {
      return NextResponse.json({ error: 'Medication not found or access denied' }, { status: 404 });
    }

    // Discontinue medication
    const discontinuedMedication = await prisma.medication.update({
      where: { id: medicationId },
      data: {
        isActive: false,
        isDiscontinued: true,
        discontinuedAt: new Date(),
        discontinuedBy: session.user.id,
      },
      include: {
        Patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        Therapist: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Log the discontinuation action
    console.log(`Medication discontinued: ${medicationId} for patient ${patientId} by therapist ${therapist.id}`, {
      action: 'DISCONTINUED',
      reason: body.reason,
      discontinuedAt: new Date().toISOString(),
      previousState: {
        isActive: existingMedication.isActive,
        isDiscontinued: existingMedication.isDiscontinued
      }
    });

    return NextResponse.json(discontinuedMedication);
  } catch (error) {
    console.error('Error discontinuing medication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
