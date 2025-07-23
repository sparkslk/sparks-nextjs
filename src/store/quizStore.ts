"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuizData {
    // Personal Information
    gender?: string;
    age?: number;

    // Well-being Assessment (Questions 1-15)
    wellbeingQ1?: number; // Energy levels
    wellbeingQ2?: number; // Sleep quality
    wellbeingQ3?: number; // Stress levels
    wellbeingQ4?: number; // Emotional balance
    wellbeingQ5?: number; // Life satisfaction
    wellbeingQ6?: number; // Physical health
    wellbeingQ7?: number; // Mental clarity
    wellbeingQ8?: number; // Social connections
    wellbeingQ9?: number; // Work-life balance
    wellbeingQ10?: number; // Self-confidence
    wellbeingQ11?: number; // Motivation levels
    wellbeingQ12?: number; // Coping with challenges
    wellbeingQ13?: number; // Overall happiness
    wellbeingQ14?: number; // Sense of purpose
    wellbeingQ15?: number; // Future optimism

    // Habits & Goals (Questions 16-23)
    exerciseHabits?: string[];
    nutritionGoals?: string[];
    stressManagement?: string[];
    sleepHabits?: string;
    socialActivities?: string[];
    personalGrowth?: string[];
    workLifeBalance?: string[];
    mindfulnessPractices?: string[];

    // Program Understanding (Questions 24-26)
    programExpectations?: string;
    commitmentLevel?: string;
    supportPreferences?: string[];
}

interface QuizStore {
    currentStep: number;
    totalSteps: number;
    quizData: QuizData;
    sessionId: string;

    // Actions
    nextStep: () => void;
    prevStep: () => void;
    setStep: (step: number) => void;
    updateQuizData: <K extends keyof QuizData>(key: K, value: QuizData[K]) => void;
    setQuizData: (data: Partial<QuizData>) => void;
    resetQuiz: () => void;
    generateSessionId: () => void;
}

const generateRandomSessionId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const useQuizStore = create<QuizStore>()(
    persist(
        (set, get) => ({
            currentStep: 1,
            totalSteps: 26,
            quizData: {},
            sessionId: generateRandomSessionId(),

            nextStep: () => {
                const { currentStep, totalSteps } = get();
                if (currentStep < totalSteps) {
                    set({ currentStep: currentStep + 1 });
                }
            },

            prevStep: () => {
                const { currentStep } = get();
                if (currentStep > 1) {
                    set({ currentStep: currentStep - 1 });
                }
            },

            setStep: (step: number) => {
                const { totalSteps } = get();
                if (step >= 1 && step <= totalSteps) {
                    set({ currentStep: step });
                }
            },

            updateQuizData: (key, value) => {
                set((state) => ({
                    quizData: {
                        ...state.quizData,
                        [key]: value,
                    },
                }));
            },

            setQuizData: (data) => {
                set((state) => ({
                    quizData: {
                        ...state.quizData,
                        ...data,
                    },
                }));
            },

            resetQuiz: () => {
                set({
                    currentStep: 1,
                    quizData: {},
                    sessionId: generateRandomSessionId(),
                });
            },

            generateSessionId: () => {
                set({ sessionId: generateRandomSessionId() });
            },
        }),
        {
            name: 'sparks-quiz-storage',
            partialize: (state) => ({
                currentStep: state.currentStep,
                quizData: state.quizData,
                sessionId: state.sessionId,
            }),
        }
    )
);
