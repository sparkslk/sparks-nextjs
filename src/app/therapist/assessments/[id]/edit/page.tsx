"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Settings } from "lucide-react";

export default function EditAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
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
            <h1 className="text-3xl font-bold text-[#8159A8]">
              Edit Assessment
            </h1>
            <p className="text-gray-600">
              Modify assessment details and questions.
            </p>
          </div>
        </div>

        {/* Coming Soon Card */}
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 bg-[#F5F3FB] rounded-full flex items-center justify-center">
              <Settings className="w-10 h-10 text-[#8159A8]" />
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Edit Assessment Feature
              </h2>
              <p className="text-gray-600 mb-6 max-w-md">
                The assessment editing functionality is currently under development. 
                This feature will allow you to modify questions, update patient assignments, 
                and adjust assessment settings.
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => router.push(`/therapist/assessments/${assessmentId}`)}
                className="bg-[#8159A8] hover:bg-[#6D4C93] text-white"
              >
                View Assessment
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/therapist/assessments")}
              >
                Back to Assessments
              </Button>
            </div>

            {/* Feature Preview */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Coming Soon Features:</h3>
              <ul className="text-left space-y-2 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-[#8159A8] rounded-full mr-3"></div>
                  Edit assessment title and description
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-[#8159A8] rounded-full mr-3"></div>
                  Modify existing questions and add new ones
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-[#8159A8] rounded-full mr-3"></div>
                  Update patient assignments
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-[#8159A8] rounded-full mr-3"></div>
                  Change assessment type and scheduling
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-[#8159A8] rounded-full mr-3"></div>
                  Bulk operations for multiple assessments
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
