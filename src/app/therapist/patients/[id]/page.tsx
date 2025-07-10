"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function PatientDetailsPage() {
  const router = useRouter();

  const patient = {
    id: "PT-2024-001",
    firstName: "Vihanga",
    lastName: "Dharmasena",
    initials: "VD",
    dateOfBirth: "2001-03-15",
    age: 24,
    gender: "Male",
    phone: "+94 77 123 4567",
    email: "vihanga.d@email.com",
    emergencyContact: {
      name: "Kumari Dharmasena",
      phone: "+94 71 987 6543",
      relation: "Mother"
    },
    address: "123 Galle Road, Colombo, Western Province 00300",
    registeredDate: "2024-01-15",
    treatmentStarted: "2025-01-04",
    status: "Active",
    lastSession: "2025-06-18",
    nextSession: "2025-06-25"
  };

  // Session history data - set to empty array or null to show "no history" message
  const sessionHistory = [
    {
      id: 24,
      date: "June 18, 2025",
      duration: "60 minutes",
      focusArea: "Managing work distractions",
      attendance: "Attended",
      progress: "Excellent",
      notes: "Patient showed significant improvement in focus and attention. Discussed coping strategies for managing distractions at work.",
      mentalStatus: "Alert, cooperative, mood stable, no signs of distress.",
      interventions: "Cognitive restructuring, behavioral rehearsal, mindfulness techniques.",
      homework: "Daily mindfulness practice, 10 minutes",
      observations: "Patient appears more confident, using learned strategies independently. Marked improvement in attention; minor difficulties with task initiation remain.",
      nextPlan: "Review mindfulness practice, introduce time management tools."
    },
    {
      id: 23,
      date: "June 11, 2025",
      duration: "60 minutes",
      focusArea: "Organizational strategies",
      attendance: "Attended",
      progress: "Good",
      notes: "Focused on developing organizational systems. Patient engaged well with task-breaking exercises and showed enthusiasm for implementing new strategies.",
      interventions: "Task organization techniques, priority matrix, time-blocking strategies.",
      homework: "Set up daily planner system; practice breaking large tasks into smaller steps",
      nextPlan: "Review organizational system implementation, address any challenges."
    }
  ];

  // Medications data
  const medications = [
    {
      id: 1,
      name: "Adderall XR 20mg",
      morningTime: "8:00 AM",
      eveningTime: "2:00 PM",
      frequency: "Twice Daily",
      duration: "30 days",
      notes: "Start with morning dose to assess tolerance. Monitor for appetite changes and sleep patterns. Patient should take with food to reduce stomach upset."
    },
    {
      id: 2,
      name: "Strattera 40mg",
      morningTime: "9:00 AM",
      eveningTime: "Not Set",
      frequency: "Once Daily",
      duration: "60 days",
      notes: "Non-stimulant alternative. Monitor for mood changes and effectiveness over 4-6 weeks. Can be taken with or without food."
    }
  ];

  // Medical History data
  const medicalHistory = {
    adherenceRate: "89%",
    missedDoses: 12,
    totalDoses: 247,
    currentStreak: 7,
    weeklyPattern: [
      { day: "Mon", status: "taken" },
      { day: "Tue", status: "taken" },
      { day: "Wed", status: "taken" },
      { day: "Thu", status: "taken" },
      { day: "Fri", status: "missed" },
      { day: "Sat", status: "taken" },
      { day: "Sun", status: "taken" }
    ],
    detailedHistory: [
      {
        id: 1,
        date: "June 25, 2025",
        medication: "Adderall XR 20mg",
        time: "8:00 AM & 2:30 PM",
        status: "EXCELLENT",
        notes: "Feeling focused and alert. No side effects noticed. Taking with breakfast as recommended."
      },
      {
        id: 2,
        date: "June 23, 2025",
        medication: "Adderall XR 20mg",
        time: "8:15 AM & Evening: Missed",
        status: "PARTIAL",
        notes: "Forgot evening dose due to busy work meeting. Recommend to set alarms, reminders."
      },
      {
        id: 3,
        date: "June 21, 2025",
        medication: "Adderall XR 20mg",
        time: "7:45 AM & 2:30 PM",
        status: "EXCELLENT",
        notes: "Completely forgot about morning. Need to set multiple reminders."
      },
      {
        id: 4,
        date: "June 20, 2025",
        medication: "Adderall XR 20mg",
        time: "Morning: Missed",
        status: "MISSED",
        notes: "Woke up late and rushed to work. Completely forgot about medication. Need to set automatic reminders."
      },
      {
        id: 5,
        date: "June 18, 2025",
        medication: "Strattera 40mg",
        time: "9:02 AM",
        status: "EXCELLENT",
        notes: "Once daily medication. Patient compliance is Adhered ok. Monitoring for effectiveness and side effects during medication switch."
      }
    ]
  };

  const [tab, setTab] = useState("info");

  return (
    <div className="min-h-screen bg-[#f7f5fb] p-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        ← Back to Patients
      </Button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="bg-[#a174c6] text-white text-xl font-semibold w-16 h-16 rounded-full flex items-center justify-center">
            {patient.initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#8159A8]">
              {patient.firstName} {patient.lastName}
            </h2>
            <div className="text-sm text-gray-600 flex flex-col md:flex-row md:gap-4">
              <span>Age: {patient.age}</span>
              <span>ID: {patient.id}</span>
              <span>Last Session: {patient.lastSession}</span>
              <span>Treatment Started: {patient.treatmentStarted}</span>
            </div>
          </div>
        </div>
        <div className="bg-green-100 text-green-700 font-medium px-4 py-1 rounded-full text-sm">
          {patient.status}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" value={tab} onValueChange={setTab} className="bg-white p-4 rounded-xl shadow-md">
        <TabsList className="flex border-b gap-4 px-2 pb-2">
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="sessions">Session History</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="tasks">Assigned Tasks</TabsTrigger>
          <TabsTrigger value="docs">Uploaded Documents</TabsTrigger>
        </TabsList>

        {/* Tab Panels */}
        <TabsContent value="info" className="pt-6">
          {/* Personal Info */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-[#8159A8] mb-2 border-b border-[#8159A8]">Personal Information</h3>
            <p><strong>Full Name:</strong> {patient.firstName} {patient.lastName}</p>
            <p><strong>Date of Birth:</strong> March 15, 2001 (Age: {patient.age} years)</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
          </section>

          {/* Contact Info */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-[#8159A8] mb-2 border-b border-[#8159A8]">Contact Information</h3>
            <p><strong>Phone:</strong> {patient.phone}</p>
            <p><strong>Email:</strong> {patient.email}</p>
            <p><strong>Emergency Contact:</strong> {patient.emergencyContact.name} ({patient.emergencyContact.relation}) – {patient.emergencyContact.phone}</p>
            <p><strong>Address:</strong> {patient.address}</p>
          </section>

          {/* Treatment Info */}
          <section>
            <h3 className="text-lg font-semibold text-[#8159A8] mb-2 border-b border-[#8159A8]">Treatment Information</h3>
            <p><strong>Registration Date:</strong> {patient.registeredDate}</p>
            <p><strong>Treatment Status:</strong> {patient.status}</p>
            <p><strong>Next Session:</strong> {patient.nextSession}</p>
          </section>
        </TabsContent>

        <TabsContent value="sessions" className="pt-6">
          {sessionHistory && sessionHistory.length > 0 ? (
            <div className="space-y-6">
              {/* Session History Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-[#8159A8]">Session History</h3>
                <div className="flex gap-6 text-sm text-gray-600">
                  <span><strong>Total Sessions:</strong> {sessionHistory.length}</span>
                  <span><strong>Attendance Rate:</strong> 95%</span>
                  <span><strong>Last Session:</strong> Jun 18, 2025</span>
                </div>
              </div>

              {/* Render each session */}
              {sessionHistory.map((session) => (
                <div key={session.id} className="bg-gray-50 rounded-lg p-6 border">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-[#8159A8]">Session #{session.id}</h4>
                    <span className="text-sm text-gray-500">{session.date}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">DURATION</p>
                      <p className="font-medium">{session.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">FOCUS AREA</p>
                      <p className="font-medium">{session.focusArea}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">ATTENDANCE</p>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                        ✓ {session.attendance}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">PROGRESS</p>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        session.progress === 'Excellent' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {session.progress}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Session Notes</h5>
                      <p className="text-gray-600 text-sm">{session.notes}</p>
                    </div>

                    {session.mentalStatus && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">🧠 Mental Status</h5>
                        <p className="text-gray-600 text-sm">{session.mentalStatus}</p>
                      </div>
                    )}

                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">🔧 Interventions Used</h5>
                      <p className="text-gray-600 text-sm">{session.interventions}</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">📚 Homework Assigned</h5>
                      <p className="text-gray-600 text-sm">{session.homework}</p>
                    </div>

                    {session.observations && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">� Key Observations</h5>
                        <p className="text-gray-600 text-sm">{session.observations}</p>
                      </div>
                    )}

                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">📅 Next Session Plan</h5>
                      <p className="text-gray-600 text-sm">{session.nextPlan}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm">📝 Edit Notes</Button>
                    <Button variant="outline" size="sm">📊 View Full Report</Button>
                    <Button variant="outline" size="sm">📄 Export PDF</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No session history available yet.</p>
          )}
        </TabsContent>

        <TabsContent value="medications" className="pt-6">
          {medications && medications.length > 0 ? (
            <div className="space-y-6">
              {/* Header with Add Medication button */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-[#8159A8]">Current Medications</h3>
                <Button className="bg-[#8159A8] hover:bg-[#6d4a8f] text-white">
                  + Add Medication
                </Button>
              </div>

              {/* Medications List */}
              {medications.map((medication) => (
                <div key={medication.id} className="bg-white border-l-4 border-[#8159A8] rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-[#8159A8]">{medication.name}</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-blue-600 border-blue-600">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-600">
                        Unallocate
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">Morning Time</p>
                      <p className="font-medium">{medication.morningTime}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">Evening Time</p>
                      <p className="font-medium">{medication.eveningTime}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">Frequency</p>
                      <p className="font-medium">{medication.frequency}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-medium">Duration</p>
                      <p className="font-medium">{medication.duration}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2">Therapist Notes</h5>
                    <p className="text-gray-600 text-sm">{medication.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No medications recorded.</p>
          )}
        </TabsContent>

        <TabsContent value="history" className="pt-6">
          {medicalHistory ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-[#8159A8]">Medical History</h3>
                <div className="flex gap-2">
                  <select className="border rounded px-3 py-1 text-sm">
                    <option>Last 3 Months</option>
                    <option>Last 6 Months</option>
                    <option>Last Year</option>
                  </select>
                  <select className="border rounded px-3 py-1 text-sm">
                    <option>All Medications</option>
                    <option>Adderall XR</option>
                    <option>Strattera</option>
                  </select>
                  <Button variant="outline" size="sm">Export Report</Button>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold text-green-600">{medicalHistory.adherenceRate}</div>
                  <div className="text-sm text-gray-600">Overall Adherence Rate</div>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold text-red-600">{medicalHistory.missedDoses}</div>
                  <div className="text-sm text-gray-600">Missed Doses (30 days)</div>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold text-[#8159A8]">{medicalHistory.totalDoses}</div>
                  <div className="text-sm text-gray-600">Total Doses Taken</div>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold text-orange-600">{medicalHistory.currentStreak}</div>
                  <div className="text-sm text-gray-600">Current Streak (days)</div>
                </div>
              </div>

              {/* Weekly Adherence Pattern */}
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="font-semibold mb-4">Weekly Adherence Pattern</h4>
                <div className="flex gap-2 mb-2">
                  <span className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    Morning Dose
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    Evening Dose
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    Missed
                  </span>
                </div>
                <div className="flex gap-1">
                  {medicalHistory.weeklyPattern.map((day, index) => (
                    <div key={index} className="flex-1">
                      <div className="text-xs text-center mb-1">{day.day}</div>
                      <div className={`h-8 rounded ${
                        day.status === 'taken' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Medication History */}
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="font-semibold mb-4">Detailed Medication History</h4>
                <p className="text-sm text-gray-600 mb-6">Chronological view of all medication events and adherence patterns</p>
                
                <div className="space-y-4">
                  {medicalHistory.detailedHistory.map((entry) => (
                    <div key={entry.id} className="flex gap-4 p-4 border-l-4 rounded-lg bg-gray-50" 
                         style={{borderLeftColor: 
                           entry.status === 'EXCELLENT' ? '#10b981' : 
                           entry.status === 'PARTIAL' ? '#f59e0b' : '#ef4444'
                         }}>
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        entry.status === 'EXCELLENT' ? 'bg-green-500' : 
                        entry.status === 'PARTIAL' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{entry.medication}</p>
                            <p className="text-sm text-gray-600">{entry.time}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{entry.date}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              entry.status === 'EXCELLENT' ? 'bg-green-100 text-green-700' : 
                              entry.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {entry.status}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-sm text-gray-700"><strong>Patient Notes:</strong></p>
                          <p className="text-sm text-gray-600">{entry.notes}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button variant="outline">Load More History</Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No medical history provided.</p>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="pt-6">
          <p className="text-muted-foreground">No assigned tasks found.</p>
        </TabsContent>

        <TabsContent value="docs" className="pt-6">
          <p className="text-muted-foreground">No documents uploaded.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
