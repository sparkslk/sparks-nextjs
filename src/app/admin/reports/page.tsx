"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Eye, FileText, Users, Receipt, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MonthlyRevenueReport from "@/components/admin/reports/monthly-revenue";
import TherapistPerformanceReport from "@/components/admin/reports/therapist-performance";
import TransactionHistoryReport from "@/components/admin/reports/transaction-history";

type ReportType = "monthly-revenue" | "therapist-performance" | "transaction-history" | null;

const FinancialDashboard: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    commission: 0,
    donations: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/reports?chart=revenueBreakdown");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const commission = data.find((item: { name: string; value: number }) => item.name === "Therapy Commissions")?.value || 0;
      const donations = data.find((item: { name: string; value: number }) => item.name === "Donations")?.value || 0;
      const totalRevenue = donations + commission;
      setStats({ totalRevenue, commission, donations });
    } catch {
      setStats({ totalRevenue: 0, commission: 0, donations: 0 });
    }
  };

  const handleViewReport = (reportType: ReportType) => {
    setActiveReport(reportType);
  };

  const handleCloseReport = () => {
    setActiveReport(null);
  };

  const reportCards = [
    {
      id: "monthly-revenue",
      title: "Monthly Revenue Report",
      description: "Detailed revenue breakdown including therapy sessions, donations, and refunds",
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      features: ["Session revenue tracking", "Donation statistics", "Refund calculations", "Commission breakdown (10%)"],
    },
    {
      id: "therapist-performance",
      title: "Therapist Performance",
      description: "Track session statistics, completion rates, and revenue per therapist",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      features: ["Session counts (scheduled, completed, cancelled, no-show)", "Patient engagement metrics", "Revenue and commission earned", "Completion rates"],
    },
    {
      id: "transaction-history",
      title: "Transaction History",
      description: "Complete transaction log with all bookings, donations, and refunds",
      icon: Receipt,
      color: "bg-purple-100 text-purple-600",
      features: ["All transaction types", "Payment method tracking", "Category filtering", "Detailed customer information"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent tracking-tight mb-2">
            Financial Reports
          </h1>
          <p className="text-gray-600">
            Generate comprehensive financial reports and track platform performance
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#8159A8]">
                Rs. {stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">All-time total revenue</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#8159A8]">
                Rs. {stats.commission.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalRevenue > 0 
                  ? ((stats.commission / stats.totalRevenue) * 100).toFixed(1) 
                  : 0}% of total revenue
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donations Received</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#8159A8]">
                Rs. {stats.donations.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalRevenue > 0 
                  ? ((stats.donations / stats.totalRevenue) * 100).toFixed(1) 
                  : 0}% of total revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reports Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-900">Available Reports</h2>
          </div>
          <p className="text-gray-600 mb-6">Select a report to view detailed analytics for the last 3 months</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reportCards.map((report) => {
              const IconComponent = report.icon;
              return (
                <Card key={report.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${report.color} flex items-center justify-center mb-4`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="mt-2">{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {report.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleViewReport(report.id as ReportType)}
                      className="w-full bg-[#8159A8] hover:bg-[#6B429B] flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Report
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Report Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Report Details</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Reports are available for the last 3 months</li>
                  <li>• Current month data includes transactions up to the current date</li>
                  <li>• All reports can be downloaded as CSV files</li>
                  <li>• Platform commission is calculated at 10% of therapy session revenue</li>
                  <li>• Refund percentages are based on cancellation timing (as per policy)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Dialogs */}
      <Dialog open={activeReport === "monthly-revenue"} onOpenChange={handleCloseReport}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Monthly Revenue Report</DialogTitle>
          </DialogHeader>
          <MonthlyRevenueReport />
        </DialogContent>
      </Dialog>

      <Dialog open={activeReport === "therapist-performance"} onOpenChange={handleCloseReport}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Therapist Performance Report</DialogTitle>
          </DialogHeader>
          <TherapistPerformanceReport />
        </DialogContent>
      </Dialog>

      <Dialog open={activeReport === "transaction-history"} onOpenChange={handleCloseReport}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction History Report</DialogTitle>
          </DialogHeader>
          <TransactionHistoryReport />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialDashboard;
