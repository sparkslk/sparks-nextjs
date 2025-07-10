"use client";

import { Calendar } from "lucide-react";

interface AppointmentsHeaderProps {
  childrenCount: number;
  upcomingSessionsCount: number;
}

export default function AppointmentsHeader({ childrenCount, upcomingSessionsCount }: AppointmentsHeaderProps) {
  return (
    <div className="mb-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg shadow-md" style={{ backgroundColor: '#8159A8' }}>
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #8159A8, #6B4C93)' }}>
                Appointments
              </h1>
              <p className="mt-1 text-sm" style={{ color: '#8159A8' }}>
                Manage your children&apos;s therapy sessions with ease
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs" style={{ color: '#8159A8' }}>Total Children</p>
              <p className="text-lg font-bold" style={{ color: '#8159A8' }}>{childrenCount}</p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: '#8159A8' }}>Upcoming Sessions</p>
              <p className="text-lg font-bold" style={{ color: '#8159A8' }}>
                {upcomingSessionsCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}