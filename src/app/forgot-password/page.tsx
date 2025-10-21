"use client";

import { useState, useEffect, useRef } from "react";
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
import { Shield, ArrowLeft, CheckCircle2, AlertCircle, Mail, Lock, Timer } from "lucide-react";
import Header from "@/components/landingpage/Header/page";
import Footer from "@/components/landingpage/Footer/page";

type Step = "email" | "otp" | "password" | "success";

export default function ForgotPasswordPage() {
    const [currentStep, setCurrentStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [verificationToken, setVerificationToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const router = useRouter();
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Timer for OTP expiry
    useEffect(() => {
        if (currentStep === "otp" && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [currentStep, timeRemaining]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setInterval(() => {
                setResendCooldown((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [resendCooldown]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!email.trim()) {
            setError("Please enter your email address");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/mobile/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    setResendCooldown(data.remainingSeconds || 60);
                    setCanResend(false);
                }
                throw new Error(data.error || "Failed to send verification code");
            }

            setCurrentStep("otp");
            setTimeRemaining(600); // Reset to 10 minutes
            setCanResend(false);
            setResendCooldown(60);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsLoading(true);
        setError("");
        setOtp(["", "", "", "", "", ""]);

        try {
            const response = await fetch("/api/mobile/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    setResendCooldown(data.remainingSeconds || 60);
                    setCanResend(false);
                }
                throw new Error(data.error || "Failed to resend verification code");
            }

            setTimeRemaining(600);
            setCanResend(false);
            setResendCooldown(60);
            setError("");
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "Failed to resend code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleOTPPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length && i < 6; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        // Focus the next empty input or the last one
        const nextEmptyIndex = newOtp.findIndex(val => !val);
        otpInputRefs.current[nextEmptyIndex !== -1 ? nextEmptyIndex : 5]?.focus();
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setError("Please enter the complete 6-digit code");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/mobile/forgot-password/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), otp: otpCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Invalid verification code");
            }

            setVerificationToken(data.verificationToken);
            setCurrentStep("password");
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "Failed to verify code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

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
            const response = await fetch("/api/mobile/forgot-password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim(),
                    verificationToken,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to reset password");
            }

            setCurrentStep("success");
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Success Screen
    if (currentStep === "success") {
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
                                Secure email verification for password recovery
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Mail className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Step 1: Enter Email</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Provide your registered email address to receive a verification code
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Step 2: Verify Code</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Enter the 6-digit code sent to your email (valid for 10 minutes)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Lock className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Step 3: New Password</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Create a strong new password for your account
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
                                        {currentStep === "email" && "Forgot Password"}
                                        {currentStep === "otp" && "Verify Your Email"}
                                        {currentStep === "password" && "Create New Password"}
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        {currentStep === "email" && "Enter your email to receive a verification code"}
                                        {currentStep === "otp" && `Code sent to ${email}`}
                                        {currentStep === "password" && "Enter your new password"}
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

                                {/* Step 1: Email Input */}
                                {currentStep === "email" && (
                                    <form onSubmit={handleRequestOTP} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium">
                                                Email Address
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

                                        <Button
                                            type="submit"
                                            className="w-full h-11 bg-primary hover:bg-primary/90"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Sending Code..." : "Send Verification Code"}
                                        </Button>
                                    </form>
                                )}

                                {/* Step 2: OTP Input */}
                                {currentStep === "otp" && (
                                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                Enter 6-Digit Code
                                            </Label>
                                            <div className="flex gap-2 justify-center" onPaste={handleOTPPaste}>
                                                {otp.map((digit, index) => (
                                                    <Input
                                                        key={index}
                                                        ref={(el) => {
                                                            otpInputRefs.current[index] = el;
                                                        }}
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={(e) => handleOTPChange(index, e.target.value)}
                                                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                                                        className="w-12 h-14 text-center text-xl font-bold"
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {timeRemaining > 0 ? (
                                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                                <Timer className="h-4 w-4" />
                                                Code expires in {formatTime(timeRemaining)}
                                            </div>
                                        ) : (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>Code expired. Please request a new one.</AlertDescription>
                                            </Alert>
                                        )}

                                        <Button
                                            type="submit"
                                            className="w-full h-11 bg-primary hover:bg-primary/90"
                                            disabled={isLoading || timeRemaining === 0}
                                        >
                                            {isLoading ? "Verifying..." : "Verify Code"}
                                        </Button>

                                        <div className="text-center">
                                            {canResend ? (
                                                <button
                                                    type="button"
                                                    onClick={handleResendOTP}
                                                    className="text-sm text-primary font-medium hover:underline"
                                                    disabled={isLoading}
                                                >
                                                    Resend Code
                                                </button>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    Resend code in {resendCooldown}s
                                                </p>
                                            )}
                                        </div>
                                    </form>
                                )}

                                {/* Step 3: New Password */}
                                {currentStep === "password" && (
                                    <form onSubmit={handleResetPassword} className="space-y-4">
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
                                            className="w-full h-11 bg-primary hover:bg-primary/90"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Resetting Password..." : "Reset Password"}
                                        </Button>
                                    </form>
                                )}

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
