"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  User,
  FileText,
  Clock,
  Calendar,
  ClipboardList,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Target,
  Filter
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

interface Task {
  id: string;
  sessionId: string;
  patientId: string;
  title: string;
  description: string;
  instructions: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  priority: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  completionNotes: string | null;
  isRecurring: boolean;
  recurringPattern: string | null;
}

export default function SessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'therapist' | 'weekly'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("clinical");

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

  useEffect(() => {
    if (!id) return;
    setTasksLoading(true);
    fetch(`/api/parent/sessions/${id}/tasks`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch session tasks");
        return res.json();
      })
      .then((data) => {
        setTasks(data.tasks || []);
        setTasksLoading(false);
      })
      .catch((err) => {
        setTasksError(err.message || "Unknown error");
        setTasksLoading(false);
      });
  }, [id]);

  const refreshTasks = async () => {
    try {
      const response = await fetch(`/api/parent/sessions/${id}/tasks`);
      if (!response.ok) {
        throw new Error("Failed to fetch session tasks");
      }
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch {
      setTasksError("Failed to load session tasks");
    }
  };

  const markTaskComplete = async (taskId: string, completionNotes?: string) => {
    try {
      const response = await fetch(`/api/parent/sessions/${id}/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completionNotes }),
      });
      if (response.ok) {
        refreshTasks();
      }
    } catch {
      // Handle error
    }
  };

  const unmarkTaskComplete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/parent/sessions/${id}/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unmark: true }),
      });
      if (response.ok) {
        refreshTasks();
      }
    } catch {
      // Handle error
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && tasks.find(t => t.dueDate === dueDate)?.status !== 'COMPLETED';
  };

  const getFilteredTasks = () => {
    let filteredTasks = tasks;
    if (filterType === 'daily') {
      filteredTasks = tasks.filter(task => task.isRecurring && task.recurringPattern === 'daily');
    } else if (filterType === 'therapist') {
      filteredTasks = tasks.filter(task => !task.isRecurring || task.recurringPattern !== 'daily');
    } else if (filterType === 'weekly') {
      filteredTasks = tasks.filter(task => task.isRecurring && task.recurringPattern === 'weekly');
    }
    if (filterStatus === 'pending') {
      filteredTasks = filteredTasks.filter(task => task.status === 'PENDING' || task.status === 'IN_PROGRESS');
    } else if (filterStatus === 'completed') {
      filteredTasks = filteredTasks.filter(task => task.status === 'COMPLETED');
    } else if (filterStatus === 'overdue') {
      filteredTasks = filteredTasks.filter(task => task.status === 'OVERDUE' || isOverdue(task.dueDate));
    }
    if (filterStatus === 'all') {
      const pending = filteredTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').sort((a, b) => b.priority - a.priority);
      const overdue = filteredTasks.filter(t => t.status === 'OVERDUE' || isOverdue(t.dueDate));
      const completed = filteredTasks.filter(t => t.status === 'COMPLETED');
      // Remove duplicates by using a Map keyed by task id
      const uniqueTasksMap = new Map<string, Task>();
      [...pending, ...overdue, ...completed].forEach(task => {
        uniqueTasksMap.set(task.id, task);
      });
      return Array.from(uniqueTasksMap.values());
    } else {
      filteredTasks.sort((a, b) => b.priority - a.priority);
      return filteredTasks;
    }
  };
  const filteredTasks = getFilteredTasks();

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

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full mb-6">
          <div className="w-full rounded-xl" style={{ boxShadow: '0 2px 8px 0 rgba(129,89,168,0.08)' }}>
            <TabsList className="w-full flex bg-[#f7f5fb] rounded-xl border border-[#e5e3ee] p-2" style={{ boxShadow: 'none' }}>
              <TabsTrigger value="clinical" className="flex-1 h-12 rounded-xl font-semibold text-[#8159A8] text-base transition-all flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-[0_2px_8px_0_rgba(129,89,168,0.08)] data-[state=active]:text-[#8159A8] data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#8159A8]">
                Clinical Documentation
              </TabsTrigger>
              <TabsTrigger value="medications" className="flex-1 h-12 rounded-xl font-semibold text-[#8159A8] text-base transition-all flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-[0_2px_8px_0_rgba(129,89,168,0.08)] data-[state=active]:text-[#8159A8] data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#8159A8]">
                Medications
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex-1 h-12 rounded-xl font-semibold text-[#8159A8] text-base transition-all flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-[0_2px_8px_0_rgba(129,89,168,0.08)] data-[state=active]:text-[#8159A8] data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#8159A8]">
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
            <div className="mb-6">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 border-[#8159A8] text-[#8159A8] hover:bg-[#8159A8]/10 shadow-sm"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </Button>
                {(filterType !== 'all' || filterStatus !== 'all') && (
                  <Badge variant="secondary" className="bg-[#8159A8]/10 text-[#8159A8] text-xs">
                    {filteredTasks.length} filtered
                  </Badge>
                )}
              </div>
              {showFilters && (
                <Card className="shadow-lg border-0 mb-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8f6fc 100%)' }}>
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Filter Options</h3>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-0">
                    {/* Task Type Filters */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2 text-[#8159A8]" />
                        Task Type
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <button
                          onClick={() => setFilterType('all')}
                          className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                            filterType === 'all' 
                              ? 'border-[#8159A8] bg-[#8159A8]/5 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-[#8159A8]/30'
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center mb-1 ${
                              filterType === 'all' ? 'bg-[#8159A8] text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              📋
                            </div>
                            <span className={`text-xs font-medium ${
                              filterType === 'all' ? 'text-[#8159A8]' : 'text-gray-700'
                            }`}>
                              All Tasks
                            </span>
                            <span className="text-xs text-gray-500">
                              {tasks.length}
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={() => setFilterType('daily')}
                          className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                            filterType === 'daily' 
                              ? 'border-[#8159A8] bg-[#8159A8]/5 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-[#8159A8]/30'
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center mb-1 ${
                              filterType === 'daily' ? 'bg-[#8159A8] text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Calendar className="w-3 h-3" />
                            </div>
                            <span className={`text-xs font-medium ${
                              filterType === 'daily' ? 'text-[#8159A8]' : 'text-gray-700'
                            }`}>
                              Daily Tasks
                            </span>
                            <span className="text-xs text-gray-500">
                              {tasks.filter(t => t.isRecurring && t.recurringPattern === 'daily').length}
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={() => setFilterType('therapist')}
                          className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                            filterType === 'therapist' 
                              ? 'border-[#8159A8] bg-[#8159A8]/5 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-[#8159A8]/30'
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center mb-1 ${
                              filterType === 'therapist' ? 'bg-[#8159A8] text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <User className="w-3 h-3" />
                            </div>
                            <span className={`text-xs font-medium ${
                              filterType === 'therapist' ? 'text-[#8159A8]' : 'text-gray-700'
                            }`}>
                              Therapist Tasks
                            </span>
                            <span className="text-xs text-gray-500">
                              {tasks.filter(t => !t.isRecurring || t.recurringPattern !== 'daily').length}
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={() => setFilterType('weekly')}
                          className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                            filterType === 'weekly' 
                              ? 'border-[#8159A8] bg-[#8159A8]/5 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-[#8159A8]/30'
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center mb-1 ${
                              filterType === 'weekly' ? 'bg-[#8159A8] text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Target className="w-3 h-3" />
                            </div>
                            <span className={`text-xs font-medium ${
                              filterType === 'weekly' ? 'text-[#8159A8]' : 'text-gray-700'
                            }`}>
                              Weekly Goals
                            </span>
                            <span className="text-xs text-gray-500">
                              {tasks.filter(t => t.isRecurring && t.recurringPattern === 'weekly').length}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                    {/* Status Filters */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-[#8159A8]" />
                        Task Status
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setFilterStatus('all')}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            filterStatus === 'all'
                              ? 'bg-[#8159A8] text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          All Statuses ({tasks.length})
                        </button>
                        <button
                          onClick={() => setFilterStatus('pending')}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center ${
                            filterStatus === 'pending'
                              ? 'bg-yellow-500 text-white shadow-md'
                              : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                          }`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Pending ({tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length})
                        </button>
                        <button
                          onClick={() => setFilterStatus('completed')}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center ${
                            filterStatus === 'completed'
                              ? 'bg-green-500 text-white shadow-md'
                              : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed ({tasks.filter(t => t.status === 'COMPLETED').length})
                        </button>
                        <button
                          onClick={() => setFilterStatus('overdue')}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center ${
                            filterStatus === 'overdue'
                              ? 'bg-red-500 text-white shadow-md'
                              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Overdue ({tasks.filter(t => t.status === 'OVERDUE' || isOverdue(t.dueDate)).length})
                        </button>
                      </div>
                    </div>
                    {(filterType !== 'all' || filterStatus !== 'all') && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Active filters:</span>
                            {filterType !== 'all' && (
                              <Badge variant="secondary" className="bg-[#8159A8]/10 text-[#8159A8]">
                                {filterType === 'daily' ? 'Daily Tasks' :
                                 filterType === 'therapist' ? 'Therapist Tasks' :
                                 'Weekly Goals'}
                              </Badge>
                            )}
                            {filterStatus !== 'all' && (
                              <Badge variant="secondary" className="bg-[#8159A8]/10 text-[#8159A8]">
                                {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFilterType('all');
                              setFilterStatus('all');
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Clear all
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                    <span className="text-2xl font-bold text-green-600">
                      {tasks.filter(t => t.status === 'COMPLETED').length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Completed</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-6 h-6 text-blue-600 mr-2" />
                    <span className="text-2xl font-bold text-blue-600">
                      {tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Pending Tasks</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                    <span className="text-2xl font-bold text-red-600">
                      {tasks.filter(t => t.status === 'OVERDUE' || isOverdue(t.dueDate)).length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Overdue Tasks</p>
                </CardContent>
              </Card>
            </div>
            {/* Filtered Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {filterType === 'all' ? 'All Tasks' :
                     filterType === 'daily' ? 'Daily Tasks' :
                     filterType === 'therapist' ? 'Therapist Assigned Tasks' :
                     'Weekly Goals'}
                  </span>
                  <Badge variant="secondary">{filteredTasks.length} tasks</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="text-center py-4 text-gray-500">Loading tasks...</div>
                ) : tasksError ? (
                  <div className="text-center py-4 text-red-500">{tasksError}</div>
                ) : filteredTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tasks match the current filters</p>
                ) : (
                  <div className="space-y-4">
                    {filteredTasks.map((task) => (
                      <div key={task.id} className={`border rounded-lg p-4 ${
                        task.isRecurring && task.recurringPattern === 'daily' ? 'bg-gray-50' :
                        task.isRecurring && task.recurringPattern === 'weekly' ? 'bg-blue-50' :
                        'border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start space-x-3">
                            <div className="flex items-center mt-1 relative">
                              <input
                                type="radio"
                                checked={task.status === 'COMPLETED'}
                                onChange={() => task.status !== 'COMPLETED' && markTaskComplete(task.id)}
                                disabled={task.status === 'COMPLETED'}
                                className={`w-5 h-5 rounded-full transition-all duration-300 ${
                                  task.status === 'COMPLETED' 
                                    ? 'bg-green-500 border-green-500 cursor-not-allowed' 
                                    : 'border-2 border-gray-300 hover:border-[#8159A8] cursor-pointer'
                                } ${task.status === 'COMPLETED' ? 'accent-green-500' : 'accent-[#8159A8]'}`}
                              />
                              {task.status === 'COMPLETED' && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                                    <path
                                      d="M20 6L9 17L4 12"
                                      stroke="#22c55e"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="animate-[draw_0.6s_ease-in-out_forwards]"
                                      style={{
                                        strokeDasharray: '20',
                                        strokeDashoffset: '20',
                                        animation: 'draw 0.6s ease-in-out forwards'
                                      }}
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                              )}
                              {task.instructions && (
                                <p className="text-sm text-blue-600 mt-2">
                                  <strong>Instructions:</strong> {task.instructions}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 mt-2">
                                <p className="text-xs text-gray-500">
                                  Due: {formatDate(task.dueDate)}
                                </p>
                                {task.isRecurring && (
                                  <Badge variant="outline" className="text-xs">
                                    {task.recurringPattern}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.toLowerCase()}
                            </Badge>
                            {task.status === 'COMPLETED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 text-xs border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => unmarkTaskComplete(task.id)}
                              >
                                Unmark
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-sm text-gray-500">
                            Assigned: {formatDate(task.createdAt)}
                          </p>
                        </div>
                        {task.completedAt && task.completionNotes && (
                          <div className="mt-3 p-2 bg-green-50 rounded border-l-4 border-green-400">
                            <p className="text-sm text-green-800">
                              <strong>Completed:</strong> {formatDate(task.completedAt)}
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                              <strong>Notes:</strong> {task.completionNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
