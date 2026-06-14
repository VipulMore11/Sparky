import { useState } from "react"
import type { AuditoryInteractionProps } from "./types"
import { InteractionLayout } from "./InteractionLayout"
import { cn } from "@/lib/utils"

export function ListenAndChoose(props: AuditoryInteractionProps) {
  const { level, onComplete, onNext, ttsSpeak } = props
  const [selected, setSelected] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle")

  const handleCheck = () => {
    if (!selected) return
    if (selected === level.correctAnswer) {
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
      setSelected(null)
    }
  }

  const handleSkip = () => {
    onComplete(0)
    onNext()
  }

  return (
    <InteractionLayout
      question={level.question}
      ttsSpeak={ttsSpeak}
      onSkip={handleSkip}
      onCheck={handleCheck}
      onContinue={handleContinue}
      canCheck={selected !== null}
      status={status}
      progress={props.progress}
      onClose={props.onClose}
    >
      <div className="flex flex-col gap-3 w-full">
        {level.options?.map((opt) => {
          const isSelected = selected === opt
          const isWrong = status === "incorrect" && isSelected
          const isCorrectOption = status === "correct" && isSelected

          return (
            <button
              key={opt}
              disabled={status !== "idle"}
              onClick={() => {
                if (status === "idle") setSelected(opt)
              }}
              className={cn(
                "flex min-h-[64px] w-full items-center justify-between rounded-2xl border-2 p-4 text-left font-bold transition-all",
                isSelected ? "border-primary bg-primary/10 ring-4 ring-primary/20" : "border-border bg-card hover:border-primary/50",
                status !== "idle" && !isSelected && "opacity-50",
                isCorrectOption && "border-success bg-success/10 text-success ring-success/20",
                isWrong && "border-destructive bg-destructive/10 text-destructive ring-destructive/20 animate-[shake_0.5s_ease-in-out]"
              )}
            >
              <span className="text-lg">{opt}</span>
              <div className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                isSelected ? "border-primary bg-primary" : "border-muted-foreground/30",
                isCorrectOption && "border-success bg-success",
                isWrong && "border-destructive bg-destructive"
              )}>
                {isSelected && <div className="size-2.5 rounded-full bg-background" />}
              </div>
            </button>
          )
        })}
      </div>
    </InteractionLayout>
  )
}
