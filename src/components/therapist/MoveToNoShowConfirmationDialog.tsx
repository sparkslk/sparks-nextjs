"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface MoveToNoShowConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  patientName?: string;
}

export function MoveToNoShowConfirmationDialog({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  patientName 
}: MoveToNoShowConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogOverlay className="bg-black/20" />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Move Session to No-Show
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to move {patientName ? `${patientName}'s` : 'this'} session to the No-Show tab? 
            This action will finalize the session as a no-show.
          </p>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              style={{ backgroundColor: '#8159A8' }}
              className="text-white hover:opacity-90"
            >
              Move to No-Show
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
