export async function POST(request: Request) {
  try {
    const formData = (await request.formData()) as any
    const audioFile = formData.get("audio") as Blob

    if (!audioFile) {
      return Response.json({ error: "No audio file provided" }, { status: 400 })
    }

    const mockTranscriptions = [
      "Patient has severe headache and fever for two days. Temperature is 101 degrees Fahrenheit.",
      "Experiencing body aches, fatigue, and loss of appetite for three days.",
      "Complaining of sore throat, cough, and difficulty swallowing.",
      "Patient reports dizziness, nausea, and occasional vomiting.",
      "Symptoms include rash on arms and legs with itching.",
      "Persistent cough for one week with chest pain when breathing.",
      "Abdominal pain and loose motions for two days.",
      "Headache with sensitivity to light and stiff neck.",
    ]

    const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)]

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return Response.json({
      text: randomTranscription,
      confidence: 0.95,
      language: "en-IN",
      duration: audioFile.size / 16000, // Approximate duration
    })
  } catch (error) {
    console.error("Transcription error:", error)
    return Response.json({ error: "Failed to transcribe audio" }, { status: 500 })
  }
}
