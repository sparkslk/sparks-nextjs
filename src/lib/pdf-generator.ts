import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

interface Session {
  id: string;
  patientName: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  therapistAmount: number;
  breakdown: string;
  sessionNotes?: string | null;
}

interface PDFData {
  therapistName: string;
  dateRange: string;
  summary: ReportSummary;
  sessions: Session[];
}

export function generateTherapistReportPDF(data: PDFData) {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [129, 89, 168]; // #8159A8
  const lightPurple: [number, number, number] = [245, 243, 255]; // Very light purple for subtle backgrounds
  const accentGreen: [number, number, number] = [16, 185, 129]; // #10b981 - emerald-500
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

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

  // Report title - minimalist
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Income Report", pageWidth - 15, 20, { align: "right" });

  // Date range and info - minimalist style
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${data.dateRange}`, 15, 40);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric"
  })}`, pageWidth - 15, 35, { align: "right" });

  // Summary statistics section - minimalist
  let yPosition = 52;
  doc.setTextColor(0, 0, 0);
  
  // Section header
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Summary", 15, yPosition);
  
  yPosition += 8;

  // Minimalist summary table
  const summaryData = [
    ["Total Sessions", data.summary.totalSessions.toString()],
    ["Completed", data.summary.completedSessions.toString()],
    ["No-Show", data.summary.noShowSessions.toString()],
    ["Cancelled", data.summary.cancelledSessions.toString()],
    ["Paid Sessions", data.summary.paidSessions.toString()],
    ["Free Sessions", data.summary.freeSessions.toString()],
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
      0: { cellWidth: 50, fontStyle: "normal" },
      1: { cellWidth: 20, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 15, right: 15 },
  });

  // Income summary section - minimalist and prominent
  yPosition = (doc as any).lastAutoTable.finalY + 12;
  
  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 30;
  }

  // Subtle separator line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 10;
  
  // Total income - clean and prominent
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Total Income Earned", 15, yPosition);
  
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(
    `LKR ${parseFloat(data.summary.totalIncome).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    15,
    yPosition + 10
  );

  // Small note in italics
  yPosition += 18;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(140, 140, 140);
  doc.text("* Includes 90% of completed/no-show sessions and applicable cancellation fees", 15, yPosition);

  // Session details section - minimalist
  yPosition += 12;
  
  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 30;
  }

  // Subtle separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 8;
  
  // Section header
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Transaction History", 15, yPosition);
  
  yPosition += 6;

  // Filter only processed sessions (exclude SCHEDULED/APPROVED)
  const filteredSessions = data.sessions.filter(
    s => s.status !== "SCHEDULED" && s.status !== "APPROVED"
  );

  // Session table - minimalist with better column sizing
  const sessionRows = filteredSessions.map((session) => [
    session.patientName,
    new Date(session.scheduledAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    session.type || "N/A",
    session.status,
    session.therapistAmount > 0
      ? `${session.therapistAmount.toFixed(2)}`
      : "0.00",
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Patient", "Date", "Type", "Status", "Earned (LKR)"]],
    body: sessionRows,
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
      0: { cellWidth: "auto" },
      1: { cellWidth: 22, halign: "left" },
      2: { cellWidth: 30, halign: "left" },
      3: { cellWidth: 25, halign: "center", fontSize: 7 },
      4: { cellWidth: 28, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 15, right: 15 },
    didParseCell: function (data) {
      // Add subtle border below header
      if (data.row.section === "head") {
        data.cell.styles.lineWidth = { bottom: 0.5 };
        data.cell.styles.lineColor = primaryColor;
      }
      
      // Color code status cells
      if (data.column.index === 3 && data.cell.section === "body") {
        const status = data.cell.text[0];
        if (status === "COMPLETED") {
          data.cell.styles.textColor = accentGreen;
          data.cell.styles.fontStyle = "bold";
        } else if (status === "CANCELLED") {
          data.cell.styles.textColor = [239, 68, 68]; // red-500
          data.cell.styles.fontStyle = "bold";
        } else if (status === "NO_SHOW") {
          data.cell.styles.textColor = [245, 158, 11]; // amber-500
          data.cell.styles.fontStyle = "bold";
        }
      }
      
      // Color code amount cells
      if (data.column.index === 4 && data.cell.section === "body") {
        const amount = parseFloat(data.cell.text[0]);
        if (amount > 0) {
          data.cell.styles.textColor = accentGreen;
        } else {
          data.cell.styles.textColor = [150, 150, 150];
        }
      }
    },
  });

  // Minimalist footer
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
    doc.text(
      `Page ${i} of ${totalPages}`,
      15,
      pageHeight - 10
    );
    doc.text(
      "© 2025 Sparks ADHD Management System",
      pageWidth - 15,
      pageHeight - 10,
      { align: "right" }
    );
  }

  // Save the PDF
  const fileName = `therapist-report-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
