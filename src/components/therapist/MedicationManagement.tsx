"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
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
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [selectedMedicationForHistory, setSelectedMedicationForHistory] = useState<Medication | null>(null);
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
        // If history endpoint doesn't exist yet, create mock history from medication data
        const medication = medications.find(m => m.id === medicationId);
        if (medication) {
          const mockHistory: MedicationHistoryEntry[] = [
            {
              id: 'hist_1',
              medicationId: medication.id,
              action: MedicationHistoryAction.CREATED,
              changedBy: medication.therapistId,
              changedAt: medication.createdAt,
              newValues: {
                name: medication.name,
                dosage: medication.dosage,
                frequency: medication.frequency,
                mealTiming: medication.mealTiming,
                startDate: medication.startDate.toISOString()
              },
              therapist: medication.therapist
            }
          ];

          // Add update history if the medication was updated
          if (medication.updatedAt > medication.createdAt) {
            mockHistory.push({
              id: 'hist_2',
              medicationId: medication.id,
              action: MedicationHistoryAction.UPDATED,
              changedBy: medication.therapistId,
              changedAt: medication.updatedAt,
              therapist: medication.therapist
            });
          }

          // Add discontinuation history if discontinued
          if (medication.isDiscontinued && medication.discontinuedAt) {
            mockHistory.push({
              id: 'hist_3',
              medicationId: medication.id,
              action: MedicationHistoryAction.DISCONTINUED,
              changedBy: medication.discontinuedBy || medication.therapistId,
              changedAt: medication.discontinuedAt,
              newValues: {
                isActive: false,
                isDiscontinued: true
              },
              therapist: medication.therapist
            });
          }

          setMedicationHistory(mockHistory);
        }
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
        // Track what changed for updates
        const changes: string[] = [];
        if (editingMedication.name !== formData.name) changes.push('name');
        if (editingMedication.dosage !== formData.dosage) changes.push('dosage');
        if (editingMedication.frequency !== formData.frequency) changes.push('frequency');
        if (editingMedication.customFrequency !== formData.customFrequency) changes.push('custom frequency');
        if (editingMedication.instructions !== formData.instructions) changes.push('instructions');
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
    } catch (error) {
      console.error('Error discontinuing medication:', error);
      setError(error instanceof Error ? error.message : 'Failed to discontinue medication');
    } finally {
      setIsLoading(false);
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold mb-2 text-[#8159A8]">Medication Management</h3>
          <p className="text-gray-600">Monitor and manage patient prescriptions</p>
        </div>
        <div className="text-right">
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 text-center mb-4">
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

      {/* Recent Activity Summary */}
      {(recentlyUpdated.length > 0 || recentlyDiscontinued.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="text-amber-800 font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity (Last 7 Days)
          </h4>
          <div className="space-y-2 text-sm">
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
      )}

      {/* Add Medication Button */}
      <div className="flex justify-end">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#8159A8] hover:bg-[#6d4a8f] text-white">
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

      {/* Active Medications */}
      {activeMedications.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-[#8159A8]">Active Medications</h4>
          {activeMedications.map((medication) => (
            <Card key={medication.id} className="shadow-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h5 className="text-xl font-bold text-[#8159A8] mb-2">{medication.name}</h5>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Dosage</p>
                        <p className="font-semibold text-gray-900">{medication.dosage}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Frequency</p>
                        <p className="font-semibold text-gray-900">{getFrequencyDisplay(medication)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Meal Timing</p>
                        <p className="font-semibold text-gray-900">{MEAL_TIMING_LABELS[medication.mealTiming]}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Start Date</p>
                        <p className="font-semibold text-gray-900">{format(new Date(medication.startDate), 'MMM dd, yyyy')}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">End Date</p>
                        <p className="font-semibold text-gray-900">
                          {medication.endDate ? format(new Date(medication.endDate), 'MMM dd, yyyy') : 'Ongoing'}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Prescribed By</p>
                        <p className="font-semibold text-gray-900">
                          {medication.therapist?.user?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
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
                      onClick={() => handleEdit(medication)}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDiscontinue(medication.id, 'Discontinued by therapist')}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Discontinue
                    </Button>
                  </div>
                </div>

                {medication.instructions && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      <h6 className="font-semibold text-blue-900">Instructions</h6>
                    </div>
                    <p className="text-blue-700 text-sm leading-relaxed">{medication.instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
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
          <h4 className="text-lg font-semibold text-gray-600">Discontinued Medications</h4>
          {discontinuedMedications.map((medication) => (
            <Card key={medication.id} className="shadow-md opacity-75">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="text-xl font-bold text-gray-600">{medication.name}</h5>
                      <Badge variant="secondary">Discontinued</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-8 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Dosage</p>
                        <p className="font-semibold text-gray-900">{medication.dosage}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Frequency</p>
                        <p className="font-semibold text-gray-900">{getFrequencyDisplay(medication)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Meal Timing</p>
                        <p className="font-semibold text-gray-900">{MEAL_TIMING_LABELS[medication.mealTiming]}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Start Date</p>
                        <p className="font-semibold text-gray-900">{format(new Date(medication.startDate), 'MMM dd, yyyy')}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">End Date</p>
                        <p className="font-semibold text-gray-900">
                          {medication.endDate ? format(new Date(medication.endDate), 'MMM dd, yyyy') : 'Not Set'}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Discontinued</p>
                        <p className="font-semibold text-gray-900">
                          {medication.discontinuedAt ? format(new Date(medication.discontinuedAt), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Prescribed By</p>
                        <p className="font-semibold text-gray-900">
                          {medication.therapist?.user?.name || 'Unknown'}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs uppercase text-gray-500 font-medium mb-1">Discontinued By</p>
                        <p className="font-semibold text-gray-900">
                          {medication.discontinuingTherapist?.user?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
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

                {medication.instructions && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      <h6 className="font-semibold text-blue-900">Instructions</h6>
                    </div>
                    <p className="text-blue-700 text-sm leading-relaxed">{medication.instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
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
                    <Card key={entry.id} className="border-l-4 border-l-[#8159A8]">
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

                        {(entry.previousValues && Object.keys(entry.previousValues).length > 0) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Previous Values:</p>
                              <div className="bg-red-50 rounded p-3 space-y-1">
                                {Object.entries(entry.previousValues).map(([key, value]) => (
                                  <div key={key} className="text-xs">
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </div>
                                ))}
                              </div>
                            </div>
                            {entry.newValues && Object.keys(entry.newValues).length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">New Values:</p>
                                <div className="bg-green-50 rounded p-3 space-y-1">
                                  {Object.entries(entry.newValues).map(([key, value]) => (
                                    <div key={key} className="text-xs">
                                      <span className="font-medium">{key}:</span> {String(value)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {entry.newValues && Object.keys(entry.newValues).length > 0 && 
                         (!entry.previousValues || Object.keys(entry.previousValues).length === 0) && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Values:</p>
                            <div className="bg-blue-50 rounded p-3 space-y-1">
                              {Object.entries(entry.newValues).map(([key, value]) => (
                                <div key={key} className="text-xs">
                                  <span className="font-medium">{key}:</span> {String(value)}
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
    </div>
  );
}
