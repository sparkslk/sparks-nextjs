import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  CreateMedicationData, 
  MedicationFrequency,
  MealTiming
} from '@/types/medications';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: patientId } = await params;

    // Verify therapist has access to this patient
    const therapist = await prisma.therapist.findUnique({
      where: { userId: session.user.id },
    });

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        primaryTherapistId: therapist.id,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found or access denied' }, { status: 404 });
    }

    // Get medications for this patient
    const medications = await prisma.medication.findMany({
      where: {
        patientId: patientId,
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
      orderBy: [
        { isActive: 'desc' },
        { isDiscontinued: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // For discontinued medications, fetch the discontinuing therapist information
    const medicationsWithDiscontinuingTherapist = await Promise.all(
      medications.map(async (medication) => {
        let discontinuingTherapist = null;
        
        if (medication.discontinuedBy) {
          try {
            discontinuingTherapist = await prisma.therapist.findUnique({
              where: { userId: medication.discontinuedBy },
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            });
          } catch (error) {
            console.error('Error fetching discontinuing therapist:', error);
          }
        }
        
        // Transform the response to match the expected interface
        return {
          ...medication,
          therapist: medication.Therapist, // Map Therapist to therapist
          discontinuingTherapist,
          Therapist: undefined, // Remove the uppercase field
        };
      })
    );

    return NextResponse.json(medicationsWithDiscontinuingTherapist);
  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: patientId } = await params;
    const body: CreateMedicationData = await request.json();

    // Verify therapist has access to this patient
    const therapist = await prisma.therapist.findUnique({
      where: { userId: session.user.id },
    });

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        primaryTherapistId: therapist.id,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found or access denied' }, { status: 404 });
    }

    // Validate required fields
    if (!body.name || !body.dosage || !body.frequency || !body.startDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, dosage, frequency, startDate' },
        { status: 400 }
      );
    }

    // Validate custom frequency
    if (body.frequency === MedicationFrequency.CUSTOM && !body.customFrequency) {
      return NextResponse.json(
        { error: 'Custom frequency description is required when frequency is CUSTOM' },
        { status: 400 }
      );
    }

    const medication = await prisma.medication.create({
      data: {
        id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        patientId: patientId,
        therapistId: therapist.id,
        name: body.name,
        dosage: body.dosage,
        frequency: body.frequency,
        customFrequency: body.customFrequency,
        instructions: body.instructions,
        mealTiming: body.mealTiming || MealTiming.NONE,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        updatedAt: new Date(),
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

    // Create history record for medication creation
    await prisma.medicationHistory.create({
      data: {
        medicationId: medication.id,
        action: 'CREATED',
        changedBy: session.user.id,
        newValues: {
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          customFrequency: medication.customFrequency,
          instructions: medication.instructions,
          mealTiming: medication.mealTiming,
          startDate: medication.startDate.toISOString(),
          endDate: medication.endDate?.toISOString(),
        },
        notes: `New medication prescribed: ${medication.name} ${medication.dosage}`,
      },
    });

    // Log the creation action (this would go to a proper history table in production)
    console.log(`Medication created: ${medication.id} for patient ${patientId} by therapist ${therapist.id}`, {
      action: 'CREATED',
      medicationData: {
        name: body.name,
        dosage: body.dosage,
        frequency: body.frequency,
        mealTiming: body.mealTiming
      }
    });

    // Transform the response to match the expected interface
    const responseData = {
      ...medication,
      therapist: medication.Therapist, // Map Therapist to therapist
      Therapist: undefined, // Remove the uppercase field
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Error creating medication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
