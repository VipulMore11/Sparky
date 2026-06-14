import { useState } from "react"
import { InteractionLayout } from "./InteractionLayout"
import type { VisualInteractionProps } from "./types"

export function SpotDifference(props: VisualInteractionProps) {
  const { level, onComplete, onNext, ttsSpeak } = props
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle")
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const handleCheck = () => {
    if (selectedIdx === level.spotDiffIndex) {
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
      setSelectedIdx(null)
    }
  }

  const size = level.spotGridSize || 9
  const gridCols = Math.ceil(Math.sqrt(size))

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
      canCheck={selectedIdx !== null}
      status={status}
      progress={props.progress}
      onClose={props.onClose}
    >
      <div 
        className="grid gap-3 p-6 bg-[#202f36] rounded-3xl border-4 border-[#37464f]"
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: size }).map((_, i) => {
          const isTarget = i === level.spotDiffIndex
          const item = isTarget ? level.spotDiff : level.spotBase
          const isWrong = status === "incorrect" && selectedIdx === i

          return (
            <button
              key={i}
              onClick={() => status === "idle" && setSelectedIdx(i)}
              className={`h-20 w-20 flex items-center justify-center text-5xl rounded-2xl border-4 transition-all ${
                selectedIdx === i
                  ? isWrong
                    ? "border-[#ea2b2b] bg-[#ffdfe0] animate-[shake_0.5s_ease-in-out]"
                    : "border-[#1CB0F6] bg-[#1CB0F6]/10"
                  : "border-transparent bg-transparent hover:bg-white/5"
              }`}
            >
              {item}
            </button>
          )
        })}
      </div>
    </InteractionLayout>
  )
}
