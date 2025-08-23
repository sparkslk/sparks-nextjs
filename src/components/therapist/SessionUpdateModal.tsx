"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, User, FileText, CheckSquare, Save, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { CompletionConfirmationModal } from "@/components/therapist/CompletionConfirmationModal";

interface Session {
  id: string;
  patientName: string;
  patientId: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  
  // Clinical documentation fields
  attendanceStatus?: string;
  overallProgress?: string;
  patientEngagement?: string;
  riskAssessment?: string;
  primaryFocusAreas?: string[];
  sessionNotes?: string;
  nextSessionGoals?: string;
}

interface SessionUpdateModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionUpdated: () => void;
}

export function SessionUpdateModal({ session, isOpen, onClose, onSessionUpdated }: SessionUpdateModalProps) {
  // Clinical Documentation Fields
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [overallProgress, setOverallProgress] = useState("");
  const [patientEngagement, setPatientEngagement] = useState("");
  const [riskAssessment, setRiskAssessment] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [sessionNotes, setSessionNotes] = useState("");
  const [nextSessionGoals, setNextSessionGoals] = useState("");
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loadingSessionDetails, setLoadingSessionDetails] = useState(false);
  const [detailedSession, setDetailedSession] = useState<Session | null>(null);

  // Completion confirmation modal state
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [completionSessionData, setCompletionSessionData] = useState<{
    sessionId: string;
    patientName: string;
    attendanceStatus: string;
  } | null>(null);

  // Focus areas options
  const focusAreaOptions = [
    "Anxiety Management",
    "Depression Treatment", 
    "Behavioral Interventions",
    "Cognitive Restructuring",
    "Social Skills",
    "Communication Skills",
    "Emotional Regulation",
    "Stress Management",
    "Trauma Processing",
    "Mindfulness/Relaxation",
    "Goal Setting",
    "Medication Compliance"
  ];

  const initializeWithDefaults = useCallback(() => {
    // Use basic session data if available, otherwise use empty strings for placeholders
    // Use nullish coalescing to preserve actual database values
    setAttendanceStatus(session?.attendanceStatus ?? "");
    setOverallProgress(session?.overallProgress ?? "");
    setPatientEngagement(session?.patientEngagement ?? "");
    setRiskAssessment(session?.riskAssessment ?? "");
    setFocusAreas(session?.primaryFocusAreas ?? []);
    setSessionNotes(session?.sessionNotes ?? "");
    setNextSessionGoals(session?.nextSessionGoals ?? "");
    // Clear the error since we're using fallback
    setSubmitError(null);
  }, [session]);

  const fetchSessionDetails = useCallback(async () => {
    if (!session) return;
    
    setLoadingSessionDetails(true);
    try {
      const response = await fetch(`/api/therapist/sessions/${session.id}`);
      if (response.ok) {
        const data = await response.json();
        const sessionData = data.session;
        setDetailedSession(sessionData);
        
        // Initialize clinical documentation fields - use DB values if they exist, otherwise use empty strings for placeholders
        // Important: Use nullish coalescing (??) to only use empty strings when field is null/undefined
        // This preserves actual database values including existing enum values
        const newAttendanceStatus = sessionData.attendanceStatus ?? "";
        const newOverallProgress = sessionData.overallProgress ?? "";
        const newPatientEngagement = sessionData.patientEngagement ?? "";
        const newRiskAssessment = sessionData.riskAssessment ?? "";
        const newFocusAreas = sessionData.primaryFocusAreas ?? [];
        const newSessionNotes = sessionData.sessionNotes ?? (sessionData.notes || "");
        const newNextSessionGoals = sessionData.nextSessionGoals ?? "";
        
        // Debug log to check what's being received from API
        console.log("Session data from API:", {
          attendanceStatus: sessionData.attendanceStatus,
          overallProgress: sessionData.overallProgress,
          patientEngagement: sessionData.patientEngagement,
          riskAssessment: sessionData.riskAssessment,
          primaryFocusAreas: sessionData.primaryFocusAreas,
          sessionNotes: sessionData.sessionNotes,
          nextSessionGoals: sessionData.nextSessionGoals
        });
        
        // Debug log to check what values are being set
        console.log("Values being set in modal:", {
          newAttendanceStatus,
          newOverallProgress,
          newPatientEngagement,
          newRiskAssessment,
          newFocusAreas,
          newSessionNotes,
          newNextSessionGoals
        });
        
        setAttendanceStatus(newAttendanceStatus);
        setOverallProgress(newOverallProgress);
        setPatientEngagement(newPatientEngagement);
        setRiskAssessment(newRiskAssessment);
        setFocusAreas(newFocusAreas);
        setSessionNotes(newSessionNotes);
        setNextSessionGoals(newNextSessionGoals);
      } else {
        console.error('Failed to fetch session details');
        // Fallback: Initialize with defaults if API fails
        initializeWithDefaults();
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      // Fallback: Initialize with defaults if API fails
      initializeWithDefaults();
    } finally {
      setLoadingSessionDetails(false);
    }
  }, [session, initializeWithDefaults]);

  useEffect(() => {
    if (session && isOpen) {
      // Reset states when session changes
      setSubmitError(null);
      setSubmitSuccess(false);
      setDetailedSession(null);
      
      // Try to fetch detailed session data, but fallback gracefully if it fails
      fetchSessionDetails();
    }
  }, [session, isOpen, fetchSessionDetails]);

  const toggleFocusArea = (area: string) => {
    setFocusAreas(prev => {
      if (prev.includes(area)) {
        return prev.filter(item => item !== area);
      } else {
        // Limit to 3 focus areas max
        if (prev.length >= 3) {
          return [...prev.slice(1), area];
        }
        return [...prev, area];
      }
    });
  };

  const handleSubmit = async (saveOnly = false) => {
    if (!session) return;

    // Validate required fields
    if (!attendanceStatus) {
      setSubmitError('Please select an attendance status');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      const updateData = {
        sessionId: session.id,
        // Clinical documentation fields - send null for empty strings to match DB schema
        attendanceStatus,
        overallProgress: overallProgress || null,
        patientEngagement: patientEngagement || null,
        riskAssessment: riskAssessment || null,
        focusAreas,
        sessionNotes: sessionNotes.trim() || null,
        nextSessionGoals: nextSessionGoals.trim() || null,
        saveOnly // Pass the save mode to the API
      };

      console.log("Sending update data:", updateData);

      const response = await fetch(`/api/therapist/sessions/${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        
        // Close modal after a brief delay to show success message
        setTimeout(() => {
          onClose();
          // Emit completion confirmation event after modal is closed
          setTimeout(() => {
            if (typeof window !== "undefined") {
              const event = new CustomEvent("sessionSaved", {
                detail: { 
                  sessionId: session.id,
                  attendanceStatus,
                  patientName: session.patientName
                }
              });
              window.dispatchEvent(event);
            }
            onSessionUpdated();
          }, 100);
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        setSubmitError(errorData.error || 'Failed to update session');
        
        // Log additional details if available
        if (errorData.details) {
          console.error("Error details:", errorData.details);
        }
      }
    } catch (error) {
      console.error('Error updating session:', error);
      setSubmitError('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleSessionSaved = (event: CustomEvent) => {
      const { sessionId, attendanceStatus, patientName } = event.detail;
      setCompletionSessionData({
        sessionId,
        attendanceStatus,
        patientName
      });
      setCompletionModalOpen(true);
    };

    window.addEventListener('sessionSaved', handleSessionSaved as EventListener);
    
    return () => {
      window.removeEventListener('sessionSaved', handleSessionSaved as EventListener);
    };
  }, []);

  if (!session) return null;

  const currentSession = detailedSession || session;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Session - {currentSession.patientName}
          </DialogTitle>
        </DialogHeader>

        {loadingSessionDetails ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading session details...</span>
          </div>
        ) : (
          <div className="space-y-6">
          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(currentSession.scheduledAt), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(currentSession.scheduledAt), "hh:mm a")} ({currentSession.duration} min)</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{currentSession.type}</span>
                </div>
                <div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {currentSession.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Clinical Assessment
                
              </CardTitle>
              <p className="text-sm text-gray-600">
                <span className="text-red-500">*</span> Required fields. Other fields are optional.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Attendance Status */}
                <div>
                  <Label htmlFor="attendanceStatus">
                    Attendance Status <span className="text-red-500">*</span>
                  </Label>
                  <Select value={attendanceStatus} onValueChange={setAttendanceStatus}>
                    <SelectTrigger className={`mt-1 ${!attendanceStatus ? 'border-red-200' : ''}`}>
                      <SelectValue placeholder="Select attendance status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESENT">Present</SelectItem>
                      <SelectItem value="LATE">Late</SelectItem>
                      <SelectItem value="NO_SHOW">No Show</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {!attendanceStatus && (
                    <p className="text-xs text-red-500 mt-1">This field is required</p>
                  )}
                </div>

                {/* Overall Progress */}
                <div>
                  <Label htmlFor="overallProgress">Overall Progress</Label>
                  <Select value={overallProgress} onValueChange={setOverallProgress}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select overall progress" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXCELLENT">Excellent</SelectItem>
                      <SelectItem value="GOOD">Good</SelectItem>
                      <SelectItem value="FAIR">Fair</SelectItem>
                      <SelectItem value="POOR">Poor</SelectItem>
                      <SelectItem value="CONCERNING">Concerning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Patient Engagement */}
                <div>
                  <Label htmlFor="patientEngagement">Patient Engagement</Label>
                  <Select value={patientEngagement} onValueChange={setPatientEngagement}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select patient engagement level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="RESISTANT">Resistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Risk Assessment */}
                <div>
                  <Label htmlFor="riskAssessment" className="flex items-center gap-2">
                    
                    Risk Assessment
                  </Label>
                  <Select value={riskAssessment} onValueChange={setRiskAssessment}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select risk assessment level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                  {riskAssessment !== 'NONE' && riskAssessment !== '' && (
                    <p className="text-xs text-gray-600 mt-1">
                      {riskAssessment === 'HIGH' && 'High risk - Immediate attention may be required'}
                      {riskAssessment === 'MEDIUM' && 'Medium risk - Monitor closely and follow up'}
                      {riskAssessment === 'LOW' && 'Low risk - Minimal risk identified'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primary Focus Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                
                Primary Focus Areas
              </CardTitle>
              <p className="text-sm text-gray-600">Select 2-3 key areas addressed in this session</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {focusAreaOptions.map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={area}
                      checked={focusAreas.includes(area)}
                      onCheckedChange={() => toggleFocusArea(area)}
                      disabled={!focusAreas.includes(area) && focusAreas.length >= 3}
                    />
                    <Label htmlFor={area} className="text-sm cursor-pointer">
                      {area}
                    </Label>
                  </div>
                ))}
              </div>
              {focusAreas.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium">Selected Focus Areas:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {focusAreas.map((area) => (
                      <Badge key={area} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sessionNotes">Brief Observations and Mood Assessment</Label>
                <Textarea
                  id="sessionNotes"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Document key observations, patient mood, significant topics discussed, and clinical insights..."
                  className="min-h-[120px]"
                />
              </div>
              <div>
                <Label htmlFor="nextSessionGoals">Next Session Goals</Label>
                <Textarea
                  id="nextSessionGoals"
                  value={nextSessionGoals}
                  onChange={(e) => setNextSessionGoals(e.target.value)}
                  placeholder="Outline focus areas and goals for the upcoming session..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* --- New Section: Medications & Tasks --- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Medications & Assessments</CardTitle>
              <p className="text-sm text-gray-600">Use these options to update the patient&apos;s current medications or assign new assessments directly from this session.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  style={{ backgroundColor: "#FAF8FB", color: "#8159A8" }}
                  className="font-semibold px-4 py-2 rounded-lg transition-colors duration-150 hover:bg-[#E9E3F2] hover:text-[#6B399A] hover:shadow-md hover:scale-103"
                  type="button"
                  onClick={() => {
                    // Open the medications modal from parent with patient context
                    if (typeof window !== "undefined" && currentSession.patientId) {
                      const event = new CustomEvent("openMedicationsModal", {
                        detail: { patientId: currentSession.patientId }
                      });
                      window.dispatchEvent(event);
                    }
                  }}
                >
                  Update Patient&apos;s Medication
                </Button>
                <Button
                  style={{ backgroundColor: "#FAF8FB", color: "#8159A8" }}
                  className="font-semibold px-4 py-2 rounded-lg transition-colors duration-150 hover:bg-[#E9E3F2] hover:text-[#6B399A] hover:shadow-md hover:scale-103"
                  type="button"
                  onClick={() => {
                    // Open the tasks modal from parent
                    if (typeof window !== "undefined") {
                      const event = new CustomEvent("openTasksModal");
                      window.dispatchEvent(event);
                    }
                  }}
                >
                  Assign New Assessments to Patient
                </Button>
                </div>
            </CardContent>
          </Card>

          


          {/* Success/Error Messages */}
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <CheckSquare className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">Session documentation saved successfully!</p>
              </div>
            </div>
          )}
          
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800 font-medium">{submitError}</p>
              </div>
            </div>
          )}


          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleSubmit(true)} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>

          
        </div>
        )}

        {/* Completion Confirmation Modal */}
        <CompletionConfirmationModal
          isOpen={completionModalOpen}
          onClose={() => {
            setCompletionModalOpen(false);
            setCompletionSessionData(null);
          }}
          sessionData={completionSessionData}
          onSessionUpdated={onSessionUpdated}
        />
      </DialogContent>
    </Dialog>
  );
}
