"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Donation {
  id: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string | null;
  donorName: string | null;
  donorEmail: string | null;
  donorPhone: string | null;
  isAnonymous: boolean;
  message: string | null;
  receiptSent: boolean;
  receiptSentAt: string | null;
  payHereOrderId: string | null;
  payHerePaymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [edited, setEdited] = useState<Record<string, { status: string; receiptSent: boolean }>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
    donorEmail: "",
    donorName: "",
    minAmount: "",
    maxAmount: "",
    anonymousOnly: false,
  });

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      // Add filters
      if (filters.status) params.append("status", filters.status);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      if (filters.donorEmail) params.append("donorEmail", filters.donorEmail);
      if (filters.donorName) params.append("donorName", filters.donorName);
      if (filters.minAmount) params.append("minAmount", filters.minAmount);
      if (filters.maxAmount) params.append("maxAmount", filters.maxAmount);
      if (filters.anonymousOnly) params.append("anonymousOnly", "true");

      const response = await fetch(`/api/admin/donations?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setDonations(data.data);
        const nextEdited: Record<string, { status: string; receiptSent: boolean }> = {};
        (data.data as Donation[]).forEach((d) => {
          nextEdited[d.id] = { status: d.paymentStatus, receiptSent: d.receiptSent };
        });
        setEdited(nextEdited);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleFilterApply = () => {
    setCurrentPage(1);
    fetchDonations();
  };

  const handleFilterClear = () => {
    setFilters({
      status: "",
      dateFrom: "",
      dateTo: "",
      donorEmail: "",
      donorName: "",
      minAmount: "",
      maxAmount: "",
      anonymousOnly: false,
    });
    setCurrentPage(1);
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      if (filters.donorEmail) params.append("donorEmail", filters.donorEmail);
      if (filters.donorName) params.append("donorName", filters.donorName);
      if (filters.minAmount) params.append("minAmount", filters.minAmount);
      if (filters.maxAmount) params.append("maxAmount", filters.maxAmount);
      if (filters.anonymousOnly) params.append("anonymousOnly", "true");

      const response = await fetch(
        `/api/admin/donations/export?${params.toString()}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donations_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  const handleSaveRow = async (donation: Donation) => {
    const row = edited[donation.id];
    if (!row) return;

    setActionLoading(donation.id);
    try {
      // 1) Status change
      if (row.status !== donation.paymentStatus) {
        const from = donation.paymentStatus;
        const to = row.status;

        if ((from === "PENDING" || from === "PROCESSING") && to === "COMPLETED") {
          const res = await fetch(`/api/admin/donations/${donation.id}/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ statusMessage: "Manually accepted", method: "manual" }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Failed to complete");
        } else if ((from === "PENDING" || from === "PROCESSING") && to === "CANCELLED") {
          const res = await fetch(`/api/admin/donations/${donation.id}/void`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: "Admin voided" }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Failed to void");
        } else if (from === "COMPLETED" && to === "REFUNDED") {
          const res = await fetch(`/api/admin/donations/${donation.id}/refund`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: "Admin refund" }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Failed to refund");
        } else if (to === from) {
          // no-op
        } else {
          alert(`Unsupported status change from ${from} to ${to}`);
        }
      }

      // 2) Receipt change (only valid for COMPLETED)
      if (donation.paymentStatus === "COMPLETED" || edited[donation.id].status === "COMPLETED") {
        if (row.receiptSent !== donation.receiptSent) {
          const res = await fetch(`/api/admin/donations/${donation.id}/receipt`, { method: "PATCH" });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Failed to toggle receipt");
        }
      }

      await fetchDonations();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Failed to save changes");
    } finally {
      setActionLoading(null);
    }
  };

  const getAllowedTargets = (status: string) => {
    if (status === "PENDING" || status === "PROCESSING") return ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];
    if (status === "COMPLETED") return ["COMPLETED", "REFUNDED"];
    if (status === "CANCELLED" || status === "REFUNDED") return [status];
    return [status];
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      COMPLETED: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
      PROCESSING: { bg: "bg-amber-100", text: "text-amber-700", label: "Processing" },
      FAILED: { bg: "bg-red-100", text: "text-red-700", label: "Failed" },
      CANCELLED: { bg: "bg-gray-100", text: "text-gray-700", label: "Cancelled" },
      REFUNDED: { bg: "bg-purple-100", text: "text-purple-700", label: "Refunded" },
    };

    const config = statusConfig[status] || {
      bg: "bg-gray-100",
      text: "text-gray-700",
      label: status,
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent tracking-tight mb-2">
            Donation Management
          </h1>
          <p className="text-gray-600">
            View, filter, and manage all donations received through the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
          <Button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-[#8159A8] hover:bg-[#8159A8]/90"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Donor Email</Label>
                <Input
                  type="text"
                  placeholder="Search by email"
                  value={filters.donorEmail}
                  onChange={(e) =>
                    setFilters({ ...filters, donorEmail: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Donor Name</Label>
                <Input
                  type="text"
                  placeholder="Search by name"
                  value={filters.donorName}
                  onChange={(e) =>
                    setFilters({ ...filters, donorName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Min Amount (LKR)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, minAmount: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Max Amount (LKR)</Label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={filters.maxAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, maxAmount: e.target.value })
                  }
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.anonymousOnly}
                    onChange={(e) =>
                      setFilters({ ...filters, anonymousOnly: e.target.checked })
                    }
                    className="w-4 h-4 text-[#8159A8] rounded"
                  />
                  <span className="text-sm">Anonymous only</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleFilterApply} className="bg-[#8159A8]">
                Apply Filters
              </Button>
              <Button onClick={handleFilterClear} variant="outline">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Donations ({totalCount} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#8159A8]" />
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No donations found matching your filters.
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {donation.donorName || "Anonymous"}
                        </h3>
                        {getStatusBadge(donation.paymentStatus)}
                        {donation.receiptSent && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            Receipt Sent
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {donation.donorEmail && (
                          <div>Email: {donation.donorEmail}</div>
                        )}
                        {donation.donorPhone && (
                          <div>Phone: {donation.donorPhone}</div>
                        )}
                        {donation.message && (
                          <div className="italic mt-2">
                            Message: &quot;{donation.message}&quot;
                          </div>
                        )}
                        <div>
                          Date: {new Date(donation.createdAt).toLocaleString()}
                        </div>
                        {donation.payHerePaymentId && (
                          <div className="text-xs">
                            PayHere ID: {donation.payHerePaymentId}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#8159A8] mb-2">
                        LKR {donation.amount.toLocaleString()}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Select
                            value={edited[donation.id]?.status || donation.paymentStatus}
                            onValueChange={(value) =>
                              setEdited((prev) => ({
                                ...prev,
                                [donation.id]: {
                                  status: value,
                                  receiptSent: prev[donation.id]?.receiptSent ?? donation.receiptSent,
                                },
                              }))
                            }
                          >
                            <SelectTrigger className="w-44">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getAllowedTargets(donation.paymentStatus).map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {((donation.paymentStatus === "COMPLETED") || (edited[donation.id]?.status === "COMPLETED")) && (
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={edited[donation.id]?.receiptSent ?? donation.receiptSent}
                                onChange={(e) =>
                                  setEdited((prev) => ({
                                    ...prev,
                                    [donation.id]: {
                                      status: prev[donation.id]?.status ?? donation.paymentStatus,
                                      receiptSent: e.target.checked,
                                    },
                                  }))
                                }
                              />
                              Receipt sent
                            </label>
                          )}

                          <Button
                            size="sm"
                            className="bg-[#8159A8] hover:bg-[#8159A8]/90 text-white"
                            onClick={() => handleSaveRow(donation)}
                            disabled={actionLoading === donation.id}
                          >
                            {actionLoading === donation.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>Save</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
