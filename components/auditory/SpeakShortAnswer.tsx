import { useState, useEffect } from "react"
import { Mic, Square } from "lucide-react"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"
import type { AuditoryInteractionProps } from "./types"
import { InteractionLayout } from "./InteractionLayout"

export function SpeakShortAnswer(props: AuditoryInteractionProps) {
  const { level, onComplete, onNext, ttsSpeak } = props
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle")
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  useEffect(() => {
    if (!listening && transcript) {
      const lowerTranscript = transcript.toLowerCase()
      const keywords = level.expectedKeywords || []
      const hasKeyword = keywords.some(kw => lowerTranscript.includes(kw.toLowerCase()))
      
      // Strict matching for short answers (must include at least one keyword)
      if (hasKeyword) {
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
    else setStatus("idle")
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
        <p className="text-lg font-bold text-slate-400 text-center max-w-sm">
          Speak your answer loudly and clearly!
        </p>
        
        {transcript && status === "idle" && (
           <p className="text-xl font-bold text-white max-w-md text-center">"{transcript}"</p>
        )}

        <button
          onClick={handleToggleListen}
          disabled={status === "correct"}
          className={`h-24 w-24 rounded-full flex items-center justify-center transition-all ${
            listening
              ? "bg-[#FF4B4B] text-white animate-pulse shadow-[0_0_0_10px_rgba(255,75,75,0.2)]"
              : status === "correct"
              ? "bg-[#58CC71] text-white"
              : "bg-[#1CB0F6] text-white hover:bg-[#1899D6] shadow-[0_8px_0_#1899D6] active:translate-y-2 active:shadow-none"
          }`}
        >
          {listening ? (
            <Square className="h-10 w-10 fill-current" />
          ) : (
            <Mic className="h-10 w-10" />
          )}
        </button>
      </div>
    </InteractionLayout>
  )
}
