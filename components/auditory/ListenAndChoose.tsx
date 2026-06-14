import { useState } from "react"
import type { AuditoryInteractionProps } from "./types"
import { InteractionLayout } from "./InteractionLayout"

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
      onComplete(0) // wait, maybe they can try again?
      // For simplicity, they just get it incorrect and must click continue to move on,
      // or we just let them try again. Let's say if incorrect, they can select again.
    }
  }

  const handleContinue = () => {
    if (status === "correct") {
      onNext()
    } else {
      // reset to try again
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
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {level.options?.map((opt) => {
          const isSelected = selected === opt
          const isWrong = status === "incorrect" && isSelected
          return (
            <button
              key={opt}
              onClick={() => {
                if (status === "idle") setSelected(opt)
              }}
              className={`p-6 rounded-2xl border-2 text-xl font-bold transition-all ${
                isSelected
                  ? isWrong
                    ? "border-[#FF4B4B] bg-[#FFDFE0] text-[#FF4B4B] animate-[shake_0.5s_ease-in-out]"
                    : "border-[#1CB0F6] bg-[#DDF4FF] text-[#1CB0F6]"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700 shadow-[0_4px_0_var(--tw-shadow-color)] shadow-slate-200 active:shadow-none active:translate-y-1"
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </InteractionLayout>
  )
}
