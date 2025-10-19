"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Shield,
    Lock,
    Database,
    Users,
    Eye,
    FileText,
    AlertTriangle,
    Globe,
    Cookie,
    Mail,
    UserCheck,
    Clock
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

export default function PrivacyPolicyPage() {
    const lastUpdated = "January 20, 2025";

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
            <Header />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
                        YOUR PRIVACY MATTERS
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Privacy{" "}
                        <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Policy
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        At SPARKS, we are committed to protecting your privacy and safeguarding your personal and
                        medical information. This Privacy Policy explains how we collect, use, store, and protect your data.
                    </p>
                    <div className="mt-4 text-sm text-muted-foreground">
                        <strong>Last Updated:</strong> {lastUpdated}
                    </div>
                </div>

                {/* Key Highlights */}
                <Card className="mb-8 bg-gradient-to-r from-primary/5 to-purple-50/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Privacy at a Glance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-foreground text-sm">Compliant & Secure</p>
                                    <p className="text-xs text-muted-foreground">Fully compliant with Sri Lanka&apos;s PDPA 2022 and GDPR-inspired best practices</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-foreground text-sm">Encrypted Storage</p>
                                    <p className="text-xs text-muted-foreground">All medical data is encrypted at rest and in transit using industry standards</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <UserCheck className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-foreground text-sm">Your Rights Protected</p>
                                    <p className="text-xs text-muted-foreground">You have full control over your data with rights to access, modify, and delete</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Eye className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-foreground text-sm">Transparent Practices</p>
                                    <p className="text-xs text-muted-foreground">Clear information about how we collect, use, and share your data</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Navigation */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Navigation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <a href="#data-collection" className="text-primary hover:underline">1. Information We Collect</a>
                            <a href="#how-we-use" className="text-primary hover:underline">2. How We Use Your Data</a>
                            <a href="#legal-basis" className="text-primary hover:underline">3. Legal Basis for Processing</a>
                            <a href="#data-sharing" className="text-primary hover:underline">4. Data Sharing & Third Parties</a>
                            <a href="#your-rights" className="text-primary hover:underline">5. Your Privacy Rights</a>
                            <a href="#security" className="text-primary hover:underline">6. Data Security</a>
                            <a href="#retention" className="text-primary hover:underline">7. Data Retention</a>
                            <a href="#cookies" className="text-primary hover:underline">8. Cookies & Tracking</a>
                            <a href="#international" className="text-primary hover:underline">9. International Transfers</a>
                            <a href="#breach" className="text-primary hover:underline">10. Data Breach Procedures</a>
                        </div>
                    </CardContent>
                </Card>

                {/* 1. Data Collection */}
                <div id="data-collection">
                    <Section icon={<Database className="h-5 w-5 text-primary" />} title="1. Information We Collect">
                        <p>
                            We collect different types of information to provide and improve our services. All health
                            data is classified as &quot;special category data&quot; under the Personal Data Protection Act 2022
                            and receives the highest level of protection.
                        </p>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Personal Information</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Name, date of birth, gender, and contact information (email, phone number, address)</li>
                                <li>National Identity Card (NIC) number or passport number (for verification purposes)</li>
                                <li>Emergency contact information</li>
                                <li>Account credentials (username, password - stored encrypted)</li>
                                <li>Profile photo (optional)</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Medical and Health Information</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>ADHD assessment results and diagnostic information</li>
                                <li>Medical history and current health conditions</li>
                                <li>Medication information and treatment plans</li>
                                <li>Therapy session notes and progress reports</li>
                                <li>Behavioral assessments and screening questionnaires</li>
                                <li>Communication with healthcare providers through the Platform</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Payment Information</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Billing address and payment method details</li>
                                <li>Transaction history and receipts</li>
                                <li>Note: Credit card information is processed by secure third-party payment processors and not stored on our servers</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Usage and Technical Data</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>IP address, browser type, and device information</li>
                                <li>Pages visited, features used, and time spent on the Platform</li>
                                <li>Log files and analytics data</li>
                                <li>Cookies and similar tracking technologies (see Section 8)</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Information from Third Parties</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Healthcare providers you authorize to share information with us</li>
                                <li>Parents or guardians (for users under 18)</li>
                                <li>Insurance providers (with your consent)</li>
                            </ul>
                        </div>
                    </Section>
                </div>

                {/* 2. How We Use Data */}
                <div id="how-we-use">
                    <Section icon={<FileText className="h-5 w-5 text-primary" />} title="2. How We Use Your Information">
                        <p>We use your information for the following purposes:</p>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Providing Healthcare Services</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Facilitate ADHD assessments and diagnoses</li>
                                <li>Connect you with qualified therapists and healthcare professionals</li>
                                <li>Enable telemedicine consultations and therapy sessions</li>
                                <li>Maintain your medical records and treatment history</li>
                                <li>Send appointment reminders and follow-up communications</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Platform Operation and Improvement</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Process payments and manage subscriptions</li>
                                <li>Provide customer support and respond to inquiries</li>
                                <li>Improve Platform features and user experience</li>
                                <li>Conduct research and analytics (using anonymized data)</li>
                                <li>Develop new services and features</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Communication</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Send service-related notifications and updates</li>
                                <li>Provide educational content and resources</li>
                                <li>Send newsletters (with your consent - you can opt out)</li>
                                <li>Respond to your questions and support requests</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Legal and Security</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Comply with legal obligations and regulations</li>
                                <li>Prevent fraud, abuse, and security threats</li>
                                <li>Enforce our Terms of Service</li>
                                <li>Protect the rights and safety of users and healthcare providers</li>
                            </ul>
                        </div>
                    </Section>
                </div>

                {/* 3. Legal Basis */}
                <div id="legal-basis">
                    <Section icon={<Shield className="h-5 w-5 text-primary" />} title="3. Legal Basis for Processing">
                        <p>
                            Under the Personal Data Protection Act No. 9 of 2022, we process your personal data based
                            on the following legal grounds:
                        </p>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Explicit Consent</h4>
                            <p>
                                For processing special category health data, we obtain your explicit, informed, and
                                freely given consent. You have the right to withdraw consent at any time.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Contractual Necessity</h4>
                            <p>
                                Processing is necessary to perform our contract with you and provide the services you
                                requested (e.g., facilitating appointments, managing your account).
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Legal Obligations</h4>
                            <p>
                                We process data to comply with legal and regulatory requirements, including:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Personal Data Protection Act No. 9 of 2022</li>
                                <li>Telemedicine Guidelines for Sri Lanka (Version 1.0, 2024)</li>
                                <li>Electronic Transactions Act No. 19 of 2006</li>
                                <li>Medical record-keeping requirements under SLMC regulations</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Legitimate Interests</h4>
                            <p>
                                We may process data for legitimate interests such as fraud prevention, network security,
                                and Platform improvement, provided these interests do not override your rights and freedoms.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Medical Necessity</h4>
                            <p>
                                Processing is necessary for medical diagnosis, provision of healthcare services, and
                                management of healthcare systems, performed by licensed healthcare professionals.
                            </p>
                        </div>
                    </Section>
                </div>

                {/* 4. Data Sharing */}
                <div id="data-sharing">
                    <Section icon={<Users className="h-5 w-5 text-primary" />} title="4. Data Sharing and Third Parties">
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded mb-4">
                            <p className="font-semibold text-blue-900 mb-1">Your Privacy is Protected</p>
                            <p className="text-blue-800 text-sm">
                                We never sell your personal or medical information to third parties. We only share data
                                when necessary to provide services or as required by law.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Healthcare Professionals</h4>
                            <p>
                                We share relevant medical information with the licensed therapists and healthcare
                                providers you choose through the Platform to facilitate your care. These professionals
                                are bound by medical confidentiality and professional ethical codes.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Service Providers</h4>
                            <p>We share limited data with trusted third-party service providers who assist us:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Cloud hosting and data storage providers (AWS, Google Cloud)</li>
                                <li>Payment processors (PayHere, Stripe) - they handle payment data securely</li>
                                <li>Email and SMS service providers for communications</li>
                                <li>Analytics providers (anonymized data only)</li>
                                <li>Customer support tools</li>
                            </ul>
                            <p className="text-sm mt-2">
                                All service providers are contractually required to protect your data and use it only
                                for specified purposes.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Legal Requirements</h4>
                            <p>We may disclose your information when required by law or in response to:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Court orders, subpoenas, or legal processes</li>
                                <li>Requests from law enforcement or government authorities</li>
                                <li>Investigations of suspected illegal activities</li>
                                <li>Protection of rights, property, or safety of SPARKS, users, or the public</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">With Your Consent</h4>
                            <p>
                                We may share information with insurance providers, family members, or other parties
                                when you provide explicit consent. You can revoke this consent at any time.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Business Transfers</h4>
                            <p>
                                In the event of a merger, acquisition, or sale of assets, your data may be transferred
                                to the new entity. We will notify you and ensure the new entity honors this Privacy Policy.
                            </p>
                        </div>
                    </Section>
                </div>

                {/* 5. Your Rights */}
                <div id="your-rights">
                    <Section icon={<UserCheck className="h-5 w-5 text-primary" />} title="5. Your Privacy Rights">
                        <p>
                            Under the Personal Data Protection Act 2022, you have the following rights regarding your
                            personal data:
                        </p>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Right to Access</h4>
                            <p>
                                You can request a copy of all personal data we hold about you. We will provide this
                                within 30 days at no charge (first request per year).
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Right to Rectification</h4>
                            <p>
                                You can request correction of inaccurate or incomplete personal data. You can update
                                most information directly in your account settings.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Right to Erasure (&quot;Right to be Forgotten&quot;)</h4>
                            <p>
                                You can request deletion of your personal data, subject to certain exceptions (e.g.,
                                legal obligations to retain medical records for specific periods).
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Right to Data Portability</h4>
                            <p>
                                You can request your data in a structured, commonly used format and transmit it to
                                another healthcare provider.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Right to Withdraw Consent</h4>
                            <p>
                                You can withdraw your consent for data processing at any time. Note that withdrawal may
                                affect our ability to provide certain services.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Right to Object</h4>
                            <p>
                                You can object to processing based on legitimate interests, direct marketing, or
                                automated decision-making.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Right to Restriction of Processing</h4>
                            <p>
                                You can request that we limit how we use your data in certain circumstances (e.g.,
                                while we verify data accuracy).
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">How to Exercise Your Rights</h4>
                            <p>
                                To exercise any of these rights, please contact our Data Protection Officer at
                                privacy@sparks.lk or use the privacy controls in your account settings. We will respond
                                to your request within 30 days.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Right to Complain</h4>
                            <p>
                                If you believe we have violated your privacy rights, you can file a complaint with the
                                Data Protection Authority of Sri Lanka at{" "}
                                <a href="https://www.dpa.gov.lk" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                    www.dpa.gov.lk
                                </a>
                            </p>
                        </div>
                    </Section>
                </div>

                {/* 6. Security */}
                <div id="security">
                    <Section icon={<Lock className="h-5 w-5 text-primary" />} title="6. Data Security Measures">
                        <p>
                            We implement robust technical and organizational measures to protect your data from
                            unauthorized access, loss, or misuse:
                        </p>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Encryption</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>All data transmitted between your device and our servers is encrypted using TLS 1.3</li>
                                <li>Medical data is encrypted at rest using AES-256 encryption</li>
                                <li>Passwords are hashed using bcrypt with strong salt</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Access Controls</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Role-based access control (RBAC) - staff can only access data necessary for their role</li>
                                <li>Multi-factor authentication (MFA) for healthcare providers</li>
                                <li>Regular access audits and logging of all data access</li>
                                <li>Automatic session timeout after inactivity</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Infrastructure Security</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Secure cloud infrastructure with certified data centers in Sri Lanka and Singapore</li>
                                <li>Regular security audits and penetration testing</li>
                                <li>Firewall protection and intrusion detection systems</li>
                                <li>Regular security updates and patch management</li>
                                <li>Daily encrypted backups with off-site storage</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Employee Training</h4>
                            <p>
                                All employees and contractors undergo mandatory data protection and confidentiality
                                training. They are bound by strict confidentiality agreements.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Data Protection Impact Assessments (DPIA)</h4>
                            <p>
                                We conduct regular DPIAs to identify and mitigate privacy risks, especially when
                                introducing new features or processing activities.
                            </p>
                        </div>
                        <p className="text-sm italic">
                            While we implement strong security measures, no system is 100% secure. We encourage you to
                            use strong passwords and protect your account credentials.
                        </p>
                    </Section>
                </div>

                {/* 7. Data Retention */}
                <div id="retention">
                    <Section icon={<Clock className="h-5 w-5 text-primary" />} title="7. Data Retention and Deletion">
                        <p>We retain your data for different periods based on the type of data and legal requirements:</p>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Medical Records</h4>
                            <p>
                                Medical records, including assessments, diagnoses, and treatment notes, are retained for
                                a minimum of 7 years after the last consultation, as required by Sri Lankan medical
                                regulations and best practices.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Account Information</h4>
                            <p>
                                Personal account information is retained for as long as your account is active. After
                                account closure, we retain essential data for 30 days to allow account reactivation,
                                then delete non-medical data.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Payment Records</h4>
                            <p>
                                Financial records are retained for 7 years to comply with tax and accounting regulations.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Communication Records</h4>
                            <p>
                                Support tickets and general communications are retained for 2 years. Medical
                                communications are part of your medical record and follow medical retention rules.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Analytics Data</h4>
                            <p>
                                Aggregated and anonymized analytics data may be retained indefinitely for research and
                                Platform improvement purposes.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Deletion Process</h4>
                            <p>
                                When data is deleted, it is permanently removed from our active systems. Backup copies
                                are deleted during the next backup cycle (within 90 days). Some data may persist in
                                encrypted backups for disaster recovery purposes but cannot be accessed for processing.
                            </p>
                        </div>
                    </Section>
                </div>

                {/* 8. Cookies */}
                <div id="cookies">
                    <Section icon={<Cookie className="h-5 w-5 text-primary" />} title="8. Cookies and Tracking Technologies">
                        <p>
                            We use cookies and similar tracking technologies to enhance your experience and understand
                            how the Platform is used.
                        </p>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Types of Cookies We Use</h4>
                            <div className="space-y-3">
                                <div>
                                    <p className="font-medium text-foreground">Essential Cookies (Required)</p>
                                    <p className="text-sm">
                                        Necessary for Platform functionality, authentication, and security. These cannot
                                        be disabled without affecting Platform operation.
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Functional Cookies (Optional)</p>
                                    <p className="text-sm">
                                        Remember your preferences, language settings, and customization choices.
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Analytics Cookies (Optional)</p>
                                    <p className="text-sm">
                                        Help us understand how users interact with the Platform using anonymized data
                                        (Google Analytics with IP anonymization).
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Performance Cookies (Optional)</p>
                                    <p className="text-sm">
                                        Monitor Platform performance and identify technical issues.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Managing Cookies</h4>
                            <p>
                                You can control cookie preferences through your browser settings or our cookie consent
                                banner. Note that disabling certain cookies may limit Platform functionality.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Third-Party Cookies</h4>
                            <p>
                                Some third-party services (e.g., payment processors, video conferencing for telemedicine)
                                may set their own cookies. We do not control these cookies. Please review their privacy
                                policies.
                            </p>
                        </div>
                    </Section>
                </div>

                {/* 9. International Transfers */}
                <div id="international">
                    <Section icon={<Globe className="h-5 w-5 text-primary" />} title="9. International Data Transfers">
                        <p>
                            Your data is primarily stored on servers located in Sri Lanka. However, some of our service
                            providers may process data in other countries.
                        </p>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Safeguards for International Transfers</h4>
                            <p>
                                When data is transferred outside Sri Lanka, we ensure appropriate safeguards are in place:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Standard Contractual Clauses (SCCs) with service providers</li>
                                <li>Transfers only to countries with adequate data protection laws</li>
                                <li>Additional encryption for data in transit internationally</li>
                                <li>Regular compliance audits of international service providers</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Service Providers by Region</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Cloud hosting: AWS (Singapore region), Google Cloud (Sri Lanka/Singapore)</li>
                                <li>Email services: SendGrid (US - using SCCs)</li>
                                <li>Analytics: Google Analytics (US - with data anonymization)</li>
                                <li>Payment processing: PayHere (Sri Lanka), Stripe (US/EU - PCI DSS compliant)</li>
                            </ul>
                        </div>
                        <p className="text-sm italic">
                            We continuously evaluate international transfers and prioritize local data storage wherever
                            possible to minimize cross-border data flows.
                        </p>
                    </Section>
                </div>

                {/* 10. Data Breach */}
                <div id="breach">
                    <Section icon={<AlertTriangle className="h-5 w-5 text-orange-600" />} title="10. Data Breach Notification Procedures">
                        <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded mb-4">
                            <p className="font-semibold text-orange-900 mb-1">Our Commitment to Breach Response</p>
                            <p className="text-orange-800 text-sm">
                                While we employ robust security measures, we maintain comprehensive breach response
                                procedures to protect you in case of any security incident.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Detection and Assessment</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>24/7 security monitoring and intrusion detection systems</li>
                                <li>Immediate investigation of suspected security incidents</li>
                                <li>Assessment of breach scope, affected data, and potential risks</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Containment and Recovery</h4>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Immediate action to contain the breach and prevent further unauthorized access</li>
                                <li>Restoration of systems and data from secure backups if necessary</li>
                                <li>Implementation of additional security measures to prevent recurrence</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Notification Requirements</h4>
                            <p>Under the PDPA 2022, we are required to:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Notify the Data Protection Authority within 72 hours of becoming aware of a breach</li>
                                <li>Notify affected individuals without undue delay if the breach poses a risk to their rights</li>
                                <li>Provide clear information about the nature of the breach and steps being taken</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">What We Will Tell You</h4>
                            <p>If you are affected by a data breach, we will inform you about:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>The nature and extent of the breach</li>
                                <li>What data was affected</li>
                                <li>Potential consequences and risks</li>
                                <li>Measures we have taken to address the breach</li>
                                <li>Steps you can take to protect yourself</li>
                                <li>Contact information for questions and support</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Your Actions</h4>
                            <p>If you suspect a security issue with your account:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Change your password immediately</li>
                                <li>Enable two-factor authentication if not already enabled</li>
                                <li>Contact us at security@sparks.lk</li>
                                <li>Monitor your account for unusual activity</li>
                            </ul>
                        </div>
                    </Section>
                </div>

                {/* Children's Privacy */}
                <Section icon={<Users className="h-5 w-5 text-primary" />} title="Children's Privacy">
                    <p>
                        While our Platform provides services for children with ADHD, we do not knowingly collect
                        personal information directly from children under 18 without parental consent.
                    </p>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Parental Controls</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Parents or legal guardians must create and manage accounts for users under 18</li>
                            <li>Parents have access to all information collected about their child</li>
                            <li>Parents can request deletion of their child&apos;s data at any time</li>
                            <li>Healthcare providers may require parental consent for treatment</li>
                        </ul>
                    </div>
                    <p>
                        If we discover we have collected information from a child under 18 without proper parental
                        consent, we will delete that information as quickly as possible.
                    </p>
                </Section>

                {/* Changes to Policy */}
                <Section icon={<FileText className="h-5 w-5 text-primary" />} title="Changes to This Privacy Policy">
                    <p>
                        We may update this Privacy Policy from time to time to reflect changes in our practices,
                        technology, legal requirements, or other factors.
                    </p>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">How We Notify You</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Material changes: Email notification and prominent Platform notice at least 30 days before effective date</li>
                            <li>Minor changes: Updated &quot;Last Updated&quot; date on this page</li>
                            <li>You will be required to accept significant changes that affect your rights</li>
                        </ul>
                    </div>
                    <p>
                        We encourage you to review this Privacy Policy periodically. Your continued use of the Platform
                        after changes take effect constitutes acceptance of the updated policy.
                    </p>
                </Section>

                {/* Contact Section */}
                <Card className="bg-gradient-to-r from-primary/10 to-purple-50 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Mail className="h-5 w-5" />
                            Contact Our Data Protection Officer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-muted-foreground">
                            For any questions about this Privacy Policy, to exercise your privacy rights, or to report
                            a privacy concern, please contact our Data Protection Officer:
                        </p>
                        <div className="space-y-2 text-sm">
                            <p><strong>Email:</strong> privacy@sparks.lk</p>
                            <p><strong>Data Protection Officer:</strong> dpo@sparks.lk</p>
                            <p><strong>Phone:</strong> +94 11 SPARKS (776 257)</p>
                            <p><strong>Address:</strong> Data Protection Officer, SPARKS, No. 123, Galle Road, Colombo 03, Sri Lanka</p>
                        </div>
                        <div className="pt-4 space-y-2">
                            <Link href="/contact" className="text-primary hover:underline font-medium block">
                                Contact our support team →
                            </Link>
                            <a
                                href="https://www.dpa.gov.lk"
                                className="text-primary hover:underline font-medium block"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Data Protection Authority of Sri Lanka →
                            </a>
                        </div>
                    </CardContent>
                </Card>

                {/* Compliance Statement */}
                <Card className="mt-6 border-green-200 bg-green-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800 text-lg">
                            <Shield className="h-5 w-5" />
                            Compliance Statement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-green-900 space-y-2">
                        <p>
                            This Privacy Policy complies with:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Personal Data Protection Act No. 9 of 2022 (Sri Lanka)</li>
                            <li>Telemedicine Guidelines for Sri Lanka (Version 1.0, 2024)</li>
                            <li>Electronic Transactions Act No. 19 of 2006</li>
                            <li>Computer Crime Act No. 24 of 2007</li>
                            <li>Medical Council of Sri Lanka confidentiality requirements</li>
                            <li>GDPR-inspired best practices for health data protection</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Acknowledgment */}
                <div className="mt-8 p-6 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground text-center">
                        By using the SPARKS Platform, you acknowledge that you have read, understood, and agree
                        to this Privacy Policy. This policy was last updated on <strong>{lastUpdated}</strong>.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
