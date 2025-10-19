import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Calendar, Clock, Video, MapPin, Users } from "lucide-react";

interface TimeSlot {
  slot: string;
  startTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  isBlocked: boolean;
  isFree: boolean;
  cost: number;
}

interface PatientSessionBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  therapistName?: string;
  onConfirmBooking: (date: Date, slot: string) => void;
}

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const PatientSessionBookingModal: React.FC<PatientSessionBookingModalProps> = ({
  open,
  onOpenChange,
  therapistName = "Therapist",
  onConfirmBooking
}) => {
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [meetingType, setMeetingType] = useState<'IN_PERSON' | 'ONLINE' | 'HYBRID'>('IN_PERSON');

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setLoadingSlots(true);
      try {
        // Format date to YYYY-MM-DD without timezone conversion issues
        const year = selectedDate.getFullYear();
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
        const day = selectedDate.getDate().toString().padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        console.log(`Patient Dashboard: Fetching slots for date:`, dateStr);

        const response = await fetch(
          `/api/patient/sessions/available-slots?date=${dateStr}`
        );

        if (response.ok) {
          const data = await response.json();
          setAvailableSlots(data.availableSlots || []);
          console.log(`Found ${data.availableSlots?.length || 0} available slots`);
        } else {
          const error = await response.json();
          console.error("Failed to fetch slots:", error);
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    if (open) {
      fetchAvailableSlots();
    }
  }, [selectedDate, open]);

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
    setSelectedSlot(null);
  };

  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot);
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !session?.user) return;

    const selectedSlotData = availableSlots.find(slot => slot.slot === selectedSlot);
    if (!selectedSlotData) {
      alert("Selected time slot is no longer available");
      return;
    }

    // Initiate payment flow
    await handlePaymentBooking();
  };

  const handlePaymentBooking = async () => {
    if (!selectedSlot || !session?.user) {
      return;
    }

    setPaymentProcessing(true);
    setBooking(true);

    try {
      // Initiate payment
      const response = await fetch('/api/patient/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`,
          timeSlot: selectedSlot,
          sessionType: "Individual",
          meetingType: meetingType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment initiation failed');
      }

      const data = await response.json();

      if (!data.requiresPayment) {
        // Free session booked successfully
        setBookingConfirmed(true);
        onConfirmBooking(selectedDate, selectedSlot);
        setTimeout(() => {
          setBookingConfirmed(false);
          onOpenChange(false);
          setSelectedSlot(null);
          setSelectedDate(new Date());
        }, 2000);
        return;
      }

      // Redirect to PayHere for payment
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://sandbox.payhere.lk/pay/checkout';

      Object.entries(data.paymentData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

    } catch (error) {
      console.error("Error initiating payment:", error);
      alert(error instanceof Error ? error.message : "An error occurred while processing payment");
      setPaymentProcessing(false);
      setBooking(false);
    }
  };

  const handlePreviousMonth = () => {
    setSelectedDate(new Date(year, month - 1, 1));
    setSelectedSlot(null);
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(year, month + 1, 1));
    setSelectedSlot(null);
  };

  const renderCalendar = () => {
    const days = [];
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

      days.push(
        <button
          key={day}
          onClick={() => !isPast && handleDateClick(day)}
          disabled={isPast}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm
            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-primary/10'}
            ${isToday ? 'border-2 border-primary' : ''}
            ${isSelected ? 'bg-primary text-white hover:bg-primary' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  if (bookingConfirmed) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-center">Booking Confirmed!</h3>
            <p className="text-center text-muted-foreground">
              Your session has been successfully booked.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Therapy Session</DialogTitle>
          <DialogDescription>
            Schedule a session with {therapistName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Type Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Session Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMeetingType('IN_PERSON')}
                className={`flex flex-col items-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                  meetingType === 'IN_PERSON'
                    ? 'bg-primary border-primary text-white'
                    : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                <MapPin className="h-5 w-5" />
                <span className="text-xs font-medium">In-Person</span>
              </button>
              <button
                type="button"
                onClick={() => setMeetingType('ONLINE')}
                className={`flex flex-col items-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                  meetingType === 'ONLINE'
                    ? 'bg-primary border-primary text-white'
                    : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                <Video className="h-5 w-5" />
                <span className="text-xs font-medium">Online</span>
              </button>
              <button
                type="button"
                onClick={() => setMeetingType('HYBRID')}
                className={`flex flex-col items-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                  meetingType === 'HYBRID'
                    ? 'bg-primary border-primary text-white'
                    : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="text-xs font-medium">Hybrid</span>
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Select Date
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                  &lt;
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  &gt;
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekdays.map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground h-8 flex items-center justify-center">
                  {day}
                </div>
              ))}
              {renderCalendar()}
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Available Time Slots
            </h3>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No available slots for this date
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.slot}
                    onClick={() => slot.isAvailable && handleSlotClick(slot.slot)}
                    disabled={!slot.isAvailable}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all
                      ${slot.isAvailable
                        ? selectedSlot === slot.slot
                          ? 'bg-primary text-white'
                          : 'bg-muted hover:bg-muted/80'
                        : 'bg-muted/30 text-muted-foreground cursor-not-allowed line-through'
                      }
                    `}
                  >
                    <div>{slot.slot}</div>
                    {slot.isFree && (
                      <div className="text-xs text-green-600 font-semibold mt-1">Free</div>
                    )}
                    {!slot.isFree && slot.cost > 0 && (
                      <div className="text-xs mt-1">LKR {slot.cost}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Info */}
          {selectedSlot && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{selectedSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{meetingType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost:</span>
                  <span className="font-medium">
                    {availableSlots.find(s => s.slot === selectedSlot)?.isFree
                      ? 'Free'
                      : `LKR ${availableSlots.find(s => s.slot === selectedSlot)?.cost || 0}`
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={booking}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedSlot || booking}
            >
              {booking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {paymentProcessing ? 'Processing...' : 'Booking...'}
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
