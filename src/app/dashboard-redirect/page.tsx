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
        
        const redirectToDashboard = async () => {
            const session = await getSession();
            const userRole = (session?.user as { role?: UserRole })?.role;
            const userId = (session?.user as { id?: string })?.id;
            
            console.log("DashboardRedirect: Got session data:", { userRole, userId });
            
            if (!userRole) {
                console.log("DashboardRedirect: No role found, redirecting to confirm-role");
                router.replace("/confirm-role");
                return;
            }
            
            const dashboardUrl = await getRoleBasedDashboard(userRole, userId);
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
