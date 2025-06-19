"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserRole } from "@/lib/auth";
import { getRoleBasedDashboard } from "@/lib/role-redirect";

const roleOptions = [
    {
        value: UserRole.NORMAL_USER,
        label: "Normal User",
        description: "Regular user access to SPARKS features",
        fields: []
    },
    {
        value: UserRole.PARENT_GUARDIAN,
        label: "Parent/Guardian",
        description: "Manage family accounts and children's progress",
        fields: []
    },
    {
        value: UserRole.THERAPIST,
        label: "Therapist",
        description: "Provide therapeutic services",
        fields: [
            { name: "licenseNumber", label: "License Number", placeholder: "Enter your therapy license number", required: true },
            { name: "specialization", label: "Specialization", placeholder: "e.g., CBT, Family Therapy, etc.", required: false }
        ]
    },
    {
        value: UserRole.MANAGER,
        label: "Manager",
        description: "Manage team and operations",
        fields: [
            { name: "organizationCode", label: "Organization Code", placeholder: "Enter your organization code", required: true },
            { name: "department", label: "Department", placeholder: "e.g., Clinical Operations, IT, etc.", required: false }
        ]
    },
    {
        value: UserRole.ADMIN,
        label: "Administrator",
        description: "Full system access",
        fields: [
            { name: "adminKey", label: "Admin Key", placeholder: "Enter the admin key", required: true, type: "password" },
            { name: "accessLevel", label: "Access Level", placeholder: "e.g., System Admin, Super Admin, etc.", required: false }
        ]
    },
];

export default function SetRolePage() {
    const { data: session, status } = useSession();
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.NORMAL_USER);
    const [metadata, setMetadata] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // If there's a suggested role in the URL params, pre-select it
        const suggestedRole = searchParams.get("role") as UserRole;
        if (suggestedRole && Object.values(UserRole).includes(suggestedRole)) {
            setSelectedRole(suggestedRole);
        }
    }, [searchParams]);

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

    const selectedRoleConfig = roleOptions.find(option => option.value === selectedRole);

    const handleMetadataChange = (field: string, value: string) => {
        setMetadata(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Validate required fields
        const requiredFields = selectedRoleConfig?.fields?.filter(field => field.required) || [];
        for (const field of requiredFields) {
            if (!metadata[field.name]?.trim()) {
                setError(`${field.label} is required for ${selectedRoleConfig?.label} role.`);
                setIsLoading(false);
                return;
            }
        }

        try {
            const response = await fetch("/api/auth/set-role", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    role: selectedRole,
                    metadata: metadata,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to set role");
            }

            // Redirect to appropriate dashboard
            const dashboardUrl = getRoleBasedDashboard(selectedRole);
            router.push(dashboardUrl);
        } catch (error: any) {
            setError(error.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
            <Card className="w-full max-w-lg shadow-xl border-0 bg-card/95 backdrop-blur">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-foreground">
                        Complete Your Registration
                    </CardTitle>
                    <CardDescription>
                        Please select your role to complete your account setup
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Label className="text-sm font-medium">Select Your Role</Label>
                            <RadioGroup
                                value={selectedRole}
                                onValueChange={(value: string) => setSelectedRole(value as UserRole)}
                                className="space-y-3"
                            >
                                {roleOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3">
                                        <RadioGroupItem
                                            value={option.value}
                                            id={option.value}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <Label
                                                htmlFor={option.value}
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                {option.label}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                {option.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {selectedRoleConfig?.fields && selectedRoleConfig.fields.length > 0 && (
                            <div className="space-y-4">
                                <Label className="text-sm font-medium">
                                    Additional Information for {selectedRoleConfig.label}
                                </Label>
                                {selectedRoleConfig.fields.map((field) => (
                                    <div key={field.name} className="space-y-2">
                                        <Label htmlFor={field.name} className="text-sm font-medium">
                                            {field.label} {field.required && "*"}
                                        </Label>
                                        <Input
                                            id={field.name}
                                            type={field.type || "text"}
                                            placeholder={field.placeholder}
                                            value={metadata[field.name] || ""}
                                            onChange={(e) => handleMetadataChange(field.name, e.target.value)}
                                            required={field.required}
                                            className="h-11"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

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
                            {isLoading ? "Setting Up..." : "Complete Setup"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
