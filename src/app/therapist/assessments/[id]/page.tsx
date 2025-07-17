"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, Calendar, ClipboardList, Users, Edit, BarChart3 } from "lucide-react";

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: "INITIAL" | "PROGRESS" | "FINAL" | "FOLLOW_UP";
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
    responses?: any;
  }[];
  averageScore?: number;
  completionRate: number;
}

export default function AssessmentDetailsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated" && assessmentId) {
      fetchAssessment();
    }
  }, [authStatus, router, assessmentId]);

  const fetchAssessment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock data - replace with actual API call
      const mockAssessment: Assessment = {
        id: assessmentId,
        title: "ADHD Initial Assessment",
        description: "Comprehensive initial assessment for ADHD diagnosis including attention span, hyperactivity, and impulsivity measures.",
        type: "INITIAL",
        assessmentDate: "2024-07-20",
        createdAt: "2024-07-15",
        updatedAt: "2024-07-15",
        questions: [
          {
            id: "q1",
            text: "How often do you find it difficult to pay attention to details?",
            type: "scale",
            required: true,
          },
          {
            id: "q2",
            text: "Which of the following symptoms do you experience most frequently?",
            type: "multiple_choice",
            options: ["Difficulty concentrating", "Restlessness", "Impulsive behavior", "Forgetfulness"],
            required: true,
          },
          {
            id: "q3",
            text: "Describe any specific situations where you notice attention difficulties.",
            type: "text",
            required: false,
          },
        ],
        assignedPatients: [
          { 
            id: "p1", 
            name: "Sarah Johnson", 
            email: "sarah.johnson@email.com",
            completedAt: "2024-07-20", 
            score: 85 
          },
          { 
            id: "p2", 
            name: "Michael Chen", 
            email: "michael.chen@email.com",
            completedAt: "2024-07-18", 
            score: 72 
          },
          { 
            id: "p3", 
            name: "Emma Davis", 
            email: "emma.davis@email.com"
          },
        ],
        averageScore: 78.5,
        completionRate: 67, // 2 out of 3 completed
      };

      setAssessment(mockAssessment);
    } catch (err) {
      console.error("Error fetching assessment:", err);
      setError("Failed to load assessment. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleEdit = () => {
    router.push(`/therapist/assessments/${assessmentId}/edit`);
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
          
          <Button
            onClick={handleEdit}
            className="bg-[#8159A8] hover:bg-[#6D4C93] text-white"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Assessment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{assessment.questions.length}</p>
                <p className="text-gray-600 text-sm">Questions</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
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
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{assessment.completionRate}%</p>
                <p className="text-gray-600 text-sm">Completion Rate</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
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
