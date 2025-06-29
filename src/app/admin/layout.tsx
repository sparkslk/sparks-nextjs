import { NotificationProvider } from "@/contexts/NotificationContext"
import { NotificationSidebar } from "@/components/NotificationSidebar"
import AdminNavigation from "./navigation/adminNavigation"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <NotificationProvider>
            <div className="min-h-screen" style={{ backgroundColor: '#F5F3FB' }}>
                <AdminNavigation />
                <main className="max-w-7xl mx-auto px-6 py-8">
                    {children}
                </main>
            </div>
            <NotificationSidebar />
        </NotificationProvider>
    )
}