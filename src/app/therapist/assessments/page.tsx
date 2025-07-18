"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PlusIcon, ClipboardList, Calendar, Users, Eye } from "lucide-react";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: "QUESTIONNAIRE" | "LISTENING_TASK" | "PICTURE_DESCRIPTION" | "FIND_DIFFERENCES" | "COGNITIVE_ASSESSMENT" | "BEHAVIORAL_ASSESSMENT";
  patientId: string;
  patientName: string;
  assessmentDate: string;
  createdAt: string;
  updatedAt: string;
  score?: number;
  assignedPatients: {
    id: string;
    name: string;
    completedAt?: string;
    score?: number;
  }[];
}

export default function AssessmentsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<Assessment | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showPatientsModal, setShowPatientsModal] = useState(false);

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
    setError(null);

    try {
      // Mock data for now - replace with actual API call
      const mockAssessments: Assessment[] = [
        {
          id: "1",
          title: "ADHD Questionnaire Assessment",
          description: "Comprehensive questionnaire for ADHD diagnosis including attention span, hyperactivity, and impulsivity measures with standardized rating scales.",
          type: "QUESTIONNAIRE",
          patientId: "p1",
          patientName: "Sarah Johnson",
          assessmentDate: "2024-07-20",
          createdAt: "2024-07-15",
          updatedAt: "2024-07-15",
          score: 85,
          assignedPatients: [
            { id: "p1", name: "Sarah Johnson", completedAt: "2024-07-20", score: 85 },
            { id: "p2", name: "Michael Chen", completedAt: "2024-07-18", score: 72 },
            { id: "p3", name: "Emma Davis" }, // Not completed yet
          ],
        },
        {
          id: "2",
          title: "Auditory Processing - Listening Task",
          description: "Audio-based assessment to evaluate listening comprehension, auditory memory, and processing speed through various listening exercises.",
          type: "LISTENING_TASK",
          patientId: "p2",
          patientName: "Michael Chen",
          assessmentDate: "2024-07-25",
          createdAt: "2024-07-10",
          updatedAt: "2024-07-22",
          assignedPatients: [
            { id: "p2", name: "Michael Chen", completedAt: "2024-07-22", score: 78 },
            { id: "p4", name: "David Wilson" }, // Not completed yet
          ],
        },
        {
          id: "3",
          title: "Visual Perception - Picture Description",
          description: "Assessment involving detailed description of complex images to evaluate visual processing, attention to detail, and verbal expression skills.",
          type: "PICTURE_DESCRIPTION",
          patientId: "p3",
          patientName: "Emma Davis",
          assessmentDate: "2024-07-30",
          createdAt: "2024-07-08",
          updatedAt: "2024-07-08",
          assignedPatients: [
            { id: "p3", name: "Emma Davis" },
            { id: "p5", name: "Lisa Rodriguez" },
            { id: "p6", name: "James Thompson" },
          ],
        },
        {
          id: "4",
          title: "Attention & Focus - Find the Differences",
          description: "Visual attention task requiring patients to identify differences between similar images to assess concentration and visual attention skills.",
          type: "FIND_DIFFERENCES",
          patientId: "p4",
          patientName: "David Wilson",
          assessmentDate: "2024-08-05",
          createdAt: "2024-07-05",
          updatedAt: "2024-07-20",
          score: 91,
          assignedPatients: [
            { id: "p4", name: "David Wilson", completedAt: "2024-08-05", score: 91 },
            { id: "p7", name: "Sophie Anderson", completedAt: "2024-08-03", score: 83 },
          ],
        },
      ];

      setAssessments(mockAssessments);
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setError("Failed to load assessments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAssessment = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    router.push(`/therapist/assessments/${id}`);
  };

  const handleEditAssessment = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    router.push(`/therapist/assessments/${id}/edit`);
  };

  const handleDeleteAssessment = (e: React.MouseEvent, assessment: Assessment) => {
    e.stopPropagation();
    setAssessmentToDelete(assessment);
    setShowDeleteModal(true);
  };

  const handleViewPatients = (e: React.MouseEvent, assessment: Assessment) => {
    e.stopPropagation();
    setSelectedAssessment(assessment);
    setShowPatientsModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setAssessmentToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!assessmentToDelete) return;

    try {
      console.log(`Deleting assessment ${assessmentToDelete.id}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAssessments(assessments.filter((assessment) => assessment.id !== assessmentToDelete.id));
      setShowDeleteModal(false);
      setAssessmentToDelete(null);
    } catch (error) {
      console.error("Error deleting assessment:", error);
      alert("Failed to delete assessment. Please try again.");
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
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onDelete={handleConfirmDelete}
        title="Delete Assessment?"
        description="Are you sure you want to delete"
        itemName={assessmentToDelete?.title}
        buttonLabel="Delete Assessment"
        buttonVariant="destructive"
      />

      {/* Patients Modal */}
      {showPatientsModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Patient Progress - {selectedAssessment.title}
              </h3>
              <Button
                variant="ghost"
                onClick={() => setShowPatientsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
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

          <Button
            onClick={handleNewAssessment}
            className="bg-[#8159A8] hover:bg-[#6D4C93] text-white transition-all duration-300 mt-4 md:mt-0"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Add New Assessment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="text-3xl font-bold text-[#8159A8]">
              {totalAssessments}
            </div>
            <div className="text-gray-500 text-sm">Total Assessments</div>
          </Card>

          <Card className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="text-3xl font-bold text-[#8159A8]">
              {totalPatients}
            </div>
            <div className="text-gray-500 text-sm">Total Assignments</div>
          </Card>

          <Card className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="text-3xl font-bold text-[#8159A8]">
              {assessments.filter(a => a.assignedPatients.some(p => p.completedAt)).length}
            </div>
            <div className="text-gray-500 text-sm">Assessments with Completions</div>
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
                        <Calendar className="w-4 h-4 mr-2" />
                        Assessment Date: {new Date(assessment.assessmentDate).toLocaleDateString()}
                      </div>
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
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-[#8159A8]"
                        onClick={(e) => handleEditAssessment(e, assessment.id)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-[#8159A8]"
                        onClick={(e) => handleViewPatients(e, assessment)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Progress
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-red-600"
                        onClick={(e) => handleDeleteAssessment(e, assessment)}
                      >
                        Delete
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
                  You haven't created any assessments yet.
                </p>
                <Button
                  onClick={handleNewAssessment}
                  className="bg-[#8159A8] hover:bg-[#6D4C93] text-white"
                >
                  Create Your First Assessment
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
