import { useState, useEffect } from "react"
import { Mic, Square } from "lucide-react"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"
import type { AuditoryInteractionProps } from "./types"
import { InteractionLayout } from "./InteractionLayout"

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
        // If they get it wrong, we let them try again by resetting status when they click mic
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
        <p className="text-xl font-bold text-slate-400">
          Listen and repeat: <span className="text-[#1CB0F6]">"{level.echoPhrase || ''}"</span>
        </p>
        
        {transcript && status === "idle" && (
           <p className="text-lg italic text-white/70">"{transcript}"</p>
        )}

        <button
          onClick={handleToggleListen}
          disabled={status === "correct"}
          className={`h-32 w-32 rounded-full flex items-center justify-center transition-all ${
            listening
              ? "bg-[#FF4B4B] text-white animate-pulse shadow-[0_0_0_10px_rgba(255,75,75,0.2)]"
              : status === "correct"
              ? "bg-[#58CC71] text-white"
              : "bg-[#1CB0F6] text-white hover:bg-[#1899D6] shadow-[0_8px_0_#1899D6] active:translate-y-2 active:shadow-none"
          }`}
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
