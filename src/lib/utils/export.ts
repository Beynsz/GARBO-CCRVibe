/**
 * GARBO — Export Utilities
 * CSV and PDF generation for monthly performance reports.
 * SRS §3.1.5 — Reporting & Export
 *
 * CSV: pure browser-side, no dependencies.
 * PDF: uses jsPDF (loaded dynamically to keep the initial bundle small).
 */

import type { MonthlyReport, SitioBreakdown } from "@/types/app.types";
import { formatDate } from "./date";

// ─────────────────────────────────────────────────────────────────────────────
// CSV export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escapes a single CSV cell value.
 */
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts an array of objects to a CSV string.
 */
export function toCSV(rows: Record<string, unknown>[], headers?: string[]): string {
  if (rows.length === 0) return "";

  const keys = headers ?? Object.keys(rows[0] ?? {});
  const header = keys.map(escapeCSV).join(",");
  const body = rows.map((row) =>
    keys.map((k) => escapeCSV(row[k] as string | number | null)).join(",")
  );

  return [header, ...body].join("\r\n");
}

/**
 * Triggers a browser download for a CSV string.
 */
export function downloadCSV(csvString: string, filename: string): void {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports a MonthlyReport to CSV and triggers a download.
 * Produces three sections: summary, weekly breakdown, sitio breakdown.
 */
export function exportMonthlyReportCSV(report: MonthlyReport): void {
  const sections: string[] = [];

  // Section 1 — Summary
  sections.push("# Monthly Summary");
  sections.push(
    toCSV([
      {
        Month:            report.month,
        "Total Routes":   report.totalRoutes,
        Completed:        report.completed,
        Delayed:          report.delayed,
        Missed:           report.missed,
        "Completion Rate (%)": report.completionRate.toFixed(1),
        "Total Waste (kg)":    report.totalWasteKg.toFixed(2),
        "Total Fuel (L)":      report.totalFuelL.toFixed(2),
        "Incident Count":      report.incidentCount,
      },
    ])
  );

  // Section 2 — Weekly breakdown
  sections.push("\n# Weekly Breakdown");
  sections.push(
    toCSV(
      report.byWeek.map((w) => ({
        "Week Starting":        w.weekStart,
        Completed:              w.completed,
        Delayed:                w.delayed,
        Missed:                 w.missed,
        "Completion Rate (%)":  w.completionRate.toFixed(1),
      }))
    )
  );

  // Section 3 — By Sitio
  sections.push("\n# Performance by Sitio");
  sections.push(
    toCSV(
      report.bySitio.map((s: SitioBreakdown) => ({
        Sitio:                  s.sitioName,
        Completed:              s.completed,
        Delayed:                s.delayed,
        Missed:                 s.missed,
        "Completion Rate (%)":  s.completionRate.toFixed(1),
        "Waste (kg)":           s.wasteKg.toFixed(2),
      }))
    )
  );

  const csv      = sections.join("\n");
  const filename = `GARBO-Report-${report.month}.csv`;
  downloadCSV(csv, filename);
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF export (dynamic import to avoid SSR issues)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates and downloads a PDF version of the monthly report.
 * Dynamically imports jsPDF to keep the initial bundle lean.
 * SRS §3.1.5 — "Generate monthly performance reports in under 5 seconds"
 */
export async function exportMonthlyReportPDF(report: MonthlyReport): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ── Colors ──
  const olive    = [98,  111, 71]  as [number, number, number];
  const mosgreen = [164, 180, 101] as [number, number, number];
  const sand     = [245, 236, 213] as [number, number, number];
  const textDark = [44,  50,  33]  as [number, number, number];

  // ── Header ──
  doc.setFillColor(...olive);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(253, 250, 244);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("GARBO", 14, 14);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Waste Management Monitoring System — Barangay Banilad", 14, 22);

  // Report title
  doc.setTextColor(...textDark);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Monthly Performance Report — ${report.month}`, 14, 38);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 130, 100);
  doc.text(`Generated: ${formatDate(new Date().toISOString().split("T")[0] ?? "")}`, 14, 44);

  // ── KPI Summary boxes ──
  const kpis = [
    { label: "Total Routes",       value: String(report.totalRoutes) },
    { label: "Completed",          value: String(report.completed) },
    { label: "Delayed",            value: String(report.delayed) },
    { label: "Missed",             value: String(report.missed) },
    { label: "Completion Rate",    value: `${report.completionRate.toFixed(1)}%` },
    { label: "Total Waste",        value: `${report.totalWasteKg.toFixed(1)} kg` },
  ];

  let kpiX = 14;
  const kpiY = 52;
  const kpiW = 29;
  const kpiH = 18;
  const kpiGap = 3;

  kpis.forEach(({ label, value }) => {
    doc.setFillColor(...sand);
    doc.roundedRect(kpiX, kpiY, kpiW, kpiH, 2, 2, "F");
    doc.setFillColor(...mosgreen);
    doc.roundedRect(kpiX, kpiY, kpiW, 6, 2, 2, "F");
    doc.setFillColor(...mosgreen);
    doc.rect(kpiX, kpiY + 4, kpiW, 2, "F");  // blend bottom of header

    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(253, 250, 244);
    doc.text(label.toUpperCase(), kpiX + kpiW / 2, kpiY + 4.5, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textDark);
    doc.text(value, kpiX + kpiW / 2, kpiY + 13, { align: "center" });

    kpiX += kpiW + kpiGap;
  });

  // ── Weekly breakdown table ──
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text("Weekly Breakdown", 14, 80);

  autoTable(doc, {
    startY:   84,
    head:     [["Week Starting", "Completed", "Delayed", "Missed", "Completion Rate"]],
    body:     report.byWeek.map((w) => [
      w.weekStart,
      w.completed,
      w.delayed,
      w.missed,
      `${w.completionRate.toFixed(1)}%`,
    ]),
    styles:        { fontSize: 9, cellPadding: 3 },
    headStyles:    { fillColor: olive, textColor: [253, 250, 244], fontStyle: "bold" },
    alternateRowStyles: { fillColor: sand },
    margin: { left: 14, right: 14 },
  });

  // ── Sitio breakdown table ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY ?? 140;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text("Performance by Sitio", 14, finalY + 10);

  autoTable(doc, {
    startY:   finalY + 14,
    head:     [["Sitio", "Completed", "Delayed", "Missed", "Rate", "Waste (kg)"]],
    body:     report.bySitio.map((s) => [
      s.sitioName,
      s.completed,
      s.delayed,
      s.missed,
      `${s.completionRate.toFixed(1)}%`,
      s.wasteKg.toFixed(1),
    ]),
    styles:        { fontSize: 9, cellPadding: 3 },
    headStyles:    { fillColor: olive, textColor: [253, 250, 244], fontStyle: "bold" },
    alternateRowStyles: { fillColor: sand },
    margin: { left: 14, right: 14 },
  });

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 160, 130);
    doc.text(
      `GARBO — Barangay Banilad    |    Page ${i} of ${pageCount}    |    Confidential`,
      105, 290,
      { align: "center" }
    );
  }

  doc.save(`GARBO-Report-${report.month}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public announcement text generator
// SRS §3.1.5.1 — "Generate text summaries of next-day schedules for public posting"
// ─────────────────────────────────────────────────────────────────────────────

export interface AnnouncementScheduleItem {
  sitioName:      string;
  routeName:      string;
  collectionDate: string;   // ISO "YYYY-MM-DD"
}

/**
 * Generates a plain-text announcement for public posting (social media, notice boards).
 */
export function generateScheduleAnnouncement(
  items: AnnouncementScheduleItem[],
  date: string,
): string {
  if (items.length === 0) {
    return `📢 GARBO — Barangay Banilad\n\nNo garbage collection scheduled for ${formatDate(date)}.\n\nFor inquiries, contact the Barangay Sanitation Committee.`;
  }

  const lines = items.map(
    (item) => `• ${item.sitioName} (${item.routeName})`
  );

  return [
    `📢 GARBO — Barangay Banilad`,
    ``,
    `�-�️ Garbage Collection Schedule — ${formatDate(date)}`,
    ``,
    `The following Sitios will be served today:`,
    ...lines,
    ``,
    `Please have your waste ready by 6:00 AM.`,
    ``,
    `For concerns or updates, contact the Barangay Sanitation Committee.`,
    `#GarboBanilad #CleanCommunity`,
  ].join("\n");
}