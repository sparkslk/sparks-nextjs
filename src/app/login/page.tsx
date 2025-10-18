"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRoleBasedDashboardSync } from "@/lib/role-redirect";
import { UserRole } from "@/lib/auth";
import Header from "@/components/landingpage/Header/page";
import Footer from "@/components/landingpage/Footer/page";
import { Shield, Heart, Users, Smartphone } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { data: session, status } = useSession();

    // Redirect authenticated users to their dashboard
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const userRole = (session.user as { role?: UserRole }).role as UserRole;
            const dashboardUrl = getRoleBasedDashboardSync(userRole);
            router.push(dashboardUrl);
        }
    }, [session, status, router]);

    // Show loading while checking authentication
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                if (result.error === "CredentialsSignin") {
                    setError("Invalid email or password. If you signed up with Google, you may need to set up a password first.");
                } else {
                    setError("Invalid credentials. Please try again.");
                }
            } else {
                // Always redirect to dashboard-redirect, let it handle role-based routing
                router.push("/dashboard-redirect");
                router.refresh();
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            // Google OAuth will be handled by middleware for role-based redirect
            await signIn("google");
        } catch {
            setError("Google sign-in failed. Please try again.");
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
                                Welcome back to{" "}
                                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                    SPARKS
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Continue your ADHD support journey with our comprehensive platform
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Heart className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Personalized Dashboard</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Access your personalized ADHD management dashboard with progress tracking
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Connect with Therapists</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Book sessions and communicate with qualified ADHD specialists
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Smartphone className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Mobile Access</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Access your account anywhere with our mobile-optimized platform
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border">
                                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Secure & Private</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Your health data is protected with enterprise-grade security
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
                                        width={120}
                                        height={60}
                                        className="object-contain"
                                    />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold text-foreground">
                                        Welcome Back
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        Sign in to your SPARKS account
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-sm font-medium">
                                                Password
                                            </Label>
                                            <Link
                                                href="/forgot-password"
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <PasswordInput
                                            id="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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
                                        {isLoading ? "Signing in..." : "Sign In"}
                                    </Button>
                                </form>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-border" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={handleGoogleSignIn}
                                    disabled={isLoading}
                                    className="w-full h-11 border-border hover:bg-accent"
                                >
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Continue with Google
                                </Button>

                                <div className="text-center text-sm space-y-2">
                                    <div>
                                        <span className="text-muted-foreground">Don&apos;t have an account? </span>
                                        <Link
                                            href="/signup"
                                            className="text-primary font-medium hover:underline"
                                        >
                                            Sign up
                                        </Link>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Signed up with Google? </span>
                                        <Link
                                            href="/set-password"
                                            className="text-primary font-medium hover:underline"
                                        >                            Set up password
                                        </Link>
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
