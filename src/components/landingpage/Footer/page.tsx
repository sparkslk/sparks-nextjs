import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function Footer() {
    const userLinks = [
        { href: "/signup", label: "Get Started" },
        { href: "/login", label: "Sign In" },
        { href: "/features", label: "Features" },
        { href: "/resources", label: "Resources" }
    ];

    const supportLinks = [
        { href: "/help", label: "Help Center" },
        { href: "/contact", label: "Contact Us" },
        { href: "/community", label: "Community" },
        { href: "/feedback", label: "Feedback" }
    ];

    const legalLinks = [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/accessibility", label: "Accessibility" },
        { href: "/security", label: "Security" }
    ];

    return (
        <footer className="border-t border-border bg-card/80 backdrop-blur-sm mt-12 sm:mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-3 sm:space-y-4 md:col-span-2 lg:col-span-1">
                        <Image
                            src="/images/sparkslogo.png"
                            alt="SPARKS Logo"
                            width={100}
                            height={50}
                            className="object-contain"
                        />
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            Comprehensive ADHD support platform designed specifically for Sri Lankan communities.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">For Users</h3>
                        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                            {userLinks.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href} className="hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
                        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                            {supportLinks.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href} className="hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Legal</h3>
                        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                            {legalLinks.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href} className="hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                    <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                        © 2025 SPARKS. All rights reserved. Made with ❤️ for Sri Lanka.
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-6 justify-center">
                        <Badge variant="outline" className="text-xs">
                            🇱🇰 Proudly Sri Lankan
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            🧠 ADHD Focused
                        </Badge>
                    </div>
                </div>
            </div>
        </footer>
    );
}
