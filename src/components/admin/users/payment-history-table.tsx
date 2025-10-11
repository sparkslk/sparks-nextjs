"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, Calendar, DollarSign } from "lucide-react";

interface Payment {
  id: string;
  orderId: string;
  paymentId: string | null;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  sessionId: string | null;
  createdAt: string;
  statusMessage: string | null;
  cardHolderName: string | null;
  maskedCardNumber: string | null;
  session: {
    id: string;
    type: string;
    scheduledAt: string;
    status: string;
    therapist: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
}

interface PaymentHistoryData {
  patient: {
    id: string;
    name: string;
  };
  payments: Payment[];
  summary: {
    totalPayments: number;
    completedPayments: number;
    totalAmount: number;
    pendingPayments: number;
    failedPayments: number;
  };
}

interface PaymentHistoryTableProps {
  patientId: string;
}

const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({ patientId }) => {
  const [data, setData] = useState<PaymentHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/patients/${patientId}/payments`);

        if (!response.ok) {
          throw new Error("Failed to fetch payment history");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPaymentHistory();
    }
  }, [patientId]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      COMPLETED: { color: "bg-green-100 text-green-800 border-green-200", label: "Completed" },
      PENDING: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
      FAILED: { color: "bg-red-100 text-red-800 border-red-200", label: "Failed" },
      CANCELLED: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Cancelled" },
      CHARGEDBACK: { color: "bg-orange-100 text-orange-800 border-orange-200", label: "Chargedback" },
      UNKNOWN: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Unknown" },
    };

    const config = statusMap[status] || statusMap.UNKNOWN;
    return (
      <Badge className={`${config.color} border`} variant="outline">
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "LKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading payment history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (!data || data.payments.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No payment history found for this patient.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Total Payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalPayments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Amount
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalAmount, "LKR")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.summary.completedPayments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending / Failed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data.summary.pendingPayments} / <span className="text-red-600">{data.summary.failedPayments}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Complete payment transaction history for {data.patient.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Order ID</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Method</th>
                  <th className="text-left p-3 font-medium">Session Type</th>
                  <th className="text-left p-3 font-medium">Therapist</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatDate(payment.createdAt)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-xs">{payment.orderId}</div>
                      {payment.paymentId && (
                        <div className="text-xs text-gray-500 mt-1">ID: {payment.paymentId}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold">{formatCurrency(payment.amount, payment.currency)}</div>
                      {payment.cardHolderName && (
                        <div className="text-xs text-gray-500 mt-1">{payment.cardHolderName}</div>
                      )}
                      {payment.maskedCardNumber && (
                        <div className="text-xs text-gray-500">{payment.maskedCardNumber}</div>
                      )}
                    </td>
                    <td className="p-3">{getStatusBadge(payment.status)}</td>
                    <td className="p-3">
                      <span className="text-sm">{payment.paymentMethod || "N/A"}</span>
                    </td>
                    <td className="p-3">
                      {payment.session ? (
                        <div>
                          <div className="font-medium text-sm">{payment.session.type}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(payment.session.scheduledAt).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="p-3">
                      {payment.session ? (
                        <div>
                          <div className="text-sm">{payment.session.therapist.name}</div>
                          <div className="text-xs text-gray-500">{payment.session.therapist.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistoryTable;
