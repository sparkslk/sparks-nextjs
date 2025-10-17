"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/lib/auth";
import { getRoleBasedDashboardSync } from "@/lib/role-redirect";

export default function ConfirmRolePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && session?.user) {
            const userRole = (session.user as { role?: UserRole }).role;

            if (userRole && userRole !== UserRole.NORMAL_USER) {
                // User already has a role assigned, redirect to their dashboard
                const dashboardUrl = getRoleBasedDashboardSync(userRole);
                router.push(dashboardUrl);
            }
        }
    }, [status, session, router]);

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

    if (!session || !session.user) {
        return null;
    }

    const user = session.user as { role?: UserRole };

    // If user already has a role, they shouldn't be here
    if (user.role && user.role !== UserRole.NORMAL_USER) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
            <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur">
                <CardHeader className="text-center space-y-4">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        Confirm Your Role
                    </CardTitle>
                    <CardDescription className="text-base">
                        Please confirm your role to continue to your personalized dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Your account has been created successfully. You can now access your dashboard as a Normal User,
                            or contact an administrator to assign you a specific role.
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium"
                            >
                                Continue to Dashboard
                            </button>
                            <button
                                onClick={() => router.push("/setup-role")}
                                className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md font-medium"
                            >
                                Set Up Professional Role
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
