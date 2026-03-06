// Mock data for report generation
interface PatientReport {
  title: string
  type: string
  patientInfo: {
    name: string
    age: number
    phone: string
    village: string
  }
  medicalHistory: string[]
  visits: Array<{
    date: string
    type: string
    symptoms: string
    diagnosis: string
    prescription: string
  }>
  notes: string
}

interface ClinicReport {
  title: string
  type: string
  statistics: {
    total_patients: number
    total_visits: number
    total_consultations: number
    average_visit_duration: string
    common_conditions: string
  }
  notes: string
}

export async function generatePatientReport(patientId: string): Promise<PatientReport> {
  // Mock patient report generation
  return {
    title: `Patient Report - ${patientId}`,
    type: "Patient Summary",
    patientInfo: {
      name: "Lakshmi Devi",
      age: 45,
      phone: "9876543210",
      village: "Nandgaon",
    },
    medicalHistory: [
      "Hypertension diagnosed in 2020",
      "Type 2 Diabetes since 2019",
      "Previous malaria treatment in 2023",
      "Allergic to Penicillin",
    ],
    visits: [
      {
        date: "2025-10-22",
        type: "Consultation",
        symptoms: "Headache, fever",
        diagnosis: "Hypertension spike",
        prescription: "Amlodipine 5mg daily",
      },
      {
        date: "2025-10-15",
        type: "Regular Checkup",
        symptoms: "Regular checkup",
        diagnosis: "Stable condition",
        prescription: "Continue current medications",
      },
    ],
    notes:
      "Patient is compliant with medications. Blood pressure readings have been stable over the past month. Recommend continued monitoring and lifestyle modifications.",
  }
}

export async function generateClinicReport(startDate: string, endDate: string): Promise<ClinicReport> {
  // Mock clinic report generation
  return {
    title: `Clinic Report - ${startDate} to ${endDate}`,
    type: "Monthly Clinic Report",
    statistics: {
      total_patients: 54,
      total_visits: 112,
      total_consultations: 39,
      average_visit_duration: "15 minutes",
      common_conditions: "Hypertension, Diabetes, Asthma",
    },
    notes:
      "The clinic has shown steady growth in patient visits this month. Remote consultations have increased by 12% compared to last month. All staff members have been trained on the new digital system.",
  }
}

export async function exportToPDF(report: any, filename: string) {
  // Create a simple HTML representation and trigger print
  const printWindow = window.open("", "", "height=600,width=800")
  if (!printWindow) return

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${report.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #0ea5e9; }
        h2 { color: #333; margin-top: 20px; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; }
        .section { margin-bottom: 20px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .info-item { margin-bottom: 10px; }
        .label { color: #666; font-size: 12px; }
        .value { font-weight: bold; }
        .visit { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; }
      </style>
    </head>
    <body>
      <h1>${report.title}</h1>
      <p>Generated on: ${new Date().toLocaleDateString()}</p>
      
      ${
        report.patientInfo
          ? `
        <h2>Patient Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="label">Name</div>
            <div class="value">${report.patientInfo.name}</div>
          </div>
          <div class="info-item">
            <div class="label">Age</div>
            <div class="value">${report.patientInfo.age}</div>
          </div>
          <div class="info-item">
            <div class="label">Phone</div>
            <div class="value">${report.patientInfo.phone}</div>
          </div>
          <div class="info-item">
            <div class="label">Village</div>
            <div class="value">${report.patientInfo.village}</div>
          </div>
        </div>
      `
          : ""
      }
      
      ${
        report.medicalHistory
          ? `
        <h2>Medical History</h2>
        <ul>
          ${report.medicalHistory.map((item: string) => `<li>${item}</li>`).join("")}
        </ul>
      `
          : ""
      }
      
      ${
        report.visits
          ? `
        <h2>Recent Visits</h2>
        ${report.visits
          .map(
            (visit: any) => `
          <div class="visit">
            <strong>${visit.date}</strong> - ${visit.type}<br>
            <strong>Symptoms:</strong> ${visit.symptoms}<br>
            <strong>Diagnosis:</strong> ${visit.diagnosis}<br>
            <strong>Prescription:</strong> ${visit.prescription}
          </div>
        `,
          )
          .join("")}
      `
          : ""
      }
      
      ${
        report.statistics
          ? `
        <h2>Statistics</h2>
        <table>
          <tr>
            ${Object.keys(report.statistics)
              .map((key) => `<th>${key.replace(/_/g, " ")}</th>`)
              .join("")}
          </tr>
          <tr>
            ${Object.values(report.statistics)
              .map((value) => `<td>${value}</td>`)
              .join("")}
          </tr>
        </table>
      `
          : ""
      }
      
      ${report.notes ? `<h2>Notes</h2><p>${report.notes}</p>` : ""}
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.print()
}

export async function exportToCSV(report: any, filename: string) {
  let csvContent = "data:text/csv;charset=utf-8,"

  // Add title and metadata
  csvContent += `${report.title}\n`
  csvContent += `Generated on,${new Date().toLocaleDateString()}\n\n`

  // Add patient info if available
  if (report.patientInfo) {
    csvContent += "Patient Information\n"
    csvContent += `Name,${report.patientInfo.name}\n`
    csvContent += `Age,${report.patientInfo.age}\n`
    csvContent += `Phone,${report.patientInfo.phone}\n`
    csvContent += `Village,${report.patientInfo.village}\n\n`
  }

  // Add medical history if available
  if (report.medicalHistory) {
    csvContent += "Medical History\n"
    report.medicalHistory.forEach((item: string) => {
      csvContent += `${item}\n`
    })
    csvContent += "\n"
  }

  // Add visits if available
  if (report.visits) {
    csvContent += "Date,Type,Symptoms,Diagnosis,Prescription\n"
    report.visits.forEach((visit: any) => {
      csvContent += `${visit.date},${visit.type},"${visit.symptoms}","${visit.diagnosis}","${visit.prescription}"\n`
    })
    csvContent += "\n"
  }

  // Add statistics if available
  if (report.statistics) {
    csvContent += "Statistic,Value\n"
    Object.entries(report.statistics).forEach(([key, value]) => {
      csvContent += `${key},${value}\n`
    })
  }

  // Add notes if available
  if (report.notes) {
    csvContent += `\nNotes\n"${report.notes}"\n`
  }

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `${filename}-${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
