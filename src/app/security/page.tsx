"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Shield,
    Lock,
    Key,
    Server,
    Eye,
    FileCheck,
    AlertTriangle,
    CheckCircle,
    Database,
    Cloud,
    Users,
    Mail,
    Bug,
    ShieldCheck,
    FileText,
    Globe
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

interface SecurityFeatureProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}

const SecurityFeature = ({ icon, title, description, color }: SecurityFeatureProps) => (
    <Card className="hover:shadow-lg transition-shadow h-full">
        <CardContent className="pt-6">
            <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
                {icon}
            </div>
            <h3 className="font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export default function SecurityPage() {
    const lastUpdated = "January 20, 2025";

    const securityFeatures = [
        {
            icon: <Lock className="h-6 w-6 text-white" />,
            title: "End-to-End Encryption",
            description: "All data transmitted between your device and our servers is encrypted using TLS 1.3 protocol.",
            color: "bg-blue-600"
        },
        {
            icon: <Database className="h-6 w-6 text-white" />,
            title: "Encrypted Storage",
            description: "Medical records and sensitive data are encrypted at rest using AES-256 encryption.",
            color: "bg-purple-600"
        },
        {
            icon: <Key className="h-6 w-6 text-white" />,
            title: "Multi-Factor Authentication",
            description: "Optional two-factor authentication (2FA) adds an extra layer of security to your account.",
            color: "bg-green-600"
        },
        {
            icon: <Eye className="h-6 w-6 text-white" />,
            title: "24/7 Security Monitoring",
            description: "Continuous monitoring and intrusion detection systems protect against unauthorized access.",
            color: "bg-orange-600"
        },
        {
            icon: <Users className="h-6 w-6 text-white" />,
            title: "Access Controls",
            description: "Role-based access control ensures users only access data necessary for their role.",
            color: "bg-red-600"
        },
        {
            icon: <Server className="h-6 w-6 text-white" />,
            title: "Secure Infrastructure",
            description: "Hosted on certified cloud infrastructure with physical and network security measures.",
            color: "bg-indigo-600"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
            <Header />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
                        YOUR DATA IS SAFE
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Security{" "}
                        <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Overview
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        At SPARKS, security is our top priority. We implement industry-leading security measures
                        to protect your personal and medical information from unauthorized access, disclosure, or misuse.
                    </p>
                    <div className="mt-4 text-sm text-muted-foreground">
                        <strong>Last Updated:</strong> {lastUpdated}
                    </div>
                </div>

                {/* Security Commitment */}
                <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                            <ShieldCheck className="h-6 w-6" />
                            Our Security Commitment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-green-900">
                        <p>
                            As a healthcare platform handling sensitive medical information, we understand the critical
                            importance of security. We are committed to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li>Protecting the confidentiality, integrity, and availability of your data</li>
                            <li>Complying with Sri Lanka&apos;s Personal Data Protection Act 2022 and international security standards</li>
                            <li>Continuously updating our security practices to address emerging threats</li>
                            <li>Being transparent about our security measures and any incidents</li>
                            <li>Empowering you with tools to protect your own account</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Security Features Grid */}
                <section className="mb-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Security Features</h2>
                        <p className="text-lg text-muted-foreground">
                            Multiple layers of protection safeguarding your data
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {securityFeatures.map((feature, index) => (
                            <SecurityFeature key={index} {...feature} />
                        ))}
                    </div>
                </section>

                {/* Data Protection */}
                <Section icon={<Lock className="h-5 w-5 text-primary" />} title="Data Protection Measures">
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Encryption in Transit</h4>
                        <p>
                            All data transmitted between your device and our servers is protected using:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li>Transport Layer Security (TLS) 1.3 - the latest and most secure protocol</li>
                            <li>HTTPS enforced on all connections with HSTS (HTTP Strict Transport Security)</li>
                            <li>Perfect Forward Secrecy (PFS) to protect past sessions even if keys are compromised</li>
                            <li>Strong cipher suites recommended by security experts</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Encryption at Rest</h4>
                        <p>
                            Your data is protected while stored on our servers:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li>AES-256 encryption for all sensitive data, including medical records</li>
                            <li>Separate encryption keys for different data types</li>
                            <li>Hardware Security Modules (HSM) for key management</li>
                            <li>Regular key rotation following security best practices</li>
                            <li>Encrypted database backups stored in geographically separate locations</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Password Security</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Passwords are hashed using bcrypt with strong salt (12+ rounds)</li>
                            <li>Never stored in plain text or reversible encryption</li>
                            <li>Minimum password strength requirements enforced</li>
                            <li>Password breach detection using HaveIBeenPwned API</li>
                            <li>Secure password reset process with time-limited tokens</li>
                        </ul>
                    </div>
                </Section>

                {/* Access Control */}
                <Section icon={<Users className="h-5 w-5 text-primary" />} title="Access Control and Authentication">
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Multi-Factor Authentication (MFA)</h4>
                        <p>
                            We strongly recommend enabling two-factor authentication for enhanced account security:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li>Time-based One-Time Passwords (TOTP) via authenticator apps</li>
                            <li>SMS-based verification codes</li>
                            <li>Email verification for sensitive operations</li>
                            <li>Backup codes for account recovery</li>
                            <li>Required for healthcare providers and administrators</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Role-Based Access Control (RBAC)</h4>
                        <p>
                            Users only have access to data necessary for their role:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li>Patients can only access their own medical records</li>
                            <li>Therapists can only view assigned patient information</li>
                            <li>Administrators have limited access with full audit logging</li>
                            <li>Principle of least privilege applied throughout the system</li>
                            <li>Regular access reviews and permission audits</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Session Management</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Secure session tokens with limited lifetime</li>
                            <li>Automatic logout after 30 minutes of inactivity</li>
                            <li>Session invalidation on password change</li>
                            <li>Detection of suspicious login attempts</li>
                            <li>Email notifications for new device logins</li>
                        </ul>
                    </div>
                </Section>

                {/* Infrastructure Security */}
                <Section icon={<Server className="h-5 w-5 text-primary" />} title="Infrastructure and Network Security">
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Cloud Infrastructure</h4>
                        <p>
                            Our platform is hosted on enterprise-grade cloud infrastructure:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li>AWS and Google Cloud Platform - both ISO 27001 and SOC 2 certified</li>
                            <li>Data centers located in Sri Lanka and Singapore (GDPR-compliant regions)</li>
                            <li>Physical security with biometric access controls</li>
                            <li>Redundant power and network connections for high availability</li>
                            <li>Geographic replication for disaster recovery</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Network Security</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Web Application Firewall (WAF) to block malicious traffic</li>
                            <li>DDoS protection to ensure service availability</li>
                            <li>Intrusion Detection and Prevention Systems (IDS/IPS)</li>
                            <li>Network segmentation isolating different system components</li>
                            <li>Regular vulnerability scanning and penetration testing</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Application Security</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Secure coding practices following OWASP Top 10 guidelines</li>
                            <li>Input validation and sanitization to prevent injection attacks</li>
                            <li>Protection against Cross-Site Scripting (XSS) and CSRF attacks</li>
                            <li>Regular security code reviews and static analysis</li>
                            <li>Dependency scanning to detect vulnerable libraries</li>
                        </ul>
                    </div>
                </Section>

                {/* Monitoring and Incident Response */}
                <Section icon={<Eye className="h-5 w-5 text-primary" />} title="Security Monitoring and Incident Response">
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Continuous Monitoring</h4>
                        <p>
                            Our security operations center provides 24/7 monitoring:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li>Real-time threat detection and alerting</li>
                            <li>Automated security event correlation and analysis</li>
                            <li>Log aggregation and retention for forensic investigation</li>
                            <li>Anomaly detection using machine learning</li>
                            <li>Regular security metrics reporting to leadership</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Incident Response Plan</h4>
                        <p>
                            We maintain a comprehensive incident response plan:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li>Dedicated security incident response team (SIRT)</li>
                            <li>Defined procedures for detection, containment, and recovery</li>
                            <li>Communication protocols for notifying affected users</li>
                            <li>Post-incident analysis and lessons learned</li>
                            <li>Regular tabletop exercises to test response procedures</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Breach Notification</h4>
                        <p>
                            In the unlikely event of a data breach:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li>Notification to Data Protection Authority within 72 hours (PDPA requirement)</li>
                            <li>Direct notification to affected users without undue delay</li>
                            <li>Clear communication about nature of breach and remediation steps</li>
                            <li>Assistance and resources to protect affected individuals</li>
                            <li>Public transparency report on our website</li>
                        </ul>
                    </div>
                </Section>

                {/* Compliance and Audits */}
                <Section icon={<FileCheck className="h-5 w-5 text-primary" />} title="Compliance and Audits">
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Regulatory Compliance</h4>
                        <p>
                            SPARKS complies with applicable data protection and healthcare regulations:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li><strong>Personal Data Protection Act No. 9 of 2022 (Sri Lanka)</strong> - Comprehensive data protection compliance</li>
                            <li><strong>Telemedicine Guidelines (Sri Lanka, 2024)</strong> - Healthcare-specific security requirements</li>
                            <li><strong>ISO 27001</strong> - Information security management system (certification in progress)</li>
                            <li><strong>SOC 2 Type II</strong> - Security, availability, and confidentiality controls (planned 2025)</li>
                            <li><strong>HIPAA-inspired practices</strong> - International healthcare data protection standards</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Security Audits</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Annual third-party security audits by certified professionals</li>
                            <li>Quarterly internal security assessments</li>
                            <li>Regular penetration testing by ethical hackers</li>
                            <li>Vulnerability assessments of all systems and applications</li>
                            <li>Code security reviews for all new features</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Security Certifications</h4>
                        <div className="grid md:grid-cols-2 gap-3 mt-2">
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                                <p className="font-semibold text-green-800 text-sm">✓ SSL/TLS Certificate</p>
                                <p className="text-xs text-green-700">Valid and up-to-date encryption</p>
                            </div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                <p className="font-semibold text-blue-800 text-sm">✓ PCI DSS Compliant</p>
                                <p className="text-xs text-blue-700">Via certified payment processors</p>
                            </div>
                            <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                                <p className="font-semibold text-purple-800 text-sm">⏳ ISO 27001</p>
                                <p className="text-xs text-purple-700">Certification in progress (Q3 2025)</p>
                            </div>
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                                <p className="font-semibold text-orange-800 text-sm">⏳ SOC 2 Type II</p>
                                <p className="text-xs text-orange-700">Audit planned for Q4 2025</p>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Employee Security */}
                <Section icon={<Users className="h-5 w-5 text-primary" />} title="Employee Security and Training">
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Background Checks</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Comprehensive background checks for all employees with data access</li>
                            <li>Reference verification and credential validation</li>
                            <li>Continuous employment screening for sensitive roles</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Security Training</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Mandatory security awareness training for all employees</li>
                            <li>Specialized training for developers on secure coding practices</li>
                            <li>Regular phishing simulation exercises</li>
                            <li>Annual HIPAA and PDPA compliance training</li>
                            <li>Incident response drills and tabletop exercises</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Confidentiality Agreements</h4>
                        <p>
                            All employees, contractors, and third-party vendors sign:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li>Non-disclosure agreements (NDAs)</li>
                            <li>Confidentiality and acceptable use policies</li>
                            <li>Code of conduct including data protection responsibilities</li>
                            <li>Agreement to report security incidents immediately</li>
                        </ul>
                    </div>
                </Section>

                {/* User Security Best Practices */}
                <Section icon={<ShieldCheck className="h-5 w-5 text-primary" />} title="Your Role in Security">
                    <p>
                        While we provide robust security measures, your cooperation is essential. Here&apos;s how you
                        can help protect your account:
                    </p>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Create a Strong Password</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Use at least 12 characters with a mix of letters, numbers, and symbols</li>
                            <li>Avoid common words, personal information, or previously breached passwords</li>
                            <li>Use a unique password for SPARKS (don&apos;t reuse passwords from other sites)</li>
                            <li>Consider using a password manager to generate and store strong passwords</li>
                            <li>Change your password if you suspect it has been compromised</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Enable Two-Factor Authentication</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Turn on 2FA in your account settings for extra protection</li>
                            <li>Use an authenticator app (Google Authenticator, Authy) for best security</li>
                            <li>Save backup codes in a secure location</li>
                            <li>Never share your 2FA codes with anyone</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Be Cautious with Emails and Links</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>SPARKS will never ask for your password via email</li>
                            <li>Verify sender addresses before clicking links or downloading attachments</li>
                            <li>Look for the lock icon (🔒) and &quot;https://&quot; in your browser address bar</li>
                            <li>Report suspicious emails to security@sparks.lk</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Protect Your Devices</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Keep your operating system and browser up to date</li>
                            <li>Use antivirus/anti-malware software</li>
                            <li>Don&apos;t access your account on public or shared computers</li>
                            <li>Enable device encryption and screen locks</li>
                            <li>Log out when you&apos;re finished, especially on shared devices</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Monitor Your Account</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Review your account activity regularly</li>
                            <li>Check for unrecognized login locations or devices</li>
                            <li>Update your contact information to receive security alerts</li>
                            <li>Report any suspicious activity immediately</li>
                        </ul>
                    </div>
                </Section>

                {/* Vulnerability Disclosure */}
                <Section icon={<Bug className="h-5 w-5 text-primary" />} title="Responsible Vulnerability Disclosure">
                    <p>
                        We appreciate the security research community&apos;s efforts in helping us maintain a secure
                        platform. If you discover a security vulnerability, we encourage responsible disclosure.
                    </p>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">How to Report a Security Vulnerability</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Email security@sparks.lk with details of the vulnerability</li>
                            <li>Include steps to reproduce the issue and potential impact</li>
                            <li>Allow us reasonable time to investigate and fix the issue before public disclosure</li>
                            <li>Do not exploit the vulnerability or access data beyond what&apos;s necessary to demonstrate the issue</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">What We Promise</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Acknowledge receipt of your report within 48 hours</li>
                            <li>Provide regular updates on our investigation and remediation</li>
                            <li>Credit you in our security acknowledgments (if desired)</li>
                            <li>Not pursue legal action against researchers who follow responsible disclosure practices</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="font-semibold text-blue-900 mb-2">Bug Bounty Program (Coming Q2 2025)</p>
                        <p className="text-sm text-blue-800">
                            We&apos;re launching a formal bug bounty program to reward security researchers who help
                            us identify and fix vulnerabilities. Check back for details on scope, rewards, and rules.
                        </p>
                    </div>
                </Section>

                {/* Contact Section */}
                <Card className="bg-gradient-to-r from-primary/10 to-purple-50 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Mail className="h-5 w-5" />
                            Security Contact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-muted-foreground">
                            For security-related questions, concerns, or to report a security issue:
                        </p>
                        <div className="space-y-2 text-sm">
                            <p><strong>Security Team:</strong> security@sparks.lk</p>
                            <p><strong>Vulnerability Reports:</strong> security@sparks.lk (PGP key available on request)</p>
                            <p><strong>Phone:</strong> +94 11 SPARKS (776 257)</p>
                            <p><strong>Response Time:</strong> Critical security issues are addressed within 24 hours</p>
                        </div>
                        <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded mt-4">
                            <p className="font-semibold text-orange-900 mb-1">Emergency Contact</p>
                            <p className="text-sm text-orange-800">
                                If you suspect your account has been compromised, change your password immediately
                                and contact us at security@sparks.lk. For immediate assistance, call our security
                                hotline at +94 77 SECURITY (732 8748).
                            </p>
                        </div>
                        <div className="pt-4 space-y-2">
                            <Link href="/privacy" className="text-primary hover:underline font-medium block">
                                View our Privacy Policy →
                            </Link>
                            <Link href="/terms" className="text-primary hover:underline font-medium block">
                                View our Terms of Service →
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Updates */}
                <Card className="mt-6 border-blue-200 bg-blue-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
                            <Globe className="h-5 w-5" />
                            Security Updates and Transparency
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-900 space-y-2">
                        <p>
                            We believe in transparency about our security practices. We publish:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Quarterly security updates on our blog</li>
                            <li>Annual transparency reports (coming 2025)</li>
                            <li>Security incident notifications (if applicable)</li>
                            <li>Updates to this security page when practices change</li>
                        </ul>
                        <p className="pt-2">
                            Subscribe to our security newsletter to stay informed about security improvements and
                            best practices.
                        </p>
                    </CardContent>
                </Card>

                {/* Acknowledgment */}
                <div className="mt-8 p-6 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground text-center">
                        This Security Overview was last updated on <strong>{lastUpdated}</strong>. We continuously
                        improve our security measures and will update this page to reflect any significant changes.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
