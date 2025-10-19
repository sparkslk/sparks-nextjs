"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Eye,
    Keyboard,
    Volume2,
    Monitor,
    Smartphone,
    Users,
    MessageSquare,
    CheckCircle,
    Mail,
    FileText,
    Languages,
    Settings
} from "lucide-react";
import Header from "@/components/landingpage/Header/page";
import Footer from "@/components/landingpage/Footer/page";

interface SectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}

const Section = ({ icon, title, children }: SectionProps) => (
    <Card className="mb-6">
        <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {icon}
                </div>
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            {children}
        </CardContent>
    </Card>
);

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    status: "available" | "coming-soon" | "planned";
}

const FeatureCard = ({ icon, title, description, status }: FeatureCardProps) => (
    <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{title}</h3>
                        {status === "available" && (
                            <Badge variant="default" className="bg-green-600 text-xs">Available</Badge>
                        )}
                        {status === "coming-soon" && (
                            <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                        )}
                        {status === "planned" && (
                            <Badge variant="outline" className="text-xs">Planned</Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function AccessibilityPage() {
    const lastUpdated = "January 20, 2025";

    const accessibilityFeatures = [
        {
            icon: <Keyboard className="h-6 w-6 text-blue-600" />,
            title: "Keyboard Navigation",
            description: "Full keyboard support with logical tab order, skip links, and visible focus indicators for all interactive elements.",
            status: "available" as const
        },
        {
            icon: <Eye className="h-6 w-6 text-purple-600" />,
            title: "Screen Reader Compatible",
            description: "ARIA labels, semantic HTML, and proper heading structure for JAWS, NVDA, and VoiceOver compatibility.",
            status: "available" as const
        },
        {
            icon: <Monitor className="h-6 w-6 text-green-600" />,
            title: "High Contrast Mode",
            description: "Enhanced color contrast ratios meeting WCAG AAA standards, with high contrast theme option.",
            status: "available" as const
        },
        {
            icon: <Settings className="h-6 w-6 text-orange-600" />,
            title: "Text Resizing",
            description: "Support for browser text zoom up to 200% without loss of functionality or content.",
            status: "available" as const
        },
        {
            icon: <Languages className="h-6 w-6 text-red-600" />,
            title: "Multi-Language Support",
            description: "Platform available in Sinhala, Tamil, and English with culturally appropriate content.",
            status: "available" as const
        },
        {
            icon: <Volume2 className="h-6 w-6 text-indigo-600" />,
            title: "Audio Descriptions",
            description: "Text-to-speech functionality and audio descriptions for visual content in educational materials.",
            status: "coming-soon" as const
        },
        {
            icon: <Smartphone className="h-6 w-6 text-pink-600" />,
            title: "Mobile Accessibility",
            description: "Touch-friendly interface with large tap targets and gesture alternatives for all mobile users.",
            status: "available" as const
        },
        {
            icon: <FileText className="h-6 w-6 text-teal-600" />,
            title: "Simplified Content",
            description: "Option to view simplified language versions and dyslexia-friendly fonts for easier reading.",
            status: "coming-soon" as const
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
            <Header />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
                        INCLUSIVE DESIGN
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Accessibility{" "}
                        <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Statement
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        SPARKS is committed to ensuring digital accessibility for all people, including those with
                        disabilities. We continuously work to improve the user experience for everyone and apply
                        relevant accessibility standards.
                    </p>
                    <div className="mt-4 text-sm text-muted-foreground">
                        <strong>Last Updated:</strong> {lastUpdated}
                    </div>
                </div>

                {/* Commitment Statement */}
                <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <CheckCircle className="h-6 w-6" />
                            Our Commitment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-muted-foreground">
                        <p>
                            SPARKS believes that access to mental health resources should be available to everyone,
                            regardless of ability. We are dedicated to providing a platform that is accessible to
                            the widest possible audience, including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li>People with visual impairments using screen readers or screen magnifiers</li>
                            <li>People with motor impairments using keyboard-only navigation or assistive devices</li>
                            <li>People with hearing impairments requiring captions or transcripts</li>
                            <li>People with cognitive differences, including ADHD, dyslexia, and autism</li>
                            <li>People using mobile devices or assistive technologies</li>
                            <li>Older adults who may face age-related accessibility challenges</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Accessibility Features */}
                <section className="mb-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Accessibility Features</h2>
                        <p className="text-lg text-muted-foreground">
                            Built-in features designed to make SPARKS accessible to all users
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {accessibilityFeatures.map((feature, index) => (
                            <FeatureCard key={index} {...feature} />
                        ))}
                    </div>
                </section>

                {/* Standards Compliance */}
                <Section icon={<FileText className="h-5 w-5 text-primary" />} title="Standards and Compliance">
                    <p>
                        We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards,
                        issued by the World Wide Web Consortium (W3C). These guidelines explain how to make web content
                        more accessible for people with disabilities.
                    </p>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">WCAG 2.1 Level AA Compliance</h4>
                        <p>Our platform adheres to the following WCAG principles:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li><strong>Perceivable:</strong> Information and user interface components must be presentable to users in ways they can perceive</li>
                            <li><strong>Operable:</strong> User interface components and navigation must be operable by all users</li>
                            <li><strong>Understandable:</strong> Information and operation of the user interface must be understandable</li>
                            <li><strong>Robust:</strong> Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Additional Standards</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Section 508 of the Rehabilitation Act (US accessibility standards)</li>
                            <li>EN 301 549 (European accessibility standard)</li>
                            <li>ARIA (Accessible Rich Internet Applications) specifications</li>
                        </ul>
                    </div>
                </Section>

                {/* Technical Specifications */}
                <Section icon={<Settings className="h-5 w-5 text-primary" />} title="Technical Specifications">
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Compatible Technologies</h4>
                        <p>The SPARKS platform is designed to be compatible with:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li>Modern web browsers (Chrome, Firefox, Safari, Edge) with latest updates</li>
                            <li>Screen readers: JAWS, NVDA, VoiceOver, TalkBack</li>
                            <li>Speech recognition software: Dragon NaturallySpeaking</li>
                            <li>Browser zoom and text enlargement tools</li>
                            <li>Keyboard navigation without mouse dependency</li>
                            <li>Mobile assistive features (iOS VoiceOver, Android TalkBack)</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Supported Browsers and Devices</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong>Desktop:</strong> Chrome 90+, Firefox 88+, Safari 14+, Edge 90+</li>
                            <li><strong>Mobile:</strong> iOS Safari 14+, Chrome Mobile, Samsung Internet</li>
                            <li><strong>Tablets:</strong> iPad OS 14+, Android 10+</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Technologies Used</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>HTML5 with semantic markup</li>
                            <li>CSS3 with responsive design</li>
                            <li>JavaScript (ES6+) with progressive enhancement</li>
                            <li>ARIA attributes for enhanced screen reader support</li>
                            <li>SVG with proper text alternatives</li>
                        </ul>
                    </div>
                </Section>

                {/* ADHD-Specific Features */}
                <Section icon={<Users className="h-5 w-5 text-primary" />} title="ADHD-Friendly Design">
                    <p>
                        Recognizing that our primary users may have ADHD, we&apos;ve implemented specific design choices
                        to support executive function challenges:
                    </p>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Attention and Focus Support</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Clear visual hierarchy with distinct headings and sections</li>
                            <li>Minimal distractions with option to reduce animations</li>
                            <li>Progress indicators for multi-step processes</li>
                            <li>Auto-save functionality to prevent data loss</li>
                            <li>Timers and reminders for appointments and tasks</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Working Memory Support</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Breadcrumb navigation showing current location</li>
                            <li>Persistent navigation menus</li>
                            <li>Clear error messages with suggested solutions</li>
                            <li>Tooltips and contextual help</li>
                            <li>Dashboard summaries of important information</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Organization and Planning</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Calendar views with color coding</li>
                            <li>Task lists and checkboxes</li>
                            <li>Filtering and sorting options</li>
                            <li>Search functionality with autocomplete</li>
                        </ul>
                    </div>
                </Section>

                {/* Content Accessibility */}
                <Section icon={<FileText className="h-5 w-5 text-primary" />} title="Content Accessibility">
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Text and Language</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Plain language writing style avoiding unnecessary jargon</li>
                            <li>Short paragraphs and bullet points for easier scanning</li>
                            <li>Clear, descriptive headings following logical hierarchy</li>
                            <li>Definitions provided for medical or technical terms</li>
                            <li>Readability level appropriate for general audience</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Images and Media</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Alternative text (alt text) for all meaningful images</li>
                            <li>Captions and transcripts for video content</li>
                            <li>Audio descriptions for complex visual information</li>
                            <li>Charts and graphs with text alternatives</li>
                            <li>No auto-playing audio or video</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Forms and Interactions</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Clear labels for all form fields</li>
                            <li>Helpful placeholder text and instructions</li>
                            <li>Error messages that clearly explain what went wrong</li>
                            <li>Confirmation messages for important actions</li>
                            <li>Sufficient time limits with option to extend</li>
                        </ul>
                    </div>
                </Section>

                {/* Testing and Evaluation */}
                <Section icon={<CheckCircle className="h-5 w-5 text-primary" />} title="Testing and Continuous Improvement">
                    <p>
                        We regularly evaluate our platform&apos;s accessibility through multiple methods:
                    </p>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Testing Methods</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Automated accessibility scanning using tools like Axe, WAVE, and Lighthouse</li>
                            <li>Manual testing with screen readers and keyboard navigation</li>
                            <li>User testing with people who have diverse abilities</li>
                            <li>Regular accessibility audits by third-party experts</li>
                            <li>Continuous monitoring and issue tracking</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Ongoing Improvements</h4>
                        <p>
                            Accessibility is an ongoing commitment. We continuously work to improve our platform by:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li>Incorporating user feedback into design decisions</li>
                            <li>Training our development team on accessibility best practices</li>
                            <li>Staying updated with latest accessibility standards and guidelines</li>
                            <li>Prioritizing accessibility in our product roadmap</li>
                            <li>Conducting quarterly accessibility reviews</li>
                        </ul>
                    </div>
                </Section>

                {/* Known Limitations */}
                <Section icon={<MessageSquare className="h-5 w-5 text-primary" />} title="Known Limitations">
                    <p>
                        While we strive for full accessibility, we acknowledge current limitations and are actively
                        working to address them:
                    </p>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Current Limitations</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Some third-party embedded content may not be fully accessible</li>
                            <li>Certain complex data visualizations are being improved for screen reader users</li>
                            <li>Live chat widget accessibility enhancements in progress</li>
                            <li>PDF documents are being converted to accessible formats</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Planned Enhancements (2025)</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Voice control integration</li>
                            <li>Enhanced dyslexia-friendly reading mode</li>
                            <li>Custom color theme builder for visual preferences</li>
                            <li>Simplified interface option for cognitive accessibility</li>
                            <li>Sign language interpretation for video content</li>
                        </ul>
                    </div>
                </Section>

                {/* Feedback Section */}
                <Card className="bg-gradient-to-r from-primary/10 to-purple-50 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Mail className="h-5 w-5" />
                            Accessibility Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            We welcome your feedback on the accessibility of the SPARKS platform. If you encounter
                            any accessibility barriers or have suggestions for improvement, please let us know:
                        </p>
                        <div className="space-y-2 text-sm">
                            <p><strong>Accessibility Team:</strong> accessibility@sparks.lk</p>
                            <p><strong>Phone:</strong> +94 11 SPARKS (776 257)</p>
                            <p><strong>Response Time:</strong> We aim to respond to accessibility feedback within 2 business days</p>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900">
                                <strong>When reporting an accessibility issue, please include:</strong>
                            </p>
                            <ul className="text-sm text-blue-800 list-disc list-inside mt-2 space-y-1 ml-2">
                                <li>The web page or feature where you encountered the issue</li>
                                <li>Your assistive technology (if applicable) and browser version</li>
                                <li>A description of the problem and what you were trying to do</li>
                                <li>Screenshots or screen recordings if possible</li>
                            </ul>
                        </div>
                        <div className="pt-4">
                            <Link href="/contact" className="text-primary hover:underline font-medium">
                                Contact our accessibility team →
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Third-Party Content */}
                <Card className="mt-6 border-orange-200 bg-orange-50/50">
                    <CardHeader>
                        <CardTitle className="text-orange-900 text-lg">Third-Party Content</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-orange-800">
                        <p>
                            Some content on the SPARKS platform is provided by third parties (e.g., payment processors,
                            video conferencing tools, embedded educational videos). While we select partners who share
                            our commitment to accessibility, we cannot guarantee the accessibility of third-party
                            content. If you encounter accessibility issues with third-party content, please notify us
                            and we will work with the provider to address the issue.
                        </p>
                    </CardContent>
                </Card>

                {/* Certification */}
                <div className="mt-8 p-6 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground text-center">
                        This Accessibility Statement was last reviewed and updated on <strong>{lastUpdated}</strong>.
                        We are committed to maintaining and improving the accessibility of our platform.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
