"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, ArrowLeft } from "lucide-react";
import { UserRole } from "@/lib/auth";
import { userRoleNeedsProfile, getRedirectPathForRole } from "@/lib/profile-utils";

export default function CreateProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
        dateOfBirth: "",
        gender: "OTHER",
        emergencyContact: {
            name: "",
            phone: "",
            relationship: ""
        },
        medicalHistory: ""
    });

    const checkExistingProfile = useCallback(async () => {
        try {
            const response = await fetch("/api/profile");
            if (response.ok) {
                const data = await response.json();
                if (data.profile) {
                    // User already has a profile, redirect to dashboard
                    router.push("/dashboard");
                }
            }
        } catch (error) {
            console.error("Error checking profile:", error);
        }
    }, [router]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        // Check if user's role needs a profile
        if (status === "authenticated" && session?.user) {
            const userRole = (session.user as { role?: UserRole }).role;
            
            // If user role doesn't need a profile, redirect to their dashboard
            if (userRole && !userRoleNeedsProfile(userRole)) {
                const correctPath = getRedirectPathForRole(userRole);
                router.push(correctPath);
                return;
            }
        }

        // Check if user already has a profile
        if (status === "authenticated") {
            checkExistingProfile();
        }
    }, [status, router, checkExistingProfile, session]);

    // Pre-populate email from session
    useEffect(() => {
        if (session?.user?.email && !formData.email) {
            setFormData(prev => ({
                ...prev,
                email: session.user.email!
            }));
        }
    }, [session?.user?.email, formData.email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        console.log("Submitting profile data:", formData);

        try {
            const response = await fetch("/api/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            console.log("Profile creation response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.log("Profile creation error:", errorData);
                throw new Error(errorData.error || "Failed to create profile");
            }

            const result = await response.json();
            console.log("Profile creation success:", result);

            // Profile created successfully, redirect to dashboard
            router.push("/dashboard");
        } catch (error) {
            console.error("Profile creation error:", error);
            setError(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        if (field.startsWith("emergencyContact.")) {
            const subField = field.split(".")[1];
            setFormData(prev => ({
                ...prev,
                emergencyContact: {
                    ...prev.emergencyContact,
                    [subField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Create Your Profile</h1>
                    <p className="text-gray-600 mt-1">
                        Please provide your information to complete your profile setup.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>
                            This information will help us provide you with personalized care.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        className="mt-1 bg-gray-50"
                                        readOnly
                                        placeholder="Email will be populated from your account"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="gender">Gender</Label>
                                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
                                        <Input
                                            id="emergencyContactName"
                                            value={formData.emergencyContact.name}
                                            onChange={(e) => handleInputChange("emergencyContact.name", e.target.value)}
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="emergencyContactPhone">Phone Number *</Label>
                                            <Input
                                                id="emergencyContactPhone"
                                                type="tel"
                                                value={formData.emergencyContact.phone}
                                                onChange={(e) => handleInputChange("emergencyContact.phone", e.target.value)}
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                                            <Input
                                                id="emergencyContactRelationship"
                                                value={formData.emergencyContact.relationship}
                                                onChange={(e) => handleInputChange("emergencyContact.relationship", e.target.value)}
                                                className="mt-1"
                                                placeholder="e.g., Parent, Spouse, Sibling"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
                                <div>
                                    <Label htmlFor="medicalHistory">Medical History</Label>
                                    <Textarea
                                        id="medicalHistory"
                                        value={formData.medicalHistory}
                                        onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                                        className="mt-1"
                                        rows={4}
                                        placeholder="Please describe any relevant medical history, current medications, allergies, or other important medical information..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="min-w-[120px]"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Creating...
                                        </div>
                                    ) : (
                                        "Create Profile"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
