"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Receipt, FileDown, Terminal, FileText } from "lucide-react";
import { format, subMonths } from "date-fns";
import { generateTransactionHistoryPDF } from "@/lib/admin-pdf-generator";

interface TransactionHistoryData {
  month: string;
  period: {
    start: string;
    end: string;
    isCurrentMonth: boolean;
  };
  summary: {
    totalTransactions: number;
    sessionBookings: {
      count: number;
      totalAmount: number;
      totalCommission: number;
    };
    donations: {
      count: number;
      totalAmount: number;
    };
    refunds: {
      count: number;
      totalAmount: number;
      totalCommissionLoss: number;
    };
    netRevenue: number;
    netCommission: number;
  };
  transactions: Array<{
    id: string;
    date: string;
    transactionId: string;
    type: string;
    category: string;
    customerName: string;
    description: string;
    amount: number;
    commission: number;
    paymentMethod: string;
    status: string;
  }>;
}

export default function TransactionHistoryReport() {
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [report, setReport] = useState<TransactionHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

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
      const res = await fetch(`/api/admin/reports/transaction-history?month=${month}`);
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

    const filteredTransactions = filterCategory === "ALL" 
      ? report.transactions 
      : report.transactions.filter(t => t.category === filterCategory);

    const headers = ["Date", "Transaction ID", "Type", "Category", "Customer", "Description", "Amount (Rs.)", "Commission (Rs.)", "Payment Method", "Status"];
    const escapeCsvValue = (value: string | number | null | undefined) => {
      const stringValue = String(value ?? "");
      if (stringValue.includes(",")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvRows = [
      headers.join(","),
      ...filteredTransactions.map(tx => [
        escapeCsvValue(format(new Date(tx.date), "yyyy-MM-dd HH:mm:ss")),
        escapeCsvValue(tx.transactionId),
        escapeCsvValue(tx.type),
        escapeCsvValue(tx.category),
        escapeCsvValue(tx.customerName),
        escapeCsvValue(tx.description),
        escapeCsvValue(tx.amount.toFixed(2)),
        escapeCsvValue(tx.commission.toFixed(2)),
        escapeCsvValue(tx.paymentMethod),
        escapeCsvValue(tx.status),
      ].join(",")),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transaction-history-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  const handleDownloadPDF = () => {
    if (!report) return;

    try {
      const filteredTransactions = filterCategory === "ALL"
        ? report.transactions
        : report.transactions.filter(t => t.category === filterCategory);

      generateTransactionHistoryPDF({
        month: format(new Date(`${selectedMonth}-01`), "MMMM yyyy"),
        categoryFilter: filterCategory,
        summary: report.summary,
        transactions: filteredTransactions,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "THERAPY_SESSION": return "bg-blue-100 text-blue-800";
      case "DONATION": return "bg-green-100 text-green-800";
      case "REFUND": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTransactions = filterCategory === "ALL" 
    ? report?.transactions || []
    : report?.transactions.filter(t => t.category === filterCategory) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction History Report
          </CardTitle>
          <CardDescription>Complete transaction log including bookings, donations, and refunds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center flex-wrap">
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

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="THERAPY_SESSION">Therapy Sessions</SelectItem>
                <SelectItem value="DONATION">Donations</SelectItem>
                <SelectItem value="REFUND">Refunds</SelectItem>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Transactions</CardDescription>
                <CardTitle className="text-2xl">{report.summary.totalTransactions}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Session Bookings</CardDescription>
                <CardTitle className="text-2xl">{report.summary.sessionBookings.count}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(report.summary.sessionBookings.totalAmount)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Donations</CardDescription>
                <CardTitle className="text-2xl text-green-600">{report.summary.donations.count}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(report.summary.donations.totalAmount)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Refunds</CardDescription>
                <CardTitle className="text-2xl text-red-600">{report.summary.refunds.count}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(report.summary.refunds.totalAmount)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                Showing {filteredTransactions.length} of {report.transactions.length} transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="grid grid-cols-7 gap-4 p-3 bg-gray-50 border-b font-medium text-sm">
                    <div>Date</div>
                    <div>Category</div>
                    <div>Customer</div>
                    <div>Description</div>
                    <div>Payment Method</div>
                    <div className="text-right">Amount</div>
                    <div className="text-right">Commission</div>
                  </div>
                  {filteredTransactions.map(tx => (
                    <div key={tx.id} className="grid grid-cols-7 gap-4 p-3 border-b hover:bg-gray-50 text-sm">
                      <div className="text-xs">
                        <div>{format(new Date(tx.date), "MMM dd, yyyy")}</div>
                        <div className="text-muted-foreground">{format(new Date(tx.date), "HH:mm")}</div>
                      </div>
                      <div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryBadgeColor(tx.category)}`}>
                          {tx.type}
                        </span>
                      </div>
                      <div className="truncate" title={tx.customerName}>{tx.customerName}</div>
                      <div className="truncate" title={tx.description}>{tx.description}</div>
                      <div className="text-xs">{tx.paymentMethod}</div>
                      <div className={`text-right font-medium ${tx.amount < 0 ? "text-red-600" : ""}`}>
                        {formatCurrency(tx.amount)}
                      </div>
                      <div className={`text-right text-xs ${tx.commission < 0 ? "text-red-600" : ""}`}>
                        {formatCurrency(tx.commission)}
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

