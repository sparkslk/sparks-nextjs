"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validatePassword } from "@/lib/password-validation";
import { Shield, CheckCircle2, AlertCircle, ArrowLeft, Lock } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function ChangePasswordPage() {
    const { data: session, status } = useSession();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
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
        if (!currentPassword) {
            setError("Current password is required");
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            setIsLoading(false);
            return;
        }

        if (currentPassword === newPassword) {
            setError("New password must be different from current password");
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
            const response = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to change password");
            }

            setSuccess(true);
            // Clear form
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
                router.push("/dashboard-redirect");
            }, 3000);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <DashboardLayout title="Change Password" subtitle="Update your account password">
                <div className="max-w-md mx-auto">
                    <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
                        <CardHeader className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold text-green-600">
                                    Password Changed Successfully!
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    Your password has been updated successfully.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">
                                You can now use your new password to sign in.
                            </p>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                Redirecting to dashboard...
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Change Password" subtitle="Update your account password">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Information Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Secure Update</h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Your password will be encrypted and securely stored
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                    <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Account Security</h3>
                                    <p className="text-sm text-purple-700 dark:text-purple-300">
                                        Use a strong, unique password for better security
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Change Password Form */}
                <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-2xl font-bold text-foreground">
                            Change Password
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Update your password to keep your account secure
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Current Account</Label>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium">{session?.user?.name}</p>
                                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword" className="text-sm font-medium">
                                    Current Password
                                </Label>
                                <PasswordInput
                                    id="currentPassword"
                                    placeholder="Enter your current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="h-11"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter your current password to verify your identity
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

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    type="submit"
                                    className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Changing Password..." : "Change Password"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11"
                                    onClick={() => router.back()}
                                    disabled={isLoading}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </form>

                        <div className="pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                <p className="mb-2">Don&apos;t have a password set?</p>
                                <Link
                                    href="/set-password"
                                    className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                                >
                                    Set up a password instead
                                    <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
