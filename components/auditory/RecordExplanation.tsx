import { useState, useEffect } from "react"
import { Mic, Square } from "lucide-react"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"
import type { AuditoryInteractionProps } from "./types"
import { InteractionLayout } from "./InteractionLayout"
import { cn } from "@/lib/utils"

export function RecordExplanation(props: AuditoryInteractionProps) {
  const { level, onComplete, onNext, ttsSpeak } = props
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle")
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  useEffect(() => {
    if (!listening && transcript) {
      const lowerTranscript = transcript.toLowerCase()
      // Evaluate against expectedKeywords
      const keywords = level.expectedKeywords || []
      const hasKeyword = keywords.some(kw => lowerTranscript.includes(kw.toLowerCase()))
      
      // If it has at least one keyword, or transcript is longer than 15 chars (mock explanation length)
      if (hasKeyword || lowerTranscript.length > 15) {
        setStatus("correct")
        onComplete(100)
      } else {
        setStatus("incorrect")
      }
    }
  }, [listening, transcript, level.expectedKeywords, onComplete])

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
      SpeechRecognition.startListening({ continuous: true })
    }
  }

  const handleContinue = () => {
    if (status === "correct") onNext()
    else setStatus("idle") // reset on incorrect so they can retry
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
      canCheck={false}
      status={status}
      progress={props.progress}
      onClose={props.onClose}
    >
      <div className="flex flex-col items-center gap-8">
        <p className="text-xl font-bold text-muted-foreground text-center max-w-sm">
          Explain your answer clearly. We'll listen for key words!
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
