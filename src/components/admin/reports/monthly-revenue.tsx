"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DollarSign, FileDown, Terminal, FileText } from "lucide-react";
import { format, subMonths } from "date-fns";

interface MonthlyRevenueData {
  month: string;
  period: {
    start: string;
    end: string;
    isCurrentMonth: boolean;
  };
  summary: {
    totalRevenue: number;
    therapyRevenue: number;
    donationRevenue: number;
    totalCommission: number;
    netRevenue: number;
    transactionCount: number;
  };
  breakdown: {
    bookedSessions: number;
    scheduledSessions: number;
    completedSessions: number;
    refundedSessions: number;
    donations: number;
  };
  transactions: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    amount: number;
    commission: number;
    status: string;
    isRefunded: boolean;
  }>;
}

export default function MonthlyRevenueReport() {
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [report, setReport] = useState<MonthlyRevenueData | null>(null);
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
      const res = await fetch(`/api/admin/reports/monthly-revenue?month=${month}`);
      if (!res.ok) throw new Error("Failed to generate report");
      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!report) return;

    const headers = ["Date", "Type", "Description", "Amount (Rs.)", "Commission (Rs.)", "Status"];
    const escapeCsvValue = (value: string | number | null | undefined) => {
      const stringValue = String(value ?? "");
      if (stringValue.includes(",")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvRows = [
      headers.join(","),
      ...report.transactions.map(tx => [
        escapeCsvValue(format(new Date(tx.date), "yyyy-MM-dd")),
        escapeCsvValue(tx.type),
        escapeCsvValue(tx.description),
        escapeCsvValue(tx.amount.toFixed(2)),
        escapeCsvValue(tx.commission.toFixed(2)),
        escapeCsvValue(tx.status),
      ].join(",")),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `monthly-revenue-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!report) return;
    
    window.print();
  };

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header with Month Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Monthly Revenue Report
          </CardTitle>
          <CardDescription>Select a month to view detailed revenue breakdown</CardDescription>
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Revenue</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(report.summary.totalRevenue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {report.summary.transactionCount} transactions
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Platform Commission (10%)</CardDescription>
                <CardTitle className="text-2xl text-green-600">{formatCurrency(report.summary.totalCommission)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  From {report.breakdown.bookedSessions} booked sessions (Scheduled + Completed)
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {report.breakdown.scheduledSessions} scheduled, {report.breakdown.completedSessions} completed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Donation Revenue</CardDescription>
                <CardTitle className="text-2xl text-blue-600">{formatCurrency(report.summary.donationRevenue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  From {report.breakdown.donations} donations
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Transactions</CardTitle>
              <CardDescription>All revenue transactions for {format(new Date(`${selectedMonth}-01`), "MMMM yyyy")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="grid grid-cols-6 gap-4 p-3 bg-gray-50 border-b font-medium text-sm">
                    <div>Date</div>
                    <div>Type</div>
                    <div>Description</div>
                    <div>Status</div>
                    <div className="text-right">Amount</div>
                    <div className="text-right">Commission</div>
                  </div>
                  {report.transactions.map(tx => (
                    <div key={tx.id} className="grid grid-cols-6 gap-4 p-3 border-b hover:bg-gray-50 text-sm">
                      <div>{format(new Date(tx.date), "MMM dd, yyyy")}</div>
                      <div><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{tx.type}</span></div>
                      <div className="truncate" title={tx.description}>{tx.description}</div>
                      <div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          tx.isRefunded ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                      <div className={`text-right font-medium ${tx.isRefunded ? "text-red-600" : ""}`}>
                        {tx.isRefunded && "-"}{formatCurrency(Math.abs(tx.amount))}
                      </div>
                      <div className={`text-right ${tx.isRefunded ? "text-red-600" : ""}`}>
                        {tx.isRefunded && "-"}{formatCurrency(Math.abs(tx.commission))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
