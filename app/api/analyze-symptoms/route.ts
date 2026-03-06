import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { symptoms } = await request.json()

    if (!symptoms || typeof symptoms !== "string") {
      return Response.json({ error: "Invalid symptoms input" }, { status: 400 })
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a medical assistant AI for rural healthcare clinics in India. Analyze the following patient symptoms and provide recommendations based on locally available medicines.

Patient Symptoms: ${symptoms}

Please provide a JSON response with the following structure (and ONLY this JSON, no other text):
{
  "symptoms": ["symptom1", "symptom2", ...],
  "possibleConditions": ["condition1", "condition2", ...],
  "severity": "mild|moderate|severe",
  "recommendations": [
    {
      "name": "medicine name",
      "dosage": "dosage",
      "frequency": "how often",
      "duration": "how long",
      "notes": "any special notes"
    }
  ],
  "followUpAdvice": "general follow-up advice"
}

Important guidelines:
- Extract specific symptoms mentioned by the patient
- List 2-3 most likely conditions based on symptoms
- Recommend commonly available medicines in rural India (Paracetamol, Ibuprofen, Amoxicillin, etc.)
- Provide clear dosages suitable for adults
- Assess severity as mild, moderate, or severe
- Include practical follow-up advice for rural settings
- Always remind that this is not a diagnosis and a qualified doctor should be consulted
- Consider local healthcare context and resource availability`,
    })

    // Parse the AI response
    const analysisData = JSON.parse(text)

    return Response.json(analysisData)
  } catch (error) {
    console.error("Symptom analysis error:", error)
    return Response.json({ error: "Failed to analyze symptoms" }, { status: 500 })
  }
}
