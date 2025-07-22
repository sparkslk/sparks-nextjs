import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Therapist {
  name: string;
  email: string;
  image?: string | null;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  therapist: Therapist | null;
}

interface SessionBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  child: Child;
  onConfirmBooking: (date: Date, slot: string) => void;
}

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeSlots = [
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 AM",
  "12:00 AM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM"
];

export const SessionBookingModal: React.FC<SessionBookingModalProps> = ({ open, onOpenChange, child, onConfirmBooking }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
    setSelectedSlot(null);
  };
  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot);
  };
  const handleConfirm = () => {
    setBookingConfirmed(true);
    onConfirmBooking(selectedDate, selectedSlot!);
    setTimeout(() => {
      setBookingConfirmed(false);
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0 sm:p-0 overflow-y-auto max-h-[90vh] rounded-2xl shadow-2xl border border-border">
        <div className="bg-background rounded-2xl p-0 sm:p-0">
          <DialogHeader className="px-8 pt-8 pb-2 border-b border-border">
            <DialogTitle className="text-left text-2xl font-bold mb-1 text-primary">Book a Session</DialogTitle>
            <DialogDescription className="text-left mb-2 text-muted-foreground text-base">Select a date and time to book your session with your therapist</DialogDescription>
          </DialogHeader>
          {/* Therapist Info */}
          <div className="px-8 pt-6 pb-2">
            <div className="font-semibold text-sm text-muted-foreground mb-2">Your Therapist</div>
            <div className="flex items-center gap-4 bg-card rounded-xl p-4 shadow border border-border">
              <Image src={child.therapist?.image || '/images/therapist.png'} alt={child.therapist?.name || ''} width={48} height={48} className="object-cover w-12 h-12 rounded-full border-2 border-primary" />
              <div>
                <div className="font-bold text-base text-foreground mb-1">Dr. {child.therapist?.name}</div>
                <div className="text-xs text-muted-foreground mb-1">Cognitive Behavioral Therapy</div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 font-semibold text-xs">★ 4.9</span>
                  <span className="text-xs text-muted-foreground">Rs.3000 per session</span>
                </div>
              </div>
            </div>
          </div>
          {/* Select Date & Calendar */}
          <div className="px-8 pt-4 pb-2">
            <div className="font-semibold text-sm text-muted-foreground mb-2">Select Date</div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
              {timeSlots.map(slot => (
                <Button
                  key={slot}
                  variant={selectedSlot === slot ? "default" : "outline"}
                  className={`rounded-xl px-4 py-2 text-base font-semibold shadow-sm ${selectedSlot === slot ? "bg-primary text-white" : ""}`}
                  onClick={() => handleSlotClick(slot)}
                >
                  {slot}
                </Button>
              ))}
            </div>
          </div>
          {/* Booking Summary */}
          <div className="px-8 pt-4 pb-8">
            <div className="font-semibold text-sm text-muted-foreground mb-2">Booking Summary</div>
            <div className="bg-muted rounded-xl p-6 border border-border shadow-sm">
              <div className="mb-3 font-bold text-lg text-foreground">Session Details</div>
              <div className="flex justify-between text-sm mb-2 text-muted-foreground">
                <span>Date:</span> <span className="font-medium text-foreground">{weekdays[selectedDate.getDay()]} {selectedDate.getDate()}</span>
              </div>
              <div className="flex justify-between text-sm mb-2 text-muted-foreground">
                <span>Time:</span> <span className="font-medium text-foreground">{selectedSlot || "--"}</span>
              </div>
              <div className="flex justify-between text-sm mb-2 text-muted-foreground">
                <span>Therapist:</span> <span className="font-medium text-foreground">Dr. {child.therapist?.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-4 text-muted-foreground">
                <span>Total Cost:</span> <span className="font-bold text-primary">Rs.3000</span>
              </div>
              <Button className="w-full bg-primary text-white text-base py-3 rounded-xl font-semibold shadow" disabled={!selectedSlot || bookingConfirmed} onClick={handleConfirm}>
                {bookingConfirmed ? "Booking Confirmed!" : "Confirm Booking"}
              </Button>
              {bookingConfirmed && (
                <div className="mt-3 text-center text-success font-semibold animate-fade-in">Your session has been booked!</div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
