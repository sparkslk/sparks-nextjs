"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface EmergencyContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emergencyContactDetails: string | null;
}

const EmergencyContactDialog: React.FC<EmergencyContactDialogProps> = ({
  open,
  onOpenChange,
  emergencyContactDetails,
}) => {
  const renderDetails = () => {
    if (!emergencyContactDetails) {
      return <span className="text-gray-700">N/A</span>;
    }

    const parts = emergencyContactDetails.split(",").map((p) => p.trim());
    return (
      <>
        <div className="flex gap-2">
          <span className="font-semibold text-[#8159A8]">Name:</span>
          <span className="text-gray-700">{parts[0] || "N/A"}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-semibold text-[#8159A8]">Phone:</span>
          <span className="text-gray-700">{parts[1] || "N/A"}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-semibold text-[#8159A8]">Relationship:</span>
          <span className="text-gray-700">{parts[2] || "N/A"}</span>
        </div>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg text-[#8159A8]">
            Emergency Contact Details
          </DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <div className="space-y-2 mt-2">{renderDetails()}</div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyContactDialog;
