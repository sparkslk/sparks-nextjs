import { Prisma } from '@prisma/client';

export interface Medication {
  id: string;
  patientId: string;
  therapistId: string;
  name: string;
  dosage: string;
  frequency: MedicationFrequency;
  customFrequency?: string;
  instructions?: string;
  mealTiming: MealTiming;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  isDiscontinued: boolean;
  discontinuedAt?: Date;
  discontinuedBy?: string;
  discontinueReason?: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: {
    firstName: string;
    lastName: string;
  };
  therapist?: {
    user: {
      name: string;
    };
  };
}

export enum MedicationFrequency {
  ONCE_DAILY = 'ONCE_DAILY',
  TWICE_DAILY = 'TWICE_DAILY',
  THREE_TIMES_DAILY = 'THREE_TIMES_DAILY',
  FOUR_TIMES_DAILY = 'FOUR_TIMES_DAILY',
  EVERY_OTHER_DAY = 'EVERY_OTHER_DAY',
  WEEKLY = 'WEEKLY',
  AS_NEEDED = 'AS_NEEDED',
  CUSTOM = 'CUSTOM'
}

export enum MealTiming {
  NONE = 'NONE',
  BEFORE_MEALS = 'BEFORE_MEALS',
  WITH_MEALS = 'WITH_MEALS',
  AFTER_MEALS = 'AFTER_MEALS',
  ON_EMPTY_STOMACH = 'ON_EMPTY_STOMACH',
  WITH_FOOD = 'WITH_FOOD'
}

export interface CreateMedicationData {
  patientId: string;
  name: string;
  dosage: string;
  frequency: MedicationFrequency;
  customFrequency?: string;
  instructions?: string;
  mealTiming: MealTiming;
  startDate: Date;
  endDate?: Date;
}

export interface UpdateMedicationData extends Partial<CreateMedicationData> {
  id: string;
}

export interface DiscontinueMedicationData {
  id: string;
  reason?: string;
}

export const FREQUENCY_LABELS: Record<MedicationFrequency, string> = {
  [MedicationFrequency.ONCE_DAILY]: 'Once daily',
  [MedicationFrequency.TWICE_DAILY]: 'Twice daily',
  [MedicationFrequency.THREE_TIMES_DAILY]: 'Three times daily',
  [MedicationFrequency.FOUR_TIMES_DAILY]: 'Four times daily',
  [MedicationFrequency.EVERY_OTHER_DAY]: 'Every other day',
  [MedicationFrequency.WEEKLY]: 'Weekly',
  [MedicationFrequency.AS_NEEDED]: 'As needed',
  [MedicationFrequency.CUSTOM]: 'Custom schedule'
};

export const MEAL_TIMING_LABELS: Record<MealTiming, string> = {
  [MealTiming.NONE]: 'No specific timing',
  [MealTiming.BEFORE_MEALS]: 'Before meals',
  [MealTiming.WITH_MEALS]: 'With meals',
  [MealTiming.AFTER_MEALS]: 'After meals',
  [MealTiming.ON_EMPTY_STOMACH]: 'On empty stomach',
  [MealTiming.WITH_FOOD]: 'With food'
};

// Medication History Types
export enum MedicationHistoryAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DISCONTINUED = 'DISCONTINUED',
  REACTIVATED = 'REACTIVATED',
  DOSAGE_CHANGED = 'DOSAGE_CHANGED',
  FREQUENCY_CHANGED = 'FREQUENCY_CHANGED',
  INSTRUCTIONS_UPDATED = 'INSTRUCTIONS_UPDATED'
}

export interface MedicationHistoryEntry {
  id: string;
  medicationId: string;
  action: MedicationHistoryAction;
  changedBy: string; // therapist ID
  changedAt: Date;
  previousValues?: Prisma.JsonValue;
  newValues?: Prisma.JsonValue;
  reason?: string;
  notes?: string;
  therapist?: {
    user: {
      name: string;
    };
  };
}

export interface MedicationWithHistory extends Medication {
  history: MedicationHistoryEntry[];
}

export const HISTORY_ACTION_LABELS: Record<MedicationHistoryAction, string> = {
  [MedicationHistoryAction.CREATED]: 'Created',
  [MedicationHistoryAction.UPDATED]: 'Updated',
  [MedicationHistoryAction.DISCONTINUED]: 'Discontinued',
  [MedicationHistoryAction.REACTIVATED]: 'Reactivated',
  [MedicationHistoryAction.DOSAGE_CHANGED]: 'Dosage Changed',
  [MedicationHistoryAction.FREQUENCY_CHANGED]: 'Frequency Changed',
  [MedicationHistoryAction.INSTRUCTIONS_UPDATED]: 'Instructions Updated'
};
