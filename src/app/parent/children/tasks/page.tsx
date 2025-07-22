"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, Calendar, User, Target, Filter } from "lucide-react";

interface Task {
  id: string;
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

function TasksContent() {
  const searchParams = useSearchParams();
  const childId = searchParams?.get('childId');
  const childName = searchParams?.get('childName');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'therapist' | 'weekly'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/parent/children/${childId}/tasks`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data.tasks || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      fetchTasks();
    }
  }, [childId]);

  const refreshTasks = async () => {
    try {
      const response = await fetch(`/api/parent/children/${childId}/tasks`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks");
    }
  };

  const markTaskComplete = async (taskId: string, completionNotes?: string) => {
    try {
      const response = await fetch(`/api/parent/children/${childId}/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completionNotes }),
      });
      
      if (response.ok) {
        refreshTasks(); // Refresh tasks
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  // Add unmarkTaskComplete function
  const unmarkTaskComplete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/parent/children/${childId}/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unmark: true }),
      });
      if (response.ok) {
        refreshTasks();
      }
    } catch (error) {
      console.error("Error unmarking task:", error);
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

  // Filter tasks by categories and applied filters
  const getFilteredTasks = () => {
    let filteredTasks = tasks;

    // Filter by type
    if (filterType === 'daily') {
      filteredTasks = tasks.filter(task => 
        task.isRecurring && task.recurringPattern === 'daily'
      );
    } else if (filterType === 'therapist') {
      filteredTasks = tasks.filter(task => 
        !task.isRecurring || task.recurringPattern !== 'daily'
      );
    } else if (filterType === 'weekly') {
      filteredTasks = tasks.filter(task => 
        task.isRecurring && task.recurringPattern === 'weekly'
      );
    }

    // Filter by status
    if (filterStatus === 'pending') {
      filteredTasks = filteredTasks.filter(task => 
        task.status === 'PENDING' || task.status === 'IN_PROGRESS'
      );
    } else if (filterStatus === 'completed') {
      filteredTasks = filteredTasks.filter(task => 
        task.status === 'COMPLETED'
      );
    } else if (filterStatus === 'overdue') {
      filteredTasks = filteredTasks.filter(task => 
        task.status === 'OVERDUE' || isOverdue(task.dueDate)
      );
    }

    // Sort by priority (higher priority first)
    // Custom sort only when showing all statuses
if (filterStatus === 'all') {
  const pending = filteredTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').sort((a, b) => b.priority - a.priority);
  const overdue = filteredTasks.filter(t => t.status === 'OVERDUE' || isOverdue(t.dueDate));
  const completed = filteredTasks.filter(t => t.status === 'COMPLETED');
  return [...pending, ...overdue, ...completed];
} else {
  // For other filters, keep the current sort by priority
  filteredTasks.sort((a, b) => b.priority - a.priority);
  return filteredTasks;
}

    return filteredTasks;
  };

  const filteredTasks = getFilteredTasks();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F3FB' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8159A8' }}></div>
          <p className="mt-2 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ backgroundColor: '#F5F3FB' }}>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Unable to load tasks</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <style jsx>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-start mb-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="flex items-center px-3 py-2 text-[#8159A8] hover:text-[#8159A8]/80 hover:bg-[#8159A8]/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Children
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tasks for {childName}
            </h1>
            <p className="text-gray-600">Track daily activities and therapy goals</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
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

                {/* Active Filters Summary */}
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
              <p className="text-sm text-gray-600">Completed Today</p>
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
            {filteredTasks.length === 0 ? (
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
                        {/* Show Unmark button for completed tasks */}
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
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F3FB' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8159A8' }}></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <TasksContent />
    </Suspense>
  );
}