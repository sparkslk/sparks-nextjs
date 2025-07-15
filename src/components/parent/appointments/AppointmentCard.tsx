"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, CalendarDays, Video, CheckCircle, MessageCircle } from "lucide-react";
import { Child, Appointment } from "@/types/appointments";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface AppointmentCardProps {
  child: Child;
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  cancelledAppointments: Appointment[];
  onTherapistClick: (therapist: Child['therapist']) => void;
  formatDate: (dateString: string) => string;
  isHighlighted?: boolean;
}

function formatSriLankaDateTime(dateString: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    ...options,
    timeZone: 'Asia/Colombo',
  }).format(date);
}

export default function AppointmentCard({ 
  child, 
  upcomingAppointments, 
  pastAppointments, 
  cancelledAppointments,
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
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center space-x-3">
            {child.id !== "all" && (
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
            )}
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-gray-900">
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

      {/* Therapist Information */}
      {child.therapist && (upcomingAppointments.length > 0 || pastAppointments.length > 0) && (
        <div 
          className="therapist-info p-2 sm:p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform mx-2 sm:mx-6 mt-2 mb-2" 
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
            </p>
          </div>
        </div>
      )}

      {/* Tabs UI */}
      <div className="flex justify-center items-center px-2 sm:px-6 pt-2 pb-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full max-w-full sm:max-w-xl mx-auto">
            <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({pastAppointments.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledAppointments.length})</TabsTrigger>
            <TabsTrigger value="all">All Sessions ({upcomingAppointments.length + pastAppointments.length + cancelledAppointments.length})</TabsTrigger>
          </TabsList>
          <CardContent className="px-2 sm:px-6">
            <TabsContent value="all">
              {(upcomingAppointments.length > 0 || pastAppointments.length > 0 || cancelledAppointments.length > 0) ? (
                <div className="space-y-4">
                  {/* Upcoming Sessions */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <CalendarDays className="w-4 h-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900 text-sm">Upcoming Sessions</h3>
                    </div>
                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingAppointments.map((appointment: Appointment) => (
                          <div
                            key={appointment.id}
                            className="session-card upcoming flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-7 bg-white/90 rounded-2xl border border-green-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-base sm:text-lg group"
                            style={{ minHeight: '110px' }}
                          >
                            <div className="flex items-center space-x-5 sm:space-x-7 w-full">
                              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center border-2 border-green-200 group-hover:border-green-400 transition-all">
                                {appointment.mode === 'Virtual' ? (
                                  <Video className="w-7 h-7" style={{ color: '#8159A8' }} />
                                ) : (
                                  <Calendar className="w-7 h-7" style={{ color: '#8159A8' }} />
                                )}
                              </div>
                              <div className="flex flex-row gap-4 sm:gap-10 items-center flex-wrap">
                                <div className="flex flex-row items-center gap-2">
                                  <Calendar className="w-5 h-5" style={{ color: '#8159A8' }} />
                                  <span className="text-xs sm:text-sm text-gray-500">Date:</span>
                                  <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{formatSriLankaDateTime(appointment.date, { dateStyle: 'medium' })}</span>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                  <Clock className="w-5 h-5" style={{ color: '#8159A8' }} />
                                  <span className="text-xs sm:text-sm text-gray-500">Time:</span>
                                  <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.time}</span>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                  <User className="w-5 h-5" style={{ color: '#8159A8' }} />
                                  <span className="text-xs sm:text-sm text-gray-500">Type:</span>
                                  <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.type}</span>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                  <CheckCircle className="w-5 h-5" style={{ color: '#8159A8' }} />
                                  <span className="text-xs sm:text-sm text-gray-500">Duration:</span>
                                  <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.duration} min</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-4 sm:mt-0 w-full sm:w-auto justify-end sm:justify-start">
                              <Button
                                variant="outline"
                                size="sm"
                                style={{ color: '#8159A8', borderColor: '#8159A8' }}
                                className="hover:bg-purple-50 text-xs sm:text-base px-3 sm:px-4 py-2 rounded-xl border-2"
                              >
                                Reschedule
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50 text-xs sm:text-base px-3 sm:px-4 py-2 rounded-xl border-2"
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
                        {pastAppointments.map((appointment: Appointment) => (
                          <div
                            key={appointment.id}
                            className="session-card past flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-7 bg-white/90 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-base sm:text-lg group"
                            style={{ minHeight: '110px' }}
                          >
                            <div className="flex items-center space-x-5 sm:space-x-7 w-full">
                              <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-slate-100 rounded-full flex items-center justify-center border-2 border-gray-200 group-hover:border-gray-400 transition-all">
                                <CheckCircle className="w-7 h-7" style={{ color: '#8159A8' }} />
                              </div>
                              <div className="flex flex-row gap-4 sm:gap-10 items-center flex-wrap">
                                <div className="flex flex-row items-center gap-2">
                                  <Calendar className="w-5 h-5" style={{ color: '#8159A8' }} />
                                  <span className="text-xs sm:text-sm text-gray-500">Date:</span>
                                  <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{formatDate(appointment.date)}</span>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                  <Clock className="w-5 h-5" style={{ color: '#8159A8' }} />
                                  <span className="text-xs sm:text-sm text-gray-500">Time:</span>
                                  <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.time}</span>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                  <User className="w-5 h-5" style={{ color: '#8159A8' }} />
                                  <span className="text-xs sm:text-sm text-gray-500">Type:</span>
                                  <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.type}</span>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                  <CheckCircle className="w-5 h-5" style={{ color: '#8159A8' }} />
                                  <span className="text-xs sm:text-sm text-gray-500">Duration:</span>
                                  <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.duration} min</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-4 sm:mt-0 w-full sm:w-auto justify-end sm:justify-start">
                              <Button
                                variant="outline"
                                size="sm"
                                style={{ color: '#8159A8', borderColor: '#8159A8' }}
                                className="hover:bg-purple-50 text-xs sm:text-base px-3 sm:px-4 py-2 rounded-xl border-2"
                                onClick={() => window.location.href = `/parent/sessions/${appointment.id}`}
                              >
                                <MessageCircle className="w-5 h-5 mr-2" style={{ color: '#8159A8' }} />
                                View Details
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
                  {/* Cancelled Sessions */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="w-4 h-4 text-red-600" />
                      <h3 className="font-semibold text-gray-900 text-sm">Cancelled Sessions</h3>
                    </div>
                    {cancelledAppointments.length > 0 ? (
                      <div className="space-y-3">
                        {cancelledAppointments.map((appointment: Appointment) => (
                          <div
                            key={appointment.id}
                            className="session-card cancelled relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-7 bg-white/90 rounded-2xl border border-red-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-base sm:text-lg group"
                            style={{ minHeight: '110px' }}
                          >
                            <div className="absolute top-2 right-4 sm:top-4 sm:right-6 z-10">
                              <span className="inline-block bg-red-100 border border-red-300 text-red-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">Cancelled</span>
                            </div>
                            <div className="flex items-center space-x-5 sm:space-x-7 w-full">
                              <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center border-2 border-red-200 group-hover:border-red-400 transition-all">
                                <Calendar className="w-7 h-7" style={{ color: '#8159A8' }} />
                              </div>
                              <div className="flex flex-row gap-4 sm:gap-10 items-center flex-wrap">
                                <div className="flex flex-row items-center gap-2">
                                  <Calendar className="w-5 h-5" style={{ color: '#8159A8' }} />
                                  <span className="text-xs sm:text-sm text-gray-500">Date:</span>
                                  <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{formatDate(appointment.date)}</span>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                  <Clock className="w-5 h-5" style={{ color: '#8159A8' }} />
                                  <span className="text-xs sm:text-sm text-gray-500">Time:</span>
                                  <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.time}</span>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                  <User className="w-5 h-5" style={{ color: '#8159A8' }} />
                                  <span className="text-xs sm:text-sm text-gray-500">Type:</span>
                                  <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.type}</span>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                  <CheckCircle className="w-5 h-5" style={{ color: '#8159A8' }} />
                                  <span className="text-xs sm:text-sm text-gray-500">Duration:</span>
                                  <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.duration} min</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-gradient-to-r from-gray-50 to-pink-50 rounded-lg text-center border border-red-200">
                        <Calendar className="w-6 h-6 mx-auto mb-2 text-red-400" />
                        <p className="text-gray-500 text-xs">No cancelled sessions</p>
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
            </TabsContent>
            <TabsContent value="upcoming">
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment: Appointment) => (
                    <div
                      key={appointment.id}
                      className="session-card upcoming flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-7 bg-white/90 rounded-2xl border border-green-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-base sm:text-lg group"
                      style={{ minHeight: '110px' }}
                    >
                      <div className="flex items-center space-x-5 sm:space-x-7 w-full">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center border-2 border-green-200 group-hover:border-green-400 transition-all">
                          {appointment.mode === 'Virtual' ? (
                            <Video className="w-7 h-7" style={{ color: '#8159A8' }} />
                          ) : (
                            <Calendar className="w-7 h-7" style={{ color: '#8159A8' }} />
                          )}
                        </div>
                        <div className="flex flex-row gap-4 sm:gap-10 items-center flex-wrap">
                          <div className="flex flex-row items-center gap-2">
                            <Calendar className="w-5 h-5" style={{ color: '#8159A8' }} />
                            <span className="text-xs sm:text-sm text-gray-500">Date:</span>
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            <Clock className="w-5 h-5" style={{ color: '#8159A8' }} />
                            <span className="text-xs sm:text-sm text-gray-500">Time:</span>
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.time}</span>
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            <User className="w-5 h-5" style={{ color: '#8159A8' }} />
                            <span className="text-xs sm:text-sm text-gray-500">Type:</span>
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.type}</span>
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            <CheckCircle className="w-5 h-5" style={{ color: '#8159A8' }} />
                            <span className="text-xs sm:text-sm text-gray-500">Duration:</span>
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.duration} min</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-4 sm:mt-0 w-full sm:w-auto justify-end sm:justify-start">
                        <Button
                          variant="outline"
                          size="sm"
                          style={{ color: '#8159A8', borderColor: '#8159A8' }}
                          className="hover:bg-purple-50 text-xs sm:text-base px-3 sm:px-4 py-2 rounded-xl border-2"
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50 text-xs sm:text-base px-3 sm:px-4 py-2 rounded-xl border-2"
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
            </TabsContent>
            <TabsContent value="completed">
              {pastAppointments.length > 0 ? (
                <div className="space-y-3">
                  {pastAppointments.map((appointment: Appointment) => (
                    <div
                      key={appointment.id}
                      className="session-card past flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-7 bg-white/90 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-base sm:text-lg group"
                      style={{ minHeight: '110px' }}
                    >
                      <div className="flex items-center space-x-5 sm:space-x-7 w-full">
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-slate-100 rounded-full flex items-center justify-center border-2 border-gray-200 group-hover:border-gray-400 transition-all">
                          <CheckCircle className="w-7 h-7" style={{ color: '#8159A8' }} />
                        </div>
                        <div className="flex flex-row gap-4 sm:gap-10 items-center flex-wrap">
                          <div className="flex flex-row items-center gap-2">
                            <Calendar className="w-5 h-5" style={{ color: '#8159A8' }} />
                            <span className="text-xs sm:text-sm text-gray-500">Date:</span>
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            <Clock className="w-5 h-5" style={{ color: '#8159A8' }} />
                            <span className="text-xs sm:text-sm text-gray-500">Time:</span>
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.time}</span>
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            <User className="w-5 h-5" style={{ color: '#8159A8' }} />
                            <span className="text-xs sm:text-sm text-gray-500">Type:</span>
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.type}</span>
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            <CheckCircle className="w-5 h-5" style={{ color: '#8159A8' }} />
                            <span className="text-xs sm:text-sm text-gray-500">Duration:</span>
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.duration} min</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 mt-4 sm:mt-0 w-full sm:w-auto justify-end sm:justify-start">
                        <Button
                          variant="outline"
                          size="sm"
                          style={{ color: '#8159A8', borderColor: '#8159A8' }}
                          className="hover:bg-purple-50 text-xs sm:text-base px-3 sm:px-4 py-2 rounded-xl border-2"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" style={{ color: '#8159A8' }} />
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
            </TabsContent>
            <TabsContent value="cancelled">
              {cancelledAppointments.length > 0 ? (
                <div className="space-y-3">
                  {cancelledAppointments.map((appointment: Appointment) => (
                    <div
                      key={appointment.id}
                      className="session-card cancelled relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-7 bg-white/90 rounded-2xl border border-red-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-base sm:text-lg group"
                      style={{ minHeight: '110px' }}
                    >
                      <div className="absolute top-2 right-4 sm:top-4 sm:right-6 z-10">
                        <span className="inline-block bg-red-100 border border-red-300 text-red-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">Cancelled</span>
                      </div>
                      <div className="flex items-center space-x-5 sm:space-x-7 w-full">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center border-2 border-red-200 group-hover:border-red-400 transition-all">
                          <Calendar className="w-7 h-7" style={{ color: '#8159A8' }} />
                        </div>
                        <div className="flex flex-row gap-4 sm:gap-10 items-center flex-wrap">
                          <div className="flex flex-row items-center gap-2">
                            <Calendar className="w-5 h-5" style={{ color: '#8159A8' }} />
                            <span className="text-xs sm:text-sm text-gray-500">Date:</span>
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            <Clock className="w-5 h-5" style={{ color: '#8159A8' }} />
                            <span className="text-xs sm:text-sm text-gray-500">Time:</span>
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.time}</span>
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            <User className="w-5 h-5" style={{ color: '#8159A8' }} />
                            <span className="text-xs sm:text-sm text-gray-500">Type:</span>
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.type}</span>
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            <CheckCircle className="w-5 h-5" style={{ color: '#8159A8' }} />
                            <span className="text-xs sm:text-sm text-gray-500">Duration:</span>
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm ml-1">{appointment.duration} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-gradient-to-r from-gray-50 to-pink-50 rounded-lg text-center border border-red-200">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-red-400" />
                  <p className="text-gray-500 text-xs">No cancelled sessions</p>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </div>
      {/* End Tabs UI */}
    </Card>
  );
}