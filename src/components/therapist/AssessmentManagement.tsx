"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Eye } from 'lucide-react';

interface Assessment {
  id: string;
  title: string;
  type: string;
  description: string;
  link?: string;
  image?: string;
  status: string;
  completedAt?: string | null;
  assignedAt: string;
  assignmentId: string;
}

interface UnassignedAssessment {
  id: string;
  title: string;
  type: string;
  description: string;
  link?: string;
  image?: string;
  typeColor: string;
}

interface AssessmentManagementProps {
  patientId: string;
  onAssessmentUpdate?: () => void;
}

export default function AssessmentManagement({ patientId, onAssessmentUpdate }: AssessmentManagementProps) {
  const [assignedAssessments, setAssignedAssessments] = useState<Assessment[]>([]);
  const [unassignedAssessments, setUnassignedAssessments] = useState<UnassignedAssessment[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchAssignedAssessments(patientId);
    }
  }, [patientId]);

  const fetchAssignedAssessments = async (patientId: string) => {
    try {
      setLoadingAssessments(true);
      const response = await fetch(`/api/therapist/patients/${patientId}/assessments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssignedAssessments(data.assessments);
      } else {
        console.error("Failed to fetch assigned assessments:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching assigned assessments:", error);
    } finally {
      setLoadingAssessments(false);
    }
  };

  const fetchUnassignedAssessments = async (patientId: string) => {
    try {
      setLoadingUnassigned(true);
      const response = await fetch(`/api/therapist/patients/${patientId}/assessments/unassigned`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnassignedAssessments(data.assessments);
      } else {
        console.error("Failed to fetch unassigned assessments:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching unassigned assessments:", error);
    } finally {
      setLoadingUnassigned(false);
    }
  };

  const handleAssignAssessment = async (assessmentId: string) => {
    try {
      const response = await fetch(`/api/therapist/patients/${patientId}/assessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assessmentId }),
      });

      if (response.ok) {
        // Refresh both assigned and unassigned assessments
        await fetchAssignedAssessments(patientId);
        await fetchUnassignedAssessments(patientId);
        
        // Show success message
        setSuccessMessage("Assessment assigned successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);

        // Call the callback if provided
        if (onAssessmentUpdate) {
          onAssessmentUpdate();
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to assign assessment: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error assigning assessment:", error);
      alert("Error assigning assessment. Please try again.");
    }
  };

  const handleUnassignAssessment = async (assessmentId: string) => {
    try {
      const response = await fetch(`/api/therapist/patients/${patientId}/assessments`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assessmentId }),
      });

      if (response.ok) {
        // Refresh both assigned and unassigned assessments
        await fetchAssignedAssessments(patientId);
        await fetchUnassignedAssessments(patientId);
        
        // Show success message
        setSuccessMessage("Assessment unassigned successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);

        // Call the callback if provided
        if (onAssessmentUpdate) {
          onAssessmentUpdate();
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to unassign assessment: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error unassigning assessment:", error);
      alert("Error unassigning assessment. Please try again.");
    }
  };

  const openAssignDialog = () => {
    setSuccessMessage(null); // Clear any existing success message
    fetchUnassignedAssessments(patientId);
    setShowAssignDialog(true);
  };

  return (
    <div>
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}
      
      {loadingAssessments ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-2 text-muted-foreground">Loading assessments...</p>
        </div>
      ) : assignedAssessments && assignedAssessments.length > 0 ? (
        <div className="space-y-6">
          {/* Assigned Assessments Header */}
          <div className="bg-transparent">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold mb-2 text-[#8159A8]">Assigned Assessments</h3>
                <p className="text-gray-600">Assessments assigned by the therapist</p>
              </div>
              
              <div className="text-right">
                <div className="flex gap-2 justify-end py-4">
                  <Button
                    style={{ backgroundColor: "#8159A8", color: "#fff" }}
                    className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow hover:brightness-110"
                    onClick={openAssignDialog}
                  >
                    <Plus className="w-5 h-5" />
                    Assign a new Assessment
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Assessments List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="bg-[#FAF8FB] rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow flex flex-col h-full border border-[#e9e1f3]"
              >
                {/* Title */}
                <h4 className="text-lg font-semibold text-[#8159A8] mb-2 truncate">{assessment.title}</h4>
                
                {/* Type Badge */}
                <div className="mb-3">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    {assessment.type}
                  </span>
                </div>
                
                {/* Description */}
                <div className="flex flex-col gap-1 text-sm text-gray-700 flex-1 mt-1">
                  <p className="leading-relaxed line-clamp-3">{assessment.description}</p>
                </div>
                
                
                
                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 flex justify-end">
                    {assessment.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2 hover:bg-blue-50 text-blue-600"
                        onClick={() => {
                          if (assessment.link) {
                            window.open(assessment.link, '_blank');
                          }
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Assessment
                      </Button>
                    )}
                    {(
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-red-50 text-red-600"
                        onClick={() => handleUnassignAssessment(assessment.id)}
                      >
                        Unassign
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No assigned assessments found.</p>
          <Button
            style={{ backgroundColor: "#8159A8", color: "#fff" }}
            className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow hover:brightness-110"
            onClick={openAssignDialog}
          >
            <Plus className="w-5 h-5" />
            Assign a new Assessment
          </Button>
        </div>
      )}

      {/* Assign Assessment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assign an Assessment</DialogTitle>
          </DialogHeader>
          
          {/* Success Message in Dialog */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          )}
          
          {loadingUnassigned ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-2 text-muted-foreground">Loading available assessments...</p>
            </div>
          ) : unassignedAssessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {unassignedAssessments.map((assessment) => (
                <div key={assessment.id} className="bg-[#fcfafd] rounded-2xl shadow p-6 flex flex-col h-full border border-[#f0eef5]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${assessment.typeColor}`}>
                      {assessment.type}
                    </span>
                  </div>
                  <div className="font-bold text-lg text-[#3b2562] mb-2">{assessment.title}</div>
                  <div className="text-sm text-gray-600 mb-4 flex-1">{assessment.description}</div>
                  
                  <div className="flex gap-2 mt-auto">
                    <Button
                      variant="outline"
                      className="border-green-400 text-green-700 hover:bg-green-50 px-3 py-1 text-s font-semibold"
                      style={{ borderColor: "#1ac600ff" }}
                      onClick={() => handleAssignAssessment(assessment.id)}
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">All available assessments are already assigned to this patient.</p>
              <p className="text-sm text-gray-500">No new assessments to assign at this time.</p>
            </div>
          )}
          <div className="flex justify-end mt-6">
            <Button
              style={{ backgroundColor: "#8159A8", color: "#fff" }}
              className="font-semibold px-6 py-2 rounded-lg"
              onClick={() => setShowAssignDialog(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}