// Speech-to-text utility for symptom recording
export class SpeechToTextService {
  private recognition: any
  private isListening = false

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = true
      this.recognition.lang = "en-IN"
    }
  }

  startListening(onResult: (text: string) => void, onError: (error: string) => void): void {
    if (!this.recognition) {
      onError("Speech recognition not supported")
      return
    }

    this.isListening = true

    this.recognition.onstart = () => {
      console.log("Listening...")
    }

    this.recognition.onresult = (event: any) => {
      let interimTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          onResult(transcript)
        } else {
          interimTranscript += transcript
        }
      }
    }

    this.recognition.onerror = (event: any) => {
      onError(event.error)
    }

    this.recognition.onend = () => {
      this.isListening = false
    }

    this.recognition.start()
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  isSupported(): boolean {
    return !!this.recognition
  }
}

export const speechService = new SpeechToTextService()
