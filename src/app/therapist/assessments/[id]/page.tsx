"use client";
import React from "react";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, Calendar, ClipboardList, Users, BarChart3, UserPlus, UserMinus } from "lucide-react";
import { Input } from "@/components/ui/input"; // Make sure you have a date input component

interface Assessment {
  id: string;
  title: string;
  description: string;
    type: "QUESTIONNAIRE" | "LISTENING_TASK" | "PICTURE_DESCRIPTION" | "FIND_DIFFERENCES" | "COGNITIVE_ASSESSMENT" | "BEHAVIORAL_ASSESSMENT";

  assessmentDate: string;
  createdAt: string;
  updatedAt: string;
  questions: {
    id: string;
    text: string;
    type: string;
    options?: string[];
    required: boolean;
  }[];
  assignedPatients: {
    id: string;
    name: string;
    email: string;
    completedAt?: string;
    score?: number;
    responses?: unknown;
    deadline?: string; // Add deadline field
  }[];
  averageScore?: number;
  completionRate: number;
}



export default function AssessmentDetailsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [availablePatients, setAvailablePatients] = useState<{id: string; name: string; email: string}[]>([]);
  const [showAddPatientList, setShowAddPatientList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store deadlines for each patient being added
  const [patientDeadlines, setPatientDeadlines] = useState<{ [id: string]: string }>({});

  const fetchAssessment = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the 'Auditory Processing - Listening Task' assessment as the mock data
      const mockAssessment: Assessment = {
        id: "1",
        title: "Auditory Processing - Listening Task",
        description: "Audio-based assessment to evaluate listening comprehension, auditory memory, and processing speed through various listening exercises.",
        type: "LISTENING_TASK",
        assessmentDate: "2024-07-10",
        createdAt: "2024-07-10",
        updatedAt: "2024-07-22",
        questions: [
          {
            id: "q1",
            text: "Listen to the audio and answer the following comprehension question.",
            type: "text",
            required: true,
          },
          {
            id: "q2",
            text: "How many words did you recall from the audio?",
            type: "scale",
            required: true,
          },
          {
            id: "q3",
            text: "Rate the difficulty of the listening task.",
            type: "scale",
            required: false,
          },
        ],
        assignedPatients: [
          { id: "p2", name: "Pasandi Piyathma", email: "pasandi@email.com", completedAt: "2024-07-22", score: 78 },
          { id: "p4", name: "Anuki Tiyara", email: "anuki@email.com" },
        ],
        averageScore: 78,
        completionRate: 50, // 1 out of 2 completed
      };
      setAssessment(mockAssessment);
    } catch (err) {
      console.error("Error fetching assessment:", err);
      setError("Failed to load assessment. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated" && assessmentId) {
      fetchAssessment();
    }
  }, [authStatus, router, assessmentId, fetchAssessment]);

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "INITIAL":
        return "bg-purple-100 text-purple-800";
      case "PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "FINAL":
        return "bg-green-100 text-green-800";
      case "FOLLOW_UP":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  

  if (authStatus === "loading" || loading) {
    return <LoadingSpinner message="Loading assessment..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-[#8159A8]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <Card className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/therapist/assessments")}>
              Back to Assessments
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-[#8159A8]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <Card className="p-8 text-center">
            <p className="text-gray-600 mb-4">Assessment not found</p>
            <Button onClick={() => router.push("/therapist/assessments")}>
              Back to Assessments
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Add patient to assignedPatients
  const handleAddPatient = (patient: { id: string; name: string; email: string }) => {
    if (!assessment) return;
    const deadline = patientDeadlines[patient.id] || "";
    const updated = {
      ...assessment,
      assignedPatients: [
        ...assessment.assignedPatients,
        { ...patient, deadline }, // Add deadline to patient object
      ],
    };
    setAssessment(updated);
    setAvailablePatients(prev => prev.filter(p => p.id !== patient.id));
    setShowAddPatientList(false);
    setPatientDeadlines(prev => {
      const copy = { ...prev };
      delete copy[patient.id];
      return copy;
    });
  };

  // Remove patient from assignedPatients
  const handleUnassignPatient = (patient: { id: string; name: string; email: string }) => {
    if (!assessment) return;
    const updated = {
      ...assessment,
      assignedPatients: assessment.assignedPatients.filter(p => p.id !== patient.id),
    };
    setAssessment(updated);
    // Add the removed patient back to availablePatients
    setAvailablePatients(prev => [...prev, {id: patient.id, name: patient.name, email: patient.email}]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-[#8159A8]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-[#8159A8]">
                  {assessment.title}
                </h1>
                <Badge className={getTypeBadgeColor(assessment.type)}>
                  {assessment.type.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-gray-600">{assessment.description}</p>
            </div>
          </div>
          
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
          <ClipboardList className="w-5 h-5 text-[#8159A8]" />
              </div>
              <div>
          <p className="text-2xl font-bold text-gray-800">{assessment.questions.length}</p>
          <p className="text-gray-600 text-sm">Questions</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
          <Users className="w-5 h-5 text-[#8159A8]" />
              </div>
              <div>
          <p className="text-2xl font-bold text-gray-800">{assessment.assignedPatients.length}</p>
          <p className="text-gray-600 text-sm">Assigned Patients</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
          <BarChart3 className="w-5 h-5 text-[#8159A8]" />
              </div>
              <div>
          <p className="text-2xl font-bold text-gray-800">{assessment.completionRate}%</p>
          <p className="text-gray-600 text-sm">Completion Rate</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
          <Calendar className="w-5 h-5 text-[#8159A8]" />
              </div>
              <div>
          <p className="text-2xl font-bold text-gray-800">
            {assessment.averageScore ? Math.round(assessment.averageScore) : "N/A"}
          </p>
          <p className="text-gray-600 text-sm">Average Score</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Questions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Assessment Questions</h2>
            <div className="space-y-4">
              {assessment.questions.map((question, index) => (
                <div key={question.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 bg-white px-2 py-1 rounded">
                      Q{index + 1}
                    </span>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {question.type.replace('_', ' ')}
                      </Badge>
                      {question.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-800 mb-3">{question.text}</p>
                  {question.options && (
                    <div className="ml-4">
                      <p className="text-sm text-gray-600 mb-2">Options:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {question.options.map((option, optIndex) => (
                          <li key={optIndex} className="flex items-center">
                            <span className="w-4 h-4 border rounded-full mr-2 flex-shrink-0"></span>
                            {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {question.type === "scale" && (
                    <p className="text-sm text-gray-600 ml-4">Rating scale: 1-10</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Assigned Patients */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Assigned Patients</h2>
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-[#FAF8FB] hover:bg-[#FAF8FB] text-[#8159A8]"
                onClick={() => setShowAddPatientList((prev) => !prev)}
              >
                + Add Patient
              </Button>
              {showAddPatientList && (
                <div className="mt-3">
                  <h4 className="font-semibold text-gray-700 mb-2">Select a patient to add</h4>
                  {availablePatients.length > 0 ? (
                    <ul className="space-y-2">
                      {availablePatients.map((patient) => (
                        <li key={patient.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div>
                            <span className="font-medium text-gray-800">{patient.name}</span>
                            <span className="ml-2 text-xs text-gray-500">{patient.email}</span>
                            {/* Deadline input on next line */}
                            <div className="mt-2 flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-orange-600" />
                              <span className="text-xs text-gray-600 font-medium">Deadline</span>
                              <Input
                              type="date"
                              value={patientDeadlines[patient.id] || ""}
                              onChange={e =>
                                setPatientDeadlines(prev => ({
                                ...prev,
                                [patient.id]: e.target.value,
                                }))
                              }
                              className="w-38" // Increased width
                              title="Select deadline"
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="text-green-700 border-green-300"
                              onClick={() => handleAddPatient(patient)}
                              title="Add Patient"
                              disabled={!patientDeadlines[patient.id]} // Disable if no deadline
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No more patients to add.</p>
                  )}
                  <div className="flex justify-end mt-2">
                    <Button size="sm" variant="ghost" onClick={() => setShowAddPatientList(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {assessment.assignedPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#8159A8] text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{patient.name}</p>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                      {patient.deadline && (
                        <p className="text-xs text-gray-500">
                          Deadline: {new Date(patient.deadline).toLocaleDateString()}
                        </p>
                      )}
                      {patient.completedAt && (
                        <p className="text-xs text-gray-500">
                          Completed: {new Date(patient.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {patient.score && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Score: {patient.score}
                      </Badge>
                    )}
                    <Badge
                      className={
                        patient.completedAt
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {patient.completedAt ? "Completed" : "Pending"}
                    </Badge>
                    <Button size="icon" variant="outline" className="text-red-700 border-red-300" onClick={() => handleUnassignPatient(patient)} title="Unassign Patient">
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                <span className="text-sm text-gray-600">
                  {assessment.assignedPatients.filter(p => p.completedAt).length} / {assessment.assignedPatients.length} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-[#8159A8] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${assessment.completionRate}%` }}
                ></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Assessment Metadata */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Assessment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Assessment Date</p>
              <p className="font-medium text-gray-800">
                {new Date(assessment.assessmentDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium text-gray-800">
                {new Date(assessment.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-medium text-gray-800">
                {new Date(assessment.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
