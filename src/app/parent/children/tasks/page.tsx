"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Clock, AlertTriangle } from "lucide-react";

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

export default function TasksPage() {
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  const childName = searchParams.get('childName');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return 'text-red-600';
    if (priority === 2) return 'text-yellow-600';
    return 'text-green-600';
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

  // Filter tasks by categories
  const dailyTasks = tasks.filter(task => 
    task.isRecurring && task.recurringPattern === 'daily'
  );

  const therapistTasks = tasks.filter(task => 
    !task.isRecurring || task.recurringPattern !== 'daily'
  );

  const weeklyGoals = tasks.filter(task => 
    task.isRecurring && task.recurringPattern === 'weekly'
  );

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F3FB' }}>
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
    <div className="min-h-screen" style={{ backgroundColor: '#F5F3FB' }}>
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tasks for {childName}
            </h1>
            <p className="text-gray-600">Track daily activities and therapy goals</p>
          </div>
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

        {/* Daily Tasks */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Daily Tasks</span>
              <Badge variant="secondary">{dailyTasks.length} tasks</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No daily tasks assigned</p>
            ) : (
              <div className="space-y-3">
                {dailyTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        task.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {task.status === 'COMPLETED' && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-600">Due: {formatDate(task.dueDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.toLowerCase()}
                      </Badge>
                      {task.status !== 'COMPLETED' && (
                        <Button
                          size="sm"
                          onClick={() => markTaskComplete(task.id)}
                          className="bg-[#8159A8] hover:bg-[#8159A8]/90"
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Therapist Assigned Tasks */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Therapist Assigned Tasks</span>
              <Badge variant="secondary">{therapistTasks.length} tasks</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {therapistTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No therapist tasks assigned</p>
            ) : (
              <div className="space-y-4">
                {therapistTasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        {task.instructions && (
                          <p className="text-sm text-blue-600 mt-2">
                            <strong>Instructions:</strong> {task.instructions}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.toLowerCase()}
                        </Badge>
                        <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                          Priority: {task.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-sm text-gray-500">
                        Assigned: {formatDate(task.createdAt)} • Due: {formatDate(task.dueDate)}
                      </p>
                      {task.status !== 'COMPLETED' && (
                        <Button
                          size="sm"
                          onClick={() => markTaskComplete(task.id)}
                          className="bg-[#8159A8] hover:bg-[#8159A8]/90"
                        >
                          Mark Complete
                        </Button>
                      )}
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

        {/* Weekly Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Weekly Goals</span>
              <Badge variant="secondary">{weeklyGoals.length} goals</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyGoals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No weekly goals set</p>
            ) : (
              <div className="space-y-3">
                {weeklyGoals.map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        goal.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}>
                        {goal.status === 'COMPLETED' && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className={`font-medium ${goal.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}`}>
                          {goal.title}
                        </p>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(goal.status)}>
                        {goal.status.toLowerCase()}
                      </Badge>
                      {goal.status !== 'COMPLETED' && (
                        <Button
                          size="sm"
                          onClick={() => markTaskComplete(goal.id)}
                          className="bg-[#8159A8] hover:bg-[#8159A8]/90"
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
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