"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, CalendarDays, MapPin, Video, CheckCircle, MessageCircle } from "lucide-react";
import { Child, Appointment } from "@/types/appointments";

interface AppointmentCardProps {
  child: Child;
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  onTherapistClick: (therapist: Child['therapist']) => void;
  formatDate: (dateString: string) => string;
  isHighlighted?: boolean;
}

export default function AppointmentCard({ 
  child, 
  upcomingAppointments, 
  pastAppointments, 
  onTherapistClick, 
  formatDate,
  isHighlighted = false
}: AppointmentCardProps) {
  return (
    <Card className={`appointments-card bg-white/80 backdrop-blur-sm shadow-lg border hover:shadow-xl transition-all duration-300 ${
      isHighlighted 
        ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-purple-200/50' 
        : 'border-white/20'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#8159A8' }}>
                <span className="font-bold text-white text-sm">
                  {child.firstName?.[0]?.toUpperCase()}{child.lastName?.[0]?.toUpperCase()}
                </span>
              </div>
              {isHighlighted && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                {child.firstName} {child.lastName}
                {isHighlighted && (
                  <span className="ml-2 text-xs text-purple-600 font-normal">(Selected)</span>
                )}
              </CardTitle>
            </div>
          </div>
          {child.therapist && (
            <Button
              size="sm"
              className="text-white hover:opacity-90 transition-all duration-300 shadow-md text-xs px-3 py-1"
              style={{ backgroundColor: '#8159A8' }}
              onClick={() => window.location.href = '/parent/bookSession'}
            >
              Book Session
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {upcomingAppointments.length > 0 || pastAppointments.length > 0 ? (
          <div className="space-y-4">
            {/* Therapist Information */}
            {child.therapist && (upcomingAppointments.length > 0 || pastAppointments.length > 0) && (
              <div 
                className="therapist-info p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform" 
                style={{ borderColor: '#8159A8' }}
                onClick={() => onTherapistClick(child.therapist)}
              >
                <div className="flex items-center space-x-2">
                  <User className="w-3 h-3" style={{ color: '#8159A8' }} />
                  <p className="text-xs" style={{ color: '#8159A8' }}>
                    {child.firstName}&apos;s therapist is{' '}
                    <span className="font-semibold">
                      {child.therapist.name || 'Unknown Therapist'}
                    </span>
                    {/* <span className="ml-2 text-xs opacity-70">(Click for details)</span> */}
                  </p>
                </div>
              </div>
            )}
            
            {/* Upcoming Sessions */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <CalendarDays className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-gray-900 text-sm">Upcoming Sessions</h3>
              </div>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="session-card upcoming flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          {appointment.mode === 'Virtual' ? (
                            <Video className="w-5 h-5 text-green-600" />
                          ) : (
                            <Calendar className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="text-xs">
                          <p className="font-medium text-gray-900 text-sm">
                            {formatDate(appointment.date)} - {appointment.type}
                          </p>
                          <p className="text-gray-600 flex items-center text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {appointment.time} • {appointment.duration} min
                          </p>
                          {appointment.therapist && (
                            <p className="text-gray-600 text-xs mt-1">
                              <span className="font-medium">Therapist:</span> {appointment.therapist}
                            </p>
                          )}
                          {appointment.mode && (
                            <p className="text-gray-600 text-xs flex items-center">
                              <span className="font-medium">Mode:</span> 
                              <span className="ml-1">{appointment.mode}</span>
                              {appointment.mode === 'Virtual' && <Video className="w-3 h-3 ml-1" />}
                              {appointment.mode === 'In-Person' && <MapPin className="w-3 h-3 ml-1" />}
                            </p>
                          )}
                          {appointment.specializations && appointment.specializations.length > 0 && (
                            <p className="text-gray-600 text-xs">
                              <span className="font-medium">Specializations:</span> {appointment.specializations.join(', ')}
                            </p>
                          )}
                          {appointment.notes && (
                            <p className="text-gray-600 text-xs mt-1">
                              <span className="font-medium">Notes:</span> {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          style={{ color: '#8159A8', borderColor: '#8159A8' }}
                          className="hover:bg-purple-50 text-xs px-2 py-1"
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50 text-xs px-2 py-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
              <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg text-center border border-gray-200">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500 text-xs">No upcoming sessions scheduled</p>
                </div>
              )}
            </div>

            {/* Past Sessions */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900 text-sm">Past Sessions</h3>
              </div>
              {pastAppointments.length > 0 ? (
                <div className="space-y-3">
                  {pastAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="session-card past flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="text-xs">
                          <p className="font-medium text-gray-900 text-sm">
                            {formatDate(appointment.date)} - {appointment.type}
                          </p>
                          <p className="text-gray-600 flex items-center text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {appointment.time} • {appointment.duration} min
                          </p>
                          {appointment.therapist && (
                            <p className="text-gray-600 text-xs mt-1">
                              <span className="font-medium">Therapist:</span> {appointment.therapist}
                            </p>
                          )}
                          {appointment.mode && (
                            <p className="text-gray-600 text-xs flex items-center">
                              <span className="font-medium">Mode:</span> 
                              <span className="ml-1">{appointment.mode}</span>
                              {appointment.mode === 'Virtual' && <Video className="w-3 h-3 ml-1" />}
                              {appointment.mode === 'In-Person' && <MapPin className="w-3 h-3 ml-1" />}
                            </p>
                          )}
                          {appointment.specializations && appointment.specializations.length > 0 && (
                            <p className="text-gray-600 text-xs">
                              <span className="font-medium">Specializations:</span> {appointment.specializations.join(', ')}
                            </p>
                          )}
                          {appointment.notes && (
                            <p className="text-gray-600 text-xs mt-1">
                              <span className="font-medium">Session Notes:</span> {appointment.notes}
                            </p>
                          )}
                          {appointment.objectives && appointment.objectives.length > 0 && (
                            <p className="text-gray-600 text-xs mt-1">
                              <span className="font-medium">Objectives:</span> {appointment.objectives.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          style={{ color: '#8159A8', borderColor: '#8159A8' }}
                          className="hover:bg-purple-50 text-xs px-2 py-1"
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          View Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg text-center border border-gray-200">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500 text-xs">No past sessions</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              No Sessions Found
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              {child.therapist 
                ? "No sessions have been scheduled yet."
                : "To schedule appointments, you need to connect with a therapist first."
              }
            </p>
            <Button
              className="text-white hover:opacity-90 transition-all duration-300 shadow-md text-sm"
              style={{ backgroundColor: '#8159A8' }}
              onClick={() => window.location.href = '/parent/findTherapist'}
            >
              {child.therapist ? "Book Session" : "Find a Therapist"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}