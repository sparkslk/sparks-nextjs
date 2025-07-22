"use client";

import { Button } from "@/components/ui/button";
// import { Calendar } from "lucide-react";

interface EmptyStateProps {
  type: "no-children" | "loading" | "error";
  error?: string;
  onRetry?: () => void;
}

export default function EmptyState({ type, error, onRetry }: EmptyStateProps) {
  if (type === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F3FB' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8159A8' }}></div>
          <p className="mt-2 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Unable to load appointments</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={onRetry}>Try Again</Button>
        </div>
      </div>
    );
  }

  // if (type === "no-children") {
  //   return (
  //     <div className="text-center py-12">
  //       <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8159A8' }}>
  //         <Calendar className="w-6 h-6 text-white" />
  //       </div>
  //       <h3 className="text-base font-semibold text-gray-900 mb-2">
  //         No Children Found
  //       </h3>
  //       <p className="text-gray-600 mb-4 text-sm">
  //         Add children to your account to manage their appointments.
  //       </p>
  //       <Button
  //         className="text-white hover:opacity-90 transition-all duration-300 shadow-md text-sm"
  //         style={{ backgroundColor: '#8159A8' }}
  //         onClick={() => window.location.href = '/parent/children'}
  //       >
  //         Add Child
  //       </Button>
  //     </div>
  //   );
  // }

  return null;
}