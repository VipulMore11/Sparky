import { useState, useEffect } from "react"
import { Volume2 } from "lucide-react"
import type { AuditoryInteractionProps } from "./types"
import { InteractionLayout } from "./InteractionLayout"

export function ListenAndMatch(props: AuditoryInteractionProps) {
  const { level, onComplete, onNext, ttsSpeak } = props
  const [selectedSound, setSelectedSound] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle")

  const pairs = level.matchPairs || []

  useEffect(() => {
    if (selectedSound && selectedImage) {
      // check match
      const pair = pairs.find((p) => p.sound === selectedSound && p.image === selectedImage)
      if (pair) {
        setMatchedPairs((prev) => [...prev, pair.sound])
        setSelectedSound(null)
        setSelectedImage(null)
      } else {
        // wrong match, shake and reset
        setTimeout(() => {
          setSelectedSound(null)
          setSelectedImage(null)
        }, 500)
      }
    }
  }, [selectedSound, selectedImage, pairs])

  const allMatched = matchedPairs.length === pairs.length && pairs.length > 0

  const handleCheck = () => {
    if (allMatched) {
      setStatus("correct")
      onComplete(100)
    }
  }

  const handleContinue = () => {
    if (status === "correct") {
      onNext()
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
      canCheck={allMatched}
      status={status}
      progress={props.progress}
      onClose={props.onClose}
    >
      <div className="flex justify-between w-full max-w-md gap-8">
        <div className="flex flex-col gap-4 w-1/2">
          {pairs.map((p) => {
            const isMatched = matchedPairs.includes(p.sound)
            const isSelected = selectedSound === p.sound
            return (
              <button
                key={p.sound}
                onClick={() => {
                  if (!isMatched) setSelectedSound(p.sound)
                  ttsSpeak(p.sound)
                }}
                disabled={isMatched}
                className={`p-4 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all ${
                  isMatched
                    ? "opacity-50 bg-slate-100 border-slate-200"
                    : isSelected
                    ? "border-[#1CB0F6] bg-[#DDF4FF] text-[#1CB0F6]"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700 shadow-[0_4px_0_var(--tw-shadow-color)] shadow-slate-200 active:translate-y-1 active:shadow-none"
                }`}
              >
                <Volume2 className="h-6 w-6" />
                <span className="font-bold">Sound</span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-col gap-4 w-1/2">
          {pairs.map((p) => {
            const isMatched = matchedPairs.includes(p.sound)
            const isSelected = selectedImage === p.image
            return (
              <button
                key={p.image}
                onClick={() => {
                  if (!isMatched) setSelectedImage(p.image)
                }}
                disabled={isMatched}
                className={`p-4 rounded-2xl border-2 transition-all font-bold text-lg ${
                  isMatched
                    ? "opacity-50 bg-slate-100 border-slate-200"
                    : isSelected
                    ? "border-[#1CB0F6] bg-[#DDF4FF] text-[#1CB0F6]"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700 shadow-[0_4px_0_var(--tw-shadow-color)] shadow-slate-200 active:translate-y-1 active:shadow-none"
                }`}
              >
                {p.image}
              </button>
            )
          })}
        </div>
      </div>
    </InteractionLayout>
  )
}
