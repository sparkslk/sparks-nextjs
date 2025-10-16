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
  isPaid: boolean;
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
    setExporting(true);
    try {
      // Simple PDF export using window.print()
      window.print();
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
          <Card className="shadow-sm hover:shadow-md transition-all duration-300 border-0 bg-gradient-to-r from-blue-50/95 to-blue-100/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalSessions}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {summary.completedSessions} completed
                    </Badge>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4 p-3 bg-white/50 rounded-lg">
                  <Calendar className="h-8 w-8" style={{ color: "#8159A8" }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Income */}
          <Card className="shadow-sm hover:shadow-md transition-all duration-300 border-0 bg-gradient-to-r from-green-50/95 to-green-100/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Income</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    LKR {parseFloat(summary.totalIncome).toLocaleString()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {summary.paidSessions} paid sessions
                    </Badge>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4 p-3 bg-white/50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* No-Show Rate */}
          <Card className="shadow-sm hover:shadow-md transition-all duration-300 border-0 bg-gradient-to-r from-orange-50/95 to-orange-100/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">No-Show Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.noShowRate}%</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {summary.noShowSessions} sessions
                    </Badge>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4 p-3 bg-white/50 rounded-lg">
                  <XCircle className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Rate */}
          <Card className="shadow-sm hover:shadow-md transition-all duration-300 border-0 bg-gradient-to-r from-red-50/95 to-red-100/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Cancellation Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.cancellationRate}%</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {summary.cancelledSessions} cancelled
                    </Badge>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4 p-3 bg-white/50 rounded-lg">
                  <Clock className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
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
                        label={({ status, count, percent }: any) => 
                          count > 0 ? `${status}: ${(percent * 100).toFixed(0)}%` : ""
                        }
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
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Paid Sessions</p>
                      <p className="text-xl font-bold">{summary.paidSessions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Free Sessions</p>
                      <p className="text-xl font-bold">{summary.freeSessions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Income/Session</p>
                      <p className="text-xl font-bold">
                        LKR{" "}
                        {summary.paidSessions > 0
                          ? (parseFloat(summary.totalIncome) / summary.paidSessions).toFixed(2)
                          : "0.00"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Session Details Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>
                  Showing {reportsData.sessions.length} sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Patient</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Date & Time</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Type</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Duration</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Rate (LKR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsData.sessions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-gray-500">
                            No sessions found for the selected filters
                          </td>
                        </tr>
                      ) : (
                        reportsData.sessions.map((session) => (
                          <tr key={session.id} className="border-b hover:bg-gray-50">
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
                              {session.bookedRate > 0 ? (
                                <span className="text-green-600">
                                  {session.bookedRate.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-gray-400">Free</span>
                              )}
                            </td>
                          </tr>
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
