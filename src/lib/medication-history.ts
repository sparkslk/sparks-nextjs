import { prisma } from '@/lib/prisma';
import { MedicationHistoryAction } from '@/types/medications';
import { Prisma } from '@prisma/client';

interface MedicationData {
  id?: string;
  name?: string;
  dosage?: string;
  frequency?: string;
  customFrequency?: string;
  instructions?: string;
  mealTiming?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  isActive?: boolean;
  isDiscontinued?: boolean;
  discontinuedAt?: Date | string;
  discontinuedBy?: string;
  discontinueReason?: string;
  [key: string]: unknown;
}

interface HistoryParams {
  medicationId: string;
  action: MedicationHistoryAction;
  changedBy: string;
  previousValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
  reason?: string;
  notes?: string;
}

export async function createMedicationHistory({
  medicationId,
  action,
  changedBy,
  previousValues,
  newValues,
  reason,
  notes
}: HistoryParams) {
  try {
    return await prisma.medicationHistory.create({
      data: {
        medicationId,
        action,
        changedBy,
        previousValues: previousValues || {},
        newValues: newValues || {},
        reason,
        notes,
      },
    });
  } catch (error) {
    console.error('Error creating medication history:', error);
    throw error;
  }
}

export function compareAndTrackChanges(
  previous: MedicationData,
  updated: MedicationData,
  excludeFields: string[] = ['id', 'updatedAt', 'createdAt']
): { previousValues: Prisma.InputJsonValue; newValues: Prisma.InputJsonValue; hasChanges: boolean } {
  const previousValues: Record<string, unknown> = {};
  const newValues: Record<string, unknown> = {};
  let hasChanges = false;

  for (const key in updated) {
    if (excludeFields.includes(key)) continue;
    
    if (previous[key] !== updated[key]) {
      previousValues[key] = previous[key];
      newValues[key] = updated[key];
      hasChanges = true;
    }
  }

  return { 
    previousValues: previousValues as Prisma.InputJsonValue, 
    newValues: newValues as Prisma.InputJsonValue, 
    hasChanges 
  };
}

export function detectSpecificChanges(
  previous: MedicationData,
  updated: MedicationData
): MedicationHistoryAction[] {
  const actions: MedicationHistoryAction[] = [];

  if (previous.dosage !== updated.dosage) {
    actions.push(MedicationHistoryAction.DOSAGE_CHANGED);
  }

  if (previous.frequency !== updated.frequency || previous.customFrequency !== updated.customFrequency) {
    actions.push(MedicationHistoryAction.FREQUENCY_CHANGED);
  }

  if (previous.instructions !== updated.instructions) {
    actions.push(MedicationHistoryAction.INSTRUCTIONS_UPDATED);
  }

  if (previous.isActive !== updated.isActive || previous.isDiscontinued !== updated.isDiscontinued) {
    if (!updated.isActive && updated.isDiscontinued) {
      actions.push(MedicationHistoryAction.DISCONTINUED);
    } else if (updated.isActive && !updated.isDiscontinued) {
      actions.push(MedicationHistoryAction.REACTIVATED);
    }
  }

  // If no specific actions detected but there are changes, mark as general update
  if (actions.length === 0) {
    actions.push(MedicationHistoryAction.UPDATED);
  }

  return actions;
}
