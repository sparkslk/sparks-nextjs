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
import { NoShowConfirmationDialog } from "@/components/therapist/NoShowConfirmationDialog";
import { MoveToNoShowConfirmationDialog } from "@/components/therapist/MoveToNoShowConfirmationDialog";
import { MoveToCompletedConfirmationDialog } from "@/components/therapist/MoveToCompletedConfirmationDialog";

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

  // No Show confirmation state
  const [showNoShowConfirmation, setShowNoShowConfirmation] = useState(false);
  const [pendingAttendanceStatus, setPendingAttendanceStatus] = useState<string>("");

  // Add Move to No-Show confirmation state
  const [showMoveNoShowConfirmation, setShowMoveNoShowConfirmation] = useState(false);
  const [moveNoShowSuccess, setMoveNoShowSuccess] = useState(false);

  // Add Move to Completed confirmation state
  const [showMoveCompletedConfirmation, setShowMoveCompletedConfirmation] = useState(false);
  const [moveCompletedSuccess, setMoveCompletedSuccess] = useState(false);

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
        const newSessionNotes = sessionData.sessionNotes ?? "";
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

  const clearClinicalFields = () => {
    setOverallProgress("");
    setPatientEngagement("");
    setRiskAssessment("");
    setFocusAreas([]);
    setSessionNotes("");
    setNextSessionGoals("");
  };

  const hasClinicalData = () => {
    return overallProgress || patientEngagement || riskAssessment ||
      focusAreas.length > 0 || sessionNotes.trim() || nextSessionGoals.trim();
  };

  const handleAttendanceStatusChange = (value: string) => {
    if (value === "NO_SHOW" && hasClinicalData()) {
      // Show confirmation dialog if there's existing clinical data
      setPendingAttendanceStatus(value);
      setShowNoShowConfirmation(true);
    } else {
      // Set directly if no clinical data or not "NO_SHOW"
      setAttendanceStatus(value);
      if (value === "NO_SHOW") {
        clearClinicalFields();
      }
    }
  };

  const handleNoShowConfirmation = (confirmed: boolean) => {
    setShowNoShowConfirmation(false);
    if (confirmed) {
      setAttendanceStatus(pendingAttendanceStatus);
      clearClinicalFields();
    }
    setPendingAttendanceStatus("");
  };

  const isClinicalFieldsDisabled = attendanceStatus === "NO_SHOW";

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

  const handleMoveSession = async () => {
    if (!session || !attendanceStatus) return;

    // Show confirmation for No-Show moves
    if (attendanceStatus === "NO_SHOW") {
      setShowMoveNoShowConfirmation(true);
      return;
    }

    // Show confirmation for Completed moves
    if (attendanceStatus === "PRESENT" || attendanceStatus === "LATE") {
      setShowMoveCompletedConfirmation(true);
      return;
    }

    // Fallback for other statuses (shouldn't reach here with current logic)
    await performMoveSession();
  };

  const performMoveSession = async () => {
    if (!session || !attendanceStatus) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let newStatus;
      if (attendanceStatus === "NO_SHOW") {
        newStatus = "NO_SHOW";
      } else {
        newStatus = "COMPLETED";
      }

      const updateData = {
        sessionId: session.id,
        attendanceStatus,
        overallProgress: overallProgress || null,
        patientEngagement: patientEngagement || null,
        riskAssessment: riskAssessment || null,
        focusAreas,
        sessionNotes: sessionNotes.trim() || null,
        nextSessionGoals: nextSessionGoals.trim() || null,
        moveToStatus: newStatus // Indicate we want to move the session
      };

      const response = await fetch(`/api/therapist/sessions/${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        if (attendanceStatus === "NO_SHOW") {
          setMoveNoShowSuccess(true);
        } else {
          setMoveCompletedSuccess(true);
        }

        // Close modal after showing success message
        setTimeout(() => {
          onClose();
          onSessionUpdated();
        }, 2000);
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || 'Failed to update session');
      }
    } catch (error) {
      console.error('Error updating session:', error);
      setSubmitError('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveNoShowConfirmation = (confirmed: boolean) => {
    setShowMoveNoShowConfirmation(false);
    if (confirmed) {
      performMoveSession();
    }
  };

  const handleMoveCompletedConfirmation = (confirmed: boolean) => {
    setShowMoveCompletedConfirmation(false);
    if (confirmed) {
      performMoveSession();
    }
  };

  // Add the formatTimeManual function (same as in session details page)
  const formatTimeManual = (dateString: string) => {
    // Extract just the time part manually to avoid timezone issues
    if (dateString.includes('T')) {
      const timePart = dateString.split('T')[1];
      const timeOnly = timePart.split('.')[0]; // Remove milliseconds if present
      const finalTime = timeOnly.split('Z')[0]; // Remove Z if present

      // Convert to 24-hour format
      const [hours, minutes] = finalTime.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    // Fallback to original method
    return format(new Date(dateString), "HH:mm");
  };

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
              <CardHeader className="pb-2">
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
                    <span>{formatTimeManual(currentSession.scheduledAt)} ({currentSession.duration} min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{currentSession.type === "With Parent" ? "Family Session" : currentSession.type}</span>
                  </div>
                  <div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {currentSession.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Attendance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start justify-between">
                    <div className="flex-1 max-w-xs">
                      <Select value={attendanceStatus} onValueChange={handleAttendanceStatusChange}>
                        <SelectTrigger className={`mt-1 ${!attendanceStatus ? 'border-red-200' : ''}`}>
                          <SelectValue placeholder="Select attendance status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRESENT">Present</SelectItem>
                          <SelectItem value="LATE">Late</SelectItem>
                          <SelectItem value="NO_SHOW">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                      {!attendanceStatus && (
                        <p className="text-xs text-red-500 mt-1">This field is required</p>
                      )}
                    </div>
                    {attendanceStatus === "NO_SHOW" && !moveNoShowSuccess && (
                      <Button
                        onClick={handleMoveSession}
                        disabled={isSubmitting}
                        style={{ backgroundColor: '#8159A8' }}
                        className="text-white hover:opacity-90 mt-1"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Move to No-Show
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Move to No-Show Success Message */}
                  {moveNoShowSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <div className="flex items-center">
                        <CheckSquare className="w-5 h-5 text-green-600 mr-2" />
                        <p className="text-green-800 font-medium">Session successfully moved to No-Show tab!</p>
                      </div>
                    </div>
                  )}

                  {attendanceStatus === "NO_SHOW" && !moveNoShowSuccess && (
                    <div className="p-2 bg-orange-50 border border-orange-200 rounded-md">
                      <p className="text-xs text-orange-700">
                        No Show selected - Clinical documentation is not required for this session.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Clinical Documentation */}
            <Card className={isClinicalFieldsDisabled ? "opacity-50" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  Clinical Assessment
                  {isClinicalFieldsDisabled && (
                    <Badge variant="secondary" className="text-xs">
                      Not Available for No Show
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Overall Progress */}
                  <div>
                    <Label htmlFor="overallProgress">Overall Progress</Label>
                    <Select
                      value={overallProgress}
                      onValueChange={setOverallProgress}
                      disabled={isClinicalFieldsDisabled}
                    >
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
                    <Select
                      value={patientEngagement}
                      onValueChange={setPatientEngagement}
                      disabled={isClinicalFieldsDisabled}
                    >
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
                  <div className="col-span-2">
                    <Label htmlFor="riskAssessment" className="flex items-center gap-2">
                      Risk Assessment
                    </Label>
                    <Select
                      value={riskAssessment}
                      onValueChange={setRiskAssessment}
                      disabled={isClinicalFieldsDisabled}
                    >
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
                    {riskAssessment !== 'NONE' && riskAssessment !== '' && !isClinicalFieldsDisabled && (
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
            <Card className={isClinicalFieldsDisabled ? "opacity-50" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  Primary Focus Areas
                  {isClinicalFieldsDisabled && (
                    <Badge variant="secondary" className="text-xs">
                      Not Available for No Show
                    </Badge>
                  )}
                </CardTitle>
                {!isClinicalFieldsDisabled && (
                  <p className="text-sm text-gray-600">Select 2-3 key areas addressed in this session</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {focusAreaOptions.map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={area}
                        checked={focusAreas.includes(area)}
                        onCheckedChange={() => toggleFocusArea(area)}
                        disabled={isClinicalFieldsDisabled || (!focusAreas.includes(area) && focusAreas.length >= 3)}
                      />
                      <Label htmlFor={area} className="text-sm cursor-pointer">
                        {area}
                      </Label>
                    </div>
                  ))}
                </div>
                {focusAreas.length > 0 && !isClinicalFieldsDisabled && (
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
            <Card className={isClinicalFieldsDisabled ? "opacity-50" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  Session Notes
                  {isClinicalFieldsDisabled && (
                    <Badge variant="secondary" className="text-xs">
                      Not Available for No Show
                    </Badge>
                  )}
                </CardTitle>
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
                    disabled={isClinicalFieldsDisabled}
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
                    disabled={isClinicalFieldsDisabled}
                  />
                </div>
              </CardContent>
            </Card>

          {/* --- New Section: Medications & Tasks --- */}
          <Card className={isClinicalFieldsDisabled ? "opacity-50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                Patient Medications & Assessments
                {isClinicalFieldsDisabled && (
                  <Badge variant="secondary" className="text-xs">
                    Not Available for No Show
                  </Badge>
                )}
              </CardTitle>
              {!isClinicalFieldsDisabled && (
                <p className="text-sm text-gray-600">Use these options to update the patient&apos;s current medications or assign new assessments directly from this session.</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  style={{ backgroundColor: "#FAF8FB", color: "#8159A8" }}
                  className="font-semibold px-4 py-2 rounded-lg transition-colors duration-150 hover:bg-[#E9E3F2] hover:text-[#6B399A] hover:shadow-md hover:scale-103"
                  type="button"
                  disabled={isClinicalFieldsDisabled}
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
                  disabled={isClinicalFieldsDisabled}
                  onClick={() => {
                    // Open the tasks modal from parent with patient context
                    if (typeof window !== "undefined" && currentSession.patientId) {
                      const event = new CustomEvent("openTasksModal", {
                        detail: { patientId: currentSession.patientId }
                      });
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

            {/* Move to Completed Success Message */}
            {moveCompletedSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center">
                  <CheckSquare className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-green-800 font-medium">Session successfully moved to Completed tab!</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {/* Only show Save button when not No-Show */}
              {attendanceStatus !== "NO_SHOW" && (
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
              )}
              {/* Only show Move to Completed button for Present/Late */}
              {(attendanceStatus === "PRESENT" || attendanceStatus === "LATE") && !moveCompletedSuccess && (
                <Button
                  onClick={handleMoveSession}
                  disabled={isSubmitting}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Move to Completed
                    </>
                  )}
                </Button>
              )}
            </div>


          </div>
        )}

        {/* No Show Confirmation Dialog */}
        <NoShowConfirmationDialog
          isOpen={showNoShowConfirmation}
          onConfirm={() => handleNoShowConfirmation(true)}
          onCancel={() => handleNoShowConfirmation(false)}
        />

        {/* Move to No-Show Confirmation Dialog */}
        <MoveToNoShowConfirmationDialog
          isOpen={showMoveNoShowConfirmation}
          onConfirm={() => handleMoveNoShowConfirmation(true)}
          onCancel={() => handleMoveNoShowConfirmation(false)}
          patientName={currentSession.patientName}
        />

        {/* Move to Completed Confirmation Dialog */}
        <MoveToCompletedConfirmationDialog
          isOpen={showMoveCompletedConfirmation}
          onConfirm={() => handleMoveCompletedConfirmation(true)}
          onCancel={() => handleMoveCompletedConfirmation(false)}
          patientName={currentSession.patientName}
        />


      </DialogContent>
    </Dialog>
  );
}

