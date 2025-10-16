"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, ClipboardList, Users } from "lucide-react";

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
  averageScore?: number;
  completionRate: number;
}

export default function AssessmentDetailsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const mockAssessment: Assessment = {
        id: "1",
        title: "Auditory Processing - Listening Task",
        description: "Audio-based assessment to evaluate listening comprehension, auditory memory, and processing speed through various listening exercises.",
        type: "LISTENING_TASK",
        assessmentDate: "2024-07-10",
        createdAt: "2024-07-10",
        updatedAt: "2024-07-22",
        questions: [
          { id: "q1", text: "Listen to the audio and answer the following comprehension question.", type: "text", required: true },
          { id: "q2", text: "How many words did you recall from the audio?", type: "scale", required: true },
          { id: "q3", text: "Rate the difficulty of the listening task.", type: "scale", required: false },
        ],
        averageScore: 78,
        completionRate: 50,
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
      case "INITIAL": return "bg-purple-100 text-purple-800";
      case "PROGRESS": return "bg-blue-100 text-blue-800";
      case "FINAL": return "bg-green-100 text-green-800";
      case "FOLLOW_UP": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
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
            <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 hover:text-[#8159A8]">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
          <Card className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/therapist/assessments")}>Back to Assessments</Button>
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
            <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 hover:text-[#8159A8]">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
          <Card className="p-8 text-center">
            <p className="text-gray-600 mb-4">Assessment not found</p>
            <Button onClick={() => router.push("/therapist/assessments")}>Back to Assessments</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 hover:text-[#8159A8]">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-[#8159A8]">{assessment.title}</h1>
                <Badge className={getTypeBadgeColor(assessment.type)}>{assessment.type.replace('_', ' ')}</Badge>
              </div>
              <p className="text-gray-600">{assessment.description}</p>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
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
                <p className="text-2xl font-bold text-gray-800">{assessment.completionRate}%</p>
                <p className="text-gray-600 text-sm">Completion Rate</p>
              </div>
            </div>
          </Card>
          
        </div>

        {/* Questions Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Assessment Questions</h2>
          <div className="space-y-4">
            {assessment.questions.map((question, index) => (
              <div key={question.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 bg-white px-2 py-1 rounded">Q{index + 1}</span>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="text-xs">{question.type.replace('_', ' ')}</Badge>
                    {question.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
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
                {question.type === "scale" && <p className="text-sm text-gray-600 ml-4">Rating scale: 1-10</p>}
              </div>
            ))}
          </div>
        </Card>

        
      </div>
    </div>
  );
}
