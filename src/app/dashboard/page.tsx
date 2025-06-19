"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Manual UserRole enum (matching our types)
enum UserRole {
    NORMAL_USER = "NORMAL_USER",
    PARENT_GUARDIAN = "PARENT_GUARDIAN",
    THERAPIST = "THERAPIST",
    MANAGER = "MANAGER",
    ADMIN = "ADMIN",
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [shouldShowPasswordPrompt, setShouldShowPasswordPrompt] = useState(false);
    const [passwordPromptDismissed, setPasswordPromptDismissed] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            // Check if user needs to set up a password
            fetch("/api/auth/password-status")
                .then(res => res.json())
                .then(data => {
                    if (data.shouldShowPasswordPrompt) {
                        setShouldShowPasswordPrompt(true);
                    }
                })
                .catch(console.error);
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session || !session.user) {
        return null;
    }

    // Type assertion to access the role property
    const user = session.user as typeof session.user & { role: UserRole };

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case "NORMAL_USER":
                return "Normal User";
            case "PARENT_GUARDIAN":
                return "Parent/Guardian";
            case "THERAPIST":
                return "Therapist";
            case "MANAGER":
                return "Manager";
            case "ADMIN":
                return "Administrator";
            default:
                return role;
        }
    };

    const getRoleDescription = (role: string) => {
        switch (role) {
            case "NORMAL_USER":
                return "You have regular user access to the platform.";
            case "PARENT_GUARDIAN":
                return "You can manage family accounts and children's profiles.";
            case "THERAPIST":
                return "You have access to therapeutic tools and client management.";
            case "MANAGER":
                return "You can manage team operations and user accounts.";
            case "ADMIN":
                return "You have full administrative access to the system.";
            default:
                return "Welcome to your dashboard.";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <header className="border-b border-border bg-card/50 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Image
                                src="/images/sparkslogo.png"
                                alt="SPARKS Logo"
                                width={80}
                                height={40}
                                className="object-contain"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-foreground">SPARKS Dashboard</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-foreground">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <Button variant="outline" onClick={handleSignOut}>
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>            <CardTitle className="text-2xl">
                            Welcome, {user.name}!
                        </CardTitle>
                            <CardDescription>
                                {getRoleDescription(user.role || "")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                    <h3 className="font-semibold text-foreground">Account Type</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {getRoleDisplayName(user.role || "")}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                                    <h3 className="font-semibold text-foreground">Email</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {user.email}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                                    <h3 className="font-semibold text-foreground">Status</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Active User
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile</CardTitle>
                                <CardDescription>
                                    Manage your account settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full">
                                    Edit Profile
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Security</CardTitle>
                                <CardDescription>
                                    Update password and security settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full">
                                    Security Settings
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Support</CardTitle>
                                <CardDescription>
                                    Get help and contact support
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full">
                                    Contact Support
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Role-specific content */}
                    {user.role === "ADMIN" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Admin Panel</CardTitle>
                                <CardDescription>
                                    Administrative tools and user management
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <Button>User Management</Button>
                                <Button>System Settings</Button>
                                <Button>Analytics</Button>
                                <Button>Audit Logs</Button>
                            </CardContent>
                        </Card>
                    )}

                    {user.role === "MANAGER" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Manager Tools</CardTitle>
                                <CardDescription>
                                    Team management and operational tools
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <Button>Team Management</Button>
                                <Button>Reports</Button>
                                <Button>Scheduling</Button>
                                <Button>Resources</Button>
                            </CardContent>
                        </Card>
                    )}

                    {user.role === "THERAPIST" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Therapist Dashboard</CardTitle>
                                <CardDescription>
                                    Client management and therapeutic tools
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <Button>Client List</Button>
                                <Button>Assessments</Button>
                                <Button>Treatment Plans</Button>
                                <Button>Progress Notes</Button>
                            </CardContent>
                        </Card>
                    )}

                    {user.role === "PARENT_GUARDIAN" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Family Dashboard</CardTitle>
                                <CardDescription>
                                    Manage your family's SPARKS journey
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <Button>Children's Profiles</Button>
                                <Button>Appointments</Button>
                                <Button>Progress Reports</Button>
                                <Button>Resources</Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Password Setup Prompt for OAuth users */}
                    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                Set Up Password
                            </CardTitle>
                            <CardDescription>
                                Set up a password to sign in with email and password in addition to Google OAuth.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-3">
                                <Button 
                                    onClick={() => router.push("/set-password")}
                                    className="bg-yellow-600 hover:bg-yellow-700"
                                >
                                    Set Password
                                </Button>
                                <Button variant="outline">
                                    Remind Me Later
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
