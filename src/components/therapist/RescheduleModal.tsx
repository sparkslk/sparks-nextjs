"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, Clock, User, Send, X } from "lucide-react";

interface Session {
  id: string;
  patientName: string;
  patientId: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
}

interface RescheduleModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onRescheduleConfirmed: () => void;
}

export function RescheduleModal({ session, isOpen, onClose, onRescheduleConfirmed }: RescheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!session) {
      setError("Session not found");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/therapist/sessions/reschedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reschedule session");
      }

      // Show success message
      alert("Reschedule request sent successfully! The patient will be notified to select a new time slot.");
      onRescheduleConfirmed();
      handleClose();
    } catch (error) {
      console.error("Error rescheduling session:", error);
      setError(error instanceof Error ? error.message : "Failed to reschedule session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    // Extract just the time part manually to avoid timezone issues
    if (dateString.includes('T')) {
      const timePart = dateString.split('T')[1];
      const timeOnly = timePart.split('.')[0]; // Remove milliseconds if present
      const finalTime = timeOnly.split('Z')[0]; // Remove Z if present
      
      // Convert to 24-hour format
      const [hours, minutes] = finalTime.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    
    // Fallback to original method
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="w-5 h-5 text-[#8159A8]" />
            Reschedule Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">{session.patientName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700">{formatDate(session.scheduledAt)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700">{formatTime(session.scheduledAt)} ({session.duration} minutes)</span>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">Reschedule Request</p>
                <p className="text-amber-700">
                  The patient will be notified about the reschedule request. The patient will need to select a new time slot from your available timeslots.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-[#8159A8] hover:bg-[#6d4792] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Reschedule Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
             

