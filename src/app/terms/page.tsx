"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FileText,
    Scale,
    Shield,
    UserCheck,
    CreditCard,
    AlertTriangle,
    Gavel,
    Mail
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

export default function TermsOfServicePage() {
    const lastUpdated = "January 20, 2025";

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
            <Header />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
                        LEGAL TERMS
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Terms of{" "}
                        <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Service
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Please read these Terms of Service carefully before using the SPARKS platform.
                        By accessing or using our services, you agree to be bound by these terms.
                    </p>
                    <div className="mt-4 text-sm text-muted-foreground">
                        <strong>Last Updated:</strong> {lastUpdated}
                    </div>
                </div>

                {/* Quick Navigation */}
                <Card className="mb-8 bg-gradient-to-r from-primary/5 to-purple-50/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Navigation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <a href="#acceptance" className="text-primary hover:underline">1. Acceptance of Terms</a>
                            <a href="#eligibility" className="text-primary hover:underline">2. Eligibility & Account</a>
                            <a href="#services" className="text-primary hover:underline">3. Platform Services</a>
                            <a href="#payments" className="text-primary hover:underline">4. Payments & Refunds</a>
                            <a href="#conduct" className="text-primary hover:underline">5. User Conduct</a>
                            <a href="#intellectual-property" className="text-primary hover:underline">6. Intellectual Property</a>
                            <a href="#medical-disclaimer" className="text-primary hover:underline">7. Medical Disclaimer</a>
                            <a href="#termination" className="text-primary hover:underline">8. Termination</a>
                            <a href="#liability" className="text-primary hover:underline">9. Limitation of Liability</a>
                            <a href="#governing-law" className="text-primary hover:underline">10. Governing Law</a>
                        </div>
                    </CardContent>
                </Card>

                {/* 1. Acceptance of Terms */}
                <div id="acceptance">
                    <Section icon={<FileText className="h-5 w-5 text-primary" />} title="1. Acceptance of Terms">
                        <p>
                            These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you
                            (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;) and SPARKS (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), governing your
                            access to and use of the SPARKS platform, website, mobile applications, and all related
                            services (collectively, the &quot;Platform&quot;).
                        </p>
                        <p>
                            By creating an account, accessing, or using any part of the Platform, you acknowledge that
                            you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy.
                            If you do not agree with these Terms, you must not use the Platform.
                        </p>
                        <p>
                            We reserve the right to modify these Terms at any time. We will notify you of material changes
                            via email or platform notification. Your continued use of the Platform after such changes
                            constitutes acceptance of the modified Terms.
                        </p>
                    </Section>
                </div>

                {/* 2. Eligibility and Account */}
                <div id="eligibility">
                    <Section icon={<UserCheck className="h-5 w-5 text-primary" />} title="2. Eligibility and Account Responsibilities">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Eligibility Requirements</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>You must be at least 18 years of age to create an account</li>
                                <li>For users under 18, a parent or legal guardian must create and manage the account</li>
                                <li>You must be a resident of or physically located in Sri Lanka to use our services</li>
                                <li>You must have the legal capacity to enter into binding agreements under Sri Lankan law</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Account Security</h4>
                            <p>
                                You are responsible for maintaining the confidentiality of your account credentials and
                                for all activities that occur under your account. You agree to:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Provide accurate, current, and complete information during registration</li>
                                <li>Maintain and promptly update your account information</li>
                                <li>Notify us immediately of any unauthorized access or security breaches</li>
                                <li>Use a strong, unique password and enable two-factor authentication when available</li>
                                <li>Not share your account credentials with others</li>
                            </ul>
                        </div>
                        <p className="text-sm italic">
                            SPARKS will not be liable for any losses arising from unauthorized use of your account.
                        </p>
                    </Section>
                </div>

                {/* 3. Platform Services */}
                <div id="services">
                    <Section icon={<Shield className="h-5 w-5 text-primary" />} title="3. Platform Services">
                        <p>
                            SPARKS operates a technology platform that facilitates connections between users and licensed,
                            registered healthcare professionals in Sri Lanka for the provision of specialized therapeutic
                            services focused on Attention-Deficit/Hyperactivity Disorder (ADHD).
                        </p>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Services Include:</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>ADHD screening assessments and diagnostic evaluations</li>
                                <li>Connecting users with qualified therapists and healthcare professionals</li>
                                <li>Telehealth consultations and therapy sessions</li>
                                <li>Educational resources and self-management tools</li>
                                <li>Progress tracking and reporting features</li>
                                <li>Parent training programs and family support</li>
                                <li>Community forums and support groups</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Important Clarifications:</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>SPARKS is a platform provider, not a healthcare provider</li>
                                <li>Healthcare services are provided by independent licensed professionals</li>
                                <li>All medical practitioners on our platform are registered with the Sri Lanka Medical Council (SLMC) or Sri Lanka Nursing Council (SLNC)</li>
                                <li>The Platform complies with the Telemedicine Guidelines for Sri Lanka (Version 1.0, 2024)</li>
                            </ul>
                        </div>
                    </Section>
                </div>

                {/* 4. Payments and Refunds */}
                <div id="payments">
                    <Section icon={<CreditCard className="h-5 w-5 text-primary" />} title="4. Payments and Refunds">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Payment Terms</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>All fees are quoted in Sri Lankan Rupees (LKR) unless otherwise specified</li>
                                <li>Payment is required before accessing paid services or assessments</li>
                                <li>We accept major payment methods including credit/debit cards and local payment gateways</li>
                                <li>You authorize us to charge your chosen payment method for all fees you incur</li>
                                <li>Subscription fees are billed in advance on a recurring basis</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Pricing and Fee Changes</h4>
                            <p>
                                We reserve the right to modify our pricing at any time. For subscription services,
                                you will be notified at least 30 days before any price increase takes effect.
                                Price changes will not affect existing subscription periods.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Refund Policy</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Digital assessment purchases are final and non-refundable once access is granted</li>
                                <li>Appointment cancellations: Full refund if cancelled 24+ hours in advance</li>
                                <li>Appointment cancellations: 50% refund if cancelled 12-24 hours in advance</li>
                                <li>No refund for cancellations less than 12 hours before scheduled appointment</li>
                                <li>Subscription cancellations: No refund for the current billing period</li>
                                <li>Refunds for technical issues will be evaluated on a case-by-case basis</li>
                            </ul>
                        </div>
                        <p className="text-sm italic">
                            Please contact our support team at billing@sparks.lk for any payment or refund inquiries.
                        </p>
                    </Section>
                </div>

                {/* 5. User Conduct */}
                <div id="conduct">
                    <Section icon={<AlertTriangle className="h-5 w-5 text-primary" />} title="5. User Conduct and Prohibited Activities">
                        <p>You agree to use the Platform responsibly and in compliance with all applicable laws. The following activities are strictly prohibited:</p>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Prohibited Activities:</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Providing false or misleading information</li>
                                <li>Impersonating another person or entity</li>
                                <li>Harassing, threatening, or abusing other users or healthcare professionals</li>
                                <li>Sharing another user&apos;s personal or medical information without consent</li>
                                <li>Attempting to gain unauthorized access to the Platform or other users&apos; accounts</li>
                                <li>Using automated systems (bots, scrapers) to access the Platform</li>
                                <li>Uploading viruses, malware, or malicious code</li>
                                <li>Using the Platform for any illegal or unauthorized purpose</li>
                                <li>Interfering with or disrupting the Platform&apos;s operation</li>
                                <li>Attempting to reverse engineer or decompile any Platform software</li>
                            </ul>
                        </div>
                        <p className="font-semibold text-foreground">
                            Violation of these terms may result in immediate account suspension or termination,
                            and may be reported to appropriate authorities.
                        </p>
                    </Section>
                </div>

                {/* 6. Intellectual Property */}
                <div id="intellectual-property">
                    <Section icon={<Scale className="h-5 w-5 text-primary" />} title="6. Intellectual Property Rights">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">SPARKS Intellectual Property</h4>
                            <p>
                                All content, features, and functionality on the Platform, including but not limited to
                                text, graphics, logos, images, software, and assessments, are owned by SPARKS or its
                                licensors and are protected by Sri Lankan and international intellectual property laws.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Your License to Use</h4>
                            <p>
                                Subject to these Terms, we grant you a limited, non-exclusive, non-transferable,
                                revocable license to access and use the Platform for your personal, non-commercial use.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">User-Generated Content</h4>
                            <p>
                                By submitting content to the Platform (feedback, forum posts, etc.), you grant SPARKS
                                a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display
                                such content for Platform operation and improvement purposes. You retain ownership of
                                your personal content and medical information.
                            </p>
                        </div>
                        <p className="font-semibold text-foreground">
                            Unauthorized reproduction or distribution of Platform content is strictly prohibited and
                            may result in legal action.
                        </p>
                    </Section>
                </div>

                {/* 7. Medical Disclaimer */}
                <div id="medical-disclaimer">
                    <Section icon={<AlertTriangle className="h-5 w-5 text-orange-600" />} title="7. Medical Disclaimer and Professional Relationships">
                        <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                            <p className="font-semibold text-orange-900 mb-2">IMPORTANT MEDICAL DISCLAIMER</p>
                            <p className="text-orange-800 text-sm">
                                The information provided on the SPARKS Platform is for informational and educational
                                purposes only and does not constitute medical advice, diagnosis, or treatment.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Not a Substitute for Professional Care</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Always seek the advice of qualified healthcare professionals for medical concerns</li>
                                <li>Never disregard professional medical advice or delay seeking it based on Platform content</li>
                                <li>In case of emergency, call 1990 (Ambulance Service Sri Lanka) or visit the nearest hospital</li>
                                <li>The Platform is not designed for crisis intervention or emergency services</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Professional Relationships</h4>
                            <p>
                                The therapeutic relationship exists between you and the healthcare professional you choose
                                through the Platform. SPARKS facilitates this connection but is not a party to the
                                professional relationship. Healthcare professionals on the Platform are independent
                                contractors, not employees of SPARKS.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Limitations</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Telemedicine has inherent limitations compared to in-person consultations</li>
                                <li>Some conditions may require in-person evaluation</li>
                                <li>Your healthcare provider may recommend in-person visits when necessary</li>
                            </ul>
                        </div>
                    </Section>
                </div>

                {/* 8. Termination */}
                <div id="termination">
                    <Section icon={<Gavel className="h-5 w-5 text-primary" />} title="8. Account Termination and Suspension">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Your Right to Terminate</h4>
                            <p>
                                You may close your account at any time by contacting our support team or using the
                                account closure feature in your settings. Upon termination, you will lose access to
                                all Platform features.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Our Right to Terminate</h4>
                            <p>We reserve the right to suspend or terminate your account immediately, without prior notice, if:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>You violate these Terms of Service</li>
                                <li>You engage in fraudulent or illegal activities</li>
                                <li>Your account poses a security risk to the Platform or other users</li>
                                <li>We are required to do so by law or legal process</li>
                                <li>We cease providing the Platform or specific services</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Effect of Termination</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>All licenses and rights granted to you will immediately cease</li>
                                <li>You must immediately stop using the Platform</li>
                                <li>We may retain certain information as required by law or for legitimate business purposes</li>
                                <li>Provisions regarding intellectual property, disclaimers, and liability limitations survive termination</li>
                            </ul>
                        </div>
                    </Section>
                </div>

                {/* 9. Limitation of Liability */}
                <div id="liability">
                    <Section icon={<Shield className="h-5 w-5 text-primary" />} title="9. Disclaimers and Limitation of Liability">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Platform Provided &quot;As Is&quot;</h4>
                            <p>
                                The Platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis. SPARKS makes no
                                warranties, express or implied, regarding the Platform&apos;s operation, content, or availability.
                                We do not guarantee that the Platform will be error-free, secure, or uninterrupted.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Limitation of Liability</h4>
                            <p>
                                To the maximum extent permitted by Sri Lankan law, SPARKS, its directors, employees,
                                and affiliates shall not be liable for:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                                <li>Loss of profits, data, or business opportunities</li>
                                <li>Damages arising from healthcare services provided by independent professionals</li>
                                <li>Unauthorized access to or alteration of your transmissions or data</li>
                                <li>Technical failures, interruptions, or errors in the Platform</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Maximum Liability</h4>
                            <p>
                                Our total liability to you for any claims arising from these Terms or your use of the
                                Platform shall not exceed the amount you paid to SPARKS in the 12 months preceding
                                the claim, or LKR 10,000, whichever is less.
                            </p>
                        </div>
                        <p className="text-sm italic">
                            Some jurisdictions do not allow certain liability limitations, so some of the above may not apply to you.
                        </p>
                    </Section>
                </div>

                {/* 10. Governing Law */}
                <div id="governing-law">
                    <Section icon={<Scale className="h-5 w-5 text-primary" />} title="10. Governing Law and Dispute Resolution">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Governing Law</h4>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of the
                                Democratic Socialist Republic of Sri Lanka, without regard to its conflict of law principles.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Jurisdiction</h4>
                            <p>
                                You agree that any legal action or proceeding arising out of or relating to these Terms
                                shall be brought exclusively in the courts of Colombo, Sri Lanka, and you consent to
                                the jurisdiction of such courts.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Dispute Resolution</h4>
                            <p>
                                Before initiating legal action, you agree to first attempt to resolve disputes informally
                                by contacting us at legal@sparks.lk. We are committed to working with you to reach a
                                fair resolution.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Applicable Regulations</h4>
                            <p>Our Platform complies with:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Personal Data Protection Act No. 9 of 2022</li>
                                <li>Telemedicine Guidelines for Sri Lanka (Version 1.0, 2024)</li>
                                <li>Electronic Transactions Act No. 19 of 2006</li>
                                <li>Computer Crime Act No. 24 of 2007</li>
                                <li>Medical Ordinance governed by SLMC regulations</li>
                            </ul>
                        </div>
                    </Section>
                </div>

                {/* Contact Section */}
                <Card className="bg-gradient-to-r from-primary/10 to-purple-50 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Mail className="h-5 w-5" />
                            Questions About These Terms?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-muted-foreground">
                            If you have any questions about these Terms of Service, please contact us:
                        </p>
                        <div className="space-y-2 text-sm">
                            <p><strong>Email:</strong> legal@sparks.lk</p>
                            <p><strong>Phone:</strong> +94 11 SPARKS (776 257)</p>
                            <p><strong>Address:</strong> SPARKS, No. 123, Galle Road, Colombo 03, Sri Lanka</p>
                        </div>
                        <div className="pt-4">
                            <Link href="/contact" className="text-primary hover:underline font-medium">
                                Contact our support team →
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Acknowledgment */}
                <div className="mt-8 p-6 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground text-center">
                        By using the SPARKS Platform, you acknowledge that you have read, understood, and agree
                        to be bound by these Terms of Service. These Terms were last updated on <strong>{lastUpdated}</strong>.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
