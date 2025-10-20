"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, FileDown, Terminal, TrendingUp, Award, FileText } from "lucide-react";
import { format, subMonths } from "date-fns";

interface TherapistPerformanceData {
  month: string;
  period: {
    start: string;
    end: string;
    isCurrentMonth: boolean;
  };
  overallStats: {
    totalTherapists: number;
    activeTherapists: number;
    totalSessions: number;
    totalCompletedSessions: number;
    totalRevenue: number;
    totalPlatformCommission: number;
    totalTherapistEarnings: number;
    averageCompletionRate: number;
  };
  therapists: any[];
}

export default function TherapistPerformanceReport() {
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [report, setReport] = useState<TherapistPerformanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const months = [
      format(now, "yyyy-MM"),
      format(subMonths(now, 1), "yyyy-MM"),
      format(subMonths(now, 2), "yyyy-MM"),
    ];
    setAvailableMonths(months);
    setSelectedMonth(months[0]);
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      handleGenerateReport(selectedMonth);
    }
  }, [selectedMonth]);

  const handleGenerateReport = async (month: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports/therapist-performance?month=${month}`);
      if (!res.ok) throw new Error("Failed to generate report");
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!report) return;

    const headers = ["Therapist Name", "Email", "Total Sessions", "Completed", "Cancelled", "No-Show", "Refunded", "Unique Patients", "Completion Rate (%)", "Total Revenue (Rs.)", "Therapist Earnings (Rs.)", "Platform Commission (Rs.)"];
    const escapeCsvValue = (value: any) => {
      const stringValue = String(value ?? "");
      if (stringValue.includes(",")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvRows = [
      headers.join(","),
      ...report.therapists.map(t => [
        escapeCsvValue(t.therapistName),
        escapeCsvValue(t.therapistEmail),
        t.performance.totalSessions,
        t.performance.completedSessions,
        t.performance.cancelledSessions,
        t.performance.noShowSessions,
        t.performance.refundedSessions,
        t.performance.uniquePatients,
        t.performance.completionRate,
        t.revenue.totalRevenue,
        t.revenue.therapistEarnings,
        t.revenue.platformCommission,
      ].join(",")),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `therapist-performance-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  const handleDownloadPDF = () => {
    if (!report) return;
    
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Therapist Performance Report
          </CardTitle>
          <CardDescription>Track therapist session statistics and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map(month => (
                  <SelectItem key={month} value={month}>
                    {format(new Date(`${month}-01`), "MMMM yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadCSV}
                disabled={!report || loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                Download CSV
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={!report || loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && <div className="text-center py-10 text-muted-foreground">Loading report...</div>}
      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {report && !loading && (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Active Therapists</CardDescription>
                <CardTitle className="text-2xl">{report.overallStats.activeTherapists}/{report.overallStats.totalTherapists}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Sessions</CardDescription>
                <CardTitle className="text-2xl">{report.overallStats.totalSessions}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {report.overallStats.totalCompletedSessions} completed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Revenue</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(report.overallStats.totalRevenue)}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Avg Completion Rate</CardDescription>
                <CardTitle className="text-2xl">{report.overallStats.averageCompletionRate.toFixed(1)}%</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Therapist Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Therapist Performance</CardTitle>
              <CardDescription>Detailed metrics for each therapist</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.therapists.map((therapist, index) => (
                  <Card key={therapist.therapistId} className="border">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            {index === 0 && <Award className="h-5 w-5 text-yellow-500" />}
                            {therapist.therapistName}
                          </h3>
                          <p className="text-sm text-muted-foreground">{therapist.therapistEmail}</p>
                          <div className="flex gap-2 mt-2">
                            {therapist.specialization.map((spec: string) => (
                              <span key={spec} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(therapist.revenue.therapistEarnings)}
                          </div>
                          <div className="text-sm text-muted-foreground">Net Revenue</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Total Sessions</div>
                          <div className="text-lg font-semibold">{therapist.performance.totalSessions}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Completed</div>
                          <div className="text-lg font-semibold text-green-600">{therapist.performance.completedSessions}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Cancelled</div>
                          <div className="text-lg font-semibold text-red-600">{therapist.performance.cancelledSessions}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">No-Show</div>
                          <div className="text-lg font-semibold text-orange-600">{therapist.performance.noShowSessions}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Refunded</div>
                          <div className="text-lg font-semibold text-red-600">{therapist.performance.refundedSessions}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Unique Patients</div>
                          <div className="text-lg font-semibold">{therapist.performance.uniquePatients}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Completion Rate</div>
                          <div className="text-lg font-semibold">{therapist.performance.completionRate}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Platform Commission</div>
                          <div className="text-lg font-semibold text-blue-600">{formatCurrency(therapist.revenue.platformCommission)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

