"use client";

import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore, QuizData } from '@/store/quizStore';
import { QuizQuestion } from '@/lib/quizData';
import { FaRegCircle, FaDotCircle } from 'react-icons/fa';
import { z } from 'zod';

interface QuizStepProps {
    question: QuizQuestion;
    validationSchema: z.ZodObject<z.ZodRawShape>;
    isLastStep: boolean;
    onNext: () => void;
    onPrevious: () => void;
}

const QuizStep: React.FC<QuizStepProps> = ({
    question,
    validationSchema,
    isLastStep,
    onNext,
    onPrevious,
}) => {
    const { currentStep, quizData, updateQuizData } = useQuizStore();

    const getCurrentValue = useCallback(() => {
        const value = quizData[question.fieldName as keyof typeof quizData];
        if (question.inputType === 'checkbox') {
            return Array.isArray(value) ? value : [];
        }
        return value || (question.inputType === 'rating' ? 3 : '');
    }, [quizData, question.fieldName, question.inputType]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm({
        resolver: zodResolver(validationSchema),
        mode: 'onChange',
    });

    const watchedValue = watch();

    useEffect(() => {
        if (question.fieldName === 'gender') {
            setValue('gender', quizData.gender || '');
            setValue('age', quizData.age || '');
        } else if (question.inputType === 'checkbox') {
            const currentValue = getCurrentValue();
            setValue('selections', currentValue);
        } else if (question.inputType === 'rating') {
            const currentValue = getCurrentValue();
            setValue('rating', currentValue || 3);
        } else if (question.inputType === 'textarea') {
            const currentValue = getCurrentValue();
            setValue('expectations', currentValue);
        } else if (question.fieldName === 'commitmentLevel') {
            const currentValue = getCurrentValue();
            setValue('commitment', currentValue);
        } else {
            const currentValue = getCurrentValue();
            setValue('selection', currentValue);
        }
    }, [question.fieldName, question.inputType, setValue, quizData, getCurrentValue]);

    const onSubmit = (data: z.infer<typeof validationSchema>) => {
        const fieldName = question.fieldName as keyof QuizData;

        if (fieldName === 'gender') {
            updateQuizData('gender', data.gender as string);
            updateQuizData('age', data.age as number);
        } else if (question.inputType === 'checkbox') {
            updateQuizData(fieldName, data.selections as string[] || []);
        } else if (question.inputType === 'rating') {
            updateQuizData(fieldName, data.rating as number);
        } else if (question.inputType === 'textarea') {
            updateQuizData(fieldName, data.expectations as string);
        } else if (fieldName === 'commitmentLevel') {
            updateQuizData(fieldName, data.commitment as string);
        } else {
            updateQuizData(fieldName, data.selection as string);
        }

        onNext();
    };

    const handleBack = () => {
        onPrevious();
    };

    const handleCheckboxChange = (optionValue: string) => {
        const currentSelections = Array.isArray(watchedValue.selections) ? watchedValue.selections : [];
        let newSelections: string[];

        if (currentSelections.includes(optionValue)) {
            newSelections = currentSelections.filter((val: string) => val !== optionValue);
        } else {
            newSelections = [...currentSelections, optionValue];
        }

        setValue('selections', newSelections);
        updateQuizData(question.fieldName as keyof QuizData, newSelections);
    };

    const renderAgeInput = () => (
        <div className="mt-6">
            <label className="block text-sm font-medium text-foreground mb-2">
                Age
            </label>
            <input
                type="number"
                {...register('age', { valueAsNumber: true })}
                className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="Enter your age"
                min="13"
                max="120"
            />
            {errors.age && (
                <p className="text-destructive text-sm mt-1">{String(errors.age?.message)}</p>
            )}
        </div>
    );

    const renderInput = () => {
        switch (question.inputType) {
            case 'radio':
                return (
                    <div className="space-y-4">
                        {question.options?.map((option) => (
                            <label
                                key={option.value}
                                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200
                  ${watchedValue.gender === option.value || watchedValue.selection === option.value || watchedValue.commitment === option.value
                                        ? 'text-white shadow-md'
                                        : 'bg-card text-foreground border-border hover:bg-accent hover:border-primary/20'}`}
                                style={watchedValue.gender === option.value || watchedValue.selection === option.value || watchedValue.commitment === option.value
                                    ? { backgroundColor: '#8159A8', borderColor: '#8159A8' }
                                    : {}}
                            >
                                <input
                                    type="radio"
                                    {...register(question.fieldName === 'gender' ? 'gender' : question.fieldName === 'commitmentLevel' ? 'commitment' : 'selection')}
                                    value={option.value}
                                    className="hidden"
                                />
                                {option.icon && (
                                    <option.icon className="mr-4 text-2xl" />
                                )}
                                <span className="font-medium">{option.label}</span>
                            </label>
                        ))}
                        {question.fieldName === 'gender' && renderAgeInput()}
                    </div>
                );
            case 'checkbox':
                return (
                    <div className="space-y-4">
                        {question.options?.map((option) => (
                            <label
                                key={option.value}
                                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200
                  ${Array.isArray(watchedValue.selections) && watchedValue.selections.includes(option.value)
                                        ? 'text-white shadow-md'
                                        : 'bg-card text-foreground border-border hover:bg-accent hover:border-primary/20'}`}
                                style={Array.isArray(watchedValue.selections) && watchedValue.selections.includes(option.value)
                                    ? { backgroundColor: '#8159A8', borderColor: '#8159A8' }
                                    : {}}
                            >
                                <input
                                    type="checkbox"
                                    value={option.value}
                                    className="hidden"
                                    onChange={() => handleCheckboxChange(option.value)}
                                    checked={Array.isArray(watchedValue.selections) && watchedValue.selections.includes(option.value)}
                                />
                                <span className="relative mr-4 w-6 h-6 flex items-center justify-center">
                                    {Array.isArray(watchedValue.selections) && watchedValue.selections.includes(option.value) ? (
                                        <FaDotCircle className="text-white text-lg" />
                                    ) : (
                                        <FaRegCircle className="text-muted-foreground text-lg" />
                                    )}
                                </span>
                                {option.icon && (
                                    <option.icon className="mr-4 text-2xl" />
                                )}
                                <span className="font-medium">{option.label}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'rating':
                return (
                    <div className="flex justify-center space-x-2">
                        {question.options?.map((option) => (
                            <label
                                key={option.value}
                                className={`flex items-center justify-center w-12 h-12 border rounded-full cursor-pointer transition-all duration-200
                                    ${(watchedValue.rating || '3').toString() === option.value
                                        ? 'text-white shadow-md'
                                        : 'bg-card text-foreground border-border hover:bg-accent hover:border-primary/20'}`}
                                style={(watchedValue.rating || '3').toString() === option.value
                                    ? { backgroundColor: '#8159A8', borderColor: '#8159A8' }
                                    : {}}
                            >
                                <input
                                    type="radio"
                                    {...register('rating', { valueAsNumber: true })}
                                    value={option.value}
                                    className="hidden"
                                    onChange={(e) => setValue('rating', parseInt(e.target.value, 10))}
                                />
                                <span className="text-lg font-semibold">{option.label}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'textarea':
                return (
                    <div>
                        <textarea
                            {...register('expectations')}
                            className="w-full p-4 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-32 bg-background text-foreground"
                            rows={4}
                            placeholder="Share your thoughts and goals..."
                        />
                        {errors.expectations && (
                            <p className="text-destructive text-sm mt-1">{String(errors.expectations?.message)}</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl mx-auto"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-4">
                            {question.question}
                        </h2>
                        {question.description && (
                            <p className="text-lg text-muted-foreground">
                                {question.description}
                            </p>
                        )}
                    </div>

                    <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
                        {renderInput()}
                    </div>

                    <div className="flex justify-between pt-6">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition duration-200 font-medium"
                            >
                                Previous
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-8 py-3 text-white rounded-lg transition duration-200 font-medium disabled:bg-muted shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            style={{ backgroundColor: '#8159A8' }}
                        >
                            {isLastStep ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </AnimatePresence>
    );
};

export default QuizStep;
