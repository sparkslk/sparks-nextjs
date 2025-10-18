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
  const lightPurple: [number, number, number] = [224, 212, 240]; // #e0d4f0
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Add header with brand color
  doc.setFillColor(...lightPurple);
  doc.rect(0, 0, pageWidth, 35, "F");

  // Add logo placeholder or text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("SPARKS", 20, 15);

  // Report title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor); // Set to primary color
  doc.text("Therapist Income Report", pageWidth / 2, 15, { align: "center" });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Therapist info and date range
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${data.dateRange}`, 20, 52);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })}`, 20, 59);

  // Summary statistics section
  let yPosition = 70;
  doc.setFillColor(...lightPurple);
  doc.rect(15, yPosition, pageWidth - 30, 8, "F");
  
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Summary Statistics", 20, yPosition + 6);
  
  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Summary grid
  const summaryData = [
    ["Total Sessions", data.summary.totalSessions.toString()],
    ["Completed Sessions", data.summary.completedSessions.toString()],
    ["Scheduled Sessions", data.summary.scheduledSessions.toString()],
    ["Cancelled Sessions", data.summary.cancelledSessions.toString()],
    ["No-Show Sessions", data.summary.noShowSessions.toString()],
    ["Paid Sessions", data.summary.paidSessions.toString()],
    ["Free Sessions", data.summary.freeSessions.toString()],
    ["No-Show Rate", `${data.summary.noShowRate}%`],
    ["Cancellation Rate", `${data.summary.cancellationRate}%`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: "bold" },
      1: { cellWidth: 40, halign: "right" },
    },
    margin: { left: 20, right: 20 },
  });

  // Income summary section
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFillColor(...lightPurple);
  doc.rect(15, yPosition, pageWidth - 30, 8, "F");
  
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Income Summary", 20, yPosition + 6);
  
  yPosition += 15;
  
  // Total income box - highlighted
  doc.setFillColor(102, 251, 157); // Light green
  doc.rect(20, yPosition, pageWidth - 40, 15, "F");
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.rect(20, yPosition, pageWidth - 40, 15, "S");
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total Income Earned:", 25, yPosition + 6);
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text(
    `LKR ${parseFloat(data.summary.totalIncome).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    pageWidth - 25,
    yPosition + 10,
    { align: "right" }
  );

  yPosition += 25;
  
  // Income breakdown note
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("Note: Income includes 90% of completed session fees and applicable cancellation earnings.", 20, yPosition);

  // Session details section
  yPosition += 10;
  
  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFillColor(...lightPurple);
  doc.rect(15, yPosition, pageWidth - 30, 8, "F");
  
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Session Transaction History", 20, yPosition + 6);
  
  yPosition += 15;

  // Session table
  const sessionRows = data.sessions.map((session) => [
    session.patientName,
    new Date(session.scheduledAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    session.type || "N/A",
    `${session.duration} min`,
    session.status,
    session.therapistAmount > 0
      ? `LKR ${session.therapistAmount.toFixed(2)}`
      : "Free",
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Patient", "Date", "Type", "Duration", "Status", "Amount Earned"]],
    body: sessionRows,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 30 },
      2: { cellWidth: 35 },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 30, halign: "center" },
      5: { cellWidth: 35, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 20, right: 20 },
    didParseCell: function (data) {
      // Color code status cells
      if (data.column.index === 4 && data.cell.section === "body") {
        const status = data.cell.text[0];
        if (status === "COMPLETED") {
          data.cell.styles.textColor = [34, 139, 34]; // Green
        } else if (status === "CANCELLED") {
          data.cell.styles.textColor = [220, 38, 38]; // Red
        } else if (status === "NO_SHOW") {
          data.cell.styles.textColor = [252, 173, 88]; // Orange
        }
      }
      // Color code amount cells
      if (data.column.index === 5 && data.cell.section === "body") {
        if (data.cell.text[0] !== "Free") {
          data.cell.styles.textColor = [34, 139, 34]; // Green
        } else {
          data.cell.styles.textColor = [150, 150, 150]; // Gray
        }
      }
    },
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(
      "© 2025 Sparks ADHD Management System. All rights reserved.",
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  }

  // Save the PDF
  const fileName = `therapist-report-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
