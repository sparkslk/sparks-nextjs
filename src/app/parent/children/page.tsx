
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
//   TrendingUp,
//   Calendar,
  FileText,
//   Activity,
//   ChevronRight,
//   Clock,
  CheckCircle
} from "lucide-react";
import ParentNavigation from "../navigation/parentNavigation";

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
          progressPercentage: 75,
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
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8159A8' }}></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ParentNavigation />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => (
            <div key={child.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#EDE6F3] flex items-center justify-center">
                    <span className="text-[#8159A8] font-semibold">
                      {child.firstName[0]}{child.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {child.firstName} {child.lastName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Under care of {child.therapistName}<br />Age: {child.age}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                      <path
                        d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831"
                        fill="none"
                        stroke="#8159A8"
                        strokeWidth="2"
                        strokeDasharray={`${child.progressPercentage}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-900">
                        {child.progressPercentage}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">TASKS COMPLETED</p>
                </div>
              </div>
              <div className="text-sm text-gray-700 mb-2 font-medium">Recent Activity</div>
              <ul className="space-y-1 text-sm">
                {child.recentActivity.map((a) => (
                  <li key={a.id} className="flex items-center">
                    {a.type === 'session' && <CheckCircle className="w-4 h-4 text-green-500 mr-2" />}
                    {a.type === 'report' && <FileText className="w-4 h-4 text-blue-500 mr-2" />}
                    {a.type === 'message' && <MessageCircle className="w-4 h-4 text-purple-500 mr-2" />}
                    {a.description}
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="outline" size="sm" className="text-[#8159A8] border-[#8159A8]">Medications</Button>
                <Button variant="outline" size="sm" className="text-[#8159A8] border-[#8159A8]">Tasks</Button>
                <Button variant="outline" size="sm" className="text-[#8159A8] border-[#8159A8]">Sessions</Button>
                <Button variant="default" size="sm" className="bg-[#8159A8]">Message Therapist</Button>
              </div>
            </div>
          ))}
        </div>

        {/* Parent Notes Section */}
        <div className="mt-10 bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900 mb-2">Parent Notes & Observations</h3>
            <div className="space-x-2">
              {children.map((child, index) => (
                <Button
                  key={child.id}
                  variant={activeChildIndex === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveChildIndex(index)}
                  className={activeChildIndex === index ? "bg-[#8159A8]" : "text-[#8159A8] border-[#8159A8]"}
                >
                  {child.firstName}
                </Button>
              ))}
            </div>
          </div>
          <div className="p-4">
            <textarea
              className="w-full border rounded-md p-2 text-sm text-gray-800 mb-4"
              rows={4}
              placeholder="Enter your observations here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <Button variant="default" className="bg-[#8159A8]">Send to Therapist</Button>
          </div>
        </div>
      </div>
    </div>
  );
}