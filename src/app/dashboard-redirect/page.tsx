"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

export default function DashboardRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        console.log("DashboardRedirect: Component mounted");
        
        const redirectToDashboard = async () => {
            try {
                const session = await getSession();
                
                console.log("DashboardRedirect: Got session data:", { 
                    hasSession: !!session,
                    userRole: session?.user?.role,
                    userId: session?.user?.id 
                });
                
                if (!session) {
                    console.log("DashboardRedirect: No session found, redirecting to login");
                    router.replace("/login");
                    return;
                }
                
                // Call the API to get the dashboard redirect URL
                const response = await fetch('/api/auth/dashboard-redirect');
                
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }
                
                const data = await response.json();
                const dashboardUrl = data.redirectUrl;
                
                console.log("DashboardRedirect: Redirecting to:", dashboardUrl);
                router.replace(dashboardUrl);
            } catch (error) {
                console.error("DashboardRedirect: Error during redirect process:", error);
                // Fallback redirect after 2 seconds
                setTimeout(() => {
                    console.log("DashboardRedirect: Falling back to login");
                    router.replace("/login");
                }, 2000);
            }
        };
        
        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            console.log("DashboardRedirect: Timeout reached, redirecting to login");
            router.replace("/login");
        }, 10000); // 10 second timeout
        
        redirectToDashboard().finally(() => {
            clearTimeout(timeoutId);
        });
        
        return () => clearTimeout(timeoutId);
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
