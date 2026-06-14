import { useState } from "react"
import { InteractionLayout } from "./InteractionLayout"
import type { VisualInteractionProps } from "./types"

export function MatchPairs(props: VisualInteractionProps) {
  const { level, onComplete, onNext, ttsSpeak } = props
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle")
  
  const pairs = level.matchPairs || []
  
  // To keep it simple, we don't randomise in this boilerplate, but we could
  const leftCol = pairs.map(p => ({ id: p.id, content: p.image }))
  // Shuffle right col simply
  const rightCol = [...pairs].sort((a,b) => a.text.localeCompare(b.text)).map(p => ({ id: p.id, content: p.text }))

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, string>>({}) // leftId -> rightId

  const handleLeftClick = (id: string) => {
    if (status !== "idle" || matches[id]) return
    setSelectedLeft(id === selectedLeft ? null : id)
  }

  const handleRightClick = (id: string) => {
    if (status !== "idle" || Object.values(matches).includes(id)) return
    
    if (selectedLeft) {
      // Make a match
      setMatches(prev => ({ ...prev, [selectedLeft]: id }))
      setSelectedLeft(null)
    } else {
      setSelectedRight(id === selectedRight ? null : id)
    }
  }

  // Allow clicking left to complete match if right is selected
  const handleLeftClickWhileRightSelected = (id: string) => {
    if (status !== "idle" || matches[id]) return
    if (selectedRight) {
      setMatches(prev => ({ ...prev, [id]: selectedRight }))
      setSelectedRight(null)
    }
  }

  const handleCheck = () => {
    let isCorrect = true
    for (const p of pairs) {
      if (matches[p.id] !== p.id) isCorrect = false
    }

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
      setMatches({})
      setSelectedLeft(null)
      setSelectedRight(null)
    }
  }

  const allMatched = Object.keys(matches).length === pairs.length

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
      canCheck={allMatched}
      status={status}
      progress={props.progress}
      onClose={props.onClose}
    >
      <div className="flex gap-16 justify-center w-full max-w-xl">
        {/* Left Column (Images) */}
        <div className="flex flex-col gap-4 flex-1">
          {leftCol.map(item => {
            const isMatched = !!matches[item.id]
            const isWrong = status === "incorrect" && matches[item.id] !== item.id

            return (
              <button
                key={item.id}
                onClick={() => selectedRight ? handleLeftClickWhileRightSelected(item.id) : handleLeftClick(item.id)}
                className={`h-24 rounded-2xl flex items-center justify-center text-5xl font-bold transition-all border-4 ${
                  isMatched
                    ? isWrong
                      ? "border-[#ea2b2b] bg-[#ffdfe0] text-[#ea2b2b] animate-[shake_0.5s_ease-in-out]"
                      : "border-[#1CB0F6] bg-[#1CB0F6]/10 text-white"
                    : selectedLeft === item.id
                    ? "border-[#1CB0F6] bg-[#37464f] text-white -translate-y-1"
                    : "border-[#37464f] bg-[#202f36] text-[#52656d] hover:bg-[#37464f]"
                }`}
              >
                {item.content}
              </button>
            )
          })}
        </div>

        {/* Right Column (Text) */}
        <div className="flex flex-col gap-4 flex-1">
          {rightCol.map(item => {
            const matchedLeftId = Object.keys(matches).find(k => matches[k] === item.id)
            const isMatched = !!matchedLeftId
            const isWrong = status === "incorrect" && matchedLeftId !== item.id

            return (
              <button
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                className={`h-24 rounded-2xl flex items-center justify-center text-xl font-bold transition-all border-4 ${
                  isMatched
                    ? isWrong
                      ? "border-[#ea2b2b] bg-[#ffdfe0] text-[#ea2b2b] animate-[shake_0.5s_ease-in-out]"
                      : "border-[#1CB0F6] bg-[#1CB0F6]/10 text-white"
                    : selectedRight === item.id
                    ? "border-[#1CB0F6] bg-[#37464f] text-white -translate-y-1"
                    : "border-[#37464f] bg-[#202f36] text-[#52656d] hover:bg-[#37464f]"
                }`}
              >
                {item.content}
              </button>
            )
          })}
        </div>
      </div>
    </InteractionLayout>
  )
}
