// Test script to verify session timing logic
import { Appointment } from "@/types/appointments";
import { parseAppointmentDateTime, canJoinSession, isAppointmentOngoing, getSessionStatus } from "@/lib/session-timing-utils";

// Test function for debugging session timing
export function testSessionTiming() {
  const now = new Date();
  console.log('Current time:', now.toLocaleString());

  // Test appointment 10 minutes from now
  const futureDate = new Date(now.getTime() + 10 * 60 * 1000);
  const testAppointment: Appointment = {
    id: 'test-1',
    date: futureDate.toISOString().split('T')[0], // YYYY-MM-DD format
    time: futureDate.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }), // e.g., "02:30 PM"
    duration: 60,
    meetingLink: 'https://meet.google.com/test-link',
    type: 'Therapy Session',
    status: 'SCHEDULED',
    childId: 'test-child',
    sessionStatus: 'SCHEDULED',
    therapist: 'Test Therapist',
    therapistEmail: 'test@example.com',
    therapistPhone: '',
    specializations: [],
    mode: 'ONLINE',
    objectives: []
  };

  console.log('Test appointment:', testAppointment);
  console.log('Parsed datetime:', parseAppointmentDateTime(testAppointment));
  console.log('Can join session:', canJoinSession(testAppointment));
  console.log('Is ongoing:', isAppointmentOngoing(testAppointment));
  console.log('Session status:', getSessionStatus(testAppointment));

  // Test appointment that can be joined (5 minutes from now)
  const joinableDate = new Date(now.getTime() + 5 * 60 * 1000);
  const joinableAppointment: Appointment = {
    ...testAppointment,
    id: 'test-2',
    date: joinableDate.toISOString().split('T')[0],
    time: joinableDate.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })
  };

  console.log('\nJoinable appointment:');
  console.log('Test appointment:', joinableAppointment);
  console.log('Parsed datetime:', parseAppointmentDateTime(joinableAppointment));
  console.log('Can join session:', canJoinSession(joinableAppointment));
  console.log('Is ongoing:', isAppointmentOngoing(joinableAppointment));
  console.log('Session status:', getSessionStatus(joinableAppointment));

  // Test ongoing appointment (started 10 minutes ago)
  const ongoingDate = new Date(now.getTime() - 10 * 60 * 1000);
  const ongoingAppointment: Appointment = {
    ...testAppointment,
    id: 'test-3',
    date: ongoingDate.toISOString().split('T')[0],
    time: ongoingDate.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })
  };

  console.log('\nOngoing appointment:');
  console.log('Test appointment:', ongoingAppointment);
  console.log('Parsed datetime:', parseAppointmentDateTime(ongoingAppointment));
  console.log('Can join session:', canJoinSession(ongoingAppointment));
  console.log('Is ongoing:', isAppointmentOngoing(ongoingAppointment));
  console.log('Session status:', getSessionStatus(ongoingAppointment));
}

// Call this in browser console to test
if (typeof window !== 'undefined') {
  (window as any).testSessionTiming = testSessionTiming;
}