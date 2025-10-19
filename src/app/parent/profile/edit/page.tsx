"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import Image from "next/image";

interface UserProfile {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: string;
    guardianRole?: string;
    isActive?: boolean;
    isVerified?: boolean;
    isPrimary?: boolean | null;
    canMakeDecisions?: boolean | null;
    createdAt?: string | Date | null;
    updatedAt?: string | Date | null;
    contactNo?: string | null;
}

interface FormData {
    name: string;
    email: string;
    contactNo: string;
}

export default function EditParentProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        contactNo: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/parent/profile");
                if (!res.ok) throw new Error("Failed to fetch user");
                const data = await res.json();

                const userData = {
                    id: data.id,
                    email: data.email,
                    name: data.name,
                    image: data.image,
                    role: data.role,
                    guardianRole: data.guardianRole,
                    isActive: data.isActive,
                    isVerified: data.isVerified,
                    contactNo: data.contactNo,
                };

                setUser(userData);
                setFormData({
                    name: userData.name || "",
                    email: userData.email || "",
                    contactNo: userData.contactNo || "",
                });
            } catch {
                setUser(null);
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (formData.contactNo && !/^\+?[\d\s\-()]+$/.test(formData.contactNo)) {
            newErrors.contactNo = "Please enter a valid contact number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/parent/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update profile");
            }

            // Redirect back to profile page on success
            router.push("/parent/profile");
        } catch (error) {
            console.error("Error updating profile:", error);
            setErrors({
                email: error instanceof Error ? error.message : "Failed to update profile",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (!user) {
        return <div className="flex justify-center items-center h-64">User not found.</div>;
    }

    return (
        <div className="min-h-[60vh] py-12 px-4 flex justify-center">
            <div className="w-full max-w-2xl">
                <Card className="bg-white rounded-xl border border-gray-200 p-10">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/parent/profile")}
                            className="p-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-3xl font-bold text-[#8159A8]">Edit Profile</h1>
                    </div>

                    {/* Profile Image Section */}
                    <div className="flex items-center gap-6 mb-8">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt={user.name}
                                width={96}
                                height={96}
                                className="rounded-full object-cover border-4 border-[#8159A8]"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-[#8159A8]">
                                <UserIcon className="h-12 w-12 text-white" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                            <p className="text-gray-500 text-sm">Role: {user.role.replace("_", " ")}</p>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                Full Name *
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Enter your full name"
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email Address *
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder="Enter your email address"
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Contact Number Field */}
                        <div className="space-y-2">
                            <Label htmlFor="contactNo" className="text-sm font-medium text-gray-700">
                                Contact Number
                            </Label>
                            <Input
                                id="contactNo"
                                type="tel"
                                value={formData.contactNo}
                                onChange={(e) => handleInputChange("contactNo", e.target.value)}
                                placeholder="Enter your contact number"
                                className={errors.contactNo ? "border-red-500" : ""}
                            />
                            {errors.contactNo && (
                                <p className="text-sm text-red-600">{errors.contactNo}</p>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-[#8159A8] hover:bg-[#6d4a91]"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/parent/profile")}
                                className="flex-1"
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}