"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ClipboardList,
    Users,
    Calendar,
    MessageSquare,
    BarChart3,
    BookOpen,
    Heart,
    Shield,
    Smartphone,
    Globe,
    Stethoscope,
    Brain,
    ArrowRight,
    CheckCircle
} from "lucide-react";
import Header from "@/components/landingpage/Header/page";
import Footer from "@/components/landingpage/Footer/page";

interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    features: string[];
}

const FeatureCard = ({ title, description, icon, color, features }: FeatureCardProps) => (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
            <CardDescription className="text-muted-foreground leading-relaxed">
                {description}
            </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
            <ul className="space-y-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
);

interface BenefitProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const Benefit = ({ title, description, icon }: BenefitProps) => (
    <div className="flex items-start gap-4 p-6 rounded-lg bg-card/30 border hover:shadow-md transition-shadow">
        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
    </div>
);

export default function FeaturesPage() {
    const coreFeatures = [
        {
            title: "ADHD Assessment Tools",
            description: "Comprehensive screening and diagnostic tools aligned with Sri Lankan healthcare standards",
            icon: <ClipboardList className="h-6 w-6 text-blue-600" />,
            color: "bg-blue-100",
            features: [
                "Evidence-based assessment questionnaires",
                "Age-appropriate screening tools",
                "Progress tracking and monitoring",
                "Detailed reporting for healthcare providers",
                "Multi-language support (Sinhala, Tamil, English)"
            ]
        },
        {
            title: "Therapy Management",
            description: "Connect with licensed therapists and manage your therapy journey seamlessly",
            icon: <Users className="h-6 w-6 text-green-600" />,
            color: "bg-green-100",
            features: [
                "Licensed therapist directory",
                "Online and in-person session booking",
                "Session notes and progress tracking",
                "Secure messaging with therapists",
                "Treatment plan management"
            ]
        },
        {
            title: "Appointment Scheduling",
            description: "Easy-to-use scheduling system for therapy sessions and medical appointments",
            icon: <Calendar className="h-6 w-6 text-purple-600" />,
            color: "bg-purple-100",
            features: [
                "Flexible scheduling options",
                "Automated reminders and notifications",
                "Rescheduling and cancellation management",
                "Calendar integration",
                "Multi-timezone support"
            ]
        },
        {
            title: "Family Communication",
            description: "Secure messaging platform for families, therapists, and healthcare providers",
            icon: <MessageSquare className="h-6 w-6 text-orange-600" />,
            color: "bg-orange-100",
            features: [
                "Secure, encrypted messaging",
                "Family group communications",
                "File and document sharing",
                "Emergency contact system",
                "Real-time notifications"
            ]
        },
        {
            title: "Progress Analytics",
            description: "Comprehensive tracking and reporting of ADHD management progress",
            icon: <BarChart3 className="h-6 w-6 text-red-600" />,
            color: "bg-red-100",
            features: [
                "Symptom tracking and trends",
                "Medication adherence monitoring",
                "Behavioral pattern analysis",
                "Goal setting and achievement tracking",
                "Comprehensive progress reports"
            ]
        },
        {
            title: "Educational Resources",
            description: "Localized ADHD education and support materials for Sri Lankan communities",
            icon: <BookOpen className="h-6 w-6 text-indigo-600" />,
            color: "bg-indigo-100",
            features: [
                "ADHD awareness and education content",
                "Coping strategies and techniques",
                "Family support guides",
                "School and workplace accommodations",
                "Local support group directories"
            ]
        }
    ];

    const benefits = [
        {
            title: "Culturally Appropriate Care",
            description: "Designed specifically for Sri Lankan communities with cultural sensitivity and local context",
            icon: <Heart className="h-5 w-5 text-primary" />
        },
        {
            title: "Secure & Private",
            description: "End-to-end encryption and HIPAA-compliant security measures to protect your data",
            icon: <Shield className="h-5 w-5 text-primary" />
        },
        {
            title: "Mobile-First Design",
            description: "Optimized for mobile devices with offline capabilities for uninterrupted access",
            icon: <Smartphone className="h-5 w-5 text-primary" />
        },
        {
            title: "Accessible Anywhere",
            description: "Available across Sri Lanka with support for rural and urban communities",
            icon: <Globe className="h-5 w-5 text-primary" />
        },
        {
            title: "Evidence-Based",
            description: "Built on proven ADHD research and best practices from international guidelines",
            icon: <Stethoscope className="h-5 w-5 text-primary" />
        },
        {
            title: "Holistic Approach",
            description: "Comprehensive support covering medical, educational, and social aspects of ADHD",
            icon: <Brain className="h-5 w-5 text-primary" />
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
                        COMPREHENSIVE ADHD PLATFORM
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Discover SPARKS{" "}
                        <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Features
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Explore our comprehensive suite of tools designed specifically for ADHD management
                        and support in Sri Lankan communities. From assessment to therapy, we&apos;ve got you covered.
                    </p>
                </div>

                {/* Core Features */}
                <section className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Core Features</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Everything you need for comprehensive ADHD support in one integrated platform
                        </p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {coreFeatures.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                title={feature.title}
                                description={feature.description}
                                icon={feature.icon}
                                color={feature.color}
                                features={feature.features}
                            />
                        ))}
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose SPARKS?</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Built specifically for Sri Lankan communities with unique advantages
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {benefits.map((benefit, index) => (
                            <Benefit
                                key={index}
                                title={benefit.title}
                                description={benefit.description}
                                icon={benefit.icon}
                            />
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl p-8 md:p-12">
                    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-xl mb-6 opacity-90 max-w-2xl mx-auto">
                        Join thousands of families across Sri Lanka who are already using SPARKS
                        to manage ADHD and improve their quality of life.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/signup">
                            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                                Start Your Journey
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
