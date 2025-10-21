import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const primaryColor: [number, number, number] = [129, 89, 168]; // #8159A8
const accentGreen: [number, number, number] = [16, 185, 129]; // #10b981

// Helper function to add header to PDF
function addHeader(doc: jsPDF, title: string, dateRange: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Minimalist header with thin line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.8);
  doc.line(15, 25, pageWidth - 15, 25);

  // Logo/Brand text
  doc.setTextColor(...primaryColor);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("SPARKS", 15, 20);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("ADHD Management System", 15, 24);

  // Report title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(title, pageWidth - 15, 20, { align: "right" });

  // Date range
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${dateRange}`, 15, 40);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })}`, pageWidth - 15, 35, { align: "right" });
}

// Helper function to add footer to all pages
function addFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Thin line above footer
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

    // Footer text
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${i} of ${totalPages}`, 15, pageHeight - 10);
    doc.text("© 2025 Sparks ADHD Management System", pageWidth - 15, pageHeight - 10, { align: "right" });
  }
}

// ===== MONTHLY REVENUE PDF =====
interface MonthlyRevenuePDFData {
  month: string;
  summary: {
    totalRevenue: number;
    therapyRevenue: number;
    donationRevenue: number;
    totalCommission: number;
    transactionCount: number;
  };
  transactions: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    amount: number;
    commission: number;
    status: string;
    isRefunded: boolean;
  }>;
}

export function generateMonthlyRevenuePDF(data: MonthlyRevenuePDFData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  addHeader(doc, "Monthly Revenue Report", data.month);

  let yPosition = 52;

  // Summary section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Summary", 15, yPosition);
  yPosition += 8;

  const summaryData = [
    ["Total Revenue", `Rs. ${data.summary.totalRevenue.toLocaleString()}`],
    ["Therapy Revenue", `Rs. ${data.summary.therapyRevenue.toLocaleString()}`],
    ["Donation Revenue", `Rs. ${data.summary.donationRevenue.toLocaleString()}`],
    ["Platform Commission (10%)", `Rs. ${data.summary.totalCommission.toLocaleString()}`],
    ["Total Transactions", data.summary.transactionCount.toString()],
  ];

  autoTable(doc, {
    startY: yPosition,
    body: summaryData,
    theme: "plain",
    styles: {
      fontSize: 9,
      cellPadding: { top: 2, bottom: 2, left: 0, right: 5 },
      textColor: [60, 60, 60],
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: "normal" },
      1: { cellWidth: 40, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 15, right: 15 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPosition = (doc as any).lastAutoTable.finalY + 12;

  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 30;
  }

  // Separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 8;

  // Transactions section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Detailed Transactions", 15, yPosition);
  yPosition += 6;

  const transactionRows = data.transactions.map((tx) => [
    new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    tx.type,
    tx.description,
    tx.status,
    `${tx.isRefunded ? "-" : ""}${tx.amount.toFixed(2)}`,
    `${tx.isRefunded ? "-" : ""}${tx.commission.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Date", "Type", "Description", "Status", "Amount (Rs.)", "Commission (Rs.)"]],
    body: transactionRows,
    theme: "plain",
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: primaryColor,
      fontStyle: "bold",
      fontSize: 8,
      lineWidth: 0,
      lineColor: [220, 220, 220],
      cellPadding: { top: 3, bottom: 3, left: 0, right: 3 },
    },
    styles: {
      fontSize: 7.5,
      cellPadding: { top: 2.5, bottom: 2.5, left: 0, right: 3 },
      textColor: [60, 60, 60],
      lineWidth: 0.1,
      lineColor: [240, 240, 240],
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 22 },
      2: { cellWidth: 55 },
      3: { cellWidth: 20, halign: "center", fontSize: 7 },
      4: { cellWidth: 25, halign: "right" },
      5: { cellWidth: 25, halign: "right" },
    },
    margin: { left: 15, right: 15 },
    didParseCell: function (data) {
      if (data.row.section === "head") {
        data.cell.styles.lineWidth = { bottom: 0.5 };
        data.cell.styles.lineColor = primaryColor;
      }
    },
  });

  addFooter(doc);

  const fileName = `monthly-revenue-${data.month}.pdf`;
  doc.save(fileName);
}

// ===== THERAPIST PERFORMANCE PDF =====
interface TherapistPerformancePDFData {
  month: string;
  overallStats: {
    activeTherapists: number;
    totalSessions: number;
    totalRevenue: number;
    avgCompletionRate: number;
  };
  therapists: Array<{
    id: string;
    name: string;
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    noShowSessions: number;
    uniquePatients: number;
    completionRate: number;
    netRevenue: number;
    platformCommission: number;
  }>;
}

