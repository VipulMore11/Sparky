import type { VisualLevel } from "@/lib/visual-levels"

export interface VisualInteractionProps {
  level: VisualLevel
  onComplete: (score: number) => void
  onNext: () => void
  onClose: () => void
  progress: number
  ttsSpeak?: (text: string) => void
}
