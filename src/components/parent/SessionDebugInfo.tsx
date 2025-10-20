import { Appointment } from "@/types/appointments";
import { parseAppointmentDateTime, canJoinSession, isAppointmentOngoing, getSessionStatus } from "@/lib/session-timing-utils";

interface SessionDebugInfoProps {
    appointment: Appointment;
}

export const SessionDebugInfo = ({ appointment }: SessionDebugInfoProps) => {
    const appointmentTime = parseAppointmentDateTime(appointment);
    const now = new Date();
    const timeDifference = appointmentTime.getTime() - now.getTime();
    const minutesDifference = timeDifference / (1000 * 60);

    return (
        <div className="bg-gray-100 p-3 rounded-lg text-xs space-y-1 border">
            <div className="font-semibold text-gray-700">Debug Info for Session {appointment.id}</div>
            <div><strong>Date:</strong> {appointment.date}</div>
            <div><strong>Time:</strong> {appointment.time}</div>
            <div><strong>Parsed DateTime:</strong> {appointmentTime.toLocaleString()}</div>
            <div><strong>Current Time:</strong> {now.toLocaleString()}</div>
            <div><strong>Time Difference (min):</strong> {Math.round(minutesDifference)}</div>
            <div><strong>Has Meeting Link:</strong> {appointment.meetingLink ? 'Yes' : 'No'}</div>
            <div><strong>Meeting Link:</strong> {appointment.meetingLink || 'None'}</div>
            <div><strong>Can Join:</strong> {canJoinSession(appointment) ? 'Yes' : 'No'}</div>
            <div><strong>Is Ongoing:</strong> {isAppointmentOngoing(appointment) ? 'Yes' : 'No'}</div>
            <div><strong>Status:</strong> {getSessionStatus(appointment)}</div>
            <div><strong>Duration:</strong> {appointment.duration} minutes</div>
        </div>
    );
};