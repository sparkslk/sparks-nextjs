"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/ui/password-input";
import { ArrowLeft, Lock } from "lucide-react";
import { validatePassword, passwordRequirements } from "@/lib/password-validation";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showValidation, setShowValidation] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError("");
        if (field === "newPassword") {
            setShowValidation(value.length > 0);
        }
    };

    const validateForm = () => {
        if (!formData.currentPassword) {
            setError("Current password is required");
            return false;
        }
        if (!formData.newPassword) {
            setError("New password is required");
            return false;
        }
        if (!formData.confirmPassword) {
            setError("Password confirmation is required");
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match");
            return false;
        }

        const passwordValidation = validatePassword(formData.newPassword);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.errors.join(". "));
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/parent/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to change password");
            }

            setSuccess("Password changed successfully!");
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setShowValidation(false);

            // Redirect to profile page after a short delay
            setTimeout(() => {
                router.push("/parent/profile");
            }, 2000);

        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const passwordValidation = validatePassword(formData.newPassword);

    return (
        <div className="min-h-[60vh] py-12 px-4 flex justify-center">
            <div className="w-full max-w-lg">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/parent/profile")}
                    className="mb-6 p-0 h-auto text-[#8159A8] hover:text-[#6d4a8c]"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Profile
                </Button>

                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-[#8159A8] rounded-full flex items-center justify-center mb-4">
                            <Lock className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-[#8159A8]">
                            Change Password
                        </CardTitle>
                        <CardDescription>
                            Update your account password to keep your account secure
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert className="border-green-200 bg-green-50 text-green-800">
                                    <AlertDescription>{success}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <PasswordInput
                                    id="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                                    placeholder="Enter your current password"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <PasswordInput
                                    id="newPassword"
                                    value={formData.newPassword}
                                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                                    placeholder="Enter your new password"
                                    required
                                />

                                {showValidation && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
                                        <div className="space-y-1">
                                            {passwordRequirements.map((req) => {
                                                const isValid = req.regex.test(formData.newPassword);
                                                return (
                                                    <div key={req.label} className="flex items-center space-x-2">
                                                        <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                        <span className={`text-sm ${isValid ? 'text-green-700' : 'text-gray-600'}`}>
                                                            {req.message}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-gray-700">Strength:</span>
                                                <span className={`text-sm font-medium ${passwordValidation.strength === 'strong' ? 'text-green-600' :
                                                        passwordValidation.strength === 'medium' ? 'text-yellow-600' :
                                                            'text-red-600'
                                                    }`}>
                                                    {passwordValidation.strength.charAt(0).toUpperCase() + passwordValidation.strength.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <PasswordInput
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                    placeholder="Confirm your new password"
                                    required
                                />
                                {formData.confirmPassword && formData.newPassword && (
                                    <div className="flex items-center space-x-2 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${formData.newPassword === formData.confirmPassword ? 'bg-green-500' : 'bg-red-500'
                                            }`} />
                                        <span className={`text-sm ${formData.newPassword === formData.confirmPassword ? 'text-green-700' : 'text-red-700'
                                            }`}>
                                            {formData.newPassword === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-[#8159A8] hover:bg-[#6d4a8c]"
                                    disabled={loading || !passwordValidation.isValid || formData.newPassword !== formData.confirmPassword}
                                >
                                    {loading ? "Changing Password..." : "Change Password"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}