"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Pill, Info, Calendar, Clock, User, Stethoscope } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  mealTiming: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  isDiscontinued: boolean;
  instructions?: string;
  Therapist: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

interface MedicationHistory {
  id: string;
  medicationId: string;
  action: string;
  changedBy: string;
  changedAt: string;
  previousValues: string | null;
  newValues: string | null;
  reason?: string;
  notes?: string;
  medication: {
    Therapist: {
      user: {
        id: string;
        name: string;
        email: string;
      };
    };
  };
}



function MedicationsPageInner() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("childId") || "";
  const childName = searchParams.get("childName") || "";
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [medHistory, setMedHistory] = useState<Record<string, MedicationHistory[]>>({});
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchMedications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/parent/medications?patientId=${childId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch medications');
      }
      const data = await response.json();
      setMedications(data.medications);
      // Initialize history for each medication
      const historyData: Record<string, MedicationHistory[]> = {};
      if (data.history) {
        data.history.forEach((h: MedicationHistory) => {
          if (!historyData[h.medicationId]) {
            historyData[h.medicationId] = [];
          }
          historyData[h.medicationId].push(h);
        });
      }
      setMedHistory(historyData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch medications');
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const fetchHistory = async (medicationId: string) => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/parent/medications/history?medicationId=${medicationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch medication history');
      }
      const data = await response.json();
      const newHistory = data.history || [];
      setMedHistory(prev => ({
        ...prev,
        [medicationId]: [...(prev[medicationId] || []), ...newHistory]
      }));
      setHistoryLoading(false);
    } catch (err) {
      console.error('Error fetching history:', err);
      setHistoryLoading(false);
    }
  };

  const activeMeds = medications.filter(m => m.isActive && !m.isDiscontinued);
  const discontinuedMeds = medications.filter(m => m.isDiscontinued);

  // Helper function to get therapist name
  const getTherapistName = (medication: Medication) => {
    return medication.Therapist?.user?.name || "Unknown Therapist";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Medications for {childName}</h1>
          <p className="text-muted-foreground">
            Track and manage your child&apos;s medication history and prescriptions
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading medications...</span>
          </div>
        ) : error ? (
          <div className="text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20">
            {error}
          </div>
        ) : (
          <>
            {/* Active Medications Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Active Medications
              </h2>
              {activeMeds.length === 0 ? (
                <Card className="shadow-sm bg-muted/30">
                  <CardContent className="p-6 text-center">
                    <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No active medications</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {activeMeds.map(med => (
                    <Card key={med.id} className="shadow-sm hover:shadow-md transition-all duration-300 border border-green-200 bg-green-50/30">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Pill className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg font-bold text-foreground">{med.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Prescribed by {getTherapistName(med)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-green-100 text-green-800 font-medium">
                              Active
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-primary text-primary hover:bg-primary/10"
                              onClick={() => {
                                setSelectedMed(med);
                                setHistoryOpen(true);
                                fetchHistory(med.id);
                              }}
                            >
                              <Info className="w-4 h-4 mr-2" />
                              History
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                          <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-2">
                              <Pill className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Dosage</p>
                                <p className="text-sm font-medium">{med.dosage}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Frequency</p>
                                <p className="text-sm font-medium">{med.frequency.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Start Date</p>
                                <p className="text-sm font-medium">{new Date(med.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Meal Timing</p>
                                <p className="text-sm font-medium">{med.mealTiming.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Prescribed By</p>
                                <p className="text-sm font-medium">{getTherapistName(med)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {med.instructions && (
                          <div className="mt-4 p-3 bg-muted rounded-lg border">
                            <div className="flex items-start gap-2">
                              <Info className="w-4 h-4 text-primary mt-0.5" />
                              <div>
                                <p className="font-medium text-sm text-primary">Instructions</p>
                                <p className="text-sm text-foreground mt-1">{med.instructions}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Discontinued Medications Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                Discontinued Medications
              </h2>
              {discontinuedMeds.length === 0 ? (
                <Card className="shadow-sm bg-muted/30">
                  <CardContent className="p-6 text-center">
                    <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No discontinued medications</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {discontinuedMeds.map(med => (
                    <Card key={med.id} className="shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 bg-gray-50/30">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <Pill className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg font-bold text-foreground">{med.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Prescribed by {getTherapistName(med)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-gray-100 text-gray-800 font-medium">
                              Discontinued
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-primary text-primary hover:bg-primary/10"
                              onClick={() => {
                                setSelectedMed(med);
                                setHistoryOpen(true);
                                fetchHistory(med.id);
                              }}
                            >
                              <Info className="w-4 h-4 mr-2" />
                              History
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                          <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-2">
                              <Pill className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Dosage</p>
                                <p className="text-sm font-medium">{med.dosage}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Frequency</p>
                                <p className="text-sm font-medium">{med.frequency.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">End Date</p>
                                <p className="text-sm font-medium">{med.endDate ? new Date(med.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }) : 'Not specified'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Meal Timing</p>
                                <p className="text-sm font-medium">{med.mealTiming.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Prescribed By</p>
                                <p className="text-sm font-medium">{getTherapistName(med)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {med.instructions && (
                          <div className="mt-4 p-3 bg-muted rounded-lg border">
                            <div className="flex items-start gap-2">
                              <Info className="w-4 h-4 text-primary mt-0.5" />
                              <div>
                                <p className="font-medium text-sm text-primary">Instructions</p>
                                <p className="text-sm text-foreground mt-1">{med.instructions}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Pill className="w-5 h-5 text-primary" />
              Medication History - {selectedMed?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading history...</span>
              </div>
            ) : (
              <>
                {!selectedMed || !medHistory[selectedMed.id] || medHistory[selectedMed.id].length === 0 ? (
                  <Card className="shadow-sm bg-muted/30">
                    <CardContent className="p-6 text-center">
                      <Info className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No history found for this medication</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {medHistory[selectedMed.id].map(h => {
                      // Parse previous/updated JSON
                      let prev: Record<string, unknown> = {};
                      let upd: Record<string, unknown> = {};
                      try { prev = h.previousValues ? JSON.parse(h.previousValues) : {}; } catch { }
                      try { upd = h.newValues ? JSON.parse(h.newValues) : {}; } catch { }
                      // Find changed fields
                      const changedFields = Object.keys({ ...prev, ...upd });

                      const getActionColor = (action: string) => {
                        switch (action) {
                          case 'PRESCRIBED':
                            return 'bg-green-100 text-green-800';
                          case 'UPDATED':
                            return 'bg-blue-100 text-blue-800';
                          case 'DISCONTINUED':
                            return 'bg-red-100 text-red-800';
                          default:
                            return 'bg-gray-100 text-gray-800';
                        }
                      };

                      return (
                        <Card key={h.id} className="shadow-sm border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge className={getActionColor(h.action)}>
                                {h.action}
                              </Badge>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(h.changedAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(h.changedAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>

                            {h.changedBy && (
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Changed by: {h.medication?.Therapist?.user?.name || h.changedBy}
                                </span>
                              </div>
                            )}

                            {(h.notes || h.reason) && (
                              <div className="mb-3 p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium text-primary mb-1">Notes:</p>
                                <p className="text-sm text-foreground">{h.notes || h.reason}</p>
                              </div>
                            )}

                            {changedFields.length > 0 && h.action !== 'PRESCRIBED' && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-primary">Changes:</p>
                                <div className="space-y-2">
                                  {changedFields.map(field => (
                                    <div key={field} className="flex items-center gap-3 text-sm">
                                      <span className="font-medium text-foreground min-w-[100px]">
                                        {field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                          {prev[field] !== undefined && prev[field] !== null && prev[field] !== ''
                                            ? String(prev[field])
                                            : 'Not set'}
                                        </Badge>
                                        <span className="text-muted-foreground">→</span>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                          {upd[field] !== undefined && upd[field] !== null && upd[field] !== ''
                                            ? String(upd[field])
                                            : 'Not set'}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MedicationsPageWrapper() {
  return (
    <Suspense>
      <MedicationsPageInner />
    </Suspense>
  );
}

export default MedicationsPageWrapper;
