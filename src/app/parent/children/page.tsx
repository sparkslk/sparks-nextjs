"use client";

import { useState, useEffect } from "react";
// import Image from "next/image";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp
} from "lucide-react";
import SessionDetailsModal from "@/components/parent/SessionDetailsModal";
import { AddChildForm } from "@/components/parent/AddChildForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  nextSessionType: string | null; // e.g., 'individual', 'group'
  nextSessionStatus: string,
  nextSessionId?: string | null;
  therapist: {
    name: string;
    email: string;
  } | null;
  image?: string | null;
}

export default function MyChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  // const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [noteText, setNoteText] = useState("");
  const [animatedProgress, setAnimatedProgress] = useState<{ [key: string]: number }>({});
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
        initialProgress[child.id] = child.progressPercentage || 0;
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
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen pb-16">
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.4)]">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-green-700">Patient Added Successfully!</h2>
            <p className="mb-4 text-gray-700">The patient has been added. They will receive an email with instructions to connect to the dashboard.</p>
            <button
              className="mt-2 px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 font-semibold"
              onClick={() => setShowSuccess(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent tracking-tight mb-1">
              My Children
            </h1>
            <p className="text-muted-foreground text-base font-medium">
              Monitor your children&apos;s therapy progress and communicate with their therapists
            </p>
          </div>
          <Button
            className="bg-primary text-primary-foreground font-semibold px-6 py-2 rounded-xl shadow-sm hover:opacity-90 transition"
            onClick={() => setShowAddChild(true)}
          >
            + Add Child
          </Button>
          <Dialog open={showAddChild} onOpenChange={setShowAddChild}>
            <DialogTrigger asChild></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Child</DialogTitle>
                <DialogDescription>
                  Create a new patient profile for your child
                </DialogDescription>
              </DialogHeader>
              <AddChildForm onSuccess={() => {
                setShowAddChild(false);
                fetchChildren();
                setTimeout(() => setShowSuccess(true), 300); // Show popup after dialog closes
              }} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {children.map((child) => (
            <Card key={child.id} className="shadow-lg border border-border rounded-2xl bg-card hover:shadow-xl transition-shadow">
              <CardContent className="p-7 flex flex-col min-h-[520px]">
                <div className="flex items-center space-x-5 mb-7">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-md border-2 border-primary bg-secondary overflow-hidden"
                  >
                    {child.image ? (
                      <Image
                        src={child.image}
                        alt={`${child.firstName} ${child.lastName}`}
                        width={56}
                        height={56}
                        className="object-cover w-14 h-14 rounded-full"
                      />
                    ) : (
                      <span className="font-bold text-xl text-primary">
                        {child.firstName[0]}{child.lastName[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-foreground truncate">
                      {child.firstName} {child.lastName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Relationship: <span className="font-medium text-foreground">{child.relationship}</span> • Age: <span className="font-medium text-foreground">{calculateAge(child.dateOfBirth)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Therapist: <span className="font-medium text-foreground">{child.therapist ? child.therapist.name : 'Not assigned'}</span>
                    </p>
                  </div>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-lg text-xs font-semibold shadow-sm"
                  >
                    Active
                  </Badge>
                </div>

                {/* Content wrapper that takes remaining space */}
                <div className="flex flex-col justify-between flex-1">
                  {/* Content section */}
                  <div>
                    {/* Centered Progress Display */}
                    <div className="flex flex-col items-center justify-center mb-7">
                      <div className="relative w-28 h-28 mb-2">
                        <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
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
                              transition: 'stroke-dasharray 0.5s cubic-bezier(.4,2,.6,1)',
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <TrendingUp className="w-7 h-7 text-primary" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-extrabold text-foreground mb-1">
                          {animatedProgress[child.id] || 0}%
                        </p>
                        <p className="text-sm text-muted-foreground font-medium">Overall Progress</p>
                      </div>
                    </div>

                    <div className="mb-4 bg-muted rounded-xl p-4 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">
                        Patient ID: <span className="font-mono text-xs bg-background px-2 py-1 rounded border border-border">{child.id}</span>
                      </p>
                      {child.therapist && (
                        <p className="text-xs text-muted-foreground mb-1">
                          Upcoming Sessions: <span className="font-semibold text-foreground">{child.upcomingSessions}</span>
                        </p>
                      )}
                      {child.therapist && child.lastSession && (
                        <p className="text-xs text-muted-foreground">
                          Last Session: <span className="text-foreground">{new Date(child.lastSession).toLocaleDateString()}</span>
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">
                        {child.isPrimary ? <span className="font-semibold text-primary">You are the primary guardian for this child.</span> : 'You are connected as a guardian.'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons - Always at bottom */}
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground font-medium rounded-lg hover:bg-muted"
                      onClick={() => {
                        window.location.href = `/parent/appointments?highlightChild=${child.id}&childName=${encodeURIComponent(child.firstName + ' ' + child.lastName)}`;
                      }}
                      disabled={!child.therapist}
                    >
                      <span className="mr-2">📅</span>
                      Appointments
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground font-medium rounded-lg hover:bg-muted"
                      onClick={() => {
                        window.location.href = `/parent/children/tasks?childId=${child.id}&childName=${encodeURIComponent(child.firstName + ' ' + child.lastName)}`;
                      }}
                    >
                      <span className="mr-2">📋</span>
                      Tasks
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground font-medium rounded-lg hover:bg-muted"
                      disabled={!child.therapist}
                    >
                      <span className="mr-2">💊</span>
                      Medications
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90"
                      disabled={!child.therapist}
                    >
                      <span className="mr-2">📞</span>
                      Contact Therapist
                    </Button>
>>>>>>> origin/Development
                  </div>
                  {/* No therapist assigned notice moved here */}
                  {!child.therapist && (
                    <div className="mt-5 mb-3 bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between gap-2">
                      <span className="text-xs text-purple-800 font-medium">
                        No therapist assigned. Connect with a therapist to enable appointments and communication.
                      </span>
                      <Button
                        size="sm"
                        className="bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-semibold hover:bg-purple-200"
                        onClick={() => window.location.href = '/parent/findTherapist'}
                      >
                        Find a Therapist
                      </Button>
                    </div>
                  )}
                  {/* Upcoming Session Section */}
                  {child.therapist && child.upcomingSessions > 0 && (
                    <div className="mb-2 mt-7 bg-background border border-border rounded-2xl p-5 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground">Next Session</h3>
                        {child.nextSessionStatus && (
                          <span
                            className={`text-xs px-2 py-1 rounded font-semibold ${child.nextSessionStatus.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                          >
                            {child.nextSessionStatus.toLowerCase()}
                          </span>
                        )}
                      </div>
                      <div className={`flex items-center justify-between rounded-lg px-3 py-2 mb-4 ${child.nextSessionStatus && child.nextSessionStatus.toLowerCase() === 'cancelled' ? 'bg-red-50' : 'bg-green-50'}`}> 
                        <div>
                          <div className="font-semibold text-foreground">Therapist : {child.therapist?.name}</div>
                          <div className="text-xs text-muted-foreground">{child.nextSessionType}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-foreground font-medium">{child.lastSession ? new Date(child.lastSession).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border text-foreground font-medium rounded-lg hover:bg-muted flex items-center justify-center gap-2"
                          onClick={() => window.location.href = `/parent/sessions/${child.nextSessionId}`}
                        >
                          <span>📅</span> View Details
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
                          onClick={() => window.open('https://zoom.us', '_blank')}
                        >
                          <span>🔗</span> Join
                        </Button>
                      </div>
                    </div>
                  )}
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
        {/* {children.length > 0 && children.some(child => child.therapist) && (
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
        )} */}

        {/* Connect with Therapist Notice - Show if no therapists assigned
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
        )} */}
      </div>
    </div>
  );
}