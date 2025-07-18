"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Question {
  id: string;
  text: string;
  type: "multiple_choice" | "text" | "scale" | "yes_no";
  options?: string[];
  required: boolean;
}

interface Patient {
  id: string;
  name: string;
  email: string;
}

export default function NewAssessmentPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"INITIAL" | "PROGRESS" | "FINAL" | "FOLLOW_UP">("INITIAL");
  const [assessmentDate, setAssessmentDate] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Question form state
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    type: "multiple_choice" as const,
    options: [""],
    required: true,
  });

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated") {
      fetchPatients();
    }
  }, [authStatus, router]);

  const fetchPatients = async () => {
    try {
      // Mock data - replace with actual API call
      const mockPatients: Patient[] = [
        { id: "p1", name: "Sarah Johnson", email: "sarah.johnson@email.com" },
        { id: "p2", name: "Michael Chen", email: "michael.chen@email.com" },
        { id: "p3", name: "Emma Davis", email: "emma.davis@email.com" },
        { id: "p4", name: "David Wilson", email: "david.wilson@email.com" },
        { id: "p5", name: "Lisa Rodriguez", email: "lisa.rodriguez@email.com" },
        { id: "p6", name: "James Thompson", email: "james.thompson@email.com" },
      ];
      setPatients(mockPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.text.trim()) return;

    const question: Question = {
      id: Date.now().toString(),
      text: newQuestion.text,
      type: newQuestion.type,
      options: newQuestion.type === "multiple_choice" ? newQuestion.options.filter(opt => opt.trim()) : undefined,
      required: newQuestion.required,
    };

    setQuestions([...questions, question]);
    setNewQuestion({
      text: "",
      type: "multiple_choice",
      options: [""],
      required: true,
    });
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, ""],
    });
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions,
    });
  };

  const removeOption = (index: number) => {
    if (newQuestion.options.length > 1) {
      const updatedOptions = newQuestion.options.filter((_, i) => i !== index);
      setNewQuestion({
        ...newQuestion,
        options: updatedOptions,
      });
    }
  };

  const togglePatientSelection = (patientId: string) => {
    setSelectedPatients(prev => 
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || questions.length === 0) {
      alert("Please fill in all required fields and add at least one question.");
      return;
    }

    setSaving(true);
    try {
      const assessmentData = {
        title,
        description,
        type,
        assessmentDate: assessmentDate || new Date().toISOString().split('T')[0],
        questions,
        assignedPatients: selectedPatients,
      };

      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert("Assessment created successfully!");
      router.push("/therapist/assessments");
    } catch (error) {
      console.error("Error saving assessment:", error);
      alert("Failed to save assessment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authStatus === "loading") {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-[#8159A8]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#8159A8]">
              Create New Assessment
            </h1>
            <p className="text-gray-600">
              Design a new assessment for your patients.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Assessment Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter assessment title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the purpose and content of this assessment"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Assessment Type *</Label>
                    <Select value={type} onValueChange={(value: any) => setType(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INITIAL">Initial Assessment</SelectItem>
                        <SelectItem value="PROGRESS">Progress Assessment</SelectItem>
                        <SelectItem value="FINAL">Final Assessment</SelectItem>
                        <SelectItem value="FOLLOW_UP">Follow-up Assessment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date">Assessment Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={assessmentDate}
                      onChange={(e) => setAssessmentDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Questions Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Questions</h2>
              
              {/* Existing Questions */}
              {questions.length > 0 && (
                <div className="space-y-4 mb-6">
                  {questions.map((question, index) => (
                    <div key={question.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-600">Q{index + 1}</span>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {question.type.replace('_', ' ')}
                            </span>
                            {question.required && (
                              <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-gray-800">{question.text}</p>
                          {question.options && (
                            <ul className="mt-2 ml-4 text-sm text-gray-600">
                              {question.options.map((option, optIndex) => (
                                <li key={optIndex}>• {option}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Question */}
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Question</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="questionText">Question Text *</Label>
                    <Textarea
                      id="questionText"
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                      placeholder="Enter your question"
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="questionType">Question Type</Label>
                      <Select 
                        value={newQuestion.type} 
                        onValueChange={(value: any) => setNewQuestion({ ...newQuestion, type: value, options: value === "multiple_choice" ? [""] : [] })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="text">Text Response</SelectItem>
                          <SelectItem value="scale">Rating Scale (1-10)</SelectItem>
                          <SelectItem value="yes_no">Yes/No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="required"
                          checked={newQuestion.required}
                          onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, required: checked === true })}
                        />
                        <Label htmlFor="required" className="text-sm">Required question</Label>
                      </div>
                    </div>
                  </div>

                  {/* Multiple Choice Options */}
                  {newQuestion.type === "multiple_choice" && (
                    <div>
                      <Label>Answer Options</Label>
                      <div className="mt-2 space-y-2">
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1"
                            />
                            {newQuestion.options.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addOption}
                          className="mt-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={addQuestion}
                    className="bg-[#8159A8] hover:bg-[#6D4C93] text-white"
                    disabled={!newQuestion.text.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assign to Patients */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Assign to Patients</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {patients.map((patient) => (
                  <div key={patient.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={patient.id}
                      checked={selectedPatients.includes(patient.id)}
                      onCheckedChange={() => togglePatientSelection(patient.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={patient.id} className="text-sm font-medium cursor-pointer">
                        {patient.name}
                      </Label>
                      <p className="text-xs text-gray-500">{patient.email}</p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedPatients.length > 0 && (
                <div className="mt-4 p-3 bg-[#F5F3FB] rounded-lg">
                  <p className="text-sm text-[#8159A8] font-medium">
                    {selectedPatients.length} patient(s) selected
                  </p>
                </div>
              )}
            </Card>

            {/* Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned Patients:</span>
                  <span className="font-medium">{selectedPatients.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{type.replace('_', ' ')}</span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleSave}
                disabled={saving || !title.trim() || !description.trim() || questions.length === 0}
                className="w-full bg-[#8159A8] hover:bg-[#6D4C93] text-white"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Assessment
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full"
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
