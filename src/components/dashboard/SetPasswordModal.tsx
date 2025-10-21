"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validatePassword } from "@/lib/password-validation";
import { CheckCircle2, AlertCircle, Lock } from "lucide-react";

interface SetPasswordModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function SetPasswordModal({ open, onOpenChange, onSuccess }: SetPasswordModalProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Validate passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        // Validate password strength
        const validation = validatePassword(password);
        if (!validation.isValid) {
            setError(validation.errors.join(". "));
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/set-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to set password");
            }

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onOpenChange(false);
                // Reset form
                setPassword("");
                setConfirmPassword("");
                setSuccess(false);
            }, 2000);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setPassword("");
            setConfirmPassword("");
            setError("");
            setSuccess(false);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                {success ? (
                    <div className="text-center py-6">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-green-600 mb-2">
                            Password Set Successfully!
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            You can now use this password to access the mobile app.
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="flex justify-center mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Lock className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <DialogTitle className="text-center text-xl">Set Up Your Password</DialogTitle>
                            <DialogDescription className="text-center">
                                Create a password to access your account on the SPARKS mobile app
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
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
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-11"
                                />
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={isLoading}
                                >
                                    Maybe Later
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-primary hover:bg-primary/90"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Setting Password..." : "Set Password"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
