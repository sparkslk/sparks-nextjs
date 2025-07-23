"use client";

import React from 'react';

interface QuizProgressProps {
    currentStep: number;
    totalSteps: number;
}

const QuizProgress: React.FC<QuizProgressProps> = ({ currentStep, totalSteps }) => {
    const progressPercentage = (currentStep / totalSteps) * 100;

    return (
        <div className="w-full mb-8">
            {/* Step counter */}
            <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-foreground">
                    Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-muted-foreground">
                    {Math.round(progressPercentage)}% complete
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ 
                        width: `${progressPercentage}%`,
                        background: 'linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)'
                    }}
                />
            </div>

            {/* Progress dots for smaller screens */}
            <div className="hidden sm:flex justify-center mt-4 space-x-2">
                {Array.from({ length: totalSteps }, (_, index) => {
                    const step = index + 1;
                    const isCompleted = step < currentStep;
                    const isCurrent = step === currentStep;

                    return (
                        <div
                            key={step}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${isCompleted || isCurrent
                                    ? ''
                                    : 'bg-muted'
                                }`}
                            style={isCompleted || isCurrent
                                ? { backgroundColor: '#8159A8', transform: isCurrent ? 'scale(1.25)' : 'scale(1)' }
                                : {}}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default QuizProgress;
