"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validatePassword } from "@/lib/password-validation";
import { Shield, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Header from "@/components/landingpage/Header/page";
import Footer from "@/components/landingpage/Footer/page";

export default function ForgotPasswordPage() {
    const [userId, setUserId] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Validation
        if (!userId.trim()) {
            setError("User ID is required");
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.errors.join(". "));
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userId.trim(),
                    newPassword: newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to reset password");
            }

            setSuccess(true);
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
                <Header />
                <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
                    <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur">
                        <CardHeader className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold text-green-600">
                                    Password Reset Successful!
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    Your password has been reset successfully.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">
                                You can now sign in with your new password.
                            </p>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                Redirecting to login...
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
                    {/* Left Column - Information */}
                    <div className="hidden lg:block space-y-8">
                        <div className="text-center lg:text-left">
                            <h1 className="text-4xl font-bold text-foreground mb-4">
                                Reset Your{" "}
                                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                    Password
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Use your User ID to securely reset your password
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Find Your User ID</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Your User ID is displayed in your dashboard under the Patient Information card.
                                        Look for the purple-bordered User ID section.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Secure Process</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Your password will be securely encrypted and updated in our system
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Instant Access</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Once reset, you can immediately login with your new password
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
                                        Forgot Password
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        Enter your User ID to reset your password
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Alert>
                                    <Shield className="h-4 w-4" />
                                    <AlertDescription className="text-sm">
                                        You can find your <strong>User ID</strong> in your dashboard under the Patient Information card.
                                    </AlertDescription>
                                </Alert>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="userId" className="text-sm font-medium">
                                            User ID
                                        </Label>
                                        <Input
                                            id="userId"
                                            type="text"
                                            placeholder="Enter your User ID (e.g., clx123...)"
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                            required
                                            className="h-11 font-mono"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Copy the <strong>User ID</strong> from the Patient Information card in your dashboard
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword" className="text-sm font-medium">
                                            New Password
                                        </Label>
                                        <PasswordInput
                                            id="newPassword"
                                            placeholder="Enter your new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            className="h-11"
                                        />
                                        {newPassword && (
                                            <PasswordStrengthIndicator password={newPassword} />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                            Confirm New Password
                                        </Label>
                                        <PasswordInput
                                            id="confirmPassword"
                                            placeholder="Confirm your new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Resetting Password..." : "Reset Password"}
                                    </Button>
                                </form>

                                <div className="text-center space-y-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-border" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-card px-2 text-muted-foreground">or</span>
                                        </div>
                                    </div>

                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Login
                                    </Link>
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
