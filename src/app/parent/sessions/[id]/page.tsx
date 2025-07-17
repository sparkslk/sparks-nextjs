"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
import {
  User,
  FileText,
  Clock,
  Calendar,
  ClipboardList,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";

interface Session {
  status?: string;
  sessionStatus?: string;
  patient?: string;
  childName?: string;
  type?: string;
  sessionType?: string;
  duration?: number;
  date?: string;
  time?: string;
  attendance?: string;
  progress?: string;
  engagement?: string;
  risk?: string;
  focusAreas?: string[];
  observations?: string;
  notes?: string;
  nextSessionGoals?: string;
}

export default function SessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/parent/sessions/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch session details");
        return res.json();
      })
      .then((data) => {
        setSession(data.session || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unknown error");
        setLoading(false);
      });
  }, [id]);

  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "scheduled":
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "declined":
        return "bg-gray-100 text-gray-800";
      case "no_show":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };


  // const getPriorityColor = (priority: number) => {
  //   switch (priority) {
  //     case 5:
  //       return "bg-red-100 text-red-800";
  //     case 4:
  //       return "bg-orange-100 text-orange-800";
  //     case 3:
  //       return "bg-yellow-100 text-yellow-800";
  //     case 2:
  //       return "bg-blue-100 text-blue-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen">Loading session details...</div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen">
        <p>{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <p>Session not found.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="hover:bg-primary/10 border-primary/20 text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Session Details
            </h1>
            <div className="flex-1 flex justify-end">
              <Badge className={`${getStatusColor(session.status || "")} px-6 py-2 rounded-xl font-semibold text-base shadow-none`}>
                {session.status || session.sessionStatus || "COMPLETED"}
              </Badge>
            </div>
          </div>

          {/* Session Details - Full Width */}
          <div className="w-full bg-[#f7f5fb] rounded-xl border border-[#e5e3ee] shadow-sm p-4 flex flex-wrap items-center gap-5 mb-6">
            <div className="flex items-center gap-4 min-w-[160px]">
              <User className="text-[#A78BFA] w-5 h-5" />
              <div>
                <div className="text-xs text-gray-500 font-semibold">PATIENT</div>
                <div className="text-base font-bold text-[#222]">{session.patient || session.childName || "-"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-[160px]">
              <FileText className="text-[#A78BFA] w-5 h-5" />
              <div>
                <div className="text-xs text-gray-500 font-semibold">TYPE</div>
                <div className="text-base font-bold text-[#222]">{session.type || session.sessionType || "-"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-[120px]">
              <Clock className="text-[#A78BFA] w-5 h-5" />
              <div>
                <div className="text-xs text-gray-500 font-semibold">DURATION</div>
                <div className="text-base font-bold text-[#222]">{session.duration || 60} min</div>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-[150px]">
              <Calendar className="text-[#A78BFA] w-5 h-5" />
              <div>
                <div className="text-xs text-gray-500 font-semibold">DATE</div>
                <div className="text-base font-bold text-[#222]">{session.date ? format(new Date(session.date), "MMM dd, yyyy") : "-"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-[120px]">
              <Clock className="text-[#A78BFA] w-5 h-5" />
              <div>
                <div className="text-xs text-gray-500 font-semibold">TIME</div>
                <div className="text-base font-bold text-[#222]">{session.time || "-"}</div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="clinical" className="w-full mb-6">
          <div className="w-full rounded-xl" style={{ boxShadow: '0 2px 8px 0 rgba(129,89,168,0.08)' }}>
            <TabsList className="w-full flex bg-[#f7f5fb] rounded-xl border border-[#e5e3ee] p-2" style={{ boxShadow: 'none' }}>
              <TabsTrigger value="clinical" className="flex-1 h-12 rounded-xl font-semibold text-[#8159A8] text-base bg-white shadow-[0_2px_8px_0_rgba(129,89,168,0.08)] data-[state=active]:text-[#8159A8] data-[state=active]:bg-white data-[state=active]:shadow-[0_2px_8px_0_rgba(129,89,168,0.08)] data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#8159A8] transition-all flex items-center justify-center">
                Clinical Documentation
              </TabsTrigger>
              <TabsTrigger value="medications" className="flex-1 h-12 rounded-xl font-semibold text-[#8159A8] text-base bg-transparent data-[state=active]:bg-white data-[state=active]:shadow-[0_2px_8px_0_rgba(129,89,168,0.08)] data-[state=active]:text-[#8159A8] data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#8159A8] transition-all flex items-center justify-center">
                Medications
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex-1 h-12 rounded-xl font-semibold text-[#8159A8] text-base bg-transparent data-[state=active]:bg-white data-[state=active]:shadow-[0_2px_8px_0_rgba(129,89,168,0.08)] data-[state=active]:text-[#8159A8] data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#8159A8] transition-all flex items-center justify-center">
                Tasks
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="clinical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white rounded-xl shadow p-6">
                <CardHeader className="flex items-center gap-2 mb-2 border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="text-green-400" />
                    <span className="font-semibold text-lg">Clinical Assessment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-2">
                    <div>
                      <span className="font-semibold text-gray-600">Attendance Status</span><br />
                      <Badge className="bg-green-100 text-green-700">{session.attendance || "PRESENT"}</Badge>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">Overall Progress</span><br />
                      <Badge className="bg-orange-100 text-orange-700">{session.progress || "POOR"}</Badge>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">Patient Engagement</span><br />
                      <Badge className="bg-blue-100 text-blue-700">{session.engagement || "MEDIUM"}</Badge>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">Risk Assessment</span><br />
                      <Badge className="bg-green-100 text-green-700">{session.risk || "NONE"}</Badge>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="font-semibold text-gray-600">Primary Focus Areas</span><br />
                    <span className="italic text-gray-400">{session.focusAreas && session.focusAreas.length > 0 ? session.focusAreas.join(", ") : "No focus areas documented"}</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white rounded-xl shadow p-6">
                <CardHeader className="flex items-center gap-2 mb-2 border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="text-blue-400" />
                    <span className="font-semibold text-lg">Session Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-600">Clinical Observations</span>
                    <div className="bg-gray-100 rounded p-2 mt-1 text-sm">{session.observations || session.notes || "No clinical observations recorded"}</div>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-600">Next Session Goals</span>
                    <div className="text-sm italic text-gray-400">{session.nextSessionGoals || "No goals set for next session"}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="medications">
            <div className="bg-white rounded-xl shadow p-6 text-gray-400 italic">No medications documented.</div>
          </TabsContent>
          <TabsContent value="tasks">
            <div className="bg-white rounded-xl shadow p-6 text-gray-400 italic">No tasks documented.</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
