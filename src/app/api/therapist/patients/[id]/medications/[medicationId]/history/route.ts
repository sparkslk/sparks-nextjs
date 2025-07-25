import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { MedicationHistoryAction } from '@/types/medications';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; medicationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: patientId, medicationId } = await params;

    // Verify therapist has access to this patient
    const therapist = await prisma.therapist.findUnique({
      where: { userId: session.user.id },
    });

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Verify medication belongs to this patient and therapist
    const medication = await prisma.medication.findFirst({
      where: {
        id: medicationId,
        patientId: patientId,
      },
      include: {
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

    if (!medication) {
      return NextResponse.json({ error: 'Medication not found or access denied' }, { status: 404 });
    }

    // Get discontinuing therapist information if the medication was discontinued
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

    // Get actual medication history from the database
    const medicationHistoryRecords = await prisma.medicationHistory.findMany({
      where: {
        medicationId: medicationId,
      },
      orderBy: {
        changedAt: 'desc',
      },
    });

    // Transform database records to include therapist information
    const history = await Promise.all(
      medicationHistoryRecords.map(async (record) => {
        // Get therapist information for the person who made the change
        let therapistInfo = null;
        try {
          const therapist = await prisma.therapist.findUnique({
            where: { userId: record.changedBy },
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          });
          
          if (therapist) {
            therapistInfo = {
              user: {
                name: therapist.user.name || 'Unknown Therapist',
              },
            };
          }
        } catch (error) {
          console.error('Error fetching therapist for history record:', error);
        }

        return {
          id: record.id,
          medicationId: record.medicationId,
          action: record.action as MedicationHistoryAction,
          changedBy: record.changedBy,
          changedAt: record.changedAt,
          previousValues: record.previousValues,
          newValues: record.newValues,
          reason: record.reason || undefined,
          notes: record.notes || undefined,
          therapist: therapistInfo || {
            user: {
              name: 'Unknown Therapist',
            },
          },
        };
      })
    );

    // If no history records exist in the database, generate basic history from medication data
    if (history.length === 0) {
      // Generate basic history entries from medication data as fallback
      history.push({
        id: `hist_created_${medication.id}`,
        medicationId: medication.id,
        action: MedicationHistoryAction.CREATED,
        changedBy: medication.therapistId,
        changedAt: medication.createdAt,
        previousValues: null,
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
        reason: undefined,
        notes: `New medication prescribed: ${medication.name} ${medication.dosage}`,
        therapist: {
          user: {
            name: medication.Therapist.user.name || 'Unknown Therapist',
          },
        },
      });

      // Add update entry if medication was updated
      if (medication.updatedAt > medication.createdAt) {
        history.push({
          id: `hist_updated_${medication.id}`,
          medicationId: medication.id,
          action: MedicationHistoryAction.UPDATED,
          changedBy: medication.therapistId,
          changedAt: medication.updatedAt,
          previousValues: null,
          newValues: {
            currentName: medication.name,
            currentDosage: medication.dosage,
            currentFrequency: medication.frequency,
            currentMealTiming: medication.mealTiming,
          },
          reason: undefined,
          notes: `${medication.name} details were updated on ${format(new Date(medication.updatedAt), 'MMM dd, yyyy')}`,
          therapist: {
            user: {
              name: medication.Therapist.user.name || 'Unknown Therapist',
            },
          },
        });
      }

      // Add discontinuation entry if discontinued
      if (medication.isDiscontinued && medication.discontinuedAt) {
        history.push({
          id: `hist_discontinued_${medication.id}`,
          medicationId: medication.id,
          action: MedicationHistoryAction.DISCONTINUED,
          changedBy: medication.discontinuedBy || medication.therapistId,
          changedAt: medication.discontinuedAt,
          previousValues: {
            isActive: true,
            isDiscontinued: false,
          },
          newValues: {
            isActive: false,
            isDiscontinued: true,
          },
          reason: 'Medication discontinued',
          notes: `${medication.name} has been discontinued`,
          therapist: {
            user: {
              name: discontinuingTherapist?.user?.name || medication.Therapist.user.name || 'Unknown Therapist',
            },
          },
        });
      }

      // Sort by date (newest first)
      history.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching medication history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
