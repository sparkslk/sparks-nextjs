"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BookOpen,
    Users,
    Download,
    ExternalLink,
    Phone,
    Globe,
    Heart,
    GraduationCap,
    ArrowRight,
    FileText,
    Video,
    Headphones,
    Calendar,
    MapPin,
    Clock,
    Shield
} from "lucide-react";
import Header from "@/components/landingpage/Header/page";
import Footer from "@/components/landingpage/Footer/page";

interface ResourceCardProps {
    title: string;
    description: string;
    type: "PDF" | "Website" | "Video" | "Audio" | "Tool";
    category: string;
    icon: React.ReactNode;
    link: string;
    isExternal?: boolean;
}

const ResourceCard = ({ title, description, type, category, icon, link, isExternal = false }: ResourceCardProps) => {
    const getTypeColor = (type: string) => {
        switch (type) {
            case "PDF": return "bg-red-100 text-red-700";
            case "Website": return "bg-blue-100 text-blue-700";
            case "Video": return "bg-purple-100 text-purple-700";
            case "Audio": return "bg-green-100 text-green-700";
            case "Tool": return "bg-orange-100 text-orange-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "PDF": return <FileText className="h-3 w-3" />;
            case "Website": return <Globe className="h-3 w-3" />;
            case "Video": return <Video className="h-3 w-3" />;
            case "Audio": return <Headphones className="h-3 w-3" />;
            case "Tool": return <Download className="h-3 w-3" />;
            default: return <FileText className="h-3 w-3" />;
        }
    };

    return (
        <Card className="h-full hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {icon}
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`text-xs px-2 py-1 ${getTypeColor(type)}`}>
                            <div className="flex items-center gap-1">
                                {getTypeIcon(type)}
                                {type}
                            </div>
                        </Badge>
                        {isExternal && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                    </div>
                </div>
                <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {title}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                </CardDescription>
                <Badge variant="outline" className="w-fit text-xs">
                    {category}
                </Badge>
            </CardHeader>
            <CardContent className="pt-0">
                <Link href={link} className={isExternal ? "block" : "block"} target={isExternal ? "_blank" : undefined}>
                    <Button variant="outline" size="sm" className="w-full group-hover:border-primary group-hover:text-primary">
                        {type === "Tool" ? "Use Tool" : type === "PDF" ? "Download" : "View Resource"}
                        <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
};

interface SupportGroupProps {
    name: string;
    type: "Online" | "In-Person" | "Hybrid";
    location: string;
    schedule: string;
    contact: string;
    description: string;
}

const SupportGroupCard = ({ name, type, location, schedule, contact, description }: SupportGroupProps) => {
    const getTypeColor = (type: string) => {
        switch (type) {
            case "Online": return "bg-blue-100 text-blue-700";
            case "In-Person": return "bg-green-100 text-green-700";
            case "Hybrid": return "bg-purple-100 text-purple-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-bold text-foreground">{name}</CardTitle>
                    <Badge className={`text-xs px-2 py-1 ${getTypeColor(type)}`}>
                        {type}
                    </Badge>
                </div>
                <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{contact}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default function ResourcesPage() {
    const educationalResources = [
        {
            title: "ADHD Guide for Parents (Sinhala)",
            description: "Comprehensive guide for Sri Lankan parents with children who have ADHD, including local resources and cultural considerations.",
            type: "PDF" as const,
            category: "Parent Education",
            icon: <BookOpen className="h-5 w-5 text-primary" />,
            link: "/resources/adhd-parent-guide-sinhala.pdf"
        },
        {
            title: "Understanding ADHD in Sri Lankan Schools",
            description: "Educational material for teachers and school staff about supporting students with ADHD in local educational settings.",
            type: "PDF" as const,
            category: "Education",
            icon: <GraduationCap className="h-5 w-5 text-primary" />,
            link: "/resources/adhd-schools-guide.pdf"
        },
        {
            title: "ADHD Medication Guide (Tamil)",
            description: "Detailed information about ADHD medications, side effects, and management strategies available in Tamil.",
            type: "PDF" as const,
            category: "Medical Information",
            icon: <Shield className="h-5 w-5 text-primary" />,
            link: "/resources/adhd-medication-guide-tamil.pdf"
        },
        {
            title: "Daily Management Strategies",
            description: "Practical tips and techniques for managing ADHD symptoms in daily life, work, and relationships.",
            type: "Website" as const,
            category: "Coping Strategies",
            icon: <Heart className="h-5 w-5 text-primary" />,
            link: "/resources/daily-management-strategies"
        }
    ];

    const toolsAndApps = [
        {
            title: "SPARKS Symptom Tracker",
            description: "Track daily symptoms, mood, and medication effects to share with your healthcare provider.",
            type: "Tool" as const,
            category: "Tracking Tools",
            icon: <Calendar className="h-5 w-5 text-primary" />,
            link: "/dashboard/symptom-tracker"
        },
        {
            title: "Focus Timer & Task Manager",
            description: "Pomodoro-style timer with task breakdown features designed specifically for ADHD minds.",
            type: "Tool" as const,
            category: "Productivity",
            icon: <Clock className="h-5 w-5 text-primary" />,
            link: "/tools/focus-timer"
        },
        {
            title: "Mindfulness Exercises for ADHD",
            description: "Guided meditation and mindfulness exercises tailored for people with ADHD and attention difficulties.",
            type: "Audio" as const,
            category: "Mental Health",
            icon: <Headphones className="h-5 w-5 text-primary" />,
            link: "/resources/mindfulness-exercises"
        },
        {
            title: "ADHD Education Videos",
            description: "Series of educational videos about ADHD in Sinhala, Tamil, and English for different age groups.",
            type: "Video" as const,
            category: "Education",
            icon: <Video className="h-5 w-5 text-primary" />,
            link: "/resources/education-videos"
        }
    ];

    const externalResources = [
        {
            title: "Children with Disabilities (CHADD) Sri Lanka",
            description: "International organization with resources adapted for Sri Lankan context.",
            type: "Website" as const,
            category: "International Resources",
            icon: <Globe className="h-5 w-5 text-primary" />,
            link: "https://chadd.org",
            isExternal: true
        },
        {
            title: "Sri Lanka College of Psychiatrists",
            description: "Professional organization providing information about mental health services in Sri Lanka.",
            type: "Website" as const,
            category: "Professional Organizations",
            icon: <Users className="h-5 w-5 text-primary" />,
            link: "https://psychiatrysl.org",
            isExternal: true
        },
        {
            title: "Ministry of Health ADHD Guidelines",
            description: "Official guidelines and policies for ADHD diagnosis and treatment in Sri Lanka.",
            type: "PDF" as const,
            category: "Government Resources",
            icon: <FileText className="h-5 w-5 text-primary" />,
            link: "https://health.gov.lk/adhd-guidelines",
            isExternal: true
        }
    ];

    const supportGroups = [
        {
            name: "Colombo ADHD Parent Support Group",
            type: "Hybrid" as const,
            location: "Colombo 7, Sri Lanka & Online",
            schedule: "Every 2nd Saturday, 2:00 PM - 4:00 PM",
            contact: "+94 11 234 5678",
            description: "Monthly meetings for parents of children with ADHD. Share experiences, strategies, and support each other."
        },
        {
            name: "Young Adults with ADHD - Online",
            type: "Online" as const,
            location: "Zoom Meetings",
            schedule: "Weekly Thursdays, 7:00 PM - 8:30 PM",
            contact: "youngadults@sparks.lk",
            description: "Peer support group for adults (18-35) managing ADHD in work, relationships, and daily life."
        },
        {
            name: "ADHD Awareness Kandy",
            type: "In-Person" as const,
            location: "Community Center, Kandy",
            schedule: "Monthly - 3rd Sunday, 10:00 AM - 12:00 PM",
            contact: "+94 81 123 4567",
            description: "Community-based support group focusing on ADHD awareness and family support in Central Province."
        },
        {
            name: "Teachers & ADHD Workshop Series",
            type: "Hybrid" as const,
            location: "Various Schools & Online",
            schedule: "Quarterly Workshops",
            contact: "education@sparks.lk",
            description: "Educational workshops for teachers and school staff about supporting students with ADHD."
        }
    ];

    const emergencyContacts = [
        {
            name: "National Mental Health Helpline",
            number: "1926",
            description: "24/7 mental health crisis support",
            availability: "24/7"
        },
        {
            name: "Samaritans of Sri Lanka",
            number: "+94 11 269 6666",
            description: "Emotional support and crisis intervention",
            availability: "24/7"
        },
        {
            name: "SPARKS Support Line",
            number: "+94 11 SPARKS (776 257)",
            description: "ADHD-specific support and guidance",
            availability: "Mon-Fri 9:00 AM - 6:00 PM"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
                        ADHD SUPPORT RESOURCES
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        ADHD{" "}
                        <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Resources
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Comprehensive collection of resources, tools, and support materials for individuals
                        with ADHD, families, educators, and healthcare professionals in Sri Lanka.
                    </p>
                </div>

                {/* Resource Categories */}
                <section className="mb-16">
                    <Tabs defaultValue="educational" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="educational">Educational</TabsTrigger>
                            <TabsTrigger value="tools">Tools & Apps</TabsTrigger>
                            <TabsTrigger value="external">External Links</TabsTrigger>
                            <TabsTrigger value="support">Support Groups</TabsTrigger>
                        </TabsList>

                        <TabsContent value="educational" className="mt-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-foreground mb-2">Educational Resources</h2>
                                <p className="text-muted-foreground">
                                    Downloadable guides, articles, and educational materials about ADHD
                                </p>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {educationalResources.map((resource, index) => (
                                    <ResourceCard key={index} {...resource} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="tools" className="mt-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-foreground mb-2">Tools & Applications</h2>
                                <p className="text-muted-foreground">
                                    Interactive tools, trackers, and applications to help manage ADHD symptoms
                                </p>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {toolsAndApps.map((resource, index) => (
                                    <ResourceCard key={index} {...resource} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="external" className="mt-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-foreground mb-2">External Resources</h2>
                                <p className="text-muted-foreground">
                                    Links to trusted external organizations, websites, and professional resources
                                </p>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {externalResources.map((resource, index) => (
                                    <ResourceCard key={index} {...resource} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="support" className="mt-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-foreground mb-2">Support Groups & Communities</h2>
                                <p className="text-muted-foreground">
                                    Connect with local and online support groups for individuals and families affected by ADHD
                                </p>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                {supportGroups.map((group, index) => (
                                    <SupportGroupCard key={index} {...group} />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </section>

                {/* Quick Access Section */}
                <section className="mb-16">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Quick Access</h2>
                        <p className="text-lg text-muted-foreground">
                            Frequently used resources and tools for immediate access
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                                <CardTitle>Symptom Tracker</CardTitle>
                                <CardDescription>
                                    Track daily symptoms and medication effects
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/tools/symptom-tracker">
                                    <Button className="w-full">Start Tracking</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                                <CardTitle>Find Therapist</CardTitle>
                                <CardDescription>
                                    Connect with ADHD specialists in your area
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/dashboard/findTherapist">
                                    <Button className="w-full">Find Therapist</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <BookOpen className="h-6 w-6 text-purple-600" />
                                </div>
                                <CardTitle>ADHD Assessment</CardTitle>
                                <CardDescription>
                                    Take a preliminary ADHD screening assessment
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/assessment/adhd-screening">
                                    <Button className="w-full">Take Assessment</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Emergency Contacts */}
                <section className="mb-16">
                    <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-800">
                                <Phone className="h-5 w-5" />
                                Emergency & Crisis Support
                            </CardTitle>
                            <CardDescription className="text-red-700">
                                If you or someone you know is in crisis, please reach out for immediate help
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                {emergencyContacts.map((contact, index) => (
                                    <div key={index} className="bg-white rounded-lg p-4 border">
                                        <h3 className="font-semibold text-foreground mb-1">{contact.name}</h3>
                                        <p className="text-2xl font-bold text-primary mb-1">{contact.number}</p>
                                        <p className="text-sm text-muted-foreground mb-1">{contact.description}</p>
                                        <Badge variant="outline" className="text-xs">
                                            {contact.availability}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Resource Guidelines */}
                <section className="mb-16">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Using These Resources Safely
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Important Reminders</h3>
                                    <ul className="space-y-1 text-sm text-muted-foreground">
                                        <li>• These resources are for educational purposes only</li>
                                        <li>• Always consult with healthcare professionals for medical advice</li>
                                        <li>• Resources are not a substitute for professional diagnosis or treatment</li>
                                        <li>• If you experience crisis situations, contact emergency services immediately</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">How to Use Resources</h3>
                                    <ul className="space-y-1 text-sm text-muted-foreground">
                                        <li>• Download PDF resources for offline access</li>
                                        <li>• Share educational materials with your support network</li>
                                        <li>• Use tracking tools consistently for best results</li>
                                        <li>• Join support groups that match your needs and schedule</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* CTA Section */}
                <section className="text-center bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl p-8 md:p-12">
                    <h2 className="text-3xl font-bold mb-4">Need More Support?</h2>
                    <p className="text-xl mb-6 opacity-90 max-w-2xl mx-auto">
                        SPARKS offers personalized ADHD support beyond these resources.
                        Join our platform for comprehensive care tailored to your needs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/signup">
                            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                                Join SPARKS Platform
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary">
                                Contact Support
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
