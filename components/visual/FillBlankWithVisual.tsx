import { useState } from "react"
import { InteractionLayout } from "./InteractionLayout"
import type { VisualInteractionProps } from "./types"

export function FillBlankWithVisual(props: VisualInteractionProps) {
  const { level, onComplete, onNext, ttsSpeak } = props
  const [selected, setSelected] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle")

  const handleCheck = () => {
    if (selected === level.correctAnswer) {
      setStatus("correct")
      onComplete(100)
    } else {
      setStatus("incorrect")
    }
  }

  const handleContinue = () => {
    if (status === "correct") onNext()
    else {
      setStatus("idle")
      setSelected(null)
    }
  }

  const sequence = level.patternSequence || []

  return (
    <InteractionLayout
      question={level.question}
      ttsSpeak={ttsSpeak || (() => {})}
      onSkip={() => {
        onComplete(0)
        onNext()
      }}
      onCheck={handleCheck}
      onContinue={handleContinue}
      canCheck={selected !== null}
      status={status}
      progress={props.progress}
      onClose={props.onClose}
    >
      <div className="flex flex-col items-center gap-12 w-full max-w-xl">
        
        {/* Sequence Display */}
        <div className="flex gap-4 p-6 bg-muted rounded-3xl border-4 border-border justify-center items-center">
          {sequence.map((item, i) => (
            <div 
              key={i} 
              className={`h-24 w-24 flex items-center justify-center text-5xl font-bold rounded-2xl ${
                item === "?" 
                  ? "border-4 border-dashed border-border bg-card" 
                  : "bg-transparent"
              }`}
            >
              {item === "?" && selected ? selected : item !== "?" ? item : ""}
            </div>
          ))}
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {level.options?.map((opt, i) => {
            const isWrong = status === "incorrect" && selected === opt
            return (
              <button
                key={i}
                onClick={() => status === "idle" && setSelected(opt)}
                className={`h-24 rounded-2xl flex items-center justify-center text-5xl transition-all border-4 ${
                  selected === opt
                    ? isWrong
                      ? "border-destructive bg-destructive/10 animate-[shake_0.5s_ease-in-out]"
                      : "border-primary bg-primary/10 shadow-[0_4px_0_var(--color-primary-shadow)] translate-y-[-4px]"
                    : "border-border bg-card hover:bg-muted shadow-sm"
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>

      </div>
    </InteractionLayout>
  )
}
