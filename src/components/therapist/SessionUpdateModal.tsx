"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar, Clock, User, FileText, Pill, CheckSquare, Plus, Trash2, Save } from "lucide-react";
import { format } from "date-fns";

interface Session {
  id: string;
  patientName: string;
  patientId: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  location?: string;
  notes?: string;
  objectives: string[];
  patientMood?: number;
  engagement?: number;
  progressNotes?: string;
}

interface Medication {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
}

interface Task {
  id?: string;
  title: string;
  description: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
}

interface SessionUpdateModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionUpdated: () => void;
}

export function SessionUpdateModal({ session, isOpen, onClose, onSessionUpdated }: SessionUpdateModalProps) {
  const [sessionNotes, setSessionNotes] = useState("");
  const [progressNotes, setProgressNotes] = useState("");
  const [patientMood, setPatientMood] = useState<number[]>([5]);
  const [engagement, setEngagement] = useState<number[]>([5]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      setSessionNotes(session.notes || "");
      setProgressNotes(session.progressNotes || "");
      setPatientMood([session.patientMood || 5]);
      setEngagement([session.engagement || 5]);
      // Initialize empty arrays for medications and tasks
      setMedications([]);
      setTasks([]);
    }
  }, [session]);

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "" }]);
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = { ...updatedMedications[index], [field]: value };
    setMedications(updatedMedications);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const addTask = () => {
    setTasks([...tasks, { title: "", description: "", priority: "medium" }]);
  };

  const updateTask = (index: number, field: keyof Task, value: string) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setTasks(updatedTasks);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!session) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        sessionId: session.id,
        notes: sessionNotes,
        progressNotes,
        patientMood: patientMood[0],
        engagement: engagement[0],
        medications: medications.filter(med => med.name && med.dosage),
        tasks: tasks.filter(task => task.title && task.description),
      };

      const response = await fetch(`/api/therapist/sessions/${session.id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        onSessionUpdated();
        onClose();
      } else {
        console.error('Failed to update session');
      }
    } catch (error) {
      console.error('Error updating session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Update Session - {session.patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(session.scheduledAt), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(session.scheduledAt), "hh:mm a")} ({session.duration} min)</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{session.type}</span>
                </div>
                <div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {session.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sessionNotes">Session Notes</Label>
                <Textarea
                  id="sessionNotes"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Enter session notes, observations, and key points discussed..."
                  className="min-h-[120px]"
                />
              </div>
              <div>
                <Label htmlFor="progressNotes">Progress Notes</Label>
                <Textarea
                  id="progressNotes"
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Document patient progress, improvements, and areas of concern..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="flex items-center justify-between">
                  Patient Mood
                  <span className="text-sm text-gray-500">{patientMood[0]}/10</span>
                </Label>
                <Slider
                  value={patientMood}
                  onValueChange={setPatientMood}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Low</span>
                  <span>Excellent</span>
                </div>
              </div>
              <div>
                <Label className="flex items-center justify-between">
                  Patient Engagement
                  <span className="text-sm text-gray-500">{engagement[0]}/10</span>
                </Label>
                <Slider
                  value={engagement}
                  onValueChange={setEngagement}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Low</span>
                  <span>Highly Engaged</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Medications
                </span>
                <Button variant="outline" size="sm" onClick={addMedication}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Medication
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No medications added yet.</p>
              ) : (
                <div className="space-y-4">
                  {medications.map((medication, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <Label htmlFor={`med-name-${index}`}>Medication Name</Label>
                          <Input
                            id={`med-name-${index}`}
                            value={medication.name}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            placeholder="e.g., Sertraline"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`med-dosage-${index}`}>Dosage</Label>
                          <Input
                            id={`med-dosage-${index}`}
                            value={medication.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            placeholder="e.g., 50mg"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`med-frequency-${index}`}>Frequency</Label>
                          <Input
                            id={`med-frequency-${index}`}
                            value={medication.frequency}
                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                            placeholder="e.g., Once daily"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeMedication(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label htmlFor={`med-instructions-${index}`}>Instructions</Label>
                        <Textarea
                          id={`med-instructions-${index}`}
                          value={medication.instructions || ""}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          placeholder="Special instructions or notes..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  Assigned Tasks
                </span>
                <Button variant="outline" size="sm" onClick={addTask}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tasks assigned yet.</p>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <Label htmlFor={`task-title-${index}`}>Task Title</Label>
                          <Input
                            id={`task-title-${index}`}
                            value={task.title}
                            onChange={(e) => updateTask(index, 'title', e.target.value)}
                            placeholder="e.g., Daily mood tracking"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`task-due-${index}`}>Due Date</Label>
                          <Input
                            id={`task-due-${index}`}
                            type="date"
                            value={task.dueDate || ""}
                            onChange={(e) => updateTask(index, 'dueDate', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <Label htmlFor={`task-description-${index}`}>Description</Label>
                        <Textarea
                          id={`task-description-${index}`}
                          value={task.description}
                          onChange={(e) => updateTask(index, 'description', e.target.value)}
                          placeholder="Detailed task description and instructions..."
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor={`task-priority-${index}`}>Priority</Label>
                          <select
                            id={`task-priority-${index}`}
                            value={task.priority}
                            onChange={(e) => updateTask(index, 'priority', e.target.value as 'low' | 'medium' | 'high')}
                            className="ml-2 border rounded px-2 py-1"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTask(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Session
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
