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
  X,
  Check,
  Ban,
  RefreshCcw,
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

  const handleToggleReceipt = async (donationId: string) => {
    setActionLoading(donationId);
    try {
      const response = await fetch(
        `/api/admin/donations/${donationId}/receipt`,
        {
          method: "PATCH",
        }
      );
      const data = await response.json();

      if (data.success) {
        fetchDonations();
      }
    } catch (error) {
      console.error("Error toggling receipt:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVoid = async (donationId: string) => {
    if (!confirm("Are you sure you want to void this donation?")) return;

    setActionLoading(donationId);
    try {
      const response = await fetch(`/api/admin/donations/${donationId}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Admin voided" }),
      });
      const data = await response.json();

      if (data.success) {
        fetchDonations();
      } else {
        alert(data.error || "Failed to void donation");
      }
    } catch (error) {
      console.error("Error voiding donation:", error);
      alert("Failed to void donation");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (donationId: string) => {
    if (
      !confirm(
        "Are you sure you want to mark this donation as refunded? You must process the actual refund through PayHere dashboard."
      )
    )
      return;

    setActionLoading(donationId);
    try {
      const response = await fetch(`/api/admin/donations/${donationId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Admin refund request" }),
      });
      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchDonations();
      } else {
        alert(data.error || "Failed to refund donation");
      }
    } catch (error) {
      console.error("Error refunding donation:", error);
      alert("Failed to refund donation");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      COMPLETED: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
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
                            Message: "{donation.message}"
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
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleReceipt(donation.id)}
                          disabled={
                            actionLoading === donation.id ||
                            donation.paymentStatus !== "COMPLETED"
                          }
                          title={
                            donation.receiptSent
                              ? "Mark receipt as not sent"
                              : "Mark receipt as sent"
                          }
                        >
                          {actionLoading === donation.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : donation.receiptSent ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>

                        {donation.paymentStatus === "PENDING" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVoid(donation.id)}
                            disabled={actionLoading === donation.id}
                            title="Void donation"
                          >
                            {actionLoading === donation.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Ban className="w-4 h-4" />
                            )}
                          </Button>
                        )}

                        {donation.paymentStatus === "COMPLETED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefund(donation.id)}
                            disabled={actionLoading === donation.id}
                            title="Mark as refunded"
                          >
                            {actionLoading === donation.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCcw className="w-4 h-4" />
                            )}
                          </Button>
                        )}
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
