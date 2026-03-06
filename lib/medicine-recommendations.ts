// AI-powered medicine recommendations based on symptoms
interface MedicineRecommendation {
  name: string
  dosage: string
  frequency: string
  duration: string
  notes: string
}

const medicineDatabase: Record<string, MedicineRecommendation[]> = {
  headache: [
    { name: "Paracetamol", dosage: "500mg", frequency: "Twice daily", duration: "3 days", notes: "Take with food" },
    { name: "Ibuprofen", dosage: "400mg", frequency: "Once daily", duration: "3 days", notes: "If needed" },
  ],
  fever: [
    {
      name: "Paracetamol",
      dosage: "500mg",
      frequency: "Twice daily",
      duration: "3 days",
      notes: "Drink plenty of water",
    },
    { name: "Aspirin", dosage: "500mg", frequency: "Once daily", duration: "3 days", notes: "Alternative option" },
  ],
  cough: [
    { name: "Cough Syrup", dosage: "10ml", frequency: "Twice daily", duration: "5 days", notes: "Before meals" },
    { name: "Honey", dosage: "1 spoon", frequency: "Twice daily", duration: "7 days", notes: "Natural remedy" },
  ],
  cold: [
    { name: "Vitamin C", dosage: "500mg", frequency: "Once daily", duration: "7 days", notes: "Boosts immunity" },
    { name: "Zinc", dosage: "15mg", frequency: "Once daily", duration: "7 days", notes: "Reduces duration" },
  ],
  hypertension: [
    { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "Ongoing", notes: "Monitor BP regularly" },
    { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "Ongoing", notes: "Alternative option" },
  ],
  diabetes: [
    { name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "Ongoing", notes: "With meals" },
    { name: "Glipizide", dosage: "5mg", frequency: "Once daily", duration: "Ongoing", notes: "Before breakfast" },
  ],
}

export function getMedicineRecommendations(symptoms: string[]): MedicineRecommendation[] {
  const recommendations: MedicineRecommendation[] = []
  const seen = new Set<string>()

  symptoms.forEach((symptom) => {
    const lowerSymptom = symptom.toLowerCase()
    const medicines = medicineDatabase[lowerSymptom] || []
    medicines.forEach((medicine) => {
      if (!seen.has(medicine.name)) {
        recommendations.push(medicine)
        seen.add(medicine.name)
      }
    })
  })

  return recommendations
}

export function searchMedicines(query: string): MedicineRecommendation[] {
  const results: MedicineRecommendation[] = []
  const seen = new Set<string>()

  Object.values(medicineDatabase).forEach((medicines) => {
    medicines.forEach((medicine) => {
      if (medicine.name.toLowerCase().includes(query.toLowerCase()) && !seen.has(medicine.name)) {
        results.push(medicine)
        seen.add(medicine.name)
      }
    })
  })

  return results
}
