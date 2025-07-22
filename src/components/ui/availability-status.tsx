import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface AvailabilityStatusProps {
    hasAvailability: boolean;
    className?: string;
}

export function AvailabilityStatus({ hasAvailability, className = "" }: AvailabilityStatusProps) {
    return (
        <Badge
            variant={hasAvailability ? "default" : "secondary"}
            className={`flex items-center gap-1 ${className}`}
        >
            {hasAvailability ? (
                <>
                    <CheckCircle className="h-3 w-3" />
                    Available
                </>
            ) : (
                <>
                    <XCircle className="h-3 w-3" />
                    No Availability Set
                </>
            )}
        </Badge>
    );
}

interface NextAvailableSlotProps {
    therapistId: string;
    className?: string;
}

export function NextAvailableSlot({ therapistId: _therapistId, className = "" }: NextAvailableSlotProps) {
    // This would be implemented to fetch and display the next available slot
    // For now, showing a placeholder
    return (
        <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
            <Clock className="h-4 w-4" />
            <span>Contact for availability</span>
        </div>
    );
} 