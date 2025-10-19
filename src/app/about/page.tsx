"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Brain,
    Users,
    TrendingUp,
    AlertTriangle,
    Heart,
    BookOpen,
    Stethoscope,
    GraduationCap,
    Home,
    ArrowRight,
    CheckCircle,
    Eye,
    Zap,
    Activity
} from "lucide-react";
import Header from "@/components/landingpage/Header/page";
import Footer from "@/components/landingpage/Footer/page";

interface SymptomCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    examples: string[];
    color: string;
}

const SymptomCard = ({ title, description, icon, examples, color }: SymptomCardProps) => (
    <Card className="h-full hover:shadow-lg transition-all duration-300">
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
            <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground mb-2">Common Examples:</h4>
                <ul className="space-y-1">
                    {examples.map((example, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                            <span>{example}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </CardContent>
    </Card>
);

interface StatisticProps {
    value: string;
    label: string;
    description: string;
    icon: React.ReactNode;
}

const Statistic = ({ value, label, description, icon }: StatisticProps) => (
    <div className="text-center p-6 rounded-lg bg-card/50 border">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            {icon}
        </div>
        <div className="text-3xl font-bold text-primary mb-2">{value}</div>
        <div className="font-semibold text-foreground mb-1">{label}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
    </div>
);

interface MythFactProps {
    myth: string;
    fact: string;
}

const MythFact = ({ myth, fact }: MythFactProps) => (
    <div className="grid md:grid-cols-2 gap-6 p-6 rounded-lg border bg-card/30">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-red-800 mb-2">Myth</h3>
                    <p className="text-red-700 text-sm">{myth}</p>
                </div>
            </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-green-800 mb-2">Fact</h3>
                    <p className="text-green-700 text-sm">{fact}</p>
                </div>
            </div>
        </div>
    </div>
);

export default function AboutADHDPage() {
    const symptoms = [
        {
            title: "Inattention",
            description: "Difficulty focusing or sustaining attention on tasks and activities",
            icon: <Eye className="h-6 w-6 text-blue-600" />,
            color: "bg-blue-100",
            examples: [
                "Difficulty paying attention to details",
                "Trouble following through on instructions",
                "Easily distracted by external stimuli",
                "Forgetful in daily activities",
                "Avoiding tasks requiring sustained mental effort"
            ]
        },
        {
            title: "Hyperactivity",
            description: "Excessive movement and restlessness, especially in inappropriate situations",
            icon: <Activity className="h-6 w-6 text-red-600" />,
            color: "bg-red-100",
            examples: [
                "Fidgeting with hands or feet",
                "Difficulty staying seated",
                "Running or climbing excessively",
                "Talking excessively",
                "Feeling restless or 'on the go'"
            ]
        },
        {
            title: "Impulsivity",
            description: "Acting without thinking, difficulty waiting, and interrupting others",
            icon: <Zap className="h-6 w-6 text-orange-600" />,
            color: "bg-orange-100",
            examples: [
                "Blurting out answers before questions are completed",
                "Difficulty waiting for their turn",
                "Interrupting or intruding on others",
                "Making decisions without considering consequences",
                "Acting on immediate impulses"
            ]
        }
    ];

    const statistics = [
        {
            value: "5-10%",
            label: "Global Prevalence",
            description: "of children worldwide have ADHD",
            icon: <Users className="h-6 w-6 text-primary" />
        },
        {
            value: "2:1",
            label: "Gender Ratio",
            description: "Boys are diagnosed twice as often as girls",
            icon: <TrendingUp className="h-6 w-6 text-primary" />
        },
        {
            value: "60%",
            label: "Continue to Adulthood",
            description: "of children with ADHD continue to have symptoms as adults",
            icon: <Brain className="h-6 w-6 text-primary" />
        },
        {
            value: "70%",
            label: "Genetic Component",
            description: "ADHD has a strong genetic component",
            icon: <Stethoscope className="h-6 w-6 text-primary" />
        }
    ];

    const mythsFacts = [
        {
            myth: "ADHD is just an excuse for bad behavior or poor parenting",
            fact: "ADHD is a legitimate neurodevelopmental disorder with biological basis. Brain imaging shows structural and functional differences in people with ADHD."
        },
        {
            myth: "Children with ADHD will outgrow it",
            fact: "While symptoms may change with age, about 60% of children with ADHD continue to experience symptoms into adulthood."
        },
        {
            myth: "ADHD medication is addictive and dangerous",
            fact: "When properly prescribed and monitored, ADHD medications are safe and effective. They actually reduce the risk of substance abuse."
        },
        {
            myth: "ADHD only affects boys",
            fact: "ADHD affects both boys and girls, though it may present differently. Girls are often underdiagnosed due to less obvious symptoms."
        },
        {
            myth: "People with ADHD can't be successful",
            fact: "Many successful people have ADHD. With proper support and treatment, people with ADHD can thrive in their careers and personal lives."
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
                        UNDERSTANDING ADHD
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        About{" "}
                        <span
                            style={{
                                background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            ADHD
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
                        Attention Deficit Hyperactivity Disorder (ADHD) is a neurodevelopmental condition
                        that affects millions of people worldwide. Learn about symptoms, causes, and treatment options.
                    </p>
                    <div className="w-20 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto rounded-full mt-6"></div>
                </div>

                {/* What is ADHD Section */}
                <section className="mb-16">
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-md border border-gray-100">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">What is ADHD?</h2>
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <p className="text-lg text-gray-600 leading-relaxed mb-4 font-light">
                                        ADHD is a neurodevelopmental disorder that affects both children and adults.
                                        It&apos;s characterized by persistent patterns of inattention, hyperactivity,
                                        and impulsivity that interfere with functioning or development.
                                    </p>
                                    <p className="text-lg text-gray-600 leading-relaxed font-light">
                                        The condition affects the brain&apos;s executive functions, including attention,
                                        working memory, and impulse control. It&apos;s not a result of laziness,
                                        lack of intelligence, or poor parenting.
                                    </p>
                                </div>
                                <div className="flex justify-center">
                                    <div
                                        className="w-48 h-48 rounded-full flex items-center justify-center shadow-lg"
                                        style={{
                                            background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                                        }}
                                    >
                                        <Brain className="h-24 w-24 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Symptoms Section */}
                <section className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Core Symptoms of{" "}
                            <span
                                style={{
                                    background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                ADHD
                            </span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                            ADHD symptoms are grouped into three main categories. Most people show symptoms from multiple categories.
                        </p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-3">
                        {symptoms.map((symptom, index) => (
                            <SymptomCard
                                key={index}
                                title={symptom.title}
                                description={symptom.description}
                                icon={symptom.icon}
                                examples={symptom.examples}
                                color={symptom.color}
                            />
                        ))}
                    </div>
                </section>

                {/* Statistics Section */}
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
                                ADHD
                            </span>{" "}
                            by the Numbers
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                            Understanding the prevalence and impact of ADHD globally and in Sri Lanka
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {statistics.map((stat, index) => (
                            <Statistic
                                key={index}
                                value={stat.value}
                                label={stat.label}
                                description={stat.description}
                                icon={stat.icon}
                            />
                        ))}
                    </div>
                </section>

                {/* Detailed Information Tabs */}
                <section className="mb-16">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Learn More About ADHD</h2>
                    </div>
                    <Tabs defaultValue="causes" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="causes">Causes</TabsTrigger>
                            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                            <TabsTrigger value="treatment">Treatment</TabsTrigger>
                            <TabsTrigger value="living">Living with ADHD</TabsTrigger>
                        </TabsList>

                        <TabsContent value="causes" className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Stethoscope className="h-5 w-5" />
                                        What Causes ADHD?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                        While the exact cause of ADHD isn&apos;t fully understood, research shows it&apos;s a complex condition
                                        influenced by multiple factors:
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="font-semibold text-foreground mb-2">Genetic Factors</h3>
                                            <ul className="space-y-1 text-sm text-muted-foreground">
                                                <li>• ADHD runs in families (70% genetic component)</li>
                                                <li>• Multiple genes are involved</li>
                                                <li>• Parents with ADHD have a higher chance of having children with ADHD</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground mb-2">Brain Structure & Function</h3>
                                            <ul className="space-y-1 text-sm text-muted-foreground">
                                                <li>• Differences in brain development</li>
                                                <li>• Imbalanced neurotransmitters (dopamine, norepinephrine)</li>
                                                <li>• Affected brain regions control attention and behavior</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground mb-2">Environmental Factors</h3>
                                            <ul className="space-y-1 text-sm text-muted-foreground">
                                                <li>• Prenatal exposure to alcohol or tobacco</li>
                                                <li>• Premature birth or low birth weight</li>
                                                <li>• Lead exposure in early childhood</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground mb-2">What DOESN&apos;T Cause ADHD</h3>
                                            <ul className="space-y-1 text-sm text-muted-foreground">
                                                <li>• Poor parenting or family problems</li>
                                                <li>• Too much screen time or sugar</li>
                                                <li>• Vaccines</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="diagnosis" className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        How is ADHD Diagnosed?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                        ADHD diagnosis involves a comprehensive evaluation by qualified healthcare professionals.
                                        There&apos;s no single test for ADHD.
                                    </p>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold text-foreground mb-3">Diagnostic Process</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg border">
                                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-xs font-bold text-primary">1</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-foreground">Clinical Interview</h4>
                                                        <p className="text-sm text-muted-foreground">Detailed discussion about symptoms, medical history, and daily functioning</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg border">
                                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-xs font-bold text-primary">2</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-foreground">Rating Scales</h4>
                                                        <p className="text-sm text-muted-foreground">Standardized questionnaires completed by patient, family, and teachers</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg border">
                                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-xs font-bold text-primary">3</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-foreground">Medical Examination</h4>
                                                        <p className="text-sm text-muted-foreground">Physical exam to rule out other conditions</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg border">
                                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-xs font-bold text-primary">4</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-foreground">Psychological Testing</h4>
                                                        <p className="text-sm text-muted-foreground">Cognitive and behavioral assessments when needed</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="treatment" className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Heart className="h-5 w-5" />
                                        Treatment Options
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                        ADHD treatment is most effective when it includes multiple approaches tailored to individual needs.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-foreground">Behavioral Interventions</h3>
                                            <div className="space-y-2">
                                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <h4 className="font-medium text-green-800 mb-1">Behavioral Therapy</h4>
                                                    <p className="text-sm text-green-700">Teaching coping strategies and organizational skills</p>
                                                </div>
                                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <h4 className="font-medium text-blue-800 mb-1">Parent Training</h4>
                                                    <p className="text-sm text-blue-700">Helping parents develop effective management strategies</p>
                                                </div>
                                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                    <h4 className="font-medium text-purple-800 mb-1">School Support</h4>
                                                    <p className="text-sm text-purple-700">Accommodations and modifications in educational settings</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-foreground">Medical Treatment</h3>
                                            <div className="space-y-2">
                                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                    <h4 className="font-medium text-orange-800 mb-1">Stimulant Medications</h4>
                                                    <p className="text-sm text-orange-700">Most common and effective (70-80% success rate)</p>
                                                </div>
                                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <h4 className="font-medium text-red-800 mb-1">Non-Stimulant Medications</h4>
                                                    <p className="text-sm text-red-700">Alternative options when stimulants aren&apos;t suitable</p>
                                                </div>
                                                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                                    <h4 className="font-medium text-indigo-800 mb-1">Regular Monitoring</h4>
                                                    <p className="text-sm text-indigo-700">Ongoing assessment and medication adjustment</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="living" className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Home className="h-5 w-5" />
                                        Living with ADHD
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                        With proper support and strategies, people with ADHD can lead successful, fulfilling lives.
                                    </p>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div>
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                                                <GraduationCap className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <h3 className="font-semibold text-foreground mb-2">At School</h3>
                                            <ul className="space-y-1 text-sm text-muted-foreground">
                                                <li>• Extended time for tests</li>
                                                <li>• Preferential seating</li>
                                                <li>• Break down large assignments</li>
                                                <li>• Regular communication with teachers</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                                                <Users className="h-6 w-6 text-green-600" />
                                            </div>
                                            <h3 className="font-semibold text-foreground mb-2">At Work</h3>
                                            <ul className="space-y-1 text-sm text-muted-foreground">
                                                <li>• Organize workspace and tasks</li>
                                                <li>• Use calendars and reminders</li>
                                                <li>• Request reasonable accommodations</li>
                                                <li>• Focus on strengths and interests</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                                                <Heart className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <h3 className="font-semibold text-foreground mb-2">Relationships</h3>
                                            <ul className="space-y-1 text-sm text-muted-foreground">
                                                <li>• Open communication about ADHD</li>
                                                <li>• Develop coping strategies together</li>
                                                <li>• Join support groups</li>
                                                <li>• Practice patience and understanding</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </section>

                {/* Myths vs Facts */}
                <section className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Common Myths About{" "}
                            <span
                                style={{
                                    background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                ADHD
                            </span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                            Let&apos;s separate fact from fiction about ADHD
                        </p>
                    </div>
                    <div className="space-y-6">
                        {mythsFacts.map((item, index) => (
                            <MythFact key={index} myth={item.myth} fact={item.fact} />
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
                    <h2 className="text-3xl font-bold mb-4">Ready to Learn More?</h2>
                    <p className="text-xl mb-6 opacity-90 max-w-2xl mx-auto font-light">
                        SPARKS provides comprehensive ADHD support tailored for Sri Lankan communities.
                        Start your journey towards better understanding and management today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/signup">
                            <Button
                                size="lg"
                                className="text-lg px-8 py-6 bg-white hover:bg-gray-100 shadow-md"
                                style={{ color: "#8159A8" }}
                            >
                                Get Started with SPARKS
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
                        <Link href="/resources">
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-[#8159A8] transition-all"
                            >
                                View Resources
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
