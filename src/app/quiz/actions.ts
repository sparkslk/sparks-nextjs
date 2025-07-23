"use server";

import { z } from 'zod';
import { QuizStatus, PrismaClient } from '@prisma/client';
import { CompleteQuizSchema } from '@/lib/validation/quizSchemas';

const prisma = new PrismaClient();

export async function submitQuiz(formData: FormData) {
    try {
        const data = JSON.parse(formData.get('quizData') as string);
        const sessionId = formData.get('sessionId') as string;
        const userId = formData.get('userId') as string | null;

        // Validate the complete quiz data
        const validatedData = CompleteQuizSchema.parse(data);

        // Save to database
        const result = await prisma.quizSubmission.create({
            data: {
                userId: userId || null,
                sessionId: sessionId,
                responses: validatedData,
                currentStep: 26,
                completionStatus: QuizStatus.COMPLETED,
                completedAt: new Date(),
            },
        });

        return {
            success: true,
            message: 'Quiz submitted successfully!',
            resultId: result.id,
        };
    } catch (error) {
        console.error('Error submitting quiz:', error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                message: 'Validation error: Please check your responses.',
                errors: error.issues,
            };
        }

        return {
            success: false,
            message: 'An error occurred while submitting your quiz. Please try again.',
        };
    }
}

export async function saveQuizProgress(formData: FormData) {
    try {
        const data = JSON.parse(formData.get('quizData') as string);
        const sessionId = formData.get('sessionId') as string;
        const userId = formData.get('userId') as string | null;
        const currentStep = parseInt(formData.get('currentStep') as string);

        // Check if a quiz result already exists for this session
        const existingResult = await prisma.quizSubmission.findFirst({
            where: {
                OR: [
                    { sessionId: sessionId },
                    { userId: userId || undefined },
                ],
            },
        });

        if (existingResult) {
            // Update existing record
            const updatedResult = await prisma.quizSubmission.update({
                where: { id: existingResult.id },
                data: {
                    responses: data,
                    currentStep: currentStep,
                    updatedAt: new Date(),
                },
            });

            return {
                success: true,
                message: 'Progress saved successfully!',
                resultId: updatedResult.id,
            };
        } else {
            // Create new record
            const newResult = await prisma.quizSubmission.create({
                data: {
                    userId: userId || null,
                    sessionId: sessionId,
                    responses: data,
                    currentStep: currentStep,
                    completionStatus: QuizStatus.IN_PROGRESS,
                },
            });

            return {
                success: true,
                message: 'Progress saved successfully!',
                resultId: newResult.id,
            };
        }
    } catch (error) {
        console.error('Error saving quiz progress:', error);
        return {
            success: false,
            message: 'An error occurred while saving your progress.',
        };
    }
}

export async function loadQuizProgress(sessionId: string, userId?: string) {
    try {
        const result = await prisma.quizSubmission.findFirst({
            where: {
                OR: [
                    { sessionId: sessionId },
                    { userId: userId || undefined },
                ],
            },
            orderBy: { updatedAt: 'desc' },
        });

        if (result) {
            return {
                success: true,
                data: {
                    currentStep: result.currentStep,
                    quizData: result.responses,
                    completionStatus: result.completionStatus,
                },
            };
        }

        return {
            success: false,
            message: 'No saved progress found.',
        };
    } catch (error) {
        console.error('Error loading quiz progress:', error);
        return {
            success: false,
            message: 'An error occurred while loading your progress.',
        };
    }
}
