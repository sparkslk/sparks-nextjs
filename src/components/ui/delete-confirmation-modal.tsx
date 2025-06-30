"use client";

import React from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  title: string;
  description: string;
  itemName?: string;
  buttonLabel?: string; // Add a customizable button label
  buttonVariant?: "destructive" | "default" | "outline" | "secondary"; // Allow customizing button variant
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onDelete,
  title,
  description,
  itemName,
  buttonLabel = "Delete", // Default to "Delete" if not provided
  buttonVariant = "destructive", // Default to destructive if not provided
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center pt-4">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6H5H21"
                stroke="#F43F5E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                stroke="#F43F5E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">
            {description}
            {itemName && (
              <>
                <br />
                <span className="font-semibold">"{itemName}"</span>
              </>
            )}
            ? This action cannot be undone.
          </p>
        </div>

        <DialogFooter className="flex flex-row justify-center gap-4 sm:justify-center">
          <Button variant="outline" onClick={onClose} className="min-w-24">
            Cancel
          </Button>
          <Button
            variant={buttonVariant}
            onClick={onDelete}
            className={`min-w-24 ${
              buttonVariant === "destructive"
                ? "bg-red-500 hover:bg-red-600"
                : buttonVariant === "outline"
                ? "border-amber-500 text-amber-600 hover:bg-amber-50"
                : ""
            }`}
          >
            {buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
