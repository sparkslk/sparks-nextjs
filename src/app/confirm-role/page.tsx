"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function RoleConfirmationPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [intendedRole, setIntendedRole] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }

        // Get intended role from session storage or URL
        const urlRole = searchParams.get("role");
        const storedRole = typeof window !== "undefined" ? sessionStorage.getItem("intendedRole") : null;

        setIntendedRole(urlRole || storedRole);
    }, [status, router, searchParams]);

    const handleConfirmRole = async (role: string) => {
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/set-role", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to set role");
            }

            // Clear stored intended role
            sessionStorage.removeItem("intendedRole");

            // Redirect to appropriate dashboard
            const dashboardMap: { [key: string]: string } = {
                THERAPIST: "/therapist/dashboard",
                MANAGER: "/manager/dashboard",
                ADMIN: "/admin/dashboard",
                PARENT_GUARDIAN: "/parent/dashboard",
                NORMAL_USER: "/dashboard"
            };

            const dashboardUrl = dashboardMap[role] || "/dashboard";
            router.push(dashboardUrl);
        } catch (error: any) {
            setError(error.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

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

    const getRoleDetails = (role: string) => {
        const roles: { [key: string]: { title: string; description: string; requirements?: string } } = {
            THERAPIST: {
                title: "Therapist Account",
                description: "Access therapeutic tools, client management, and treatment planning.",
                requirements: "Requires valid therapy license"
            },
            MANAGER: {
                title: "Manager Account",
                description: "Oversee operations, manage staff, and access analytics.",
                requirements: "Requires organization code"
            },
            ADMIN: {
                title: "Administrator Account",
                description: "Full system access and administrative controls.",
                requirements: "Requires admin key"
            },
            PARENT_GUARDIAN: {
                title: "Parent/Guardian Account",
                description: "Manage family accounts and track children's progress."
            },
            NORMAL_USER: {
                title: "Regular User Account",
                description: "Standard access to platform features."
            }
        };
        return roles[role] || roles.NORMAL_USER;
    };

    const roleDetails = intendedRole ? getRoleDetails(intendedRole) : null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
            <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <Image
                            src="/images/sparkslogo.png"
                            alt="SPARKS Logo"
                            width={60}
                            height={60}
                            className="rounded-lg"
                        />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            Confirm Account Type
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Complete your Google sign-up by confirming your account type
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Signed in as:</p>
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium">{session?.user?.name}</p>
                            <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                        </div>
                    </div>

                    {intendedRole && roleDetails && (
                        <div className="space-y-4">
                            <div className="p-4 border rounded-lg bg-primary/5">
                                <h3 className="font-semibold text-foreground">{roleDetails.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{roleDetails.description}</p>
                                {roleDetails.requirements && (
                                    <p className="text-xs text-yellow-600 mt-2">⚠️ {roleDetails.requirements}</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={() => handleConfirmRole(intendedRole)}
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Setting up account..." : `Confirm ${roleDetails.title}`}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => handleConfirmRole("NORMAL_USER")}
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    Create Regular User Account Instead
                                </Button>
                            </div>
                        </div>
                    )}

                    {!intendedRole && (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground text-center">
                                Choose your account type:
                            </p>

                            <div className="space-y-2">
                                <Button
                                    onClick={() => handleConfirmRole("NORMAL_USER")}
                                    variant="outline"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    Regular User
                                </Button>

                                <Button
                                    onClick={() => handleConfirmRole("PARENT_GUARDIAN")}
                                    variant="outline"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    Parent/Guardian
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                Professional accounts (Therapist, Manager, Admin) require separate registration.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            {error}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
