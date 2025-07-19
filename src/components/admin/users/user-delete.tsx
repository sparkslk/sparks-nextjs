"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserDeleteProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (userId: string | number) => void;
}

const UserDelete: React.FC<UserDeleteProps> = ({
  user,
  open,
  onOpenChange,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Make API call to delete the user
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      // Call the onDelete callback to update the parent component's state
      onDelete(user.id);
      
      // Close the modal
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      setError(null);
      onOpenChange(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Delete User
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full ${user.avatarColor} flex items-center justify-center text-white font-semibold text-lg shadow-md border-2 border-white`}
              >
                {user.avatar}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-base">
                  {user.name}
                </div>
                {user.email && (
                  <div className="text-sm text-gray-500">{user.email}</div>
                )}
                <div className="text-xs text-gray-400">
                  Role: {user.role} • ID: {user.id}
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete <strong>{user.name}</strong>? This will permanently remove:
          </p>

          <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4">
            <li>• User account and profile information</li>
            <li>• All associated data and records</li>
            {user.role === "Patient" && <li>• Medical history and appointments</li>}
            {user.role === "Therapist" && <li>• Client sessions and notes</li>}
            {user.role === "Guardian" && <li>• Patient relationships and access</li>}
            <li>• Access to the system</li>
          </ul>

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDelete;