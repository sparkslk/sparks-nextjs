import { NotificationProvider } from "@/contexts/NotificationContext"
import { NotificationSidebar } from "@/components/NotificationSidebar"
import ParentNavigation from "./navigation/parentNavigation"

export default function ParentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <NotificationProvider>
            <div className="min-h-screen bg-gray-50">
                <ParentNavigation />
                <main className="max-w-7xl mx-auto px-6 py-8">
                    {children}
                </main>
            </div>
            <NotificationSidebar />
        </NotificationProvider>
    )
}
