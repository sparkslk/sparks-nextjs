"use client";

import React, { useState } from 'react';
import { Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// TypeScript interfaces
interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: 'green' | 'purple' | 'blue';
}

interface ReportItemProps {
  title: string;
  description: string;
  isPinned?: boolean;
  isRecent?: boolean;
  date?: string;
  size?: string;
}

interface RecentReportProps {
  title: string;
  date: string;
  size: string;
}

const FinancialDashboard: React.FC = () => {
  // Removed unused activeTab and setActiveTab
  const [fromDate, setFromDate] = useState('01/04/2025');
  const [toDate, setToDate] = useState('30/04/2025');
  const [reportFormat, setReportFormat] = useState('PDF Document');
  const [detailLevel, setDetailLevel] = useState('Summary');

  // Removed unused tabs array

  // Removed unused MetricCard component

  const ReportItem: React.FC<ReportItemProps> = ({ title, description, isPinned, isRecent, date, size }) => {
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
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Reports</h1>
            <p className="text-gray-600">Generate comprehensive financial reports and track platform performance</p>
          </div>

        </div>

        {/* Date Range Selector */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">From Date</label>
              <input
                type="text"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">To Date</label>
              <input
                type="text"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Statistics Cards*/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#8159A8]">Rs. 3,847,250</div>
              <p className="text-xs text-muted-foreground">Current month period</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#8159A8]">Rs. 384,725</div>
              <p className="text-xs text-muted-foreground">10% of total revenue</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donations Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#8159A8]">Rs. 985,600</div>
              <p className="text-xs text-muted-foreground">From platform users</p>
            </CardContent>
          </Card>
        </div>

        {/* Reports Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generate New Report */}
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

                <button className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition-colors font-medium">
                  Generate & Download Report
                </button>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
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

export default FinancialDashboard;