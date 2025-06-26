import { NotificationProvider } from "@/contexts/NotificationContext"
import { NotificationSidebar } from "@/components/NotificationSidebar"

export default function ParentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <NotificationProvider>
            {children}
            <NotificationSidebar />
        </NotificationProvider>
    )
}
