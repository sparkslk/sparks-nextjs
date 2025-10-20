"use client";

import { useState, useEffect } from "react";
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
    Pill,
    UserCheck,
    Activity,
    Video
} from "lucide-react";
import Header from "@/components/landingpage/Header/page";
import Footer from "@/components/landingpage/Footer/page";

interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    features: string[];
    index: number;
    isVisible: boolean;
}

const FeatureCard = ({ title, description, icon, features, index, isVisible }: FeatureCardProps) => (
    <div
        className={`
            group transition-all duration-600 transform h-full
            ${isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}
        `}
        style={{
            transitionDelay: `${index * 100}ms`,
            transitionDuration: "600ms",
        }}
    >
        <Card className="h-full text-center hover:shadow-lg transition-all duration-300 border-gray-100 hover:border-gray-200 bg-white">
            <CardHeader className="pb-4 relative">
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:shadow-lg transition-all duration-300"
                    style={{ backgroundColor: "rgba(129, 89, 168, 0.1)" }}
                >
                    <div style={{ color: "#8159A8" }}>{icon}</div>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-3">{title}</CardTitle>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                    {description}
                </CardDescription>

                {/* Subtle hover accent */}
                <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                    style={{ backgroundColor: "#8159A8" }}
                ></div>
            </CardHeader>
            <CardContent className="pt-0">
                <ul className="space-y-2 text-left">
                    {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <div
                                className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                                style={{ backgroundColor: "#8159A8" }}
                            />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    </div>
);

interface BenefitProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    index: number;
    isVisible: boolean;
}

const Benefit = ({ title, description, icon, index, isVisible }: BenefitProps) => (
    <div
        className={`
            flex items-start gap-4 p-6 rounded-2xl bg-white border border-gray-100 
            hover:shadow-md transition-all duration-500 transform
            ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
        `}
        style={{
            transitionDelay: `${index * 100}ms`,
        }}
    >
        <div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "rgba(129, 89, 168, 0.1)" }}
        >
            <div style={{ color: "#8159A8" }}>{icon}</div>
        </div>
        <div>
            <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
    </div>
);

