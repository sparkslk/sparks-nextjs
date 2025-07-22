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
  const [removingChildId, setRemovingChildId] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

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

  const handleRemoveChild = async (patientId: string) => {
    setRemoveLoading(true);
    setRemoveError(null);
    try {
      const res = await fetch("/api/parent/remove-child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove child");
      }
      setShowRemoveConfirm(false);
      setRemovingChildId(null);
      fetchChildren();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setRemoveError(err.message || "Failed to remove child");
      } else {
        setRemoveError("Failed to remove child");
      }
    } finally {
      setRemoveLoading(false);
    }
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
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 border border-green-200 rounded-lg text-xs font-semibold shadow-sm h-auto min-h-0 flex items-center justify-center"
                      style={{ width: 90, padding: '0.5rem 0', height: 25 }}
                    >
                      Active
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold shadow-sm h-auto min-h-0 flex items-center justify-center"
                      style={{ width: 90, padding: '0.5rem 0', height: 25 }}
                      onClick={() => {
                        setRemovingChildId(child.id);
                        setShowRemoveConfirm(true);
                        setRemoveError(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
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
                  </div>
                  {/* Remove Child button moved above under badge */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Remove Child Confirmation Dialog */}
        {showRemoveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.3)]">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
              <h2 className="text-xl font-bold mb-4 text-red-700">Remove Child?</h2>
              <p className="mb-4 text-gray-700">Are you sure you want to remove this child from your account? This action cannot be undone.</p>
              {removeError && <div className="text-red-600 text-sm mb-2">{removeError}</div>}
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  className="rounded px-6"
                  onClick={() => {
                    setShowRemoveConfirm(false);
                    setRemovingChildId(null);
                  }}
                  disabled={removeLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="rounded px-6 bg-red-600 text-white hover:bg-red-700"
                  onClick={() => removingChildId && handleRemoveChild(removingChildId)}
                  disabled={removeLoading}
                >
                  {removeLoading ? "Removing..." : "Remove"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session Details Modal */}
      {selectedChild && (
        <SessionDetailsModal
          isOpen={sessionModalOpen}
          onClose={() => {
            setSessionModalOpen(false);
            setSelectedChild(null);
          }}
          childName={`${selectedChild.firstName} ${selectedChild.lastName}`}
          childId={selectedChild.id}
        />
      )}
    </div>
  );
}