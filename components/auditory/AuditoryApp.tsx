import { useState, useMemo } from "react"
import { useProfile } from "@/lib/use-profile"
import { getAuditoryLevels } from "@/lib/auditory-levels"
import { ListenAndChoose } from "./ListenAndChoose"
import { ListenAndMatch } from "./ListenAndMatch"
import { ListenAndSequence } from "./ListenAndSequence"
import { Echo } from "./Echo"
import { SpeakShortAnswer } from "./SpeakShortAnswer"
import { RecordExplanation } from "./RecordExplanation"
import { DialogueDebate } from "./DialogueDebate"
import { TypeWriteFallback } from "./TypeWriteFallback"
import { BlockReport } from "./BlockReport"

interface AuditoryLearningLessonProps {
  levelIndex: number
  onComplete: (score: number) => void
  onClose: () => void
}

export function AuditoryLearningLesson({
  levelIndex,
  onComplete,
  onClose,
}: AuditoryLearningLessonProps) {
  const { profile } = useProfile()
  const [showReport, setShowReport] = useState(false)
  
  const levels = useMemo(() => getAuditoryLevels(profile.ageGroup), [profile.ageGroup])
  // Modulo the index by levels.length just in case we have more stages than levels
  const level = levels[levelIndex % levels.length]

  const handleNextLevel = () => {
    // If it's a block-end level (4, 9, 14, 19), show the report
    if ((levelIndex + 1) % 5 === 0) {
      setShowReport(true)
    } else {
      onComplete(100) // Call the parent onComplete which finishes the stage
    }
  }

  const ttsSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
    }
  }

  if (!level) {
    return null
  }

  if (showReport) {
    const blockIndex = Math.floor(levelIndex / 5)
    // Pass fake scores representing 100% since we just finished the block.
    // Real implementation would read from profile.scores
    const blockScores = [100, 100, 100, 100, 100]
    return (
      <div className="fixed inset-0 z-50 bg-[#131f24] flex items-center justify-center">
        <BlockReport
          scores={blockScores}
          blockIndex={blockIndex}
          onContinue={() => onComplete(100)}
        />
      </div>
    )
  }

  // Calculate generic progress based on level index (0-100)
  const progress = Math.min((((levelIndex % 5) + 1) / 5) * 100, 100)

  // Active Interaction Props
  const commonProps = {
    level,
    onComplete: () => {}, // We don't use this directly anymore, we rely on `onNext` which is `handleContinue` inside the components
    onNext: handleNextLevel,
    ttsSpeak,
    progress,
    onClose,
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#131f24] text-white">
      {level.interactionType === "ListenAndChoose" && <ListenAndChoose {...commonProps} />}
      {level.interactionType === "ListenAndMatch" && <ListenAndMatch {...commonProps} />}
      {level.interactionType === "ListenAndSequence" && <ListenAndSequence {...commonProps} />}
      {level.interactionType === "Echo" && <Echo {...commonProps} />}
      {level.interactionType === "SpeakShortAnswer" && <SpeakShortAnswer {...commonProps} />}
      {level.interactionType === "RecordExplanation" && <RecordExplanation {...commonProps} />}
      {level.interactionType === "DialogueDebate" && <DialogueDebate {...commonProps} />}
      {level.interactionType === "TypeWriteFallback" && <TypeWriteFallback {...commonProps} />}
    </div>
  )
}
