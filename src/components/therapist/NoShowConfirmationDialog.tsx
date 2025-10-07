"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface NoShowConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function NoShowConfirmationDialog({ isOpen, onConfirm, onCancel }: NoShowConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogOverlay className="bg-black/20" />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Confirm No Show Selection
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Selecting &quot;No Show&quot; will clear all existing clinical documentation for this session. 
            This action cannot be undone. Are you sure you want to proceed?
          </p>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Confirm No Show
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
