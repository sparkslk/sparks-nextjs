/* "use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface CompletionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: {
    sessionId: string;
    patientName: string;
    attendanceStatus: string;
  } | null;
  onSessionUpdated: () => void;
}

export function CompletionConfirmationModal({ 
  isOpen, 
  onClose, 
  sessionData, 
  onSessionUpdated 
}: CompletionConfirmationModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompletion = async (markAsCompleted: boolean) => {
    if (!sessionData) return;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/therapist/sessions/${sessionData.sessionId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markAsCompleted
        }),
      });

      if (response.ok) {
        onClose();
        onSessionUpdated();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update session status');
      }
    } catch (error) {
      console.error('Error updating session completion:', error);
      setError('Network error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!sessionData) return null;

  const canMarkCompleted = sessionData.attendanceStatus === 'PRESENT' || sessionData.attendanceStatus === 'LATE';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Session Documentation Saved
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600">
              Session details for <span className="font-semibold">{sessionData.patientName}</span> have been saved successfully.
            </p>
          </div>

          {canMarkCompleted ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Would you like to mark this session as completed?
              </p>
              <p className="text-xs text-blue-600">
                Marking as completed will finalize the session and update the patient&apos;s treatment progress.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 mb-2">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Session cannot be marked as completed
              </p>
              <p className="text-xs text-amber-600">
                Sessions with status &quot;{sessionData.attendanceStatus}&quot; cannot be marked as completed.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {canMarkCompleted ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleCompletion(false)}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Later
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleCompletion(true)}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Yes, Mark as Completed
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
 */