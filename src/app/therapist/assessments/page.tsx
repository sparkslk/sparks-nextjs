"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ClipboardList, Users, CheckCircle, UserPlus, UserMinus } from "lucide-react";

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: "QUESTIONNAIRE" | "LISTENING_TASK" | "PICTURE_DESCRIPTION" | "FIND_DIFFERENCES" | "COGNITIVE_ASSESSMENT" | "BEHAVIORAL_ASSESSMENT";
  createdAt: string;
  updatedAt: string;
  score?: number;
  assignedPatients: {
    id: string;
    name: string;
    email?: string;
    completedAt?: string;
    score?: number;
  }[];
}

export default function AssessmentsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assessmentToDelete, setAssessmentToDelete] = useState<Assessment | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showPatientsModal, setShowPatientsModal] = useState(false);
  const [showAddPatientList, setShowAddPatientList] = useState(false);

  // Hardcoded possible patients to add
  const possiblePatients = [
    { id: 'p10', name: 'Nimal Perera', email: 'nimal@email.com' },
    { id: 'p11', name: 'Kamal Silva', email: 'kamal@email.com' },
    { id: 'p12', name: 'Sunethra Jayasuriya', email: 'sunethra@email.com' },
    { id: 'p13', name: 'Ruwanthi Fernando', email: 'ruwanthi@email.com' },
  ];
  
  const [availablePatients, setAvailablePatients] = useState(possiblePatients);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated") {
      fetchAssessments();
    }
  }, [authStatus, router]);

  const fetchAssessments = async () => {
    setLoading(true);
    // setError(null);

    try {
      // Mock data for now - replace with actual API call
      const mockAssessments: Assessment[] = [
        {
          id: "1",
          title: "Auditory Processing - Listening Task",
          description: "Audio-based assessment to evaluate listening comprehension, auditory memory, and processing speed through various listening exercises.",
          type: "LISTENING_TASK",
          createdAt: "2024-07-10",
          updatedAt: "2024-07-22",
          assignedPatients: [
            { id: "p2", name: "Pasandi Piyathma", completedAt: "2024-07-22", score: 78 },
            { id: "p4", name: "Anuki Tiyara" }, // Not completed yet
          ],
        },
        {
          id: "2",
          title: "Visual Perception - Picture Description",
          description: "Assessment involving detailed description of complex images to evaluate visual processing, attention to detail, and verbal expression skills.",
          type: "PICTURE_DESCRIPTION",
          createdAt: "2024-07-08",
          updatedAt: "2024-07-08",
          assignedPatients: [
            { id: "p3", name: "Niduni Fernando" },
            { id: "p5", name: "Onel Gomez" },
            { id: "p6", name: "Dinithi Aloka" },
          ],
        },
        {
          id: "3",
          title: "Attention & Focus - Find the Differences",
          description: "Visual attention task requiring patients to identify differences between similar images to assess concentration and visual attention skills.",
          type: "FIND_DIFFERENCES",
          createdAt: "2024-07-05",
          updatedAt: "2024-07-20",
          score: 91,
          assignedPatients: [
            { id: "p4", name: "Sanduni Perera", completedAt: "2024-08-05", score: 91 },
            { id: "p7", name: "Mithara Gethmi", completedAt: "2024-08-03", score: 83 },
          ],
        },
      ];

      setAssessments(mockAssessments);
    } catch (err) {
      console.error("Error fetching assessments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatients = (e: React.MouseEvent, assessment: Assessment) => {
    e.stopPropagation();
    setSelectedAssessment(assessment);
    setShowPatientsModal(true);
    // Remove already assigned patients from availablePatients
    const assignedIds = new Set(assessment.assignedPatients.map(p => p.id));
    setAvailablePatients(possiblePatients.filter(p => !assignedIds.has(p.id)));
    setShowAddPatientList(false);
  };

  const handleAddPatient = (patient: { id: string; name: string; email: string }) => {
    if (!selectedAssessment) return;
    // Add patient to assignedPatients
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === selectedAssessment.id
          ? { ...a, assignedPatients: [...a.assignedPatients, patient] }
          : a
      )
    );
    setSelectedAssessment((prev) =>
      prev ? { ...prev, assignedPatients: [...prev.assignedPatients, patient] } : prev
    );
    setAvailablePatients((prev) => prev.filter((p) => p.id !== patient.id));
    setShowAddPatientList(false);
  };

  const handleUnassignPatient = (patient: { id: string; name: string; email?: string }) => {
    if (!selectedAssessment) return;
    // Remove patient from assignedPatients
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === selectedAssessment.id
          ? { ...a, assignedPatients: a.assignedPatients.filter((p) => p.id !== patient.id) }
          : a
      )
    );
    setSelectedAssessment((prev) =>
      prev ? { ...prev, assignedPatients: prev.assignedPatients.filter((p) => p.id !== patient.id) } : prev
    );
    // Add back to availablePatients if in possiblePatients
    const found = possiblePatients.find((p) => p.id === patient.id);
    if (found) {
      setAvailablePatients((prev) => [...prev, found]);
    }
  };

  // Since we removed status, we don't need filtering anymore
  const filteredAssessments = assessments;

  const totalAssessments = assessments.length;
  const totalPatients = assessments.reduce((sum, a) => sum + a.assignedPatients.length, 0);

  const handleNewAssessment = () => {
    router.push("/therapist/assessments/new");
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "QUESTIONNAIRE":
        return "bg-purple-100 text-purple-800";
      case "LISTENING_TASK":
        return "bg-blue-100 text-blue-800";
      case "PICTURE_DESCRIPTION":
        return "bg-green-100 text-green-800";
      case "FIND_DIFFERENCES":
        return "bg-orange-100 text-orange-800";
      case "COGNITIVE_ASSESSMENT":
        return "bg-indigo-100 text-indigo-800";
      case "BEHAVIORAL_ASSESSMENT":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (authStatus === "loading" || loading) {
    return <LoadingSpinner message="Loading assessments..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6">
      {/* Patients Modal */}
      {showPatientsModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Assigned Patients - {selectedAssessment.title}
              </h3>
              <Button
                variant="ghost"
                onClick={() => setShowPatientsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
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
                          </div>
                          <Button size="icon" variant="outline" className="text-green-700 border-green-300" onClick={() => handleAddPatient(patient)} title="Add Patient">
                            <UserPlus className="w-4 h-4" />
                          </Button>
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
            <div className="space-y-3">
              {selectedAssessment.assignedPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#8159A8] text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{patient.name}</p>
                      {patient.email && (
                        <p className="text-xs text-gray-500">{patient.email}</p>
                      )}
                      {patient.completedAt && (
                        <p className="text-sm text-gray-500">
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
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#8159A8] mb-2">
              Assessment Management
            </h1>
            <p className="text-gray-600">
              Create and manage patient assessments and evaluations.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
            <div className="text-left">
              <div className="text-3xl font-bold text-[#8159A8]">
                {totalAssessments}
              </div>
              <div className="text-gray-500 text-sm">Total Assessments</div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <ClipboardList className="w-10 h-10 text-[#8159A8]" />
            </div>
          </Card>

          <Card className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
            <div className="text-left">
              <div className="text-3xl font-bold text-[#8159A8]">
                {totalPatients}
              </div>
              <div className="text-gray-500 text-sm">Total Assignments</div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <Users className="w-10 h-10 text-[#8159A8]" />
            </div>
          </Card>

          <Card className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
            <div className="text-left">
              <div className="text-3xl font-bold text-[#8159A8]">
                {assessments.filter(a => a.assignedPatients.some(p => p.completedAt)).length}
              </div>
              <div className="text-gray-500 text-sm">Assessments with Completions</div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <CheckCircle className="w-10 h-10 text-[#8159A8]" />
            </div>
          </Card>
        </div>

        {/* Assessment Grid */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.length > 0 ? (
              filteredAssessments.map((assessment) => (
                <Card
                  key={assessment.id}
                  className="overflow-hidden border rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => router.push(`/therapist/assessments/${assessment.id}`)}
                >
                  <div className="p-5 space-y-4">
                    {/* Header with Type */}
                    <div className="flex justify-start items-start">
                      <Badge className={getTypeBadgeColor(assessment.type)}>
                        {assessment.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>

                    {/* Title and Description */}
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2 text-gray-800 mb-2">
                        {assessment.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {assessment.description}
                      </p>
                    </div>

                    {/* Assessment Info */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-2" />
                        {assessment.assignedPatients.length} patients assigned
                      </div>
                      {assessment.score && (
                        <div className="flex items-center text-sm text-gray-500">
                          <ClipboardList className="w-4 h-4 mr-2" />
                          Latest Score: {assessment.score}%
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4 border-t mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/therapist/assessments/${assessment.id}`);
                        }}
                        className="bg-[#FAF8FB] hover:bg-[#FAF8FB] text-[#8159A8]"
                      >
                        View Assessment
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#FAF8FB] hover:bg-[#FAF8FB] text-[#8159A8]"
                        onClick={(e) => handleViewPatients(e, assessment)}
                      >
                        Assigned Patients
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
                <div className="text-3xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No assessments found
                </h3>
                <p className="text-gray-500 mb-6">
                  You haven&apos;t created any assessments yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}