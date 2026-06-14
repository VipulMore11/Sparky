import { useState } from "react"
import { InteractionLayout } from "./InteractionLayout"
import type { VisualInteractionProps } from "./types"

export function ImageChoice(props: VisualInteractionProps) {
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
      <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
        {level.options?.map((opt, i) => (
          <button
            key={i}
            onClick={() => status === "idle" && setSelected(opt)}
            className={`h-32 rounded-2xl flex items-center justify-center text-6xl transition-all border-4 ${
              selected === opt
                ? status === "incorrect"
                  ? "border-destructive bg-destructive/10 animate-[shake_0.5s_ease-in-out]"
                  : "border-primary bg-primary/10 shadow-[0_4px_0_var(--color-primary-shadow)] translate-y-[-4px]"
                : "border-border bg-card hover:bg-muted shadow-sm"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
      `}} />
    </InteractionLayout>
  )
}
