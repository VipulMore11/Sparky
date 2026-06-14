import { useState, useEffect } from "react"
import { Mic, Square } from "lucide-react"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"
import type { AuditoryInteractionProps } from "./types"
import { InteractionLayout } from "./InteractionLayout"
import { cn } from "@/lib/utils"

export function Echo(props: AuditoryInteractionProps) {
  const { level, onComplete, onNext, ttsSpeak } = props
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle")
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  // Evaluate the transcript when the microphone stops listening
  useEffect(() => {
    if (!listening && transcript) {
      // Remove punctuation and convert to lowercase for comparison
      const cleanTranscript = transcript.toLowerCase().replace(/[^\w\s\']/gi, '').trim()
      const cleanExpected = (level.echoPhrase || "").toLowerCase().replace(/[^\w\s\']/gi, '').trim()
      
      if (cleanTranscript.includes(cleanExpected) || cleanExpected.includes(cleanTranscript)) {
        setStatus("correct")
        onComplete(100)
      } else {
        setStatus("incorrect")
      }
    }
  }, [listening, transcript, level.echoPhrase, onComplete])

  const handleToggleListen = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Speech recognition is not supported in this browser.")
      return
    }
    if (listening) {
      SpeechRecognition.stopListening()
    } else {
      resetTranscript()
      setStatus("idle")
      SpeechRecognition.startListening({ continuous: false })
    }
  }

  const handleContinue = () => {
    if (status === "correct") onNext()
    else setStatus("idle") // reset on incorrect so they can retry or skip
  }

  return (
    <InteractionLayout
      question={level.question}
      ttsSpeak={ttsSpeak}
      onSkip={() => {
        onComplete(0)
        onNext()
      }}
      onCheck={() => {}}
      onContinue={handleContinue}
      canCheck={false} // Check happens automatically after listen
      status={status}
      progress={props.progress}
      onClose={props.onClose}
    >
      <div className="flex flex-col items-center gap-8">
        <p className="text-2xl font-bold text-muted-foreground">
          Listen and repeat: <span className="text-primary font-extrabold text-3xl">"{level.echoPhrase || ''}"</span>
        </p>
        
        {transcript && (
           <p className="text-xl italic text-foreground max-w-md text-center">"{transcript}"</p>
        )}

        <button
          onClick={handleToggleListen}
          disabled={status === "correct"}
          className={cn(
            "h-32 w-32 rounded-full flex items-center justify-center transition-all border-b-[8px] active:translate-y-2 active:border-b-0",
            listening
              ? "bg-destructive border-destructive/50 text-destructive-foreground animate-pulse shadow-[0_0_0_10px_rgba(239,68,68,0.2)]"
              : status === "correct"
              ? "bg-success border-success/50 text-success-foreground"
              : "bg-primary border-primary/50 text-primary-foreground hover:bg-primary/90"
          )}
        >
          {listening ? (
            <Square className="h-12 w-12 fill-current" />
          ) : (
            <Mic className="h-12 w-12" />
          )}
        </button>
      </div>
    </InteractionLayout>
  )
}
