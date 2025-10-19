"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// interface ReportItemProps {
//   title: string;
//   description: string;
//   isPinned?: boolean;
//   isRecent?: boolean;
//   date?: string;
//   size?: string;
// }

interface RecentReportProps {
  title: string;
  date: string;
  size: string;
}

interface DonationListItem {
  id: string;
  donorName: string | null;
  donorEmail: string | null;
  isAnonymous: boolean;
  amount: string | number; // Prisma Decimal serialized
  currency: string;
  paymentStatus: string;
  createdAt: string;
}

// Simple Button component since it's not imported
const Button: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}> = ({ children, className, onClick, disabled, style }) => {
  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
};

const AllDonationsCard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<DonationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/donations/list?page=${currentPage}&pageSize=${pageSize}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setItems(data.data.items);
          setTotal(data.data.total);
        }
      } catch (e) {
        console.error("Failed to load donations list", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [currentPage, pageSize]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5; // Show 5 page numbers at a time
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    const end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          All Donations
        </CardTitle>
        <div className="text-sm text-gray-500 mt-1">
          Page {total === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, total)} of {total} donations
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#8159A8] inline-block" />
            </div>
          ) : items && items.length > 0 ? (
            items.map((donation) => (
              <div
                key={donation.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-base text-gray-800 mb-1">
                    {donation.isAnonymous ? "Anonymous" : (donation.donorName || donation.donorEmail || "Donor")}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="font-medium">Donor</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {donation.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="text-lg font-bold text-green-500 mb-0.5">
                    Rs. {Number(donation.amount).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Donation</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No donations found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > pageSize && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${currentPage === 1
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    className={`w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200 ${currentPage === pageNumber
                        ? "text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    style={
                      currentPage === pageNumber
                        ? { backgroundColor: "#8159A8" }
                        : {}
                    }
                    onClick={() => handlePageClick(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                ))}
              </div>

              <Button
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface DonationMetrics {
  allTime: {
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
  };
  last7Days: {
    totalAmount: number;
    totalCount: number;
  };
  last30Days: {
    totalAmount: number;
    totalCount: number;
  };
}

const FinancialDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DonationMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    fetchDonationMetrics();
  }, []);

  const fetchDonationMetrics = async () => {
    try {
      const response = await fetch("/api/admin/donations/metrics");
      const data = await response.json();
      if (data.success) {
        setMetrics(data.data);
      }
    } catch (error) {
      console.error("Error fetching donation metrics:", error);
    } finally {
      setMetricsLoading(false);
    }
  };

  /* const ReportItem: React.FC<ReportItemProps> = ({
    title,
    description,
    isPinned,
    isRecent,
    date,
    size,
  }) => {
    return (
      <div className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-gray-900">{title}</h4>
              {isPinned && <span className="text-orange-500">📌</span>}
            </div>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            {(date || size) && (
              <div className="flex gap-4 text-xs text-gray-500">
                {date && <span>{date}</span>}
                {size && <span>{size}</span>}
              </div>
            )}
          </div>
          {isRecent && (
            <div className="flex gap-2 ml-4">
              <button className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">
                Download
              </button>
              <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                View
              </button>
              <button className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }; */

  const RecentReport: React.FC<RecentReportProps> = ({ title, date, size }) => {
    return (
      <div className="p-3 border rounded-lg bg-white">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
          <div className="flex gap-2">
            <button className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">
              Download
            </button>
            <button className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
              View
            </button>
            <button className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">
              Delete
            </button>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-gray-500">
          <span>{date}</span>
          <span>{size}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent tracking-tight mb-2">
              Financial Reports
            </h1>
            <p className="text-gray-600">
              Generate comprehensive financial reports and track platform
              performance
            </p>
          </div>
        </div>

        {/* Statistics Cards*/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#8159A8]">
                Rs. 3,847,250
              </div>
              <p className="text-xs text-muted-foreground">
                Current month period
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Platform Commission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#8159A8]">
                Rs. 384,725
              </div>
              <p className="text-xs text-muted-foreground">
                10% of total revenue
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Donations Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[#8159A8]" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-[#8159A8]">
                    Rs. {metrics?.allTime.totalAmount.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.allTime.totalCount || 0} donations • Avg. Rs.{" "}
                    {metrics?.allTime.averageAmount.toLocaleString() || 0}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reports Section */}
        {/* Generate New Report 
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Generate New Report</h3>
            </div>
            
            <div className="space-y-6">
              <ReportItem
                title="Revenue Report"
                description="Monthly, quarterly, and annual revenue including session subscriptions, and donations"
                isPinned={true}
              />
              
              <ReportItem
                title="Therapist Performance"
                description="Individual therapist earnings, session counts, and performance metrics"
              />
              
              <ReportItem
                title="Transaction History"
                description="Detailed transaction log with payment details, refunds, and adjustments"
              />
              
              <div className="pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Format
                    </label>
                    <select
                      value={reportFormat}
                      onChange={(e) => setReportFormat(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option>PDF Document</option>
                      <option>Excel Spreadsheet</option>
                      <option>CSV File</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detail Level
                    </label>
                    <select
                      value={detailLevel}
                      onChange={(e) => setDetailLevel(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option>Summary</option>
                      <option>Detailed</option>
                      <option>Comprehensive</option>
                    </select>
                  </div>
                </div>
                
                <button className="w-full bg-[#8159A8] text-white py-3 rounded-md hover:bg-purple-700 transition-colors font-medium">
                  Generate & Download Report
                </button>
              </div>
            </div>
          </div>*/}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* All Donations Card */}
          <AllDonationsCard />

          {/* Recent Reports */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Reports
              </h3>
            </div>

            <div className="space-y-4">
              <RecentReport
                title="Monthly Revenue Report - June 2025"
                date="Generated on Jun 30, 2025"
                size="CSV • 4.3 MB"
              />

              <RecentReport
                title="Therapist Performance - Q2 2025"
                date="Generated on Jun 28, 2025"
                size="PDF • 1.8 MB"
              />

              <RecentReport
                title="Transaction History - May 2025"
                date="Generated on May 31, 2025"
                size="CSV • 892 KB"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// This is the key fix - add the default export
export default FinancialDashboard;
