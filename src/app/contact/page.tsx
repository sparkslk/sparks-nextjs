"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    MessageSquare,
    Users,
    Stethoscope,
    GraduationCap,
    Building,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    Globe,
    Calendar
} from "lucide-react";
import Header from "@/components/landingpage/Header/page";
import Footer from "@/components/landingpage/Footer/page";

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    category: string;
    message: string;
}

interface ContactInfoProps {
    icon: React.ReactNode;
    title: string;
    details: string[];
    color: string;
}

const ContactInfo = ({ icon, title, details, color }: ContactInfoProps) => (
    <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="text-center">
            <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                {icon}
            </div>
            <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
            {details.map((detail, index) => (
                <p key={index} className="text-muted-foreground text-sm">{detail}</p>
            ))}
        </CardContent>
    </Card>
);

interface OfficeLocationProps {
    name: string;
    address: string;
    phone: string;
    email: string;
    hours: string[];
    services: string[];
}

const OfficeLocation = ({ name, address, phone, email, hours, services }: OfficeLocationProps) => (
    <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                {name}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-muted-foreground">{address}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{phone}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{email}</p>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Operating Hours
                </h4>
                <ul className="space-y-1">
                    {hours.map((hour, index) => (
                        <li key={index} className="text-sm text-muted-foreground">{hour}</li>
                    ))}
                </ul>
            </div>

            <div>
                <h4 className="font-semibold text-foreground mb-2">Services Available</h4>
                <div className="flex flex-wrap gap-1">
                    {services.map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                            {service}
                        </Badge>
                    ))}
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function ContactPage() {
    const [formData, setFormData] = useState<ContactFormData>({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    const handleInputChange = (field: keyof ContactFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSubmitStatus("success");
            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "",
                category: "",
                message: ""
            });
        } catch {
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubmitStatus("idle"), 5000);
        }
    };

    const contactInfo = [
        {
            icon: <Phone className="h-6 w-6 text-blue-600" />,
            title: "Call Us",
            details: [
                "Main Line: +94 11 SPARKS (776 257)",
                "Crisis Support: 1926",
                "WhatsApp: +94 77 123 4567"
            ],
            color: "bg-blue-100"
        },
        {
            icon: <Mail className="h-6 w-6 text-green-600" />,
            title: "Email Us",
            details: [
                "General: info@sparks.lk",
                "Support: support@sparks.lk",
                "Medical: medical@sparks.lk"
            ],
            color: "bg-green-100"
        },
        {
            icon: <MessageSquare className="h-6 w-6 text-purple-600" />,
            title: "Live Chat",
            details: [
                "Available Mon-Fri 9AM-6PM",
                "Instant support for urgent queries",
                "Average response time: 2 minutes"
            ],
            color: "bg-purple-100"
        },
        {
            icon: <Globe className="h-6 w-6 text-orange-600" />,
            title: "Social Media",
            details: [
                "Facebook: @SparksLK",
                "Instagram: @sparks_srilanka",
                "YouTube: SPARKS Sri Lanka"
            ],
            color: "bg-orange-100"
        }
    ];

    const officeLocations = [
        {
            name: "SPARKS Colombo (Head Office)",
            address: "No. 123, Galle Road, Colombo 03, Sri Lanka",
            phone: "+94 11 234 5678",
            email: "colombo@sparks.lk",
            hours: [
                "Monday - Friday: 8:00 AM - 6:00 PM",
                "Saturday: 9:00 AM - 2:00 PM",
                "Sunday: Closed",
                "Emergency consultations available 24/7"
            ],
            services: ["ADHD Assessment", "Therapy", "Family Counseling", "Medical Consultation", "Support Groups"]
        },
        {
            name: "SPARKS Kandy",
            address: "456 Peradeniya Road, Kandy, Sri Lanka",
            phone: "+94 81 987 6543",
            email: "kandy@sparks.lk",
            hours: [
                "Monday - Friday: 9:00 AM - 5:00 PM",
                "Saturday: 9:00 AM - 1:00 PM",
                "Sunday: Closed"
            ],
            services: ["ADHD Assessment", "Therapy", "Educational Support", "Teacher Training"]
        },
        {
            name: "SPARKS Galle",
            address: "789 Matara Road, Galle, Sri Lanka",
            phone: "+94 91 555 1234",
            email: "galle@sparks.lk",
            hours: [
                "Tuesday & Thursday: 10:00 AM - 4:00 PM",
                "Saturday: 9:00 AM - 3:00 PM",
                "Other days: By appointment"
            ],
            services: ["ADHD Assessment", "Therapy", "Community Outreach"]
        }
    ];

    const categories = [
        "General Inquiry",
        "ADHD Assessment Booking",
        "Therapy Appointment",
        "Technical Support",
        "Billing & Payment",
        "Partnership Inquiry",
        "Media & Press",
        "Feedback & Suggestions"
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
                        GET IN TOUCH
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Contact{" "}
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
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
                        We&apos;re here to help you on your ADHD journey. Reach out to our team for support,
                        information, or to book an appointment with our qualified professionals.
                    </p>
                    <div className="w-20 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto rounded-full mt-6"></div>
                </div>

                {/* Contact Methods */}
                <section className="mb-16">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            <span
                                style={{
                                    background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                How to Reach Us
                            </span>
                        </h2>
                        <p className="text-lg text-gray-600 font-light">
                            Multiple ways to connect with our support team
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {contactInfo.map((info, index) => (
                            <ContactInfo key={index} {...info} />
                        ))}
                    </div>
                </section>

                {/* Contact Form & Quick Actions */}
                <section className="mb-16">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <Card className="bg-white border-gray-100 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Send us a Message</CardTitle>
                                    <CardDescription>
                                        Fill out the form below and we&apos;ll get back to you within 24 hours
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name *</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Enter your full name"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    placeholder="+94 XX XXX XXXX"
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="category">Category *</Label>
                                                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category} value={category}>
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="subject">Subject *</Label>
                                            <Input
                                                id="subject"
                                                placeholder="Brief description of your inquiry"
                                                value={formData.subject}
                                                onChange={(e) => handleInputChange("subject", e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message">Message *</Label>
                                            <Textarea
                                                id="message"
                                                placeholder="Please provide details about your inquiry..."
                                                rows={5}
                                                value={formData.message}
                                                onChange={(e) => handleInputChange("message", e.target.value)}
                                                required
                                            />
                                        </div>

                                        {submitStatus === "success" && (
                                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <p className="text-sm text-green-700">
                                                    Message sent successfully! We&apos;ll get back to you soon.
                                                </p>
                                            </div>
                                        )}

                                        {submitStatus === "error" && (
                                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                                <p className="text-sm text-red-700">
                                                    Failed to send message. Please try again or contact us directly.
                                                </p>
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            className="w-full shadow-md hover:shadow-lg transition-all"
                                            style={{ backgroundColor: "#8159A8", color: "white" }}
                                            disabled={isSubmitting || !formData.name || !formData.email || !formData.subject || !formData.category || !formData.message}
                                        >
                                            {isSubmitting ? "Sending..." : "Send Message"}
                                            <svg
                                                className="h-4 w-4 ml-2"
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
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-6">
                            <Card className="bg-white border-gray-100 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" style={{ color: "#8159A8" }} />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Link href="/signup" className="block">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start hover:bg-gray-50"
                                        >
                                            <Users className="h-4 w-4 mr-2" style={{ color: "#8159A8" }} />
                                            Create Account
                                        </Button>
                                    </Link>
                                    <Link href="/quiz" className="block">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start hover:bg-gray-50"
                                        >
                                            <Stethoscope className="h-4 w-4 mr-2" style={{ color: "#8159A8" }} />
                                            Take ADHD Quiz
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/findTherapist" className="block">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start hover:bg-gray-50"
                                        >
                                            <GraduationCap className="h-4 w-4 mr-2" style={{ color: "#8159A8" }} />
                                            Find Therapist
                                        </Button>
                                    </Link>
                                    <Link href="/resources" className="block">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start hover:bg-gray-50"
                                        >
                                            <Globe className="h-4 w-4 mr-2" style={{ color: "#8159A8" }} />
                                            View Resources
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card
                                className="border-2 shadow-md"
                                style={{
                                    borderColor: "rgba(129, 89, 168, 0.2)",
                                    background: "rgba(129, 89, 168, 0.05)",
                                }}
                            >
                                <CardHeader>
                                    <CardTitle style={{ color: "#8159A8" }}>Emergency Support</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-gray-700">
                                        If you&apos;re experiencing a mental health crisis:
                                    </p>
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-gray-900">Crisis Hotline: 1926</p>
                                        <p className="text-sm font-semibold text-gray-900">Samaritans: +94 11 269 6666</p>
                                        <p className="text-sm text-gray-600">Available 24/7</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Office Locations */}
                <section className="mb-16">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            <span
                                style={{
                                    background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                Our Locations
                            </span>
                        </h2>
                        <p className="text-lg text-gray-600 font-light">
                            Visit us at any of our offices across Sri Lanka
                        </p>
                    </div>
                    <div className="grid gap-8 lg:grid-cols-3">
                        {officeLocations.map((location, index) => (
                            <OfficeLocation key={index} {...location} />
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="mb-16">
                    <Card className="bg-white border-gray-100 shadow-sm">
                        <CardHeader>
                            <CardTitle>Frequently Asked Questions</CardTitle>
                            <CardDescription>
                                Quick answers to common questions about SPARKS services
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">How do I book an ADHD assessment?</h3>
                                        <p className="text-sm text-gray-600 font-light">
                                            You can book online through our platform, call our main line, or visit any of our offices. Initial consultations are available within 1-2 weeks.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Do you accept insurance?</h3>
                                        <p className="text-sm text-gray-600 font-light">
                                            We work with most major insurance providers in Sri Lanka. Contact us to verify coverage for your specific plan.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Is online therapy available?</h3>
                                        <p className="text-sm text-gray-600 font-light">
                                            Yes, we offer secure online therapy sessions for those who prefer virtual consultations or live in remote areas.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">What languages do you support?</h3>
                                        <p className="text-sm text-gray-600 font-light">
                                            Our services are available in Sinhala, Tamil, and English. We have qualified therapists for each language.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">How much does an assessment cost?</h3>
                                        <p className="text-sm text-gray-600 font-light">
                                            Initial ADHD assessments start from Rs. 5,000. We offer payment plans and sliding scale fees based on financial need.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Do you provide family support?</h3>
                                        <p className="text-sm text-gray-600 font-light">
                                            Yes, we offer family counseling, parent training programs, and support groups for families affected by ADHD.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* CTA Section */}
                <section
                    className="text-center rounded-2xl p-8 md:p-12 text-white shadow-lg"
                    style={{
                        background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                    }}
                >
                    <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
                    <p className="text-xl mb-6 opacity-90 max-w-2xl mx-auto font-light">
                        Don&apos;t wait to get the support you need. Contact SPARKS today and take the first step
                        towards better ADHD management and improved quality of life.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/signup">
                            <Button
                                size="lg"
                                className="text-lg px-8 py-6 bg-white hover:bg-gray-100 shadow-md"
                                style={{ color: "#8159A8" }}
                            >
                                Get Started Today
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
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-[#8159A8] transition-all"
                        >
                            <Phone className="h-5 w-5 mr-2" />
                            Call Now: +94 11 776 257
                        </Button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
