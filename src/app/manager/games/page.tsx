"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { Gamepad2, Brain, Target, Zap, PlusCircle, RefreshCw, Terminal, Play, Power } from "lucide-react";

// --- Type Definitions ---
export interface Assessment {
  id: string;
  title: string | null;
  link: string | null;
  type: string;
  description: string | null;
  isActive?: boolean;
  isDeactivated?: boolean;
}

type Category = "attention" | "memory" | "focus";

// --- Form Component (previously in a separate file) ---
interface AddAssessmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onAssessmentAdded: (newAssessment: Assessment) => void;
}

const AddAssessmentForm: React.FC<AddAssessmentFormProps> = ({ isOpen, onClose, onAssessmentAdded }) => {
    const [title, setTitle] = useState('');
    const [assessmentUrl, setAssessmentUrl] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Category | ''>('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !assessmentUrl || !description || !category) {
            setError('Please fill out all fields.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/assessments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, assessmentUrl, description, category }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add assessment');
            }
            const newAssessment = await response.json();
            onAssessmentAdded(newAssessment);
            handleClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setTitle(''); setAssessmentUrl(''); setDescription(''); setCategory(''); setError(null);
        onClose();
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white/90 backdrop-saturate-150 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Add New Assessment</h2>
                    <Button variant="ghost" size="sm" onClick={handleClose}>X</Button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Memory Matrix" />
                    </div>
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700">Assessment URL</label>
                        <Input id="url" type="url" value={assessmentUrl} onChange={(e) => setAssessmentUrl(e.target.value)} placeholder="https://..." />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                         <Select onValueChange={(value: Category) => setCategory(value)} value={category}>
                            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="attention">Attention</SelectItem>
                                <SelectItem value="memory">Memory</SelectItem>
                                <SelectItem value="focus">Focus</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief summary of the assessment..." />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>Cancel</Button>
                        <Button type="submit" className="bg-[#8159A8] hover:bg-[#6B429B]" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Assessment'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function AssessmentManagementPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  // Removed category filters
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/assessments');
      if (!response.ok) throw new Error('Failed to fetch assessments');
      const data: Assessment[] = await response.json();
      setAssessments(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleAssessmentAdded = (newAssessment: Assessment) => {
    setAssessments(prev => [newAssessment, ...prev]);
    setIsFormOpen(false);
  };

  const handleDeleteClick = (assessmentId: string) => {
    setAssessmentToDelete(assessmentId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!assessmentToDelete) return;

    try {
      const response = await fetch(`/api/admin/assessments?id=${assessmentToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deactivate assessment');
      }

      // Mark the assessment as deactivated in the local state
      setAssessments(prev => prev.map(assessment => 
        assessment.id === assessmentToDelete 
          ? { ...assessment, isDeactivated: true }
          : assessment
      ));
      setIsDeleteDialogOpen(false);
      setAssessmentToDelete(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsDeleteDialogOpen(false);
      setAssessmentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setAssessmentToDelete(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "attention": return <Target className="h-4 w-4 text-blue-500" />;
      case "memory": return <Brain className="h-4 w-4 text-purple-500" />;
      case "focus": return <Zap className="h-4 w-4 text-yellow-500" />;
      default: return <Gamepad2 className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const filteredAssessments = assessments;

  return (
    <>
      <AddAssessmentForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onAssessmentAdded={handleAssessmentAdded} />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <main className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent tracking-tight mb-1">Assessment Management</h1>
              <p className="text-muted-foreground mt-1">Manage therapeutic assessments for patients.</p>
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="bg-[#8159A8] hover:bg-[#6B429B] flex items-center gap-2">
              <PlusCircle className="h-4 w-4" /> New Assessment
            </Button>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-end gap-4">
            <p className="text-xs text-gray-500 flex items-center gap-1.5"><RefreshCw className="h-3 w-3" /> Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? <p className="col-span-full text-center">Loading assessments...</p> :
             error ? <p className="col-span-full text-center text-red-500">Error: {error}</p> :
             filteredAssessments.length > 0 ? (
              filteredAssessments.map((assessment) => (
                <Card key={assessment.id} className={`flex flex-col justify-between hover:shadow-md transition-shadow duration-200 ${assessment.isDeactivated ? 'opacity-50 bg-gray-100' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(assessment.type)}
                        <CardTitle className="text-base font-semibold">{assessment.title}</CardTitle>
                        {assessment.isDeactivated && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Deactivated</span>
                        )}
                      </div>
                    </div>
                    <CardDescription className="pt-2">{assessment.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center pt-4">
                    {assessment.isDeactivated ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Power className="h-4 w-4" />
                        <span className="text-sm">Assessment Deactivated</span>
                      </div>
                    ) : (
                      <>
                      <div className="flex gap-2 ml-auto">
                        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <a href={assessment.link || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                              <Play className="h-4 w-4" />
                              Play Assessment
                          </a>
                        </Button>
                        <Button 
                          onClick={() => handleDeleteClick(assessment.id)}
                          size="sm" 
                          variant="destructive"
                          className="flex items-center gap-2"
                        >
                          <Power className="h-4 w-4" />
                          Deactivate
                        </Button>
                      </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border-dashed border-2">
                <h3 className="text-lg font-medium">No assessments found.</h3>
                <p className="text-sm text-gray-500 mt-1">Click the &quot;+ New Assessment&quot; button to add one.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      <DeleteConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onDelete={handleConfirmDelete}
        title="Deactivate Assessment"
        description="Are you sure you want to deactivate this assessment? This action will permanently remove the assessment from the system"
        buttonLabel="Deactivate"
        buttonVariant="destructive"
      />
    </>
  );
}