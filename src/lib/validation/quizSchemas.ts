import { z } from 'zod';

// Personal Information Schema (Step 1)
export const PersonalInfoSchema = z.object({
    gender: z.string().min(1, "Please select your gender"),
    age: z.number().min(13, "Age must be at least 13").max(120, "Please enter a valid age"),
});

// Well-being Assessment Schemas (Steps 2-16)
export const WellbeingQuestionSchema = z.object({
    rating: z.number().min(1, "Please select a rating").max(10, "Rating must be between 1-10"),
});

// Habits Selection Schemas (Steps 17-24)
export const MultiSelectSchema = z.object({
    selections: z.array(z.string()).min(1, "Please select at least one option"),
});

export const SingleSelectSchema = z.object({
    selection: z.string().min(1, "Please make a selection"),
});

// Program Understanding Schemas (Steps 25-26)
export const ProgramExpectationsSchema = z.object({
    expectations: z.string().min(10, "Please provide at least 10 characters"),
});

export const CommitmentLevelSchema = z.object({
    commitment: z.string().min(1, "Please select your commitment level"),
});

export const SupportPreferencesSchema = z.object({
    preferences: z.array(z.string()).min(1, "Please select at least one support preference"),
});

// Mapping step numbers to their corresponding schemas
export const stepSchemas = {
    1: PersonalInfoSchema,
    2: WellbeingQuestionSchema,
    3: WellbeingQuestionSchema,
    4: WellbeingQuestionSchema,
    5: WellbeingQuestionSchema,
    6: WellbeingQuestionSchema,
    7: WellbeingQuestionSchema,
    8: WellbeingQuestionSchema,
    9: WellbeingQuestionSchema,
    10: WellbeingQuestionSchema,
    11: WellbeingQuestionSchema,
    12: WellbeingQuestionSchema,
    13: WellbeingQuestionSchema,
    14: WellbeingQuestionSchema,
    15: WellbeingQuestionSchema,
    16: WellbeingQuestionSchema,
    17: MultiSelectSchema,
    18: MultiSelectSchema,
    19: MultiSelectSchema,
    20: SingleSelectSchema,
    21: MultiSelectSchema,
    22: MultiSelectSchema,
    23: MultiSelectSchema,
    24: MultiSelectSchema,
    25: ProgramExpectationsSchema,
    26: CommitmentLevelSchema,
} as const;

// Complete quiz schema for final validation
export const CompleteQuizSchema = z.object({
    gender: z.string().min(1),
    age: z.number().min(13).max(120),
    wellbeingQ1: z.number().min(1).max(10),
    wellbeingQ2: z.number().min(1).max(10),
    wellbeingQ3: z.number().min(1).max(10),
    wellbeingQ4: z.number().min(1).max(10),
    wellbeingQ5: z.number().min(1).max(10),
    wellbeingQ6: z.number().min(1).max(10),
    wellbeingQ7: z.number().min(1).max(10),
    wellbeingQ8: z.number().min(1).max(10),
    wellbeingQ9: z.number().min(1).max(10),
    wellbeingQ10: z.number().min(1).max(10),
    wellbeingQ11: z.number().min(1).max(10),
    wellbeingQ12: z.number().min(1).max(10),
    wellbeingQ13: z.number().min(1).max(10),
    wellbeingQ14: z.number().min(1).max(10),
    wellbeingQ15: z.number().min(1).max(10),
    exerciseHabits: z.array(z.string()).min(1),
    nutritionGoals: z.array(z.string()).min(1),
    stressManagement: z.array(z.string()).min(1),
    sleepHabits: z.string().min(1),
    socialActivities: z.array(z.string()).min(1),
    personalGrowth: z.array(z.string()).min(1),
    workLifeBalance: z.array(z.string()).min(1),
    mindfulnessPractices: z.array(z.string()).min(1),
    programExpectations: z.string().min(10),
    commitmentLevel: z.string().min(1),
});

export type CompleteQuizData = z.infer<typeof CompleteQuizSchema>;