export default function FeaturesPage() {
    const [visibleItems, setVisibleItems] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisibleItems(true);
        }, 200);
        return () => clearTimeout(timer);
    }, []);

    const coreFeatures = [
        {
            title: "ADHD Quiz & Assessment",
            description: "Interactive screening tools to help identify ADHD symptoms and track progress over time",
            icon: <ClipboardList className="h-8 w-8" />,
            features: [
                "Evidence-based ADHD screening questionnaires",
                "Age-appropriate assessment tools",
                "Instant results and recommendations",
                "Progress tracking over time"
            ]
        },
        {
            title: "Find & Connect with Therapists",
            description: "Browse qualified therapists, view their profiles, and connect with the right professional for you",
            icon: <Users className="h-8 w-8" />,
            features: [
                "Browse licensed therapist directory",
                "View therapist specializations",
                "Send connection requests",
                "Check therapist availability"
            ]
        },
        {
            title: "Therapy Session Management",
            description: "Schedule, manage, and track all your therapy sessions in one convenient place",
            icon: <Calendar className="h-8 w-8" />,
            features: [
                "Book online sessions",
                "Flexible rescheduling options",
                "Session notes and documentation",
                "Video call integration for sessions",
                "Session history and progress reports"
            ]
        },
        {
            title: "Medication Management",
            description: "Track medications, set reminders, and monitor treatment effectiveness",
            icon: <Pill className="h-8 w-8" />,
            features: [
                "Medication schedule and reminders",
                "Dosage tracking and history",
                "Share medication info with therapist"
            ]
        },
        {
            title: "Appointment Scheduling",
            description: "Comprehensive calendar system with automated reminders and notifications",
            icon: <Activity className="h-8 w-8" />,
            features: [
                "Integrated calendar view",
                "Automated appointment reminders",
                "Cancellation and refund management",
                "Real-time availability updates"
            ]
        },
        {
            title: "Parent-Child Management",
            description: "Enable parents to monitor and support their children's ADHD journey",
            icon: <UserCheck className="h-8 w-8" />,
            features: [
                "Link parent and child accounts",
                "Monitor treatment progress",
                "Access child's session notes",
                "Communication with therapists",
                "Shared appointment calendar"
            ]
        },
        {
            title: "Secure Messaging & Chat",
            description: "End-to-end encrypted communication platform for secure conversations",
            icon: <MessageSquare className="h-8 w-8" />,
            features: [
                "End-to-end encrypted messaging",
                "Real-time chat with therapists",
                "File and document sharing",
                "Message history and search"
            ]
        },
        {
            title: "Progress Tracking & Analytics",
            description: "Visualize your treatment journey with comprehensive progress reports and insights",
            icon: <BarChart3 className="h-8 w-8" />,
            features: [
                "Treatment progress dashboards",
                "Session completion tracking",
                "Goal achievement monitoring",
                "Visual progress charts",
                "Exportable reports for healthcare providers"
            ]
        },
        {
            title: "Educational Resources & Blog",
            description: "Access curated ADHD resources, articles, and community support content",
            icon: <BookOpen className="h-8 w-8" />,
            features: [
                "ADHD awareness articles and guides",
                "Expert blog posts and tips",
                "Coping strategies and techniques",
                "Community success stories",
                "Downloadable resources and worksheets"
            ]
        }
    ];

    const benefits = [
        {
            title: "Culturally Appropriate Care",
            description: "Designed specifically for Sri Lankan communities with cultural sensitivity and local context",
            icon: <Heart className="h-5 w-5" />
        },
        {
            title: "Secure & Private",
            description: "End-to-end encryption and robust security measures to protect your sensitive data",
            icon: <Shield className="h-5 w-5" />
        },
        {
            title: "Mobile-First Design",
            description: "Optimized for mobile devices with responsive design for seamless access anywhere",
            icon: <Smartphone className="h-5 w-5" />
        },
        {
            title: "Accessible Nationwide",
            description: "Available across Sri Lanka with support for rural and urban communities",
            icon: <Globe className="h-5 w-5" />
        },
        {
            title: "Video Consultation Ready",
            description: "Built-in video call integration for convenient online therapy sessions",
            icon: <Video className="h-5 w-5" />
        },
        {
            title: "Comprehensive Platform",
            description: "All-in-one solution covering assessment, treatment, communication, and support",
            icon: <Activity className="h-5 w-5" />
        }
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#F5F3FB" }}>
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <Badge
                        variant="secondary"
                        className="mb-4 px-4 py-2 text-sm font-medium"
                        style={{ backgroundColor: "rgba(129, 89, 168, 0.1)", color: "#8159A8" }}
                    >
                        COMPREHENSIVE ADHD PLATFORM
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Discover{" "}
                        <span
                            style={{
                                background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            SPARKS
                        </span>{" "}
                        Features
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
                        Explore our comprehensive suite of tools designed specifically for ADHD management
                        and support in Sri Lankan communities. From assessment to therapy, we&apos;ve got you covered.
                    </p>
                    <div className="w-20 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto rounded-full mt-6"></div>
                </div>

                {/* Core Features */}
                <section className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            <span
                                style={{
                                    background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                Core Features
                            </span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
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
                                features={feature.features}
                                index={index}
                                isVisible={visibleItems}
                            />
                        ))}
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Why Choose{" "}
                            <span
                                style={{
                                    background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                SPARKS
                            </span>
                            ?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
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
                                index={index}
                                isVisible={visibleItems}
                            />
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section
                    className="text-center rounded-2xl p-8 md:p-12 text-white shadow-lg"
                    style={{
                        background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                    }}
                >
                    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-xl mb-6 opacity-90 max-w-2xl mx-auto font-light">
                        Join thousands of families across Sri Lanka who are already using SPARKS
                        to manage ADHD and improve their quality of life.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/signup">
                            <Button
                                size="lg"
                                className="text-lg px-8 py-6 bg-white hover:bg-gray-100 shadow-md"
                                style={{ color: "#8159A8" }}
                            >
                                Start Your Journey
                                <svg
                                    className="h-5 w-5 ml-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-[#8159A8] transition-all"
                            >
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
