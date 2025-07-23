"use client";

import React from 'react';
import { useQuizStore } from '@/store/quizStore';
import { getQuestionById } from '@/lib/quizData';
import { stepSchemas } from '@/lib/validation/quizSchemas';
import QuizProgress from './QuizProgress';
import QuizStep from './QuizStep';
import { motion } from 'framer-motion';

const QuizLayout: React.FC = () => {
    const { currentStep, totalSteps, nextStep, prevStep, quizData } = useQuizStore();

    const currentQuestion = getQuestionById(currentStep);
    const validationSchema = stepSchemas[currentStep as keyof typeof stepSchemas];

    const handleNext = () => {
        if (currentStep < totalSteps) {
            nextStep();
        } else {
            // Handle quiz completion
            handleQuizComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            prevStep();
        }
    };

    const handleQuizComplete = async () => {
        try {
            const formData = new FormData();
            formData.append('quizData', JSON.stringify(quizData));
            formData.append('sessionId', useQuizStore.getState().sessionId);
            formData.append('userId', ''); // Add user ID if you have authentication

            const result = await fetch('/api/quiz', {
                method: 'POST',
                body: formData,
            });

            const response = await result.json();

            if (response.success) {
                alert('Quiz completed successfully! Thank you for your responses.');
                // You could redirect to a results page here
                // router.push('/quiz/results');
            } else {
                alert(response.message || 'There was an error submitting your quiz. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('There was an error submitting your quiz. Please try again.');
        }
    };

    if (!currentQuestion) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Question not found
                    </h1>
                    <p className="text-gray-600">
                        There was an error loading this question.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#F5F3FB" }}>
            <div className="container mx-auto px-4 py-8">
                {/* Header with Logo */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 pt-8"
                >
                    <div className="flex items-center justify-center mb-6">
                        <h1 className="text-4xl font-bold"
                            style={{
                                background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            SPARKS
                        </h1>
                    </div>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Personalized Well-Being Assessment
                    </p>
                </motion.header>

                {/* Progress Indicator */}
                <QuizProgress currentStep={currentStep} totalSteps={totalSteps} />

                {/* Quiz Step */}
                <QuizStep
                    question={currentQuestion}
                    validationSchema={validationSchema}
                    isLastStep={currentStep === totalSteps}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                />

                {/* Footer */}
                <motion.footer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-16 text-muted-foreground"
                >
                    <p>
                        Your responses are secure and will be used to create your personalized well-being plan.
                    </p>
                </motion.footer>
            </div>
        </div>
    );
};

export default QuizLayout;
