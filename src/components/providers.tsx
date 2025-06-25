"use client";

import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NotificationSidebar } from "@/components/NotificationSidebar";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <NotificationProvider>
                {children}
                <NotificationSidebar />
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
            </NotificationProvider>
        </SessionProvider>
    );
}
