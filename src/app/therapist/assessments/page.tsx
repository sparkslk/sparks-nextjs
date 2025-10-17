"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ClipboardList, Users,  UserPlus, UserMinus } from "lucide-react";
import Image from "next/image";

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  assignedPatients: {
    id: string;
    name: string;
    email?: string;
    completedAt?: string;
  }[];
}

export default function AssessmentsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showPatientsModal, setShowPatientsModal] = useState(false);
  const [showAddPatientList, setShowAddPatientList] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Replace hardcoded patients with dynamic data
  const [possiblePatients, setPossiblePatients] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [availablePatients, setAvailablePatients] = useState<Array<{ id: string; name: string; email: string }>>([]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated") {
      fetchAssessments();
      fetchTherapistPatients(); // Add this line
    }
  }, [authStatus, router]);

  // Add function to fetch therapist's patients
  const fetchTherapistPatients = async () => {
    try {
      const response = await fetch('/api/therapist/patients');
      if (response.ok) {
        const data = await response.json();
        const formattedPatients = data.patients.map((patient: any) => ({
          id: patient.id,
          name: `${patient.firstName} ${patient.lastName}`.trim(),
          email: patient.user?.email || patient.email || ''
        }));
        setPossiblePatients(formattedPatients);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchAssessments = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/therapist/assessments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch assessments');
      }

      const data = await response.json();
      
      // Fetch assignment data for each assessment
      const assessmentsWithAssignments = await Promise.all(
        data.assessments.map(async (assessment: any) => {
          const assignmentResponse = await fetch(`/api/therapist/assessments/${assessment.id}/assignments`);
          
          if (assignmentResponse.ok) {
            const assignmentData = await assignmentResponse.json();
            return {
              ...assessment,
              assignedPatients: assignmentData.assignments || []
            };
          }
          
          return {
            ...assessment,
            assignedPatients: []
          };
        })
      );

      setAssessments(assessmentsWithAssignments);
    } catch (err) {
      console.error("Error fetching assessments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatients = async (e: React.MouseEvent, assessment: Assessment) => {
    e.stopPropagation();
    
    try {
      // Fetch fresh assignment data for this assessment
      const assignmentResponse = await fetch(`/api/therapist/assessments/${assessment.id}/assignments`);
      
      let updatedAssessment = assessment;
      if (assignmentResponse.ok) {
        const assignmentData = await assignmentResponse.json();
        updatedAssessment = {
          ...assessment,
          assignedPatients: assignmentData.assignments || []
        };
      }
      
      setSelectedAssessment(updatedAssessment);
      setShowPatientsModal(true);
      
      // Remove already assigned patients from availablePatients
      const assignedIds = new Set(updatedAssessment.assignedPatients.map(p => p.id));
      setAvailablePatients(possiblePatients.filter(p => !assignedIds.has(p.id)));
      setShowAddPatientList(false);
    } catch (error) {
      console.error('Error fetching assignment data:', error);
      // Fall back to cached data
      setSelectedAssessment(assessment);
      setShowPatientsModal(true);
      const assignedIds = new Set(assessment.assignedPatients.map(p => p.id));
      setAvailablePatients(possiblePatients.filter(p => !assignedIds.has(p.id)));
      setShowAddPatientList(false);
    }
  };

  // Update handleAddPatient to show success message
  const handleAddPatient = async (patient: { id: string; name: string; email: string }) => {
    if (!selectedAssessment) return;
    
    try {
      const response = await fetch(`/api/therapist/assessments/${selectedAssessment.id}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patient.id
        }),
      });

      if (response.ok) {
        // Update local state
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
        
        // Show success message
        setSuccessMessage(`${patient.name} has been successfully assigned to this assessment.`);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        console.error('Failed to assign patient');
      }
    } catch (error) {
      console.error('Error assigning patient:', error);
    }
  };

  const handleUnassignPatient = async (patient: { id: string; name: string; email?: string }) => {
    if (!selectedAssessment) return;
    
    try {
      const response = await fetch(`/api/therapist/assessments/${selectedAssessment.id}/assignments`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patient.id
        }),
      });

      if (response.ok) {
        // Update local state
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
        
        // Show success message
        setSuccessMessage(`${patient.name} has been successfully unassigned from this assessment.`);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        console.error('Failed to unassign patient');
      }
    } catch (error) {
      console.error('Error unassigning patient:', error);
    }
  };

  // Since we removed status, we don't need filtering anymore
  const filteredAssessments = assessments;

  const totalAssessments = assessments.length;
  const totalPatients = assessments.reduce((sum, a) => sum + a.assignedPatients.length, 0);


  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "INITIAL":
        return "bg-blue-100 text-blue-800";
      case "PROGRESS":
        return "bg-green-100 text-green-800";
      case "FINAL":
        return "bg-purple-100 text-purple-800";
      case "FOLLOW_UP":
        return "bg-orange-100 text-orange-800";
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
                onClick={() => {
                  setShowPatientsModal(false);
                  setSuccessMessage("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            
            {/* Success Message Bar */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center">
                <div className="w-5 h-5 mr-2 text-green-600">
                  ✓
                </div>
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            )}
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
                <div className="mt-3 max-h-40 overflow-y-auto">
                  <h4 className="font-semibold text-gray-700 mb-2">Select a patient to add</h4>
                  {availablePatients.length > 0 ? (
                    <ul className="space-y-2">
                      {availablePatients.map((patient) => (
                        <li key={patient.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div>
                            <span className="font-medium text-gray-800">{patient.name}</span>
                            <span className="ml-2 text-xs text-gray-500">{patient.email}</span>
                          </div>
                          <Button
                            size="icon"
                            variant="outline"
                            className="text-green-700 border-green-300"
                            onClick={() => handleAddPatient(patient)}
                            title="Add Patient"
                          >
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
            <div className="space-y-3 max-h-60 overflow-y-auto">
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
        {/* Header with Stats */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[#8159A8] mb-2">
              Assessment Management
            </h1>
            <p className="text-gray-600">
              Create and manage patient assessments and evaluations.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Card className="bg-primary-foreground p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between min-w-[200px]">
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
            <Card className="bg-primary-foreground p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between min-w-[200px]">
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
          </div>
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

                    {/* Image */}
                    <div className="relative w-full h-40">
                      <Image
                        src={assessment.image ? `/images/assessments/${assessment.image}` : '/images/assessments/default.png'}
                        alt={assessment.title}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
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
                        Assign Patients
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



