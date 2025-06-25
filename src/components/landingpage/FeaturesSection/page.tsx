import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const FeatureCard = ({ title, description, icon, color }: FeatureCardProps) => (
    <Card className="text-center hover:shadow-lg transition-shadow p-1 sm:p-0">
        <CardHeader className="p-4 sm:p-6">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 ${color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                {icon}
            </div>
            <CardTitle className="text-base sm:text-lg mb-2">{title}</CardTitle>
            <CardDescription className="text-xs sm:text-sm leading-relaxed">
                {description}
            </CardDescription>
        </CardHeader>
    </Card>
);

export default function FeaturesSection() {
    return (
        <section className="py-12 sm:py-16 px-4">
            <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
                    SPARKS is a system of tools
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-2 leading-relaxed">
                    Unlike single-function apps, we provide comprehensive support covering all aspects of ADHD management.
                </p>
            </div>

            <div className="grid gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
                <FeatureCard
                    title="ADHD Assessment"
                    description="Comprehensive screening tools aligned with Sri Lankan healthcare standards"
                    icon={
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    }
                    color="bg-blue-100"
                />
                <FeatureCard
                    title="Daily Management"
                    description="Track symptoms, mood, and progress with personalized insights and recommendations"
                    icon={
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    }
                    color="bg-green-100"
                />
                <FeatureCard
                    title="Education & Resources"
                    description="Localized content about ADHD, coping strategies, and family support guides"
                    icon={
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    }
                    color="bg-purple-100"
                />
                <FeatureCard
                    title="Community Support"
                    description="Connect with families, professionals, and support groups in Sri Lanka"
                    icon={
                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                    color="bg-orange-100"
                />
            </div>
        </section>
    );
}
