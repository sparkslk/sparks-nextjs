"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { validatePassword } from "@/lib/password-validation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetPasswordPage() {
    const { data: session, status } = useSession();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

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

    if (status === "unauthenticated") {
        router.push("/login");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Validation
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.errors.join(". "));
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/set-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to set password");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard-redirect");
            }, 2000);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
                <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-green-600">
                            Password Set Successfully!
                        </CardTitle>
                        <CardDescription>
                            You can now sign in with your email and password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Redirecting to dashboard...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
            <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur">
                <CardHeader className="space-y-4 text-center">
                    <div>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            Set Password
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Set up a password to sign in with email and password next time
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Current Account</Label>
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium">{session?.user?.name}</p>
                            <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                New Password
                            </Label>
                            <PasswordInput
                                id="password"
                                placeholder="Enter your new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11"
                            />
                            {password && (
                                <PasswordStrengthIndicator password={password} />
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm Password
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
                            {isLoading ? "Setting Password..." : "Set Password"}
                        </Button>
                    </form>

                    <div className="text-center">
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/dashboard-redirect")}
                            className="text-sm"
                        >
                            Skip for now
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
