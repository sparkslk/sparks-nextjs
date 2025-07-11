"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { MessageCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, FileText, Clock, Calendar, ClipboardList } from "lucide-react";

export default function SessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    console.log("Fetching session details for ID:", id);
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading session details...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex flex-col items-center justify-center text-red-500"><p>{error}</p><Button onClick={() => router.back()}>Go Back</Button></div>;
  }
  if (!session) {
    return <div className="min-h-screen flex flex-col items-center justify-center text-gray-500"><p>Session not found.</p><Button onClick={() => router.back()}>Go Back</Button></div>;
  }

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-[#8159A8] mb-2">Session Details</h1>
        <div className="w-full bg-[#f7f5fb] rounded-xl border border-[#e5e3ee] shadow-sm p-4 flex items-center gap-5 mb-6">
          <div className="flex items-center gap-4 min-w-[160px]">
            <User className="text-[#A78BFA] w-5 h-5" />
            <div>
              <div className="text-xs text-gray-500 font-semibold">PATIENT</div>
              <div className="text-base font-bold text-[#222]">{session.patient || "Oneli Perera"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-[160px]">
            <FileText className="text-[#A78BFA] w-5 h-5" />
            <div>
              <div className="text-xs text-gray-500 font-semibold">TYPE</div>
              <div className="text-base font-bold text-[#222]">{session.type || session.sessionType || "Group Therapy"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-[120px]">
            <Clock className="text-[#A78BFA] w-5 h-5" />
            <div>
              <div className="text-xs text-gray-500 font-semibold">DURATION</div>
              <div className="text-base font-bold text-[#222]">{session.duration || "60"} min</div>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-[150px]">
            <Calendar className="text-[#A78BFA] w-5 h-5" />
            <div>
              <div className="text-xs text-gray-500 font-semibold">DATE</div>
              <div className="text-base font-bold text-[#222]">{session.date || "Jul 07, 2025"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-[120px]">
            <Clock className="text-[#A78BFA] w-5 h-5" />
            <div>
              <div className="text-xs text-gray-500 font-semibold">TIME</div>
              <div className="text-base font-bold text-[#222]">{session.time || "9:30 PM"}</div>
            </div>
          </div>
          <div className="flex-1 flex justify-end">
            <Badge className="bg-green-100 text-green-700 px-6 py-2 rounded-xl font-semibold text-base shadow-none">{session.status || session.sessionStatus || "COMPLETED"}</Badge>
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
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-green-400" />
                  <span className="font-semibold text-lg">Clinical Assessment</span>
                </div>
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
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="text-blue-400" />
                  <span className="font-semibold text-lg">Session Notes</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-600">Clinical Observations</span>
                  <div className="bg-gray-100 rounded p-2 mt-1 text-sm">{session.observations || "dasfsgfsa"}</div>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-600">Next Session Goals</span>
                  <div className="text-sm italic text-gray-400">No goals set for next session</div>
                </div>
              </div>
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
