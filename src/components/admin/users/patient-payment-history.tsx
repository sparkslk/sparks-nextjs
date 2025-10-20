"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown, Calendar, DollarSign, Clock, CreditCard, ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";

interface PaymentHistoryData {
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    sessionId: string;
    sessionStatus: string;
    sessionScheduledAt: string;
    therapistName: string;
    type: "payment";
  }>;
  refunds: Array<{
    id: string;
    refundAmount: number;
    originalAmount: number;
    refundPercentage: number;
    refundStatus: string;
    createdAt: string;
    sessionId: string;
    hoursBeforeSession: number;
    cancelReason: string;
    therapistName: string;
    type: "refund";
  }>;
  allTransactions: Array<{
    id: string;
    createdAt: string;
    sessionId: string;
    therapistName: string;
    type: "payment" | "refund";
    // Payment fields
    amount?: number;
    status?: string;
    paymentMethod?: string;
    sessionStatus?: string;
    sessionScheduledAt?: string;
    // Refund fields
    refundAmount?: number;
    originalAmount?: number;
    refundPercentage?: number;
    refundStatus?: string;
    hoursBeforeSession?: number;
    cancelReason?: string;
  }>;
  summary: {
    totalPaid: number;
    totalRefunded: number;
    netAmount: number;
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
  };
}

interface PatientPaymentHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

export default function PatientPaymentHistory({
  isOpen,
  onClose,
  patientId,
  patientName,
}: PatientPaymentHistoryProps) {
  const [data, setData] = useState<PaymentHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPaymentHistory();
    }
  }, [isOpen, patientId]);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${patientId}/payment-history`);
      if (!response.ok) {
        throw new Error("Failed to fetch payment history");
      }
      const paymentData = await response.json();
      setData(paymentData);
    } catch (err: any) {
      setError(err.message || "Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!data) return;

    const headers = ["Date", "Type", "Description", "Amount (Rs.)", "Status", "Session ID"];
    const escapeCsvValue = (value: any) => {
      const stringValue = String(value ?? "");
      if (stringValue.includes(",")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvRows = [
      headers.join(","),
      ...data.allTransactions.map(transaction => {
        if (transaction.type === "payment") {
          return [
            escapeCsvValue(transaction.createdAt ? format(new Date(transaction.createdAt), "yyyy-MM-dd HH:mm") : "N/A"),
            escapeCsvValue("Payment"),
            escapeCsvValue(`Session Payment - ${transaction.therapistName} (${transaction.sessionStatus})`),
            escapeCsvValue(transaction.amount!.toFixed(2)),
            escapeCsvValue(transaction.status!),
            escapeCsvValue(transaction.sessionId),
          ].join(",");
        } else {
          return [
            escapeCsvValue(transaction.createdAt ? format(new Date(transaction.createdAt), "yyyy-MM-dd HH:mm") : "N/A"),
            escapeCsvValue("Refund"),
            escapeCsvValue(`Refund ${transaction.refundPercentage}% - Cancelled ${transaction.hoursBeforeSession!.toFixed(1)}hrs before`),
            escapeCsvValue(-transaction.refundAmount!.toFixed(2)),
            escapeCsvValue(transaction.refundStatus!),
            escapeCsvValue(transaction.sessionId),
          ].join(",");
        }
      }),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `payment-history-${patientName.replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <DollarSign className="h-5 w-5" /> */}
            Payment History - {patientName}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading payment history...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-600 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        )}

        {data && !loading && !error && (
          <div className="space-y-6">

            {/* Transaction History */}
            <div className="space-y-4">
              {/* <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3> */}
              
              {data.allTransactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  No transaction history found for this patient.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* All Transactions (sorted by date, latest first) */}
                  {data.allTransactions.map((transaction) => (
                    <Card 
                      key={transaction.id} 
                      className={`border-l-4 ${
                        transaction.type === "payment" 
                          ? "border-l-green-500" 
                          : "border-l-red-500"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.type === "payment" 
                                ? "bg-green-100" 
                                : "bg-red-100"
                            }`}>
                              {transaction.type === "payment" ? (
                                <CreditCard className="h-5 w-5 text-green-600" />
                              ) : (
                                <ArrowLeftRight className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {transaction.type === "payment" ? "Session Payment" : "Session Refund"}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {transaction.type === "payment" ? (
                                  `Therapist: ${transaction.therapistName}`
                                ) : (
                                  `${transaction.refundPercentage}% refund - Cancelled ${transaction.hoursBeforeSession!.toFixed(1)}hrs before session`
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                Session ID: {transaction.sessionId}
                              </p>
                              {transaction.type === "payment" && transaction.sessionStatus && (
                                <p className="text-xs text-gray-500">
                                  Status: {transaction.sessionStatus}
                                </p>
                              )}
                              {transaction.type === "refund" && transaction.cancelReason && (
                                <p className="text-xs text-gray-500">
                                  Reason: {transaction.cancelReason}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              transaction.type === "payment" 
                                ? "text-green-600" 
                                : "text-red-600"
                            }`}>
                              {transaction.type === "payment" 
                                ? formatCurrency(transaction.amount!)
                                : `-${formatCurrency(transaction.refundAmount!)}`
                              }
                            </div>
                            {transaction.type === "refund" && (
                              <div className="text-sm text-gray-600">
                                of {formatCurrency(transaction.originalAmount!)}
                              </div>
                            )}
                            <Badge className={getStatusBadgeColor(
                              transaction.type === "payment" 
                                ? transaction.status! 
                                : transaction.refundStatus!
                            )}>
                              {transaction.type === "payment" 
                                ? transaction.status! 
                                : transaction.refundStatus!
                              }
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {transaction.createdAt ? format(new Date(transaction.createdAt), "MMM dd, yyyy HH:mm") : "N/A"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


