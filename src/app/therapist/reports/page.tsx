"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  FileBarChart,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { generateTherapistReportPDF } from "@/lib/pdf-generator";

interface ReportSummary {
  totalSessions: number;
  completedSessions: number;
  scheduledSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  paidSessions: number;
  freeSessions: number;
  totalIncome: string;
  noShowRate: string;
  cancellationRate: string;
}

interface ChartData {
  sessionStatusData: Array<{ status: string; count: number; color: string }>;
  paidVsFreeData: Array<{ type: string; count: number; color: string }>;
  sessionsByType: Array<{ type: string; count: number }>;
  monthlyIncomeData: Array<{ month: string; income: number; sessions: number }>;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
}

interface Session {
  id: string;
  patientName: string;
  patientId: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  bookedRate: number;
  therapistAmount: number;
  systemFeeOrRefund: number;
  breakdown: string;
  sessionNotes?: string | null;
  isPaid: boolean;
  hasRefund: boolean;
  refundPercentage: number;
}

interface ReportsData {
  summary: ReportSummary;
  charts: ChartData;
  patients: Patient[];
  sessions: Session[];
}

export default function TherapistReportsPage() {
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [therapistName, setTherapistName] = useState<string>("");

  // Filter states
  const [filterType, setFilterType] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("all");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        filterType,
      });

      if (filterType === "custom") {
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
      }

      if (selectedPatientId && selectedPatientId !== "all") {
        params.append("patientId", selectedPatientId);
      }

      const response = await fetch(`/api/therapist/reports?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setReportsData(data);
      } else {
        console.error("Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch therapist name
  useEffect(() => {
    const fetchTherapistName = async () => {
      try {
        const response = await fetch("/api/therapist/profile");
        if (response.ok) {
          const data = await response.json();
          setTherapistName(`${data.firstName || ""} ${data.lastName || ""}`.trim() || "Therapist");
        }
      } catch (error) {
        console.error("Error fetching therapist name:", error);
        setTherapistName("Therapist");
      }
    };
    fetchTherapistName();
  }, []);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => {
    fetchReports();
  };

  const handleResetFilters = () => {
    setFilterType("monthly");
    setStartDate("");
    setEndDate("");
    setSelectedPatientId("all");
    setTimeout(() => fetchReports(), 100);
  };

  const exportToCSV = () => {
    if (!reportsData) return;
    
    setExporting(true);
    try {
      // Prepare CSV content
      const csvRows = [];
      
      // Add header
      csvRows.push("Patient Name,Date,Time,Duration (min),Type,Status,Rate (LKR),Paid");
      
      // Add data rows
      reportsData.sessions.forEach((session) => {
        const date = new Date(session.scheduledAt).toLocaleDateString();
        const time = new Date(session.scheduledAt).toLocaleTimeString();
        csvRows.push(
          `"${session.patientName}","${date}","${time}",${session.duration},"${session.type}","${session.status}",${session.bookedRate},${session.isPaid ? "Yes" : "No"}`
        );
      });
      
      // Add summary at the end
      csvRows.push("");
      csvRows.push("SUMMARY");
      csvRows.push(`Total Sessions,${reportsData.summary.totalSessions}`);
      csvRows.push(`Completed Sessions,${reportsData.summary.completedSessions}`);
      csvRows.push(`Paid Sessions,${reportsData.summary.paidSessions}`);
      csvRows.push(`Free Sessions,${reportsData.summary.freeSessions}`);
      csvRows.push(`Total Income (LKR),${reportsData.summary.totalIncome}`);
      csvRows.push(`No-Show Rate,${reportsData.summary.noShowRate}%`);
      csvRows.push(`Cancellation Rate,${reportsData.summary.cancellationRate}%`);
      
      // Create blob and download
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `therapist-reports-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = () => {
    if (!reportsData) return;
    
    setExporting(true);
    try {
      // Determine date range string
      let dateRange = "All Time";
      if (filterType === "weekly") {
        dateRange = "Last 7 Days";
      } else if (filterType === "monthly") {
        dateRange = "Last 30 Days";
      } else if (filterType === "custom" && startDate && endDate) {
        dateRange = `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
      } else if (filterType === "custom" && startDate) {
        dateRange = `From ${new Date(startDate).toLocaleDateString()}`;
      } else if (filterType === "custom" && endDate) {
        dateRange = `Until ${new Date(endDate).toLocaleDateString()}`;
      }

      generateTherapistReportPDF({
        therapistName: therapistName || "Therapist",
        dateRange,
        summary: reportsData.summary,
        sessions: reportsData.sessions.filter(s => s.status !== "SCHEDULED" && s.status !== "APPROVED"),
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!reportsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
        <div className="text-center">
          <FileBarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No data available</h3>
          <p className="text-muted-foreground">Unable to load reports data.</p>
        </div>
      </div>
    );
  }

  const { summary, charts, patients } = reportsData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50/30">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-primary">Session Reports & Analytics</h1>
              <p className="text-muted-foreground mt-2">
                Track your sessions, income, and performance metrics
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={exportToCSV}
                disabled={exporting}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button
                onClick={exportToPDF}
                disabled={exporting}
                style={{ backgroundColor: "#8159A8" }}
                className="text-white hover:opacity-90 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Time Period Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Time Period</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="weekly">Last 7 Days</SelectItem>
                    <SelectItem value="monthly">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date (shown only for custom) */}
              {filterType === "custom" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              )}

              {/* End Date (shown only for custom) */}
              {filterType === "custom" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              )}

              {/* Patient Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Patient</label>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Patients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button onClick={handleApplyFilters} style={{ backgroundColor: "#8159A8" }} className="text-white">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
              <Button onClick={handleResetFilters} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Sessions */}
          <Card className="bg-primary-foreground p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between min-w-[200px]">
            <div className="text-left">
              <div className="text-3xl font-bold text-[#8159A8]">
                {summary.totalSessions}
              </div>
              <div className="text-gray-500 text-sm">Total Sessions</div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <Calendar className="w-10 h-10 text-[#8159A8]" />
            </div>
          </Card>

          {/* Total Income */}
          <Card className="bg-primary-foreground p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between min-w-[200px]">
            <div className="text-left">
              <div className="text-3xl font-bold text-[#8159A8]">
                LKR {parseFloat(summary.totalIncome).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-gray-500 text-sm">Total Income Earned</div>
              <div className="text-white/70 text-xs mt-1">After all deductions</div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <DollarSign className="w-10 h-10 text-[#8159A8]" />
            </div>
          </Card>

          {/* No-Show Rate */}
          <Card className="bg-primary-foreground p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between min-w-[200px]">
            <div className="text-left">
              <div className="text-3xl font-bold text-[#8159A8]">
                {summary.noShowRate}%
              </div>
              <div className="text-gray-500 text-sm">No-Show Rate</div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <XCircle className="w-10 h-10 text-[#8159A8]" />
            </div>
          </Card>

          {/* Cancellation Rate */}
          <Card className="bg-primary-foreground p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between min-w-[200px]">
            <div className="text-left">
              <div className="text-3xl font-bold text-[#8159A8]">
                {summary.cancellationRate}%
              </div>
              <div className="text-gray-500 text-sm">Cancellation Rate</div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <Clock className="w-10 h-10 text-[#8159A8]" />
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income Trends</TabsTrigger>
            <TabsTrigger value="sessions">Session Details</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Session Status Chart */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Session Status Distribution</CardTitle>
                  <CardDescription>Breakdown of sessions by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={charts.sessionStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props) => {
                          const entry = props as unknown as { status: string; count: number; percent: number };
                          return entry.count > 0 ? `${entry.status}: ${(entry.percent * 100).toFixed(0)}%` : "";
                        }}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {charts.sessionStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Paid vs Free Chart */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Paid vs Free Sessions</CardTitle>
                  <CardDescription>Distribution of paid and free sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={charts.paidVsFreeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8159A8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Session Types Chart */}
              {charts.sessionsByType.length > 0 && (
                <Card className="shadow-sm lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Sessions by Type</CardTitle>
                    <CardDescription>Breakdown of sessions by therapy type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={charts.sessionsByType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8159A8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Income Trends Tab */}
          <TabsContent value="income" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Monthly Income Trends</CardTitle>
                <CardDescription>Income and session count over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={charts.monthlyIncomeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="income"
                      stroke="#8159A8"
                      strokeWidth={2}
                      name="Income (LKR)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="sessions"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Completed Sessions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Income Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-primary-foreground border shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Paid Sessions</p>
                      <p className="text-3xl font-bold text-[#8159A8]">{summary.paidSessions}</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-[#8159A8]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary-foreground border shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Free Sessions</p>
                      <p className="text-3xl font-bold text-[#8159A8]">{summary.freeSessions}</p>
                    </div>
                    <Users className="h-10 w-10 text-[#8159A8]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary-foreground border shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Avg Income/Session</p>
                      <p className="text-3xl font-bold text-[#8159A8]">
                        {summary.paidSessions > 0
                          ? (parseFloat(summary.totalIncome) / summary.paidSessions).toFixed(0)
                          : "0"}
                      </p>
                    </div>
                    <DollarSign className="h-10 w-10 text-[#8159A8]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Income Calculation Info */}
            <Card className="shadow-sm bg-purple-50/50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#8159A8] mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-1">Income Calculation:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Completed sessions: You receive 90% of the booked rate (10% system commission)</li>
                      <li>Cancelled (Less than 24 hours): You receive 30% of the original amount</li>
                      <li>Cancelled (Prior to 24 hours): No income earned</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Session Details Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Detailed income breakdown for {reportsData.sessions.filter(s => s.status !== "SCHEDULED" && s.status !== "APPROVED").length} processed sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-semibold text-gray-700 w-8"></th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Patient</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Date & Time</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Type</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Duration</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Amount Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsData.sessions.filter(s => s.status !== "SCHEDULED" && s.status !== "APPROVED").length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-gray-500">
                            No completed or processed sessions found for the selected filters
                          </td>
                        </tr>
                      ) : (
                        reportsData.sessions
                          .filter(session => session.status !== "SCHEDULED" && session.status !== "APPROVED")
                          .map((session) => (
                          <>
                            <tr 
                              key={session.id} 
                              className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                            >
                              <td className="p-3">
                                {expandedSessionId === session.id ? (
                                  <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                              </td>
                              <td className="p-3 text-sm">{session.patientName}</td>
                              <td className="p-3 text-sm">
                                {new Date(session.scheduledAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}{" "}
                                at{" "}
                                {new Date(session.scheduledAt).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td className="p-3 text-sm capitalize">{session.type}</td>
                              <td className="p-3 text-sm">{session.duration} min</td>
                              <td className="p-3">
                                <Badge
                                  variant={
                                    session.status === "COMPLETED"
                                      ? "default"
                                      : session.status === "CANCELLED"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {session.status}
                                </Badge>
                              </td>
                              <td className="p-3 text-sm text-right font-medium">
                                {session.therapistAmount > 0 ? (
                                  <span className="text-emerald-600">
                                    LKR {session.therapistAmount.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">
                                    LKR 0.00
                                  </span>
                                )}
                              </td>
                            </tr>
                            {expandedSessionId === session.id && (
                              <tr className="bg-purple-50/50 border-b">
                                <td colSpan={7} className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                      <Info className="w-5 h-5 text-[#8159A8] mt-0.5" />
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-sm text-gray-800 mb-2">
                                          Income Breakdown
                                        </h4>
                                        {session.breakdown ? (
                                          <div className="bg-white p-3 rounded-md border border-purple-200 space-y-2">
                                            {(session.status === "COMPLETED" || session.status === "NO_SHOW") && (
                                              <>
                                                <div className="flex justify-between text-sm">
                                                  <span className="text-gray-600">Total Session Amount:</span>
                                                  <span className="font-medium">
                                                    LKR {session.bookedRate.toFixed(2)}
                                                  </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                  <span className="text-gray-600">System Commission (10%):</span>
                                                  <span className="font-medium text-red-600">
                                                    - LKR {session.systemFeeOrRefund.toFixed(2)}
                                                  </span>
                                                </div>
                                                <div className="border-t pt-2 flex justify-between text-sm">
                                                  <span className="font-semibold text-gray-800">Your Share (90%):</span>
                                                  <span className="font-bold text-emerald-600">
                                                    LKR {session.therapistAmount.toFixed(2)}
                                                  </span>
                                                </div>
                                              </>
                                            )}
                                            {session.status === "CANCELLED" && session.hasRefund && (
                                              <>
                                                <div className="flex justify-between text-sm">
                                                  <span className="text-gray-600">Original Amount:</span>
                                                  <span className="font-medium">
                                                    LKR {(session.systemFeeOrRefund + session.therapistAmount).toFixed(2)}
                                                  </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                  <span className="text-gray-600">
                                                    Refund to Patient ({session.refundPercentage}%):
                                                  </span>
                                                  <span className="font-medium text-red-600">
                                                    - LKR {session.systemFeeOrRefund.toFixed(2)}
                                                  </span>
                                                </div>
                                                <div className="border-t pt-2 flex justify-between text-sm">
                                                  <span className="font-semibold text-gray-800">
                                                    Your Share ({session.refundPercentage === 60 ? "30%" : "0%"}):
                                                  </span>
                                                  <span className={`font-bold ${session.therapistAmount > 0 ? "text-emerald-600" : "text-gray-500"}`}>
                                                    LKR {session.therapistAmount.toFixed(2)}
                                                  </span>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        ) : (
                                          <p className="text-sm text-gray-500 italic">
                                            No income generated from this session
                                          </p>
                                        )}
                                        
                                        {session.sessionNotes && (
                                          <div className="mt-3">
                                            <h5 className="font-semibold text-sm text-gray-800 mb-1">
                                              Session Notes:
                                            </h5>
                                            <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                                              {session.sessionNotes}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
