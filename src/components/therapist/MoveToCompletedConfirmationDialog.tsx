"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface MoveToCompletedConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  patientName?: string;
}

export function MoveToCompletedConfirmationDialog({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  patientName 
}: MoveToCompletedConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogOverlay className="bg-black/20" />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Move Session to Completed
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to move {patientName ? `${patientName}'s` : 'this'} session to the Completed tab? 
            This action will finalize the session and mark it as completed.
          </p>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Move to Completed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
