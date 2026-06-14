import { useState } from "react"
import type { AuditoryInteractionProps } from "./types"
import { InteractionLayout } from "./InteractionLayout"
import { cn } from "@/lib/utils"

export function TypeWriteFallback(props: AuditoryInteractionProps) {
  const { level, onComplete, onNext, ttsSpeak } = props
  const [text, setText] = useState("")
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle")

  const expected = level.expectedKeywords || [level.correctAnswer || ""]

  const handleCheck = () => {
    const isCorrect = expected.some((kw) => text.toLowerCase().includes(kw.toLowerCase()))
    if (isCorrect) {
      setStatus("correct")
      onComplete(100)
    } else {
      setStatus("incorrect")
      onComplete(0)
    }
  }

  const handleContinue = () => {
    if (status === "correct") {
      onNext()
    } else {
      setStatus("idle")
      setText("")
    }
  }

  return (
    <InteractionLayout
      question={level.question}
      ttsSpeak={ttsSpeak}
      onSkip={() => {
        onComplete(0)
        onNext()
      }}
      onCheck={handleCheck}
      onContinue={handleContinue}
      canCheck={text.length > 0}
      status={status}
      progress={props.progress}
      onClose={props.onClose}
    >
      <div className="w-full max-w-md">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your answer here..."
          className={cn(
            "w-full p-5 rounded-2xl border-2 border-border bg-card text-lg font-bold text-foreground focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none resize-none h-32 transition-all",
            status === "incorrect" && "border-destructive focus:border-destructive focus:ring-destructive/20"
          )}
          disabled={status !== "idle"}
        />
      </div>
    </InteractionLayout>
  )
}
