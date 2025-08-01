import { TherapistSidebar } from "@/components/therapist/TherapistSidebar"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { NotificationSidebar } from "@/components/NotificationSidebar"

export default function TherapistLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <NotificationProvider>
            <TherapistSidebar>{children}</TherapistSidebar>
            <NotificationSidebar />
        </NotificationProvider>
    )
}
