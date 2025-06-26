"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { getRoleBasedDashboard } from "@/lib/role-redirect";
import type { UserRole } from "@/lib/auth";

export default function DashboardRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        console.log("DashboardRedirect: Component mounted");
        const getSessionWithRetry = async (retries = 10, delay = 200) => {
            console.log("DashboardRedirect: Starting session retry");
            for (let i = 0; i < retries; i++) {
                const session = await getSession();
                const userRole = (session?.user as { role?: UserRole })?.role;
                console.log(`DashboardRedirect: Attempt ${i + 1}, role:`, userRole);
                if (userRole) return userRole;
                await new Promise(res => setTimeout(res, delay));
            }
            console.log("DashboardRedirect: No role found after retries");
            return null;
        };
        const redirectToDashboard = async () => {
            const userRole = await getSessionWithRetry();
            const dashboardUrl = getRoleBasedDashboard(userRole ?? null);
            console.log("DashboardRedirect: Redirecting to:", dashboardUrl);
            router.replace(dashboardUrl);
        };
        redirectToDashboard();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
