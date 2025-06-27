"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  FileText,
  CheckCircle,
  TrendingUp
} from "lucide-react";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  therapyType: string;
  status: "Active" | "Inactive";
  nextSession: string;
  completedSessions: number;
  totalSessions: number;
  recentActivity: Array<{
    id: string;
    type: "session" | "report" | "message";
    description: string;
    timestamp: string;
  }>;
  progressPercentage: number;
  therapistName: string;
  parentNote?: string;
}

export default function MyChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [animatedProgress, setAnimatedProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    setTimeout(() => {
      const childrenData: Child[] = [
        {
          id: "1",
          firstName: "Amal",
          lastName: "Perera",
          age: 12,
          therapyType: "Speech Therapy",
          status: "Active",
          nextSession: "Dec 15, 9:00 AM",
          completedSessions: 15,
          totalSessions: 20,
          progressPercentage: 100,
          therapistName: "Dr. Nirmal Silva",
          parentNote:
            "Amal had a good day today. Showed improved focus during our evening conversation. Mood was stable throughout the day. Ate well at dinner and seemed more engaged with family activities. Completed his homework without much resistance.",
          recentActivity: [
            {
              id: "1",
              type: "session",
              description: "Completed morning routine",
              timestamp: "Today"
            },
            {
              id: "2",
              type: "report",
              description: "Therapy session attended",
              timestamp: "Yesterday"
            }
          ]
        },
        {
          id: "2",
          firstName: "Sahan",
          lastName: "Perera",
          age: 8,
          therapyType: "Occupational Therapy",
          status: "Active",
          nextSession: "Dec 16, 2:00 PM",
          completedSessions: 12,
          totalSessions: 20,
          progressPercentage: 60,
          therapistName: "Dr. Kamala Wijesinghe",
          parentNote: "",
          recentActivity: [
            {
              id: "3",
              type: "session",
              description: "Completed morning routine",
              timestamp: "Today"
            },
            {
              id: "4",
              type: "report",
              description: "Therapy session attended",
              timestamp: "Yesterday"
            }
          ]
        }
      ];

      setChildren(childrenData);
      setLoading(false);

      // Initialize animated progress for each child
      const initialProgress: { [key: string]: number } = {};
      childrenData.forEach(child => {
        initialProgress[child.id] = 0;
      });
      setAnimatedProgress(initialProgress);

      // Animate progress circles
      setTimeout(() => {
        childrenData.forEach((child, index) => {
          setTimeout(() => {
            animateProgress(child.id, child.progressPercentage);
          }, index * 200); // Stagger animations
        });
      }, 100);
    }, 1000);
  }, []);

  const animateProgress = (childId: string, targetProgress: number) => {
    let currentProgress = 0;
    const increment = targetProgress / 50; // 50 frames for smooth animation
    const timer = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= targetProgress) {
        currentProgress = targetProgress;
        clearInterval(timer);
      }
      setAnimatedProgress(prev => ({
        ...prev,
        [childId]: Math.round(currentProgress)
      }));
    }, 20); // 20ms interval for smooth animation
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F3FB' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8159A8' }}></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F3FB' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => (
            <Card key={child.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#EDE6F3' }}
                  >
                    <span className="font-semibold" style={{ color: '#8159A8' }}>
                      {child.firstName[0]}{child.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {child.firstName} {child.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {child.therapyType} • Age: {child.age}
                    </p>
                    <p className="text-sm text-gray-500">
                      Therapist: {child.therapistName}
                    </p>
                  </div>
                  <Badge
                    variant={child.status === "Active" ? "default" : "secondary"}
                    className={child.status === "Active" ? "bg-green-100 text-green-800" : ""}
                  >
                    {child.status}
                  </Badge>
                </div>

                {/* Centered Progress Display */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative w-24 h-24 mb-3">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <path
                        d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      {/* Progress circle */}
                      <path
                        d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                        fill="none"
                        stroke="#8159A8"
                        strokeWidth="3"
                        strokeDasharray={`${animatedProgress[child.id] || 0} ${100 - (animatedProgress[child.id] || 0)}`}
                        strokeLinecap="round"
                        style={{
                          transition: 'stroke-dasharray 0.5s ease-in-out'
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6" style={{ color: '#8159A8' }} />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {animatedProgress[child.id] || 0}%
                    </p>
                    <p className="text-sm text-gray-500 font-medium">Overall Progress</p>
                  </div>
                </div>

                <div className="mb-4 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">
                    Next Session: <span className="font-medium">{child.nextSession}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Sessions: {child.completedSessions}/{child.totalSessions} completed
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h5>
                  <div className="space-y-2">
                    {child.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center text-sm text-gray-600">
                        {activity.type === 'session' && <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />}
                        {activity.type === 'report' && <FileText className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />}
                        {activity.type === 'message' && <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#8159A8' }} />}
                        <span className="flex-1">{activity.description}</span>
                        <span className="text-xs text-gray-400">{activity.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Medications
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Tasks
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Sessions
                  </Button>
                  <Button
                    size="sm"
                    style={{ backgroundColor: '#8159A8' }}
                    className="text-white hover:opacity-90"
                  >
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Parent Notes Section */}
        <Card className="mt-10 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-4">Parent Notes & Observations</CardTitle>
            <div className="space-x-2">
              {children.map((child, index) => (
                <Button
                  key={child.id}
                  variant={activeChildIndex === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveChildIndex(index)}
                  className={activeChildIndex === index ? "bg-[#8159A8] hover:bg-[#8159A8]/90" : "text-[#8159A8] border-[#8159A8] hover:bg-[#8159A8]/10"}
                >
                  {child.firstName}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 mb-4 focus:ring-2 focus:ring-[#8159A8] focus:border-[#8159A8] outline-none resize-none"
              rows={4}
              placeholder="Enter your observations about your child's progress, behavior, or any concerns you'd like to share with the therapist..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Share your observations to help your child&apos;s therapist provide better care
              </p>
              <Button
                style={{ backgroundColor: '#8159A8' }}
                className="text-white hover:opacity-90 px-6"
              >
                Send to Therapist
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}