import { useState, useMemo } from "react"
import type { AuditoryInteractionProps } from "./types"
import { InteractionLayout } from "./InteractionLayout"

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
      <div className="flex flex-col items-center gap-8 w-full max-w-lg">
        {/* Drop zones / Sequence built so far */}
        <div className="flex gap-2 min-h-[4rem] p-4 border-b-2 border-slate-200 w-full justify-center">
          {sequence.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (status === "idle") {
                  setSequence((prev) => prev.filter((_, index) => index !== i))
                }
              }}
              className="px-4 py-2 bg-[#1CB0F6] text-white font-bold rounded-xl shadow-[0_4px_0_#1899D6]"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Available options */}
        <div className="flex flex-wrap gap-4 justify-center">
          {options.map((opt) => {
            const isUsed = sequence.includes(opt)
            return (
              <button
                key={opt}
                disabled={isUsed}
                onClick={() => {
                  if (status === "idle" && !isUsed) {
                    setSequence((prev) => [...prev, opt])
                    ttsSpeak(opt)
                  }
                }}
                className={`px-6 py-3 rounded-2xl border-2 font-bold transition-all ${
                  isUsed
                    ? "opacity-50 bg-slate-100 border-slate-200 text-slate-400"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700 shadow-[0_4px_0_var(--tw-shadow-color)] shadow-slate-200 active:translate-y-1 active:shadow-none"
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
