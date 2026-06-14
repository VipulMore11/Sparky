import type { AuditoryLevel } from "@/lib/auditory-levels"

export interface AuditoryInteractionProps {
  level: AuditoryLevel
  onComplete: (score: number) => void
  onNext: () => void
  ttsSpeak: (text: string) => void
  progress?: number
  onClose?: () => void
}
