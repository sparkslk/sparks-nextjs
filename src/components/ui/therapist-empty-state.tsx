import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface EmptyStateProps {
  onClearFilters: () => void;
}

export function TherapistEmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100">
        <Users className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No therapists found</h3>
      <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
      <Button
        onClick={onClearFilters}
        variant="outline"
      >
        Clear All Filters
      </Button>
    </div>
  );
}