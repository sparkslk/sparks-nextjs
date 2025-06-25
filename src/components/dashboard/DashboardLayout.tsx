"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/NotificationBell";
import {
    Settings,
    LogOut,
    User,
    ChevronDown,
    Menu,
    X
} from "lucide-react";
import { ReactNode, useState, useEffect, useRef } from "react";

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const handleSignOut = async () => {
        try {
            // Clear all potential session storage
            sessionStorage.clear();
            localStorage.clear();

            // Call custom logout API to clear cookies
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            // Sign out with proper cleanup
            await signOut({
                callbackUrl: "/login",
                redirect: true
            });
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback to regular signOut if custom logout fails
            await signOut({
                callbackUrl: "/login",
                redirect: true
            });
        }
    };

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
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
            {/* Header */}
            <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50" ref={mobileMenuRef}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo and Title */}
                        <div className="flex items-center space-x-4">
                            <Image
                                src="/images/sparkslogo.png"
                                alt="Sparks Logo"
                                width={100}
                                height={50}
                                className="object-contain"
                            />
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">{title}</h1>
                                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-4">
                            {/* Notifications */}
                            <NotificationBell />

                            {/* Settings */}
                            <Button variant="ghost" size="icon" className="hover:bg-accent">
                                <Settings className="h-5 w-5" />
                            </Button>

                            {/* User Menu */}
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm font-medium">{session?.user?.name || session?.user?.email}</span>
                                    <ChevronDown className="h-3 w-3" />
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive">
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

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

                    {/* Mobile Title (visible when desktop title is hidden) */}
                    <div className="sm:hidden pb-2">
                        <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">{title}</h1>
                        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
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
                                {/* User Info */}
                                <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg mb-2">
                                    <User className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">{session?.user?.name || session?.user?.email}</span>
                                </div>

                                {/* Notifications */}
                                <div className="flex items-center space-x-3 p-3 hover:bg-accent rounded-lg transition-colors">
                                    <NotificationBell />
                                    <span className="text-sm">Notifications</span>
                                </div>

                                {/* Settings */}
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                                    <Settings className="mr-3 h-4 w-4" />
                                    Settings
                                </Button>

                                <div className="border-t border-border my-2"></div>

                                {/* Sign Out */}
                                <Button
                                    variant="ghost"
                                    onClick={handleSignOut}
                                    className="w-full justify-start hover:bg-destructive/10 hover:text-destructive transition-colors"
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {children}
            </main>
        </div>
    );
}
