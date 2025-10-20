import { Appointment } from "@/types/appointments";

// Parse appointment datetime safely without timezone conversion
export const parseAppointmentDateTime = (appointment: Appointment): Date => {
    console.log('Parsing appointment datetime:', { date: appointment.date, time: appointment.time });

    if (appointment.date && appointment.time) {
        const [year, month, day] = appointment.date.split('-').map(Number);

        // Handle time format - could be "14:30" or "02:30 PM"
        let hours, minutes;

        if (appointment.time.includes('AM') || appointment.time.includes('PM')) {
            // Handle 12-hour format with AM/PM
            const timePart = appointment.time.replace(/\s*(AM|PM)/i, '');
            const [hourStr, minuteStr] = timePart.split(':');
            const isPM = appointment.time.toUpperCase().includes('PM');

            hours = parseInt(hourStr);
            minutes = parseInt(minuteStr);

            // Convert to 24-hour format
            if (isPM && hours !== 12) {
                hours += 12;
            } else if (!isPM && hours === 12) {
                hours = 0;
            }
        } else {
            // Handle 24-hour format
            [hours, minutes] = appointment.time.split(':').map(Number);
        }

        // Create date in local timezone without conversion
        const parsedDate = new Date(year, month - 1, day, hours, minutes);
        console.log('Parsed datetime:', parsedDate);
        return parsedDate;
    } else {
        // Fallback for other formats
        return new Date(appointment.date);
    }
};

export const isAppointmentPast = (appointment: Appointment): boolean => {
    const appointmentTime = parseAppointmentDateTime(appointment);
    const now = new Date();

    return appointmentTime <= now;
};

export const isAppointmentOngoing = (appointment: Appointment): boolean => {
    const appointmentTime = parseAppointmentDateTime(appointment);
    const now = new Date();
    const appointmentEndTime = new Date(appointmentTime.getTime() + (appointment.duration * 60 * 1000)); // Add duration in milliseconds

    // Appointment is ongoing if current time is between start and end time
    return appointmentTime <= now && now <= appointmentEndTime;
};

export const canJoinSession = (appointment: Appointment): boolean => {
    const appointmentTime = parseAppointmentDateTime(appointment);
    const now = new Date();
    const timeDifference = appointmentTime.getTime() - now.getTime();
    const minutesDifference = timeDifference / (1000 * 60);

    console.log('Session timing debug:', {
        appointmentId: appointment.id,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        parsedDateTime: appointmentTime,
        currentTime: now,
        timeDifference: timeDifference,
        minutesDifference: Math.round(minutesDifference * 100) / 100, // Round to 2 decimal places
        canJoin: (minutesDifference <= 15 && !isAppointmentPast(appointment)) || isAppointmentOngoing(appointment),
        hasLink: !!appointment.meetingLink,
        isPast: isAppointmentPast(appointment),
        isOngoing: isAppointmentOngoing(appointment)
    });

    // Allow joining 15 minutes before appointment time, during the appointment, or if ongoing
    return (minutesDifference <= 15 && !isAppointmentPast(appointment)) || isAppointmentOngoing(appointment);
}; export const handleJoinSession = (appointment: Appointment): void => {
    console.log('Attempting to join session:', {
        appointmentId: appointment.id,
        meetingLink: appointment.meetingLink,
        status: getSessionStatus(appointment)
    });

    if (!appointment.meetingLink) {
        alert("Meeting link is not available for this session.");
        return;
    }

    const appointmentTime = parseAppointmentDateTime(appointment);
    const now = new Date();
    const timeDifference = appointmentTime.getTime() - now.getTime();
    const minutesDifference = timeDifference / (1000 * 60);

    console.log('Join session timing check:', {
        appointmentTime,
        currentTime: now,
        minutesDifference,
        canJoin: canJoinSession(appointment),
        isOngoing: isAppointmentOngoing(appointment)
    });

    // Check if session is too early
    if (minutesDifference > 15) {
        alert(`Session has not started yet. You can join 15 minutes before the scheduled time. Time remaining: ${Math.round(minutesDifference - 15)} minutes.`);
        return;
    }

    // Check if session is too late (more than session duration past start time)
    const sessionEndTime = new Date(appointmentTime.getTime() + (appointment.duration * 60 * 1000));
    if (now > sessionEndTime) {
        alert('This session has already ended.');
        return;
    }

    console.log('Opening meeting link:', appointment.meetingLink);
    // Open the meeting link
    window.open(appointment.meetingLink, '_blank', 'noopener,noreferrer');
};

export const getSessionStatus = (appointment: Appointment): 'upcoming' | 'can-join' | 'ongoing' | 'ended' => {
    const appointmentTime = parseAppointmentDateTime(appointment);
    const now = new Date();
    const timeDifference = appointmentTime.getTime() - now.getTime();
    const minutesDifference = timeDifference / (1000 * 60);
    const sessionEndTime = new Date(appointmentTime.getTime() + (appointment.duration * 60 * 1000));

    if (now > sessionEndTime) {
        return 'ended';
    } else if (isAppointmentOngoing(appointment)) {
        return 'ongoing';
    } else if (minutesDifference <= 15) {
        return 'can-join';
    } else {
        return 'upcoming';
    }
};