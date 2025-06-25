"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                closeMobileMenu();
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    // Close mobile menu on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMobileMenu();
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isMobileMenuOpen]);

    return (
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50" ref={mobileMenuRef}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" onClick={closeMobileMenu}>
                            <Image
                                src="/images/sparkslogo.png"
                                alt="SPARKS Logo"
                                width={100}
                                height={50}
                                className="object-contain"
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-4" aria-label="Main navigation">
                        <Link href="/features">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                                Features
                            </Button>
                        </Link>
                        <Link href="/about">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                                About ADHD
                            </Button>
                        </Link>
                        <Link href="/resources">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                                Resources
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                                Contact
                            </Button>
                        </Link>
                        <div className="h-6 w-px bg-border mx-2"></div>
                        <Link href="/login">
                            <Button variant="ghost">Sign In</Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMobileMenu}
                            className="p-2"
                            aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <nav
                    id="mobile-menu"
                    className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen
                            ? 'max-h-96 opacity-100 visible'
                            : 'max-h-0 opacity-0 invisible overflow-hidden'
                        }`}
                    aria-label="Mobile navigation"
                    aria-hidden={!isMobileMenuOpen}
                >
                    <div className="border-t border-border bg-card/95 backdrop-blur-sm">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link href="/features" onClick={closeMobileMenu}>
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                                    Features
                                </Button>
                            </Link>
                            <Link href="/about" onClick={closeMobileMenu}>
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                                    About ADHD
                                </Button>
                            </Link>
                            <Link href="/resources" onClick={closeMobileMenu}>
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                                    Resources
                                </Button>
                            </Link>
                            <Link href="/contact" onClick={closeMobileMenu}>
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                                    Contact
                                </Button>
                            </Link>
                            <div className="border-t border-border my-2"></div>
                            <Link href="/login" onClick={closeMobileMenu}>
                                <Button variant="ghost" className="w-full justify-start hover:bg-accent transition-colors">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/signup" onClick={closeMobileMenu}>
                                <Button className="w-full justify-start bg-primary hover:bg-primary/90 transition-colors">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
}
