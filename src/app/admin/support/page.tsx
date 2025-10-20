"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Mail,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { SupportTicket } from "@/types/support";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [comment, setComment] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "ALL",
    dateFrom: "",
    dateTo: "",
    search: "",
  });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (filters.status && filters.status !== "ALL") params.append("status", filters.status);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/admin/support?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTickets(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching support tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleFilterApply = () => {
    setCurrentPage(1);
    fetchTickets();
  };

  const handleFilterClear = () => {
    setFilters({
      status: "ALL",
      dateFrom: "",
      dateTo: "",
      search: "",
    });
    setCurrentPage(1);
  };

  const handleViewDetails = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/admin/support/${ticketId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedTicket(data.data);
        setShowDetail(true);
      }
    } catch (error) {
      console.error("Error fetching ticket details:", error);
    }
  };

  const handleUpdateTicket = async (ticketId: string, updates: { status?: string; priority?: string }) => {
    setActionLoading(ticketId);
    try {
      const response = await fetch(`/api/admin/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to update");

      await fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(data.data);
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to update ticket");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !comment.trim()) return;

    setActionLoading("comment");
    try {
      const response = await fetch(`/api/admin/support/${selectedTicket.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: comment.trim(), isInternal: true }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to add comment");

      setComment("");
      handleViewDetails(selectedTicket.id);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to add comment");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      OPEN: { bg: "bg-blue-100", text: "text-blue-700", icon: <AlertCircle className="w-3 h-3" /> },
      IN_PROGRESS: { bg: "bg-yellow-100", text: "text-yellow-700", icon: <Clock className="w-3 h-3" /> },
      RESOLVED: { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
      CLOSED: { bg: "bg-gray-100", text: "text-gray-700", icon: <XCircle className="w-3 h-3" /> },
      PENDING_USER_RESPONSE: { bg: "bg-purple-100", text: "text-purple-700", icon: <MessageSquare className="w-3 h-3" /> },
    };

    const c = config[status] || { bg: "bg-gray-100", text: "text-gray-700", icon: null };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${c.bg} ${c.text}`}>
        {c.icon}
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      LOW: { bg: "bg-gray-100", text: "text-gray-600" },
      MEDIUM: { bg: "bg-blue-100", text: "text-blue-600" },
      HIGH: { bg: "bg-orange-100", text: "text-orange-600" },
      URGENT: { bg: "bg-red-100", text: "text-red-600" },
    };

    const c = config[priority] || { bg: "bg-gray-100", text: "text-gray-600" };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent tracking-tight mb-2">
            Support Tickets
          </h1>
          <p className="text-gray-600">
            Manage and respond to user support requests
          </p>
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? "Hide" : "Show"} Filters
        </Button>
      </div>

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
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="PENDING_USER_RESPONSE">Pending User Response</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              

              <div>
                <Label>Search</Label>
                <Input
                  type="text"
                  placeholder="Search in title/description"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              <div>
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>

              <div>
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {tickets.length} of {totalCount}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleFilterApply} className="bg-[#8159A8]">
                  Apply Filters
                </Button>
                <Button onClick={handleFilterClear} variant="outline">
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tickets ({totalCount} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#8159A8]" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No support tickets found.
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(ticket.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{ticket.title}</h3>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {ticket.email}
                          {ticket.userName && (
                            <>
                              <User className="w-4 h-4 ml-2" />
                              {ticket.userName}
                              {ticket.userRole && (
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                  {ticket.userRole}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(ticket.createdAt).toLocaleString()}
                        </div>
                        <p className="text-gray-700 mt-2 line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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

      {/* Ticket Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl pr-8">{selectedTicket.title}</DialogTitle>
                <DialogDescription>
                  Ticket ID: {selectedTicket.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex gap-4 flex-wrap">
                  <div>
                    <Label className="text-xs text-gray-500">Status</Label>
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(value) => handleUpdateTicket(selectedTicket.id, { status: value })}
                      disabled={actionLoading === selectedTicket.id}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="PENDING_USER_RESPONSE">Pending User Response</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Priority</Label>
                    <Select
                      value={selectedTicket.priority}
                      onValueChange={(value) => handleUpdateTicket(selectedTicket.id, { priority: value })}
                      disabled={actionLoading === selectedTicket.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">User Information</Label>
                  <div className="mt-1 space-y-1 text-sm">
                    <div>Email: {selectedTicket.email}</div>
                    {selectedTicket.userName && <div>Name: {selectedTicket.userName}</div>}
                    {selectedTicket.userRole && <div>Role: {selectedTicket.userRole}</div>}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Description</Label>
                  <div className="mt-1 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm">
                    {selectedTicket.description}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Timeline</Label>
                  <div className="mt-1 space-y-1 text-xs text-gray-600">
                    <div>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</div>
                    <div>Updated: {new Date(selectedTicket.updatedAt).toLocaleString()}</div>
                    {selectedTicket.resolvedAt && (
                      <div>Resolved: {new Date(selectedTicket.resolvedAt).toLocaleString()}</div>
                    )}
                  </div>
                </div>

                {selectedTicket.comments && selectedTicket.comments.length > 0 && (
                  <div>
                    <Label className="text-xs text-gray-500">Internal Notes ({selectedTicket.comments.length})</Label>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {selectedTicket.comments.map((c) => (
                        <div key={c.id} className="p-3 bg-blue-50 rounded-lg text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{c.user.name || c.user.email}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(c.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-gray-700">{c.comment}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label>Add Internal Note</Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a note for internal tracking..."
                    rows={3}
                    className="mt-1"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!comment.trim() || actionLoading === "comment"}
                    className="mt-2 bg-[#8159A8]"
                    size="sm"
                  >
                    {actionLoading === "comment" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Add Note"
                    )}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(`mailto:${selectedTicket.email}`, "_blank")}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email User
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDetail(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
