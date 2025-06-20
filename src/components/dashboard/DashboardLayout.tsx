"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/NotificationBell";
import {
    Settings,
    LogOut,
    User,
    ChevronDown
} from "lucide-react";
import { ReactNode } from "react";

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
    const { data: session } = useSession();

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            {/* Header */}
            <header className="bg-card/95 backdrop-blur border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Image
                                src="/images/sparkslogo.png"
                                alt="Sparks Logo"
                                width={40}
                                height={40}
                                className="rounded-lg"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <NotificationBell />

                            {/* Settings */}
                            <Button variant="ghost" size="icon">
                                <Settings className="h-5 w-5" />
                            </Button>

                            {/* User Menu */}
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm font-medium">{session?.user?.name || session?.user?.email}</span>
                                    <ChevronDown className="h-3 w-3" />
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
