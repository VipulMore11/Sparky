import { useState, useEffect } from "react"
import { Volume2 } from "lucide-react"
import type { AuditoryInteractionProps } from "./types"
import { InteractionLayout } from "./InteractionLayout"
import { cn } from "@/lib/utils"

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
        // wrong match, reset
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
      <div className="grid grid-cols-2 gap-6 w-full">
        {/* Left Column (Sounds) */}
        <div className="flex flex-col gap-3">
          {pairs.map((p) => {
            const isMatched = matchedPairs.includes(p.sound)
            const isSelected = selectedSound === p.sound
            return (
              <button
                key={`sound-${p.sound}`}
                onClick={() => {
                  if (!isMatched) setSelectedSound(p.sound)
                  ttsSpeak(p.sound)
                }}
                disabled={isMatched}
                className={cn(
                  "min-h-[64px] rounded-xl border-2 p-3 flex flex-col items-center justify-center font-bold transition-all gap-1",
                  isMatched ? "border-primary bg-primary text-primary-foreground opacity-50" : "border-border bg-card hover:border-primary/50 text-foreground",
                  isSelected && "border-primary ring-4 ring-primary/20",
                  status === "incorrect" && isMatched && "border-destructive bg-destructive text-destructive-foreground"
                )}
              >
                <Volume2 className="h-6 w-6" />
                <span className="text-sm">Listen</span>
              </button>
            )
          })}
        </div>

        {/* Right Column (Images/Words) */}
        <div className="flex flex-col gap-3">
          {pairs.map((p) => {
            const isMatched = matchedPairs.includes(p.sound)
            const isSelected = selectedImage === p.image
            return (
              <button
                key={`img-${p.image}`}
                onClick={() => {
                  if (!isMatched) setSelectedImage(p.image)
                }}
                disabled={isMatched}
                className={cn(
                  "min-h-[64px] rounded-xl border-2 p-3 text-center font-bold transition-all text-foreground",
                  isMatched ? "border-primary bg-primary text-primary-foreground opacity-50" : "border-border bg-card hover:border-primary/50",
                  isSelected && "border-primary ring-4 ring-primary/20",
                  status === "incorrect" && isMatched && "border-destructive bg-destructive text-destructive-foreground"
                )}
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
