"use client"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { NotificationSidebar } from "@/components/NotificationSidebar"
import AdminNavigation from "./navigation/adminNavigation"
import { usePathname } from "next/navigation"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const hideChrome = /^\/admin\/users\/[^/]+\/availability$/.test(pathname || "")
    return (
        <NotificationProvider>
            <div className="min-h-screen" style={{ backgroundColor: '#F5F3FB' }}>
                {!hideChrome && <AdminNavigation />}
                <main className="max-w-7xl mx-auto px-6 py-8">
                    {children}
                </main>
            </div>
            {!hideChrome && <NotificationSidebar />}
        </NotificationProvider>
    )
}