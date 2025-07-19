import { MedicationFrequency, MealTiming, CreateMedicationData } from '@/types/medications';

/**
 * Medication API utilities for easy interaction with the medication endpoints
 */
export class MedicationAPI {
  static async getMedications(patientId: string) {
    const response = await fetch(`/api/therapist/patients/${patientId}/medications`);
    if (!response.ok) {
      throw new Error(`Failed to fetch medications: ${response.statusText}`);
    }
    return response.json();
  }

  static async createMedication(patientId: string, medicationData: CreateMedicationData) {
    const response = await fetch(`/api/therapist/patients/${patientId}/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicationData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create medication');
    }
    
    return response.json();
  }

  static async updateMedication(patientId: string, medicationId: string, medicationData: Partial<CreateMedicationData>) {
    const response = await fetch(`/api/therapist/patients/${patientId}/medications/${medicationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicationData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update medication');
    }
    
    return response.json();
  }

  static async discontinueMedication(patientId: string, medicationId: string, reason?: string) {
    const response = await fetch(`/api/therapist/patients/${patientId}/medications/${medicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: medicationId, reason }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to discontinue medication');
    }
    
    return response.json();
  }
}

/**
 * Example usage and test data
 */
export const exampleMedications: CreateMedicationData[] = [
  {
    patientId: '', // Will be filled at runtime
    name: 'Adderall XR',
    dosage: '20mg',
    frequency: MedicationFrequency.TWICE_DAILY,
    instructions: 'Take in the morning and early afternoon. Do not take after 4 PM to avoid sleep issues.',
    mealTiming: MealTiming.WITH_FOOD,
    
    startDate: new Date(),
  },
  {
    patientId: '', // Will be filled at runtime
    name: 'Strattera',
    dosage: '40mg',
    frequency: MedicationFrequency.ONCE_DAILY,
    instructions: 'Take at the same time each day, preferably in the morning.',
    mealTiming: MealTiming.NONE,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
  },
  {
    patientId: '', // Will be filled at runtime
    name: 'Concerta',
    dosage: '18mg',
    frequency: MedicationFrequency.EVERY_OTHER_DAY,
    instructions: 'Take every other day in the morning. Swallow whole, do not crush or chew.',
    mealTiming: MealTiming.BEFORE_MEALS,
    startDate: new Date(),
  },
  {
    patientId: '', // Will be filled at runtime
    name: 'Vitamin D3',
    dosage: '1000 IU',
    frequency: MedicationFrequency.CUSTOM,
    customFrequency: 'Monday, Wednesday, Friday',
    instructions: 'Take with the largest meal of the day for better absorption.',
    mealTiming: MealTiming.WITH_MEALS,
    startDate: new Date(),
  },
];

/**
 * Helper function to create sample medications for testing
 */
export async function createSampleMedications(patientId: string) {
  try {
    const results = [];
    for (const med of exampleMedications) {
      const medicationData = { ...med, patientId };
      const result = await MedicationAPI.createMedication(patientId, medicationData);
      results.push(result);
    }
    return results;
  } catch (error) {
    console.error('Error creating sample medications:', error);
    throw error;
  }
}
