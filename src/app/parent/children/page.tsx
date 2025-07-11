"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp
} from "lucide-react";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: string;
  isPrimary: boolean;
  upcomingSessions: number;
  progressReports: number;
  progressPercentage: number;
  lastSession: string | null;
  therapist: {
    name: string;
    email: string;
  } | null;
}

export default function MyChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [animatedProgress, setAnimatedProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await fetch("/api/parent/children");
      if (!response.ok) {
        throw new Error("Failed to fetch children data");
      }
      const data = await response.json();
      setChildren(data.children || []);

      // Initialize animated progress for each child
      const initialProgress: { [key: string]: number } = {};
      data.children?.forEach((child: Child) => {
        initialProgress[child.id] = 0;
      });
      setAnimatedProgress(initialProgress);

      // Animate progress circles
      setTimeout(() => {
        data.children?.forEach((child: Child, index: number) => {
          setTimeout(() => {
            animateProgress(child.id, child.progressPercentage || 0);
          }, index * 200); // Stagger animations
        });
      }, 100);
    } catch (error) {
      console.error("Error fetching children:", error);
      setError("Failed to load children data");
    } finally {
      setLoading(false);
    }
  };

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
          <p className="mt-2 text-gray-600">Loading children...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Unable to load children</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchChildren}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No Children Found</h3>
          <p className="text-gray-600 mb-4">You haven&apos;t added any children yet.</p>
          <Button onClick={() => window.location.href = '/parent/dashboard'}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Calculate age from dateOfBirth
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F3FB' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            My Children
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your children&apos;s therapy progress and communicate with their therapists
          </p>
        </div>

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
                      Relationship: {child.relationship} • Age: {calculateAge(child.dateOfBirth)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Therapist: {child.therapist ? child.therapist.name : 'Not assigned'}
                    </p>
                  </div>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    Active
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
                    Patient ID: <span className="font-mono text-xs bg-white px-2 py-1 rounded border">{child.id}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Upcoming Sessions: <span className="font-medium">{child.upcomingSessions}</span>
                  </p>
                  {child.lastSession && (
                    <p className="text-sm text-gray-600">
                      Last Session: {new Date(child.lastSession).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {child.isPrimary ? 'You are the primary guardian for this child.' : 'You are connected as a guardian.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    View Sessions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Reports
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Medical Info
                  </Button>
                  <Button
                    size="sm"
                    style={{ backgroundColor: '#8159A8' }}
                    className="text-white hover:opacity-90"
                  >
                    Contact Therapist
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Parent Notes Section - Only show if any child has a therapist */}
        {children.length > 0 && children.some(child => child.therapist) && (
          <Card className="mt-10 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-4">Parent Notes & Observations</CardTitle>
              <div className="space-x-2">
                {children.filter(child => child.therapist).map((child, index) => (
                  <Button
                    key={child.id}
                    variant={activeChildIndex === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setActiveChildIndex(index);
                      setNoteText(""); // Clear note when switching children
                    }}
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
                  disabled={!noteText.trim()}
                  onClick={() => {
                    // TODO: Implement sending note to therapist
                    alert(`Note for ${children.filter(child => child.therapist)[activeChildIndex]?.firstName} would be sent to their therapist.`);
                    setNoteText("");
                  }}
                >
                  Send to Therapist
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connect with Therapist Notice - Show if no therapists assigned */}
        {children.length > 0 && !children.some(child => child.therapist) && (
          <Card className="mt-5 shadow-sm border-2 border-dashed border-gray-300">
            <CardContent className="p-4 text-center">
              <div className="w-50 h-50 mx-auto flex items-center justify-center">
                <Image 
                  src="/images/doctor.png" 
                  alt="Doctor" 
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connect with a Therapist
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                To start sharing notes and observations about your child&apos;s progress, you&apos;ll need to connect with a qualified therapist first.
              </p>
              <Button
                style={{ backgroundColor: '#8159A8' }}
                className="text-white hover:opacity-90 px-8 py-2"
                onClick={() => window.location.href = '/parent/findTherapist'}
              >
                Find a Therapist
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                Browse our network of licensed mental health professionals
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}