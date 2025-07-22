"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, FileText, Target, TrendingUp } from "lucide-react";
import { format } from "date-fns";


interface Session {
  id: string;
  patientName: string;
  patientId: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  sessionNotes?: string;
  primaryFocusAreas: string[];
  patientMood?: number;
  engagement?: number;
  progressNotes?: string;
}

interface SessionDetailsModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionDetailsModal({ session, isOpen, onClose }: SessionDetailsModalProps) {
  if (!session) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'declined':
        return 'bg-gray-100 text-gray-800';
      case 'no_show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Session Details - {session.patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Session Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Session Information
                <Badge className={getStatusColor(session.status)}>
                  {session.status.replace('_', ' ')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(session.scheduledAt), "EEEE, MMMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Time & Duration</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(session.scheduledAt), "hh:mm a")} ({session.duration} minutes)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Session Type</p>
                  <p className="text-sm text-gray-600 capitalize">{session.type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primary Focus Areas */}
          {session.primaryFocusAreas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Primary Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {session.primaryFocusAreas.map((focusArea, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{focusArea}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Progress Tracking */}
          {(session.patientMood || session.engagement) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Progress Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {session.patientMood && (
                    <div>
                      <p className="text-sm font-medium mb-2">Patient Mood</p>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(session.patientMood / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{session.patientMood}/10</span>
                      </div>
                    </div>
                  )}
                  {session.engagement && (
                    <div>
                      <p className="text-sm font-medium mb-2">Engagement Level</p>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(session.engagement / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{session.engagement}/10</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Notes */}
          {session.sessionNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Session Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm whitespace-pre-wrap">{session.sessionNotes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Notes */}
          {session.progressNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Progress Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm whitespace-pre-wrap">{session.progressNotes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
