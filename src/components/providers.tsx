"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NotificationSidebar } from "@/components/NotificationSidebar";
import { Toaster } from "sonner";

function AuthenticatedProviders({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    // Always provide NotificationProvider (it will handle unauthenticated state internally)
    return (
        <NotificationProvider>
            {children}
            {status === "authenticated" && session && <NotificationSidebar />}
        </NotificationProvider>
    );
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthenticatedProviders>
                {children}
            </AuthenticatedProviders>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                    },
                }}
                closeButton
                richColors
            />
        </SessionProvider>
    );
}
