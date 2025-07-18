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

  const handleSubmit = async () => {
    if (!session) return;

    setIsSubmitting(true);
    
    try {
      // Send notification to patient about reschedule request
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Session Reschedule Request',
          message: `Your therapist has requested to reschedule your session scheduled for ${formatDate(session.scheduledAt)} at ${formatTime(session.scheduledAt)}. Please check your appointments to select a new time slot.`,
          type: 'APPOINTMENT',
          receiverId: session.patientId,
          isUrgent: true,
          metadata: {
            sessionId: session.id,
            action: 'RESCHEDULE_REQUEST',
            originalScheduledAt: session.scheduledAt
          }
        }),
      });

      if (response.ok) {
        // Show success message
        alert(`Reschedule request sent to ${session.patientName}. They will be notified to select a new time slot.`);
        onRescheduleConfirmed();
        onClose();
      } else {
        throw new Error('Failed to send reschedule notification');
      }
    } catch (error) {
      console.error('Error sending reschedule notification:', error);
      alert('Failed to send reschedule request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
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
                  The patient will be notified about the reschedule request and asked to select a new time slot from your available appointments.
                </p>
              </div>
            </div>
          </div>

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
              style={{ backgroundColor: '#8159A8' }}
              className="flex-1 text-white hover:opacity-90"
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
