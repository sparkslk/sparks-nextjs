import React from "react";

interface ADHDChallengeProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const ADHDChallenge = ({ icon, title, description }: ADHDChallengeProps) => (
    <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 rounded-lg bg-card/50 border hover:shadow-md transition-shadow">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
            {icon}
        </div>
        <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2 text-base sm:text-lg">{title}</h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{description}</p>
        </div>
    </div>
);

export default function ADHDChallengesSection() {
    return (
        <section className="py-12 sm:py-16 px-4">
            <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
                    Understanding ADHD Challenges
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-2 leading-relaxed">
                    ADHD affects individuals in multiple ways. Our platform addresses these core challenges comprehensively.
                </p>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                <ADHDChallenge
                    icon={
                        <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    }
                    title="Attention"
                    description="Difficulty focusing or sustaining attention on tasks, leading to incomplete work and missed details."
                />
                <ADHDChallenge
                    icon={
                        <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    }
                    title="Impulsivity"
                    description="Acting without thinking, interrupting others, and making hasty decisions without considering consequences."
                />
                <ADHDChallenge
                    icon={
                        <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    }
                    title="Hyperactivity"
                    description="Excessive movement, restlessness, and difficulty staying still in situations that require calm behavior."
                />
            </div>
        </section>
    );
}
