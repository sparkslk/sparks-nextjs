"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogClose, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  History,
  Clock,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  Medication, 
  MedicationFrequency, 
  MealTiming, 
  MedicationHistoryEntry,
  MedicationHistoryAction,
  FREQUENCY_LABELS,
  MEAL_TIMING_LABELS,
  HISTORY_ACTION_LABELS
} from '@/types/medications';

interface MedicationManagementProps {
  patientId: string;
  medications: Medication[];
  onMedicationUpdate: () => void;
}

// Helper function to convert technical field names to user-friendly labels
const getFieldDisplayName = (key: string): string => {
  const fieldMap: Record<string, string> = {
    name: 'Medication Name',
    dosage: 'Dosage',
    frequency: 'How Often',
    customFrequency: 'Custom Schedule',
    instructions: 'Instructions',
    mealTiming: 'When to Take',
    startDate: 'Start Date',
    endDate: 'End Date',
    isActive: 'Status',
    isDiscontinued: 'Discontinued',
    discontinuedAt: 'Discontinued Date',
    currentName: 'Current Name',
    currentDosage: 'Current Dosage',
    currentFrequency: 'Current Schedule',
    currentMealTiming: 'Current Timing'
  };
  
  return fieldMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

// Helper function to format field values for better readability
const formatFieldValue = (key: string, value: any): string => {
  if (value === null || value === undefined) {
    return 'Not set';
  }
  
  // Handle different field types
  switch (key) {
    case 'frequency':
    case 'currentFrequency':
      return FREQUENCY_LABELS[value as MedicationFrequency] || value;
    
    case 'mealTiming':
    case 'currentMealTiming':
      return MEAL_TIMING_LABELS[value as MealTiming] || value;
    
    case 'startDate':
    case 'endDate':
    case 'discontinuedAt':
      if (typeof value === 'string') {
        try {
          return format(new Date(value), 'MMM dd, yyyy');
        } catch {
          return value;
        }
      }
      return value;
    
    case 'isActive':
      return value ? 'Active' : 'Inactive';
    
    case 'isDiscontinued':
      return value ? 'Yes' : 'No';
    
    default:
      return String(value);
  }
};

// Separate MedicationForm component to prevent re-rendering issues
interface MedicationFormProps {
  formData: MedicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<MedicationFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string;
  editingMedication: Medication | null;
}

const MedicationFormComponent: React.FC<MedicationFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isLoading,
  error,
  editingMedication
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    {error && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <span className="text-red-700 text-sm">{error}</span>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name">Medication Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Adderall XR"
          required
        />
      </div>

      <div>
        <Label htmlFor="dosage">Dosage *</Label>
        <Input
          id="dosage"
          value={formData.dosage}
          onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
          placeholder="e.g., 10mg"
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>Frequency *</Label>
        <Select
          value={formData.frequency}
          onValueChange={(value) => setFormData(prev => ({ 
            ...prev, 
            frequency: value as MedicationFrequency,
            customFrequency: value === MedicationFrequency.CUSTOM ? prev.customFrequency : ''
          }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.frequency === MedicationFrequency.CUSTOM && (
        <div>
          <Label htmlFor="customFrequency">Custom Frequency *</Label>
          <Input
            id="customFrequency"
            value={formData.customFrequency}
            onChange={(e) => setFormData(prev => ({ ...prev, customFrequency: e.target.value }))}
            placeholder="e.g., Every Monday, Wednesday, Friday"
            required
          />
        </div>
      )}

      <div>
        <Label>Meal Timing</Label>
        <Select
          value={formData.mealTiming}
          onValueChange={(value) => setFormData(prev => ({ ...prev, mealTiming: value as MealTiming }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MEAL_TIMING_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="startDate">Start Date *</Label>
        <Input
          id="startDate"
          type="date"
          value={formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : ''}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            startDate: e.target.value ? new Date(e.target.value) : undefined 
          }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="endDate">End Date (Optional)</Label>
        <Input
          id="endDate"
          type="date"
          value={formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : ''}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            endDate: e.target.value ? new Date(e.target.value) : undefined 
          }))}
        />
      </div>
    </div>

    <div>
      <Label htmlFor="instructions">Instructions</Label>
      <Textarea
        id="instructions"
        value={formData.instructions}
        onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
        placeholder="Special instructions for taking this medication..."
        rows={3}
      />
    </div>

    <div className="flex gap-2 pt-4">
      <Button type="submit" disabled={isLoading} className="bg-[#8159A8] hover:bg-[#6d4a8f]">
        {isLoading ? 'Saving...' : editingMedication ? 'Update Medication' : 'Add Medication'}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  </form>
);

interface MedicationFormData {
  name: string;
  dosage: string;
  frequency: MedicationFrequency | '';
  customFrequency: string;
  instructions: string;
  mealTiming: MealTiming;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const initialFormData: MedicationFormData = {
  name: '',
  dosage: '',
  frequency: '',
  customFrequency: '',
  instructions: '',
  mealTiming: MealTiming.NONE,
  startDate: undefined,
  endDate: undefined,
};

export default function MedicationManagement({ 
  patientId, 
  medications, 
  onMedicationUpdate 
}: MedicationManagementProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDiscontinueConfirmOpen, setIsDiscontinueConfirmOpen] = useState(false);
  const [showAdherenceModal, setShowAdherenceModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [selectedMedicationForHistory, setSelectedMedicationForHistory] = useState<Medication | null>(null);
  const [medicationToDiscontinue, setMedicationToDiscontinue] = useState<Medication | null>(null);
  const [medicationHistory, setMedicationHistory] = useState<MedicationHistoryEntry[]>([]);
  const [formData, setFormData] = useState<MedicationFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string>('');

  const resetForm = () => {
    setFormData(initialFormData);
    setError('');
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (isAddOpen && !editingMedication) {
      resetForm();
    }
  }, [isAddOpen, editingMedication]);

  // Populate form when editing
  useEffect(() => {
    if (editingMedication) {
      setFormData({
        name: editingMedication.name,
        dosage: editingMedication.dosage,
        frequency: editingMedication.frequency,
        customFrequency: editingMedication.customFrequency || '',
        mealTiming: editingMedication.mealTiming,
        startDate: new Date(editingMedication.startDate),
        endDate: editingMedication.endDate ? new Date(editingMedication.endDate) : undefined,
        instructions: editingMedication.instructions || ''
      });
    }
  }, [editingMedication]);

  const handleCancel = () => {
    resetForm();
    setIsAddOpen(false);
    setIsEditOpen(false);
    setEditingMedication(null);
  };

  const fetchMedicationHistory = async (medicationId: string) => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/therapist/patients/${patientId}/medications/${medicationId}/history`);
      if (response.ok) {
        const history = await response.json();
        setMedicationHistory(history);
      } else {
        console.error('Failed to fetch medication history:', response.status, response.statusText);
        setMedicationHistory([]);
      }
    } catch (error) {
      console.error('Error fetching medication history:', error);
      setMedicationHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleViewHistory = async (medication: Medication) => {
    setSelectedMedicationForHistory(medication);
    setIsHistoryOpen(true);
    await fetchMedicationHistory(medication.id);
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      customFrequency: medication.customFrequency || '',
      instructions: medication.instructions || '',
      mealTiming: medication.mealTiming,
      startDate: new Date(medication.startDate),
      endDate: medication.endDate ? new Date(medication.endDate) : undefined,
    });
    setIsEditOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.name || !formData.dosage || !formData.frequency || !formData.startDate) {
        setError('Please fill in all required fields');
        return;
      }

      if (formData.frequency === MedicationFrequency.CUSTOM && !formData.customFrequency) {
        setError('Please provide custom frequency details');
        return;
      }

      const medicationData = {
        patientId,
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency as MedicationFrequency,
        customFrequency: formData.customFrequency || undefined,
        instructions: formData.instructions || undefined,
        mealTiming: formData.mealTiming,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
      };

      let response;
      if (editingMedication) {
        // Helper function to normalize empty values for comparison
        const normalizeEmpty = (value: any): string | null => {
          if (value === null || value === undefined || value === '') {
            return null;
          }
          return String(value);
        };

        // Track what changed for updates
        const changes: string[] = [];
        if (editingMedication.name !== formData.name) changes.push('name');
        if (editingMedication.dosage !== formData.dosage) changes.push('dosage');
        if (editingMedication.frequency !== formData.frequency) changes.push('frequency');
        
        // Compare custom frequency with proper null handling
        const oldCustomFreq = normalizeEmpty(editingMedication.customFrequency);
        const newCustomFreq = normalizeEmpty(formData.customFrequency);
        if (oldCustomFreq !== newCustomFreq) changes.push('custom frequency');
        
        // Compare instructions with proper null handling
        const oldInstructions = normalizeEmpty(editingMedication.instructions);
        const newInstructions = normalizeEmpty(formData.instructions);
        if (oldInstructions !== newInstructions) changes.push('instructions');
        
        if (editingMedication.mealTiming !== formData.mealTiming) changes.push('meal timing');
        if (new Date(editingMedication.startDate).toDateString() !== formData.startDate.toDateString()) changes.push('start date');
        
        const previousEndDate = editingMedication.endDate ? new Date(editingMedication.endDate).toDateString() : null;
        const newEndDate = formData.endDate ? formData.endDate.toDateString() : null;
        if (previousEndDate !== newEndDate) changes.push('end date');

        // Add change tracking to the request
        const updateData = {
          ...medicationData,
          changeLog: {
            changedFields: changes,
            timestamp: new Date().toISOString(),
            reason: changes.length > 0 ? `Updated: ${changes.join(', ')}` : 'No changes detected'
          }
        };

        // Update existing medication
        response = await fetch(`/api/therapist/patients/${patientId}/medications/${editingMedication.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
      } else {
        // Create new medication
        response = await fetch(`/api/therapist/patients/${patientId}/medications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(medicationData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save medication');
      }

      // Success
      resetForm();
      setIsAddOpen(false);
      setIsEditOpen(false);
      setEditingMedication(null);
      onMedicationUpdate();
    } catch (error) {
      console.error('Error saving medication:', error);
      setError(error instanceof Error ? error.message : 'Failed to save medication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscontinue = async (medicationId: string, reason?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/therapist/patients/${patientId}/medications/${medicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: medicationId, reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to discontinue medication');
      }

      onMedicationUpdate();
      // Close the confirmation modal
      setIsDiscontinueConfirmOpen(false);
      setMedicationToDiscontinue(null);
    } catch (error) {
      console.error('Error discontinuing medication:', error);
      setError(error instanceof Error ? error.message : 'Failed to discontinue medication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscontinueClick = (medication: Medication) => {
    setMedicationToDiscontinue(medication);
    setIsDiscontinueConfirmOpen(true);
  };

  const handleConfirmDiscontinue = () => {
    if (medicationToDiscontinue) {
      handleDiscontinue(medicationToDiscontinue.id, 'Discontinued by therapist');
    }
  };

  const handleCancelDiscontinue = () => {
    setIsDiscontinueConfirmOpen(false);
    setMedicationToDiscontinue(null);
  };

  const getFrequencyDisplay = (medication: Medication) => {
    if (medication.frequency === MedicationFrequency.CUSTOM) {
      return medication.customFrequency || 'Custom schedule';
    }
    return FREQUENCY_LABELS[medication.frequency];
  };

  const activeMedications = medications.filter(med => med.isActive && !med.isDiscontinued);
  const discontinuedMedications = medications.filter(med => med.isDiscontinued);
  
  // Calculate recent activity
  const recentlyUpdated = medications.filter(med => {
    const daysSinceUpdate = (new Date().getTime() - new Date(med.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate <= 7; // Updated in last 7 days
  });

  const recentlyDiscontinued = discontinuedMedications.filter(med => {
    if (!med.discontinuedAt) return false;
    const daysSinceDiscontinued = (new Date().getTime() - new Date(med.discontinuedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceDiscontinued <= 7; // Discontinued in last 7 days
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold mb-2 text-[#8159A8]">Medication Management</h3>
          <p className="text-gray-600">Monitor and manage patient prescriptions</p>
        </div>
        <div className="w-full md:w-auto">
          <div className="grid grid-cols-2 gap-4 text-center mb-4">
            <div className="bg-gray-50 rounded-lg p-3 border">
              <div className="text-2xl font-bold text-[#8159A8]">{activeMedications.length}</div>
              <div className="text-sm text-gray-600">Active Medications</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border">
              <div className="text-2xl font-bold text-[#8159A8]">{discontinuedMedications.length}</div>
              <div className="text-sm text-gray-600">Discontinued</div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons: View Adherence Details & Add Medication */}
      <div className="flex flex-col sm:flex-row justify-end mt-4 gap-2">
        {/* Adherence Details Button */}
        <Dialog open={showAdherenceModal} onOpenChange={setShowAdherenceModal}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="bg-white">
              View Adherence Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Medication Adherence Details</DialogTitle>
              <DialogDescription>
                Hardcoded adherence statistics and weekly pattern for demonstration.
              </DialogDescription>
            </DialogHeader>
            {/* Adherence Details Content (moved from tab) */}
            <div className="space-y-6">
              

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <select className="border rounded-1g px-3 py-2 text-sm bg-white shadow-sm">
                  <option>Last 3 Months</option>
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
                <select className="border rounded-1g px-3 py-2 text-sm bg-white shadow-sm">
                  <option>All Medications</option>
                  <option>Adderall XR</option>
                  <option>Strattera</option>
                </select>
              </div>
            <Button variant="outline" size="sm" className="bg-white">Export Report</Button>
            </div>
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border shadow-md text-center">
                  <div className="text-2xl font-bold text-green-600">89%</div>
                  <div className="text-sm text-gray-600">Overall Adherence Rate</div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-md text-center">
                  <div className="text-2xl font-bold text-red-600">12</div>
                  <div className="text-sm text-gray-600">Missed Doses (30 days)</div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-md text-center">
                  <div className="text-2xl font-bold text-[#8159A8]">247</div>
                  <div className="text-sm text-gray-600">Total Doses Taken</div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-md text-center">
                  <div className="text-2xl font-bold text-orange-600">7</div>
                  <div className="text-sm text-gray-600">Current Streak (days)</div>
                </div>
              </div>

              {/* Weekly Adherence Pattern */}
              <div className="bg-white p-6 rounded-xl border shadow-md">
                <h4 className="text-lg font-semibold text-[#8159A8] mb-4">Weekly Adherence Pattern</h4>
                <div className="flex gap-2 mb-4">
                  <span className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    Taken
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    Missed
                  </span>
                </div>
                <div className="flex gap-2">
                  {[
                    { day: "Mon", status: "taken" },
                    { day: "Tue", status: "taken" },
                    { day: "Wed", status: "taken" },
                    { day: "Thu", status: "taken" },
                    { day: "Fri", status: "missed" },
                    { day: "Sat", status: "taken" },
                    { day: "Sun", status: "taken" }
                  ].map((day, index) => (
                    <div key={index} className="flex-1">
                      <div className="text-xs text-center mb-2 font-medium">{day.day}</div>
                      <div className={`h-12 rounded-lg ${day.status === 'taken' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Medication Button */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#8159A8] hover:bg-[#6d4a8f] text-white" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
            </DialogHeader>
            <MedicationFormComponent
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
              error={error}
              editingMedication={editingMedication}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Activity Summary */}
      {/* {(recentlyUpdated.length > 0 || recentlyDiscontinued.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <h4 className="text-amber-800 font-semibold mb-2 flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            Recent Activity (Last 7 Days)
          </h4>
          <div className="space-y-2 text-xs max-h-40 overflow-y-auto pr-1">
            {recentlyUpdated.map(med => (
              <div key={`updated-${med.id}`} className="flex items-center justify-between bg-white rounded p-2">
                <span className="text-amber-700">
                  <strong>{med.name}</strong> was updated on {format(new Date(med.updatedAt), 'MMM dd')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewHistory(med)}
                  className="text-xs"
                >
                  View History
                </Button>
              </div>
            ))}
            {recentlyDiscontinued.map(med => (
              <div key={`discontinued-${med.id}`} className="flex items-center justify-between bg-white rounded p-2">
                <span className="text-amber-700">
                  <strong>{med.name}</strong> was discontinued on {med.discontinuedAt ? format(new Date(med.discontinuedAt), 'MMM dd') : 'Unknown'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewHistory(med)}
                  className="text-xs"
                >
                  View History
                </Button>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Active Medications */}
      {activeMedications.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-[#8159A8]">Active Medications</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {activeMedications.map((medication) => (
              <div
                key={medication.id}
                className="bg-[#FAF8FB] rounded-2xl shadow-md p-6 flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                  <span className="text-[#8159A8] font-bold text-xl flex items-center gap-1">
                    {medication.name}
                  </span>
                  </div>
                  <div className="flex gap-2">
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewHistory(medication)}
                  className="text-gray-600 border-gray-600 hover:bg-gray-50"
                  >
                  <History className="w-4 h-4 mr-1" />
                  History
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    onClick={() => handleEdit(medication)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => handleDiscontinueClick(medication)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Discontinue
                  </Button>
                  
                  </div>
                </div>
                <div className="mb-2" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 mt-2 mb-4">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Dosage</div>
                    <div className="font-bold text-gray-900">{medication.dosage}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Frequency</div>
                    <div className="font-bold text-gray-900">{getFrequencyDisplay(medication)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Meal Timing</div>
                    <div className="font-bold text-gray-900">{MEAL_TIMING_LABELS[medication.mealTiming]}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Start Date</div>
                    <div className="font-bold text-gray-900">{format(new Date(medication.startDate), 'MMM dd, yyyy')}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">End Date</div>
                    <div className="font-bold text-gray-900">
                      {medication.endDate ? format(new Date(medication.endDate), 'MMM dd, yyyy') : 'Ongoing'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Prescribed By</div>
                    <div className="font-bold text-gray-900">{medication.therapist?.user?.name || 'Unknown'}</div>
                  </div>
                </div>
                {medication.instructions && (
                  <div className="bg-[#ede6fa] rounded-lg p-4 mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-[#8159A8]" />
                      <span className="font-semibold text-[#8159A8]">Instructions</span>
                    </div>
                    <div className="text-[#8159A8] text-sm">{medication.instructions}</div>
                  </div>
                )}
                
                  
                
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg text-gray-500 mb-2">No active medications</p>
          <p className="text-sm text-gray-400">Click &quot;Add Medication&quot; to get started</p>
        </div>
      )}

      {/* Discontinued Medications */}
      {discontinuedMedications.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-[#8159A8]">Discontinued Medications</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {discontinuedMedications.map((medication) => (
              <div
                key={medication.id}
                className="bg-[#FAF8FB] rounded-2xl shadow-md p-6 flex flex-col h-full opacity-75"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8159A8] font-bold text-xl flex items-center gap-1">
                      {medication.name}
                    </span>
                    <Badge variant="secondary">Discontinued</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewHistory(medication)}
                      className="text-gray-600 border-gray-600 hover:bg-gray-50"
                    >
                      <History className="w-4 h-4 mr-1" />
                      History
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 mt-2 mb-4">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Dosage</div>
                    <div className="font-bold text-gray-900">{medication.dosage}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Frequency</div>
                    <div className="font-bold text-gray-900">{getFrequencyDisplay(medication)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Meal Timing</div>
                    <div className="font-bold text-gray-900">{MEAL_TIMING_LABELS[medication.mealTiming]}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Start Date</div>
                    <div className="font-bold text-gray-900">{format(new Date(medication.startDate), 'MMM dd, yyyy')}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">End Date</div>
                    <div className="font-bold text-gray-900">
                      {medication.endDate ? format(new Date(medication.endDate), 'MMM dd, yyyy') : 'Not Set'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Discontinued</div>
                    <div className="font-bold text-gray-900">
                      {medication.discontinuedAt ? format(new Date(medication.discontinuedAt), 'MMM dd, yyyy') : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Prescribed By</div>
                    <div className="font-bold text-gray-900">
                      {medication.therapist?.user?.name || 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Discontinued By</div>
                    <div className="font-bold text-gray-900">
                      {medication.discontinuingTherapist?.user?.name || 'Unknown'}
                    </div>
                  </div>
                </div>
                {medication.instructions && (
                  <div className="bg-[#ede6fa] rounded-lg p-4 mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-[#8159A8]" />
                      <span className="font-semibold text-[#8159A8]">Instructions</span>
                    </div>
                    <div className="text-[#8159A8] text-sm">{medication.instructions}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
          </DialogHeader>
          <MedicationFormComponent
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            error={error}
            editingMedication={editingMedication}
          />
        </DialogContent>
      </Dialog>

      {/* Medication History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Medication History
              {selectedMedicationForHistory && (
                <span className="text-[#8159A8]">- {selectedMedicationForHistory.name}</span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading history...</div>
              </div>
            ) : medicationHistory.length > 0 ? (
              <div className="space-y-3">
                {medicationHistory
                  .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
                  .map((entry) => (
                    <Card key={entry.id} className="bg-purple-50 shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={entry.action === MedicationHistoryAction.DISCONTINUED ? 'destructive' : 
                                     entry.action === MedicationHistoryAction.CREATED ? 'default' : 'secondary'}
                            >
                              {HISTORY_ACTION_LABELS[entry.action]}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="w-3 h-3" />
                              {format(new Date(entry.changedAt), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </div>
                          {entry.therapist && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <User className="w-3 h-3" />
                              {entry.therapist.user.name}
                            </div>
                          )}
                        </div>

                        {entry.reason && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">{entry.reason}</p>
                          </div>
                        )}

                        {entry.notes && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">{entry.notes}</p>
                          </div>
                        )}

                        {/* Display changes in a user-friendly way - but not for discontinuation */}
                        {(entry.previousValues && Object.keys(entry.previousValues).length > 0 && 
                          entry.action !== MedicationHistoryAction.DISCONTINUED) && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">What Changed:</p>
                            <div className="bg-blue-50 rounded p-3 space-y-2">
                              {Object.entries(entry.previousValues).map(([key, oldValue]) => {
                                const newValue = entry.newValues?.[key as keyof typeof entry.newValues];
                                const fieldName = getFieldDisplayName(key);
                                
                                return (
                                  <div key={key} className="text-sm">
                                    <span className="font-medium text-blue-800">{fieldName}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-red-700 bg-red-100 px-2 py-1 rounded text-xs">
                                        {formatFieldValue(key, oldValue)}
                                      </span>
                                      <span className="text-gray-500">→</span>
                                      <span className="text-green-700 bg-green-100 px-2 py-1 rounded text-xs">
                                        {formatFieldValue(key, newValue)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* For creation entries, show initial values */}
                        {entry.newValues && Object.keys(entry.newValues).length > 0 && 
                         (!entry.previousValues || Object.keys(entry.previousValues).length === 0) && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              {entry.action === MedicationHistoryAction.CREATED ? 'Initial Details:' : 'Details:'}
                            </p>
                            <div className="bg-blue-50 rounded p-3 space-y-1">
                              {Object.entries(entry.newValues).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium text-blue-800">{getFieldDisplayName(key)}:</span>{' '}
                                  <span className="text-gray-700">{formatFieldValue(key, value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No history available for this medication</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Discontinue Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDiscontinueConfirmOpen}
        onClose={handleCancelDiscontinue}
        onDelete={handleConfirmDiscontinue}
        title="Discontinue Medication"
        description="Are you sure you want to discontinue this medication"
        itemName={medicationToDiscontinue?.name}
        buttonLabel="Discontinue"
        buttonVariant="destructive"
      />
    </div>
  );
}
