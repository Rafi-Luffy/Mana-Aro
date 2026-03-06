/**
 * PDF Export Utility
 * Generates PDF reports from HTML elements
 */

import { jsPDF } from "jspdf"

declare const html2pdf: any

export interface PDFExportOptions {
  filename?: string
  title?: string
  orientation?: "portrait" | "landscape"
  format?: "a4" | "letter"
}

export function exportToPDF(element: HTMLElement, options: PDFExportOptions = {}) {
  const {
    filename = `report-${new Date().toISOString().split("T")[0]}.pdf`,
    title = "Health Report",
    orientation = "portrait",
    format = "a4",
  } = options

  if (typeof window === "undefined" || !html2pdf) {
    console.error("PDF export not available in this environment")
    return
  }

  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement

  // Hide elements that shouldn't be in PDF
  const hiddenElements = clone.querySelectorAll("[data-no-export]")
  hiddenElements.forEach((el) => {
    ;(el as HTMLElement).style.display = "none"
  })

  const opt = {
    margin: 10,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, logging: false, useCORS: true },
    jsPDF: { orientation: orientation, unit: "mm", format: format },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  }

  html2pdf().set(opt).from(clone).save()
}

/**
 * Generate a summary PDF with charts and tables
 */
export function generateReportPDF(data: {
  title: string
  date: string
  patients: number
  visits: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  topConditions?: Array<{ name: string; count: number }>
  syncStats?: {
    totalItems: number
    syncedItems: number
    pendingItems: number
  }
}) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${data.title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          color: #1f2937;
        }
        .header {
          border-bottom: 3px solid #0d9488;
          margin-bottom: 30px;
          padding-bottom: 15px;
        }
        .hospital-info {
          text-align: center;
          margin-bottom: 20px;
        }
        .hospital-info h1 {
          margin: 0;
          color: #0d9488;
          font-size: 28px;
        }
        .hospital-info p {
          margin: 5px 0;
          color: #6b7280;
          font-size: 12px;
        }
        .report-date {
          text-align: right;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 20px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 30px;
        }
        .summary-card {
          padding: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }
        .summary-card h3 {
          margin: 0 0 10px 0;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
        }
        .summary-card .value {
          font-size: 28px;
          font-weight: bold;
          color: #0d9488;
        }
        .summary-card.high .value {
          color: #dc2626;
        }
        .summary-card.medium .value {
          color: #ea8c00;
        }
        .summary-card.low .value {
          color: #059669;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section h2 {
          font-size: 16px;
          color: #0d9488;
          border-bottom: 2px solid #0d9488;
          padding-bottom: 8px;
          margin: 20px 0 15px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        th {
          background: #f3f4f6;
          color: #374151;
          padding: 10px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
        }
        td {
          padding: 8px 10px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 12px;
        }
        tr:last-child td {
          border-bottom: none;
        }
        .footer {
          margin-top: 40px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 10px;
          color: #6b7280;
        }
        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }
        .badge.high {
          background: #fee2e2;
          color: #991b1b;
        }
        .badge.medium {
          background: #fef3c7;
          color: #92400e;
        }
        .badge.low {
          background: #dcfce7;
          color: #166534;
        }
        .badge.synced {
          background: #dcfce7;
          color: #005a0f;
        }
        .badge.pending {
          background: #e0e7ff;
          color: #312e81;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="hospital-info">
          <h1>🏥 Mana Aarogyam</h1>
          <p>Rural Healthcare Management System</p>
        </div>
        <div class="report-date">Generated: ${new Date(data.date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}</div>
      </div>

      <h1 style="text-align: center; color: #1f2937; margin-bottom: 30px;">${data.title}</h1>

      <div class="summary-grid">
        <div class="summary-card">
          <h3>Total Patients</h3>
          <div class="value">${data.patients}</div>
        </div>
        <div class="summary-card">
          <h3>Total Visits</h3>
          <div class="value">${data.visits}</div>
        </div>
        <div class="summary-card high">
          <h3>High Risk</h3>
          <div class="value">${data.highRiskCount}</div>
        </div>
        <div class="summary-card medium">
          <h3>Medium Risk</h3>
          <div class="value">${data.mediumRiskCount}</div>
        </div>
        <div class="summary-card low">
          <h3>Low Risk</h3>
          <div class="value">${data.lowRiskCount}</div>
        </div>
      </div>

      ${
        data.topConditions && data.topConditions.length > 0
          ? `
        <div class="section">
          <h2>Top Conditions</h2>
          <table>
            <thead>
              <tr>
                <th>Condition</th>
                <th style="text-align: right;">Cases</th>
              </tr>
            </thead>
            <tbody>
              ${data.topConditions
                .map(
                  (c) => `
              <tr>
                <td>${c.name}</td>
                <td style="text-align: right; font-weight: 500;">${c.count}</td>
              </tr>
            `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `
          : ""
      }

      ${
        data.syncStats
          ? `
        <div class="section">
          <h2>Sync Status</h2>
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th style="text-align: right;">Items</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="badge synced">✓ Synced</span></td>
                <td style="text-align: right; font-weight: 500;">${data.syncStats.syncedItems}</td>
              </tr>
              <tr>
                <td><span class="badge pending">⊙ Pending</span></td>
                <td style="text-align: right; font-weight: 500;">${data.syncStats.pendingItems}</td>
              </tr>
              <tr>
                <td><strong>Total</strong></td>
                <td style="text-align: right; font-weight: 600;">${data.syncStats.totalItems}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
          : ""
      }

      <div class="footer">
        <p>This report was automatically generated by Mana Aarogyam Health Management System.</p>
        <p>For offline-first rural healthcare systems. | ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `

  const element = document.createElement("div")
  element.innerHTML = htmlContent

  exportToPDF(element, {
    filename: `mana-aarogyam-report-${new Date().toISOString().split("T")[0]}.pdf`,
    title: data.title,
  })
}

export function generateClinicSummaryPdf(input: {
  clinicName: string
  totalPatients: number
  totalVisits: number
  riskDistribution: Array<{ name: string; value: number }>
}) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })

  pdf.setFontSize(18)
  pdf.text("Mana Aarogyam - Clinic Summary", 40, 50)

  pdf.setFontSize(11)
  pdf.text(`Clinic Name: ${input.clinicName}`, 40, 85)
  pdf.text(`Generated On: ${new Date().toLocaleString("en-IN")}`, 40, 105)

  pdf.setFontSize(13)
  pdf.text("Summary Metrics", 40, 145)

  pdf.setFontSize(11)
  pdf.text(`Total Patients: ${input.totalPatients}`, 40, 170)
  pdf.text(`Total Visits: ${input.totalVisits}`, 40, 190)

  pdf.setFontSize(13)
  pdf.text("Risk Distribution", 40, 230)
  pdf.setFontSize(11)

  input.riskDistribution.forEach((row, index) => {
    pdf.text(`${row.name}: ${row.value}`, 40, 255 + index * 20)
  })

  pdf.save(`mana-aarogyam-report-${new Date().toISOString().split("T")[0]}.pdf`)
}
