"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Pill, Info } from "lucide-react";

// import { Card, CardContent } from "@/components/ui/card";
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

  const prescribedByMap: Record<string, string> = {
    "med_1752302332890_mpkfcojbp": "Ravindi Fernando",
    "med_1752749318080_j04200vqs": "Dr. Nimal Perera",
    "med_1752750619121_9g1zjwo8x": "Dr. Nimal Perera"
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent tracking-tight mb-1">Medications for {childName}</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-2 mt-4">Active Medications</h2>
          {activeMeds.length === 0 ? <div className="mb-6">No active medications.</div> : (
            <div className="grid gap-6 mb-8">
              {activeMeds.map(med => (
                <div key={med.id} className="bg-white rounded-[16px] shadow p-6 border flex flex-col gap-4" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Pill style={{ color: 'var(--primary)' }} className="mr-1" size={22} />
                      <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>{med.name}</span>
                      <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-semibold" style={{ background: '#E6F4EA', color: '#388E3C' }}>Active</span>
                    </div>
                    <button
                      className="flex items-center gap-1 px-3 py-1 rounded border border-[var(--primary)] text-[var(--primary)] bg-white hover:bg-violet-50 text-sm font-medium transition"
                      style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                      onClick={() => {
                        setSelectedMed(med);
                        setHistoryOpen(true);
                        fetchHistory(med.id);
                      }}
                    >
                      <Info size={16} /> History
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6">
                    <div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>DOSAGE</div>
                      <div className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{med.dosage}</div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>FREQUENCY</div>
                      <div className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{med.frequency.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>MEAL TIMING</div>
                      <div className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{med.mealTiming.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>START DATE</div>
                      <div className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{new Date(med.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}</div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>END DATE</div>
                      <div className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{med.endDate ? new Date(med.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }) : '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>PRESCRIBED BY</div>
                      <div className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{prescribedByMap[med.id] || "-"}</div>
                    </div>
                  </div>
                  {med.instructions && (
                    <div className="rounded-lg p-3 flex items-start gap-2 mt-2" style={{ background: 'var(--muted)', borderRadius: '12px' }}>
                      <Info style={{ color: 'var(--primary)' }} className="mt-0.5" size={18} />
                      <div>
                        <span className="font-semibold text-sm" style={{ color: 'var(--primary)' }}>Instructions</span>
                        <div className="text-sm mt-1" style={{ color: 'var(--foreground)' }}>{med.instructions}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <h2 className="text-xl font-semibold mb-2">Discontinued Medications</h2>
          {discontinuedMeds.length === 0 ? <div>No discontinued medications.</div> : (
            <div className="grid gap-6">
              {discontinuedMeds.map(med => (
                <div key={med.id} className="bg-white rounded-[16px] shadow p-6 border flex flex-col gap-4" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Pill style={{ color: 'var(--primary)' }} className="mr-1" size={22} />
                      <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>{med.name}</span>
                      <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#F3F4F6', color: '#374151' }}>Discontinued</span>
                    </div>
                    <button
                      className="flex items-center gap-1 px-3 py-1 rounded border border-[var(--primary)] text-[var(--primary)] bg-white hover:bg-violet-50 text-sm font-medium transition"
                      style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                      onClick={() => {
                        setSelectedMed(med);
                        setHistoryOpen(true);
                        fetchHistory(med.id);
                      }}
                    >
                      <Info size={16} /> History
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6">
                    <div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>DOSAGE</div>
                      <div className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{med.dosage}</div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>FREQUENCY</div>
                      <div className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{med.frequency.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>MEAL TIMING</div>
                      <div className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{med.mealTiming.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>START DATE</div>
                      <div className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{new Date(med.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}</div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>END DATE</div>
                      <div className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{med.endDate ? new Date(med.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }) : '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>PRESCRIBED BY</div>
                      <div className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{prescribedByMap[med.id] || "-"}</div>
                    </div>
                  </div>
                  {med.instructions && (
                    <div className="rounded-lg p-3 flex items-start gap-2 mt-2" style={{ background: 'var(--muted)', borderRadius: '12px' }}>
                      <Info style={{ color: 'var(--primary)' }} className="mt-0.5" size={18} />
                      <div>
                        <span className="font-semibold text-sm" style={{ color: 'var(--primary)' }}>Instructions</span>
                        <div className="text-sm mt-1" style={{ color: 'var(--foreground)' }}>{med.instructions}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="medication-history-modal max-w-lg" style={{ maxHeight: '70vh', width: '100%', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle>
              <span className="font-semibold text-lg flex items-center gap-2">
                <span className="mr-2">Medication History</span>
                <span className="text-primary">- {selectedMed?.name}</span>
              </span>
            </DialogTitle>
          </DialogHeader>
          {historyLoading ? (
            <div>Loading...</div>
          ) : (
            <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
              {!selectedMed || !medHistory[selectedMed.id] || medHistory[selectedMed.id].length === 0 ? (
                <div className="medication-history-table-empty">No history found.</div>
              ) : (
                <div className="flex flex-col gap-5">
                  {medHistory[selectedMed.id].map(h => {
                    // Parse previous/updated JSON
                    let prev: Record<string, unknown> = {};
                    let upd: Record<string, unknown> = {};
                    try { prev = h.previousValues ? JSON.parse(h.previousValues) : {}; } catch {}
                    try { upd = h.newValues ? JSON.parse(h.newValues) : {}; } catch {}
                    // Find changed fields
                    const changedFields = Object.keys({...prev, ...upd});
                    const actionColor = h.action === 'CREATED' ? 'text-green-600' : 
                                      h.action === 'UPDATED' ? 'text-blue-600' : 
                                      h.action === 'DISCONTINUED' ? 'text-red-600' : 'text-primary';
                    
                    return (
                      <div key={h.id} className="rounded-xl bg-[var(--muted)] p-5 shadow-sm border border-[var(--border)]">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-semibold ${actionColor}`}>{h.action}</span>
                          <span className="text-xs text-[var(--muted-foreground)]">{new Date(h.changedAt).toLocaleString()}</span>
                          <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="inline-block mr-1">
                              <path d="M12 8v4l2 2"/>
                            </svg>
                            {selectedMed ? prescribedByMap[selectedMed.id] : "-"}
                          </span>
                        </div>
                        {(h.notes || h.reason) && (
                          <div className="mb-2">
                            <span className="block text-xs font-semibold text-[var(--muted-foreground)]">Notes:</span>
                            <span className="block text-sm bg-[var(--card)] rounded px-2 py-1 mt-1">{h.notes || h.reason}</span>
                          </div>
                        )}
                        {changedFields.length > 0 && h.action !== 'CREATED' && (
                          <div className="mt-2">
                            <span className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">What Changed:</span>
                            <div className="flex flex-col gap-2">
                              {changedFields.map(field => (
                                <div key={field} className="flex items-center gap-3">
                                  <span className="font-semibold text-[var(--primary)] text-sm min-w-[120px]">
                                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold">
                                      {prev[field] !== undefined && prev[field] !== null && prev[field] !== ''
                                        ? String(prev[field])
                                        : 'Not set'}
                                    </span>
                                    <span className="mx-1 text-[var(--muted-foreground)]">→</span>
                                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">
                                      {upd[field] !== undefined && upd[field] !== null && upd[field] !== ''
                                        ? String(upd[field])
                                        : 'Not set'}
                                    </span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
