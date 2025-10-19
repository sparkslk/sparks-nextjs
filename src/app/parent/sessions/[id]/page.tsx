"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Tabs removed - assessments not needed on this page
import { Badge } from "@/components/ui/badge";
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
  sessionNotes?: string;
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
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

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

  console.log('Session details:', session);
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
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center px-3 py-2 text-[#8159A8] hover:text-[#8159A8]/80 hover:bg-[#8159A8]/10"
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

        <div className="w-full mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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
                  <div className="bg-gray-100 rounded p-2 mt-1 text-sm">{session.observations || session.sessionNotes || "No clinical observations recorded"}</div>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-600">Next Session Goals</span>
                  <div className="text-sm italic text-gray-400">{session.nextSessionGoals || "No goals set for next session"}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";

// type MedicationHistory = {
//   id?: string;
//   medicationId?: string;
//   action: string;
//   changedAt: string;
//   medicationName?: string;
//   medicationDetails?: {
//     id?: string;
//     name?: string;
//     dosage?: string;
//     frequency?: string;
//     customFrequency?: string;
//     instructions?: string;
//     mealTiming?: string;
//     isActive?: boolean;
//     isDiscontinued?: boolean;
//     startDate?: string;
//     endDate?: string;
//   };
//   notes?: string;
//   description?: string;
//   previousValues?: Record<string, unknown>;
//   newValues?: Record<string, unknown>;
//   changedByUser?: { name?: string | null; email?: string | null } | null;
// };

// function MedicationSessionHistory({ session }: { session: Session & { childId?: string } }) {
//   const [medHistory, setMedHistory] = useState<MedicationHistory[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!session?.date) return;
//     const childId = session.childId;
//     if (!childId) {
//       setError('No childId found for this session.');
//       setLoading(false);
//       return;
//     }
//     fetch(`/api/parent/children/${childId}/medication-history`)
//       .then(async (res) => {
//         if (!res.ok) throw new Error("Failed to fetch medication history");
//         return res.json();
//       })
//       .then((data) => {
//         setMedHistory(data.history || []);
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError(err.message || "Unknown error");
//         setLoading(false);
//       });
//   }, [session?.date, session?.childId]);

//   if (loading) return <div className="bg-white rounded-xl shadow p-6 text-gray-400 italic text-center">Loading medication history...</div>;
//   if (error) return <div className="bg-white rounded-xl shadow p-6 text-red-400 italic text-center">{error}</div>;
//   if (!medHistory.length) return <div className="bg-white rounded-xl shadow p-6 text-gray-400 italic text-center">No medication changes documented for this session.</div>;

//   // Filter medication history by session date (same day) using changedAt
//   let sessionDate = '';
//   if (session.date) {
//     sessionDate = new Date(session.date).toISOString().slice(0, 10);
//   }
//   const sessionMeds = medHistory.filter((h) => h.changedAt && h.changedAt.slice(0, 10) === sessionDate);

//   if (!sessionMeds.length) return <div className="bg-white rounded-xl shadow p-6 text-gray-400 italic text-center">No medication changes documented for this session.</div>;

//   // Helper to pretty print before/after changes
//   function renderChange(before: Record<string, unknown> | undefined, after: Record<string, unknown> | undefined) {
//     if (!before && !after) return null;
//     const keys = Array.from(new Set([...(before ? Object.keys(before) : []), ...(after ? Object.keys(after) : [])]));
//     const renderValue = (val: unknown) => {
//       if (val === null || val === undefined) return <span className="italic text-gray-300">-</span>;
//       if (typeof val === 'object') return <span className="italic text-gray-400">[object]</span>;
//       return String(val);
//     };
//     return (
//       <table className="w-full text-xs mt-2 border rounded-xl overflow-hidden bg-gray-50">
//         <thead>
//           <tr className="bg-muted">
//             <th className="p-2 text-left font-semibold text-gray-700"></th>
//             <th className="p-2 text-left font-semibold text-gray-700">Before</th>
//             <th className="p-2 text-left font-semibold text-gray-700">After</th>
//           </tr>
//         </thead>
//         <tbody>
//           {keys.map((key) => (
//             <tr key={key} className="border-t border-border">
//               <td className="p-2 font-medium text-gray-700">{key}</td>
//               <td className="p-2 text-gray-500">{renderValue(before?.[key])}</td>
//               <td className="p-2 text-gray-900">{renderValue(after?.[key])}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     );
//   }

//   // Helper for action badge
//   function actionBadge(action: string) {
//     let color = "bg-gray-100 text-gray-700 border border-gray-200";
//     let icon = null;
//     if (action === 'CREATED') {
//       color = "bg-green-100 text-green-700 border border-green-200";
//       icon = <CheckCircle className="w-4 h-4 mr-1 text-green-500" />;
//     } else if (action === 'UPDATED' || action.endsWith('_CHANGED')) {
//       color = "bg-blue-100 text-blue-700 border border-blue-200";
//       icon = <FileText className="w-4 h-4 mr-1 text-blue-500" />;
//     } else if (action === 'DISCONTINUED') {
//       color = "bg-red-100 text-red-700 border border-red-200";
//       icon = <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />;
//     } else if (action === 'REACTIVATED') {
//       color = "bg-yellow-100 text-yellow-700 border border-yellow-200";
//       icon = <Clock className="w-4 h-4 mr-1 text-yellow-500" />;
//     }
//     return (
//       <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${color}`}>
//         {icon}
//         {action.replace(/_/g, ' ')}
//       </span>
//     );
//   }

//   return (
//     <div className="bg-white rounded-xl shadow p-6">
//       <div className="flex items-center justify-between border-b border-border pb-2 mb-6">
//         <h3 className="text-xl font-bold text-[#8159A8] flex items-center gap-2">
//           <FileText className="w-6 h-6 text-[#8159A8]" /> Medication Changes in this Session
//         </h3>
//       </div>
//       <ul className="space-y-5 mt-2">
//         {sessionMeds.map((h, idx) => (
//           <li
//             key={h.id || idx}
//             className="bg-[#f7f5fb] border border-[#e5e3ee] rounded-xl shadow-sm p-5 flex flex-col gap-2"
//           >
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
//               <div className="flex items-center gap-2 flex-1 flex-wrap">
//                 {actionBadge(h.action)}
//                 <span className="text-base font-semibold text-gray-800">
//                   {h.medicationName || h.medicationDetails?.name || ''}
//                 </span>
//                 <span className="text-xs text-gray-400">
//                   {new Date(h.changedAt).toLocaleString()}
//                 </span>
//                 {h.changedByUser && (
//                   <span className="ml-2 text-xs text-gray-500 font-medium">
//                     by {h.changedByUser.name || h.changedByUser.email}
//                   </span>
//                 )}
//               </div>
//             </div>
//             <div className="text-sm text-gray-700 space-y-2">
//               {h.notes && (
//                 <div className="mb-1">
//                   <span className="font-medium text-gray-600">Notes:</span> {h.notes}
//                 </div>
//               )}
//               {h.description && (
//                 <div className="mb-1">
//                   <span className="font-medium text-gray-600">Description:</span> {h.description}
//                 </div>
//               )}
//               {/* Show before/after table for updates */}
//               {(h.action === 'UPDATED' || h.action.endsWith('_CHANGED') || h.action === 'DISCONTINUED' || h.action === 'REACTIVATED') && (
//                 <div className="mt-2">
//                   <span className="block text-xs font-semibold text-gray-500 mb-1">Change Details</span>
//                   {renderChange(h.previousValues, h.newValues)}
//                 </div>
//               )}
//               {/* For CREATED, show medication details */}
//               {h.action === 'CREATED' && h.medicationDetails && (
//                 <div className="mt-2">
//                   <span className="block text-xs font-semibold text-gray-500 mb-1">Medication Details</span>
//                   <table className="w-full text-xs border rounded-xl overflow-hidden bg-gray-50">
//                     <tbody>
//                       <tr><td className="p-2 font-medium text-gray-700">Dosage</td><td className="p-2">{h.medicationDetails.dosage}</td></tr>
//                       <tr><td className="p-2 font-medium text-gray-700">Frequency</td><td className="p-2">{h.medicationDetails.frequency}{h.medicationDetails.customFrequency ? ` (${h.medicationDetails.customFrequency})` : ''}</td></tr>
//                       <tr><td className="p-2 font-medium text-gray-700">Instructions</td><td className="p-2">{h.medicationDetails.instructions || <span className="italic text-gray-300">-</span>}</td></tr>
//                       <tr><td className="p-2 font-medium text-gray-700">Meal Timing</td><td className="p-2">{h.medicationDetails.mealTiming}</td></tr>
//                       <tr><td className="p-2 font-medium text-gray-700">Start Date</td><td className="p-2">{h.medicationDetails.startDate ? new Date(h.medicationDetails.startDate).toLocaleDateString() : '-'}</td></tr>
//                       <tr><td className="p-2 font-medium text-gray-700">End Date</td><td className="p-2">{h.medicationDetails.endDate ? new Date(h.medicationDetails.endDate).toLocaleDateString() : '-'}</td></tr>
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