export function generateTherapistPerformancePDF(data: TherapistPerformancePDFData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  addHeader(doc, "Therapist Performance Report", data.month);

  let yPosition = 52;

  // Overall stats
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Overall Statistics", 15, yPosition);
  yPosition += 8;

  const overallData = [
    ["Active Therapists", data.overallStats.activeTherapists.toString()],
    ["Total Sessions", data.overallStats.totalSessions.toString()],
    ["Total Revenue", `Rs. ${data.overallStats.totalRevenue.toLocaleString()}`],
    ["Avg Completion Rate", `${data.overallStats.avgCompletionRate.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: yPosition,
    body: overallData,
    theme: "plain",
    styles: {
      fontSize: 9,
      cellPadding: { top: 2, bottom: 2, left: 0, right: 5 },
      textColor: [60, 60, 60],
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: "normal" },
      1: { cellWidth: 40, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 15, right: 15 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPosition = (doc as any).lastAutoTable.finalY + 12;

  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 30;
  }

  // Separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 8;

  // Therapist details
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Individual Therapist Performance", 15, yPosition);
  yPosition += 6;

  const therapistRows = data.therapists.map((t) => [
    t.name,
    t.totalSessions.toString(),
    t.completedSessions.toString(),
    t.uniquePatients.toString(),
    `${t.completionRate.toFixed(0)}%`,
    t.netRevenue.toFixed(2),
    t.platformCommission.toFixed(2),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Therapist", "Total", "Completed", "Patients", "Rate", "Revenue (Rs.)", "Commission (Rs.)"]],
    body: therapistRows,
    theme: "plain",
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: primaryColor,
      fontStyle: "bold",
      fontSize: 8,
      lineWidth: 0,
      lineColor: [220, 220, 220],
      cellPadding: { top: 3, bottom: 3, left: 0, right: 3 },
    },
    styles: {
      fontSize: 7.5,
      cellPadding: { top: 2.5, bottom: 2.5, left: 0, right: 3 },
      textColor: [60, 60, 60],
      lineWidth: 0.1,
      lineColor: [240, 240, 240],
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 18, halign: "center" },
      5: { cellWidth: 28, halign: "right" },
      6: { cellWidth: 28, halign: "right" },
    },
    margin: { left: 15, right: 15 },
    didParseCell: function (data) {
      if (data.row.section === "head") {
        data.cell.styles.lineWidth = { bottom: 0.5 };
        data.cell.styles.lineColor = primaryColor;
      }
    },
  });

  addFooter(doc);

  const fileName = `therapist-performance-${data.month}.pdf`;
  doc.save(fileName);
}

// ===== TRANSACTION HISTORY PDF =====
interface TransactionHistoryPDFData {
  month: string;
  categoryFilter: string;
  summary: {
    totalTransactions: number;
    sessionBookings: { count: number; totalAmount: number };
    donations: { count: number; totalAmount: number };
    refunds: { count: number; totalAmount: number };
  };
  transactions: Array<{
    id: string;
    date: string;
    transactionId: string;
    type: string;
    category: string;
    customerName: string;
    description: string;
    amount: number;
    commission: number;
    paymentMethod: string;
    status: string;
  }>;
}

export function generateTransactionHistoryPDF(data: TransactionHistoryPDFData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const dateRange = `${data.month} ${data.categoryFilter !== "ALL" ? `(${data.categoryFilter})` : ""}`;
  addHeader(doc, "Transaction History Report", dateRange);

  let yPosition = 52;

  // Summary section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Summary", 15, yPosition);
  yPosition += 8;

  const summaryData = [
    ["Total Transactions", data.summary.totalTransactions.toString()],
    ["Session Bookings", `${data.summary.sessionBookings.count} (Rs. ${data.summary.sessionBookings.totalAmount.toLocaleString()})`],
    ["Donations", `${data.summary.donations.count} (Rs. ${data.summary.donations.totalAmount.toLocaleString()})`],
    ["Refunds", `${data.summary.refunds.count} (Rs. ${data.summary.refunds.totalAmount.toLocaleString()})`],
  ];

  autoTable(doc, {
    startY: yPosition,
    body: summaryData,
    theme: "plain",
    styles: {
      fontSize: 9,
      cellPadding: { top: 2, bottom: 2, left: 0, right: 5 },
      textColor: [60, 60, 60],
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: "normal" },
      1: { cellWidth: 80, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 15, right: 15 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPosition = (doc as any).lastAutoTable.finalY + 12;

  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 30;
  }

  // Separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 8;

  // Transactions section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Transaction Details", 15, yPosition);
  yPosition += 6;

  const transactionRows = data.transactions.map((tx) => [
    new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    tx.type,
    tx.customerName,
    tx.description.length > 40 ? tx.description.substring(0, 37) + "..." : tx.description,
    tx.paymentMethod,
    tx.amount.toFixed(2),
    tx.commission.toFixed(2),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Date", "Type", "Customer", "Description", "Method", "Amount (Rs.)", "Comm. (Rs.)"]],
    body: transactionRows,
    theme: "plain",
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: primaryColor,
      fontStyle: "bold",
      fontSize: 8,
      lineWidth: 0,
      lineColor: [220, 220, 220],
      cellPadding: { top: 3, bottom: 3, left: 0, right: 3 },
    },
    styles: {
      fontSize: 7,
      cellPadding: { top: 2.5, bottom: 2.5, left: 0, right: 3 },
      textColor: [60, 60, 60],
      lineWidth: 0.1,
      lineColor: [240, 240, 240],
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 24 },
      2: { cellWidth: 28 },
      3: { cellWidth: 45 },
      4: { cellWidth: 22 },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 20, halign: "right" },
    },
    margin: { left: 15, right: 15 },
    didParseCell: function (data) {
      if (data.row.section === "head") {
        data.cell.styles.lineWidth = { bottom: 0.5 };
        data.cell.styles.lineColor = primaryColor;
      }

      // Color negative amounts in red
      if ((data.column.index === 5 || data.column.index === 6) && data.cell.section === "body") {
        const value = parseFloat(data.cell.text[0]);
        if (value < 0) {
          data.cell.styles.textColor = [239, 68, 68]; // red
        }
      }
    },
  });

  addFooter(doc);

  const fileName = `transaction-history-${data.month}.pdf`;
  doc.save(fileName);
}
