"use client"
import { useState, useEffect } from "react"
import { useProfile } from "@/lib/use-profile"
import { getVisualLevels } from "@/lib/visual-levels"
import { BlockReport } from "./BlockReport"

// Interaction components
import { ImageChoice } from "./ImageChoice"
import { LabelDiagram } from "./LabelDiagram"
import { SequenceImages } from "./SequenceImages"
import { SpotDifference } from "./SpotDifference"
import { MatchPairs } from "./MatchPairs"
import { FillBlankWithVisual } from "./FillBlankWithVisual"
import { ReadChart } from "./ReadChart"
import { BuildPattern } from "./BuildPattern"

interface VisualLearningLessonProps {
  levelIndex: number
  onComplete: (score: number) => void
  onClose: () => void
}

export function VisualLearningLesson({ levelIndex, onComplete, onClose }: VisualLearningLessonProps) {
  const { profile } = useProfile()
  const levels = getVisualLevels(profile.ageGroup)
  const currentLevel = levels[levelIndex]

  const [showReport, setShowReport] = useState(false)

  // Track scores for the block
  // A block is 5 levels. So level 0-4 is block 0, 5-9 is block 1, etc.
  // When a user hits levelIndex % 5 === 4, they finish a block.
  // For MVP we just use an array of 5 100s for the report
  const blockScores = [100, 100, 100, 100, 100]

  const handleNextLevel = () => {
    // If it's a block-end level (4, 9, 14, 19), show the report
    if ((levelIndex + 1) % 5 === 0) {
      setShowReport(true)
    } else {
      onComplete(100) // Call the parent onComplete which finishes the stage
    }
  }

  const handleReportClose = () => {
    setShowReport(false)
    onComplete(100) // Finish the stage after reading report
  }

  if (showReport) {
    return <BlockReport scores={blockScores} onClose={handleReportClose} isFinal={levelIndex === 19} />
  }

  if (!currentLevel) {
    return (
      <div className="fixed inset-0 z-50 bg-[#131f24] text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Level not found!</h1>
        <button onClick={onClose} className="px-6 py-2 bg-[#1CB0F6] rounded-xl font-bold">Back</button>
      </div>
    )
  }

  // TTS fallback wrapper using standard window.speechSynthesis
  const handleTtsSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel() // stop current
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  const progress = ((levelIndex % 5) / 5) * 100

  const props = {
    level: currentLevel,
    onComplete: () => {}, // We don't save per-interaction score internally in MVP
    onNext: handleNextLevel,
    onClose,
    progress,
    ttsSpeak: handleTtsSpeak
  }

  switch (currentLevel.interactionType) {
    case "ImageChoice": return <ImageChoice {...props} />
    case "LabelDiagram": return <LabelDiagram {...props} />
    case "SequenceImages": return <SequenceImages {...props} />
    case "SpotDifference": return <SpotDifference {...props} />
    case "MatchPairs": return <MatchPairs {...props} />
    case "FillBlankWithVisual": return <FillBlankWithVisual {...props} />
    case "ReadChart": return <ReadChart {...props} />
    case "BuildPattern": return <BuildPattern {...props} />
    default:
      return <div className="p-8">Unknown interaction type</div>
  }
}
