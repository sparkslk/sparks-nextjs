"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/lib/auth";
import Header from "@/components/landingpage/Header/page";
import Footer from "@/components/landingpage/Footer/page";
import { Shield, Settings, Users, BarChart3 } from "lucide-react";

export default function AdminSignupPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        adminKey: "",
        accessLevel: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setIsLoading(false);
            return;
        }

        if (!formData.adminKey.trim()) {
            setError("Admin key is required for administrator registration.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    role: UserRole.ADMIN,
                    metadata: {
                        adminKey: formData.adminKey,
                        accessLevel: formData.accessLevel,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create account");
            }

            // Sign in the user after successful signup
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                throw new Error("Failed to sign in after registration");
            }

            router.push("/admin/dashboard");
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
                    {/* Left Column - Benefits */}
                    <div className="hidden lg:block space-y-8">
                        <div className="text-center lg:text-left">
                            <h1 className="text-4xl font-bold text-foreground mb-4">
                                Admin Access to{" "}
                                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                    SPARKS
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Manage and oversee the SPARKS platform with comprehensive administrative tools
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border">
                                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">System Security</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Full control over system security, user access, and data protection
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">User Management</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Manage all users, roles, and permissions across the platform
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <BarChart3 className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Analytics & Reporting</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Access comprehensive system analytics and generate detailed reports
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Settings className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">System Configuration</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Configure system settings, features, and platform customizations
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="w-full max-w-md mx-auto lg:mx-0">
                        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
                            <CardHeader className="space-y-4 text-center">
                                <div className="flex justify-center">
                                    <Image
                                        src="/images/sparkslogo.png"
                                        alt="SPARKS Logo"
                                        width={60}
                                        height={60}
                                        className="rounded-lg"
                                    />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold text-foreground">
                                        Admin Registration
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        Create your administrator account for SPARKS system management
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            Full Name
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="adminKey" className="text-sm font-medium">
                                            Admin Key *
                                        </Label>
                                        <Input
                                            id="adminKey"
                                            name="adminKey"
                                            type="password"
                                            placeholder="Enter the admin key"
                                            value={formData.adminKey}
                                            onChange={handleChange}
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="accessLevel" className="text-sm font-medium">
                                            Access Level
                                        </Label>
                                        <Input
                                            id="accessLevel"
                                            name="accessLevel"
                                            type="text"
                                            placeholder="e.g., System Admin, Super Admin, etc."
                                            value={formData.accessLevel}
                                            onChange={handleChange}
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-medium">
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="Create a password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                            Confirm Password
                                        </Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="Confirm your password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    {error && (
                                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Creating Account..." : "Create Admin Account"}
                                    </Button>
                                </form>

                                <div className="text-center space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Already have an account?{" "}
                                        <Link
                                            href="/login"
                                            className="text-primary hover:underline font-medium"
                                        >
                                            Sign in
                                        </Link>
                                    </p>
                                    <div className="text-xs text-muted-foreground">
                                        ⚠️ Admin registration requires valid admin key
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
