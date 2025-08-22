import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Appointment } from "@/types/appointments";
import Image from "next/image";

interface RescheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onRescheduleSuccess: () => void;
}

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function RescheduleModal({ open, onOpenChange, appointment, onRescheduleSuccess }: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Array<{slot: string, isAvailable: boolean, isBooked?: boolean, isBlocked?: boolean}>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [therapistInfo, setTherapistInfo] = useState<{
    name: string;
    cost: number;
    duration: number;
    image?: string;
  }>({
    name: "Therapist",
    cost: 3000,
    duration: 60
  });

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!appointment?.childId) return;
      
      setLoadingSlots(true);
      try {
        const response = await fetch(
          `/api/parent/sessions/available-slots?childId=${appointment.childId}&date=${selectedDate.toISOString()}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setAvailableSlots(data.slots || []);
          setTherapistInfo(prev => ({
            ...prev,
            cost: data.cost || prev.cost,
            duration: data.sessionDuration || prev.duration,
            name: data.therapistName || prev.name,
            image: data.therapistImage
          }));
        } else {
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    if (open && appointment?.childId) {
      fetchAvailableSlots();
    }
  }, [selectedDate, open, appointment?.childId]);

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
    setSelectedSlot(null);
  };

  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot);
  };

  const handleRescheduleSession = async () => {
    if (!appointment || !selectedSlot) return;

    setRescheduling(true);
    try {
      console.log('Sending reschedule request:', {
        sessionId: appointment.id,
        newDate: selectedDate.toISOString(),
        newTime: selectedSlot,
        rescheduleReason: rescheduleReason.trim()
      });

      const response = await fetch('/api/parent/sessions/reschedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: appointment.id,
          newDate: selectedDate.toISOString(),
          newTime: selectedSlot,
          rescheduleReason: rescheduleReason.trim()
        }),
      });

      if (response.ok) {
        // Show success dialog
        setShowSuccessDialog(true);
        
        // Reset form states
        setSelectedSlot(null);
        setRescheduleReason("");
        
        // Auto-close success dialog after 3 seconds and refresh data
        setTimeout(() => {
          setShowSuccessDialog(false);
          onOpenChange(false);
          onRescheduleSuccess();
        }, 3000);
      } else {
        const error = await response.json();
        alert(`Failed to reschedule session: ${error.error}`);
      }
    } catch (error) {
      console.error("Error rescheduling session:", error);
      alert("An error occurred while rescheduling the session");
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <>
      {/* Reschedule Dialog */}
      <Dialog open={open && !showSuccessDialog} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl w-full p-0 sm:p-0 overflow-y-auto max-h-[90vh] rounded-2xl shadow-2xl border border-border">
          <div className="bg-background rounded-2xl p-0 sm:p-0">
            <DialogHeader className="px-8 pt-8 pb-2 border-b border-border">
              <DialogTitle className="text-left text-2xl font-bold mb-1 text-primary">Reschedule Session</DialogTitle>
              <DialogDescription className="text-left mb-2 text-muted-foreground text-base">
                Select a new date and time for your therapy session
              </DialogDescription>
            </DialogHeader>

            {/* Current Session Info */}
            {appointment && (
              <div className="px-8 pt-6 pb-2">
                <div className="font-semibold text-sm text-muted-foreground mb-2">Current Session</div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
                  <div className="text-sm text-blue-600 font-medium">Currently Scheduled:</div>
                  <div className="font-semibold text-blue-800">
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                  </div>
                  <div className="text-sm text-blue-600">
                    Type: {appointment.type} • Duration: {appointment.duration} min
                  </div>
                </div>
              </div>
            )}

            {/* Therapist Info */}
            <div className="px-8 pt-2 pb-2">
              <div className="font-semibold text-sm text-muted-foreground mb-2">Your Therapist</div>
              <div className="flex items-center gap-4 bg-card rounded-xl p-4 shadow border border-border">
                <Image 
                  src={therapistInfo.image || '/images/therapist.png'} 
                  alt={therapistInfo.name} 
                  width={48} 
                  height={48} 
                  className="object-cover w-12 h-12 rounded-full border-2 border-primary" 
                />
                <div>
                  <div className="font-bold text-base text-foreground mb-1">Dr. {therapistInfo.name}</div>
                  <div className="text-xs text-muted-foreground mb-1">Cognitive Behavioral Therapy</div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 font-semibold text-xs">★ 4.9</span>
                    <span className="text-xs text-muted-foreground">Rs.{therapistInfo.cost} per session</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Select Date & Calendar */}
            <div className="px-8 pt-4 pb-2">
              <div className="font-semibold text-sm text-muted-foreground mb-2">Select New Date</div>
              <div className="flex gap-2 mb-2 justify-start flex-wrap">
                {Array.from({ length: 5 }).map((_, i) => {
                  const d = new Date(year, month, today.getDate() + i);
                  const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const isSelected = d.toDateString() === selectedDate.toDateString();
                  return (
                    <button
                      key={i}
                      className={`rounded-xl px-6 py-3 text-base font-semibold border border-border shadow-sm transition-colors duration-150 focus:outline-none mb-2 ${isSelected ? "bg-primary text-white" : "bg-background text-foreground hover:bg-muted/30"} ${isPast ? "opacity-50 cursor-not-allowed" : ""}`}
                      type="button"
                      onClick={() => !isPast && handleDateClick(d.getDate())}
                      disabled={isPast}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-base">{weekdays[d.getDay()]}</span>
                        <span className="text-lg">{d.getDate()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-start mb-4">
                <Button variant="outline" size="sm" className="text-xs px-3 py-1" onClick={() => setShowCalendar(!showCalendar)}>
                  {showCalendar ? "Hide Calendar" : "View Calendar"}
                </Button>
              </div>
              {showCalendar && (
                <div className="bg-gradient-to-br from-muted/40 to-background rounded-2xl p-6 border border-border mb-2 shadow-md w-full max-w-lg mx-auto">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-2xl text-primary">{selectedDate.toLocaleString('default', { month: 'long' })} {year}</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    {weekdays.map((w) => (
                      <span key={w} className="text-base text-muted-foreground text-center font-semibold tracking-wide uppercase">{w}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2 border border-border rounded-xl bg-card p-2">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <span key={i}></span>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const cellDate = new Date(year, month, day);
                      const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                      const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month;
                      return (
                        <button
                          key={day}
                          className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-medium transition border focus:outline-none focus:ring-2 focus:ring-primary/50 ${isSelected ? "bg-primary text-white border-primary shadow-lg scale-105" : "hover:bg-primary/10 text-foreground border-transparent"} ${isPast ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={() => !isPast && handleDateClick(day)}
                          aria-label={`Select ${weekdays[cellDate.getDay()]} ${day}`}
                          disabled={isPast}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Time Slots */}
            <div className="px-8 pt-4 pb-2">
              <div className="font-semibold text-sm text-muted-foreground mb-2">Available Time Slots <span className="text-primary">{selectedDate && selectedDate.toLocaleString('default', { month: 'short', day: 'numeric' })}</span></div>
              {loadingSlots ? (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">Loading available slots...</div>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">No available time slots for this date</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  {availableSlots.map((slotData) => (
                    <Button
                      key={slotData.slot}
                      variant={selectedSlot === slotData.slot ? "default" : "outline"}
                      className={`rounded-xl px-4 py-2 text-base font-semibold shadow-sm ${
                        selectedSlot === slotData.slot 
                          ? "bg-primary text-white" 
                          : slotData.isAvailable 
                          ? "hover:bg-primary/10" 
                          : "opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
                      }`}
                      onClick={() => slotData.isAvailable && handleSlotClick(slotData.slot)}
                      disabled={!slotData.isAvailable}
                    >
                      {slotData.slot} {!slotData.isAvailable && (slotData.isBooked ? "(Booked)" : "(Blocked)")}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Reschedule Reason */}
            <div className="px-8 pt-2 pb-2">
              <div className="font-semibold text-sm text-muted-foreground mb-2">Reason for Rescheduling (Optional)</div>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                rows={3}
                placeholder="Please let us know why you're rescheduling..."
              />
            </div>

            {/* Reschedule Summary */}
            <div className="px-8 pt-4 pb-8">
              <div className="font-semibold text-sm text-muted-foreground mb-2">Reschedule Summary</div>
              <div className="bg-muted rounded-xl p-6 border border-border shadow-sm">
                <div className="mb-3 font-bold text-lg text-foreground">New Session Details</div>
                <div className="flex justify-between text-sm mb-2 text-muted-foreground">
                  <span>Date:</span> <span className="font-medium text-foreground">{weekdays[selectedDate.getDay()]} {selectedDate.getDate()}</span>
                </div>
                <div className="flex justify-between text-sm mb-2 text-muted-foreground">
                  <span>Time:</span> <span className="font-medium text-foreground">{selectedSlot || "--"}</span>
                </div>
                <div className="flex justify-between text-sm mb-2 text-muted-foreground">
                  <span>Therapist:</span> <span className="font-medium text-foreground">Dr. {therapistInfo.name}</span>
                </div>
                <div className="flex justify-between text-sm mb-4 text-muted-foreground">
                  <span>Duration:</span> <span className="font-bold text-primary">{therapistInfo.duration} min</span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      setSelectedSlot(null);
                      setRescheduleReason("");
                    }}
                    disabled={rescheduling}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-primary text-white text-base py-3 rounded-xl font-semibold shadow" 
                    disabled={!selectedSlot || rescheduling} 
                    onClick={handleRescheduleSession}
                  >
                    {rescheduling ? "Rescheduling..." : "Confirm Reschedule"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Session Rescheduled Successfully!</DialogTitle>
            <DialogDescription>
              Your therapy session has been rescheduled and both you and the therapist have been notified.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          {selectedSlot && (
            <div className="text-center space-y-2">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-600">New Session Time:</div>
                <div className="font-semibold text-green-800">
                  {selectedDate.toLocaleDateString()} at {selectedSlot}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                The page will refresh automatically in a moment...
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}