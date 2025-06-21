import { TherapistSidebar } from "@/components/therapist/TherapistSidebar"

export default function TherapistLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <TherapistSidebar>{children}</TherapistSidebar>
}
