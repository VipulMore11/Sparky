import { useState, useMemo } from "react"
import type { AuditoryInteractionProps } from "./types"
import { InteractionLayout } from "./InteractionLayout"
import { cn } from "@/lib/utils"

export function ListenAndSequence(props: AuditoryInteractionProps) {
  const { level, onComplete, onNext, ttsSpeak } = props
  const [sequence, setSequence] = useState<string[]>([])
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle")

  const options = useMemo(() => {
    const opts = [...(level.options || [])]
    return opts.sort(() => Math.random() - 0.5)
  }, [level.options])

  const expected = level.expectedSequence || []

  const handleCheck = () => {
    if (sequence.length !== expected.length) return
    const isCorrect = sequence.every((s, i) => s === expected[i])
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
      setSequence([])
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
      canCheck={sequence.length === expected.length}
      status={status}
      progress={props.progress}
      onClose={props.onClose}
    >
      <div className="flex flex-col w-full gap-6">
        {/* Drop zones / Sequence built so far */}
        <div className="flex flex-col gap-2 min-h-[120px] rounded-2xl border-2 border-dashed border-border bg-muted/30 p-4">
          {sequence.length === 0 && <span className="text-muted-foreground font-semibold text-center mt-6">Tap items below to add them in order</span>}
          {sequence.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (status === "idle") {
                  setSequence((prev) => prev.filter((_, index) => index !== i))
                }
              }}
              className={cn(
                "flex min-h-[56px] w-full items-center gap-4 rounded-xl border-2 border-primary bg-primary/10 px-4 text-left font-bold text-primary transition-all",
                status === "incorrect" && "border-destructive bg-destructive/10 text-destructive"
              )}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-sm">
                {i + 1}
              </span>
              {item}
            </button>
          ))}
        </div>

        {/* Available options */}
        {sequence.length < expected.length && (
          <div className="flex flex-wrap gap-3">
            {options.map((opt) => {
              const isUsed = sequence.includes(opt)
              if (isUsed) return null
              
              return (
                <button
                  key={opt}
                  onClick={() => {
                    if (status === "idle" && !isUsed) {
                      setSequence((prev) => [...prev, opt])
                      ttsSpeak(opt)
                    }
                  }}
                  className="rounded-xl border-2 border-border bg-card px-4 py-3 font-bold hover:border-primary/50 transition-all active:translate-y-1 text-foreground"
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </InteractionLayout>
  )
}
