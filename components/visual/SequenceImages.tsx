import { useState } from "react"
import { InteractionLayout } from "./InteractionLayout"
import type { VisualInteractionProps } from "./types"

export function SequenceImages(props: VisualInteractionProps) {
  const { level, onComplete, onNext, ttsSpeak } = props
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle")
  
  const [bank, setBank] = useState<string[]>(level.sequenceItems || [])
  const [sequence, setSequence] = useState<string[]>([])

  const expected = level.expectedSequence || []

  const handleSelect = (item: string) => {
    if (status !== "idle") return
    setBank(prev => prev.filter(i => i !== item))
    setSequence(prev => [...prev, item])
  }

  const handleDeselect = (item: string) => {
    if (status !== "idle") return
    setSequence(prev => prev.filter(i => i !== item))
    setBank(prev => [...prev, item])
  }

  const handleCheck = () => {
    const isCorrect = sequence.every((item, i) => item === expected[i])
    if (isCorrect) {
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
      setBank(level.sequenceItems || [])
      setSequence([])
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
      canCheck={sequence.length === expected.length}
      status={status}
      progress={props.progress}
      onClose={props.onClose}
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-xl">
        
        {/* The Sequence Box */}
        <div className="w-full flex gap-4 min-h-[120px] p-4 bg-muted rounded-3xl border-4 border-border items-center justify-center">
          {sequence.length === 0 && (
            <span className="text-muted-foreground font-bold text-lg">Tap items below to build sequence</span>
          )}
          {sequence.map((item, i) => {
            const isWrong = status === "incorrect" && item !== expected[i]
            return (
              <button
                key={i}
                onClick={() => handleDeselect(item)}
                className={`h-24 w-24 rounded-2xl flex items-center justify-center text-5xl transition-all border-4 ${
                  isWrong
                    ? "border-destructive bg-destructive/10 animate-[shake_0.5s_ease-in-out]"
                    : "border-primary bg-primary/10"
                }`}
              >
                {item}
              </button>
            )
          })}
        </div>

        {/* Word/Image Bank */}
        <div className="flex gap-4 justify-center">
          {bank.map((item, i) => (
            <button
              key={i}
              onClick={() => handleSelect(item)}
              className="h-24 w-24 rounded-2xl flex items-center justify-center text-5xl bg-card border-border border-b-4 hover:bg-muted hover:translate-y-1 transition-all"
            >
              {item}
            </button>
          ))}
        </div>

      </div>
    </InteractionLayout>
  )
}
