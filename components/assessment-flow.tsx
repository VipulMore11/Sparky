"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Volume2, Eye, BookOpenText } from "lucide-react"
import { FlowShell } from "@/components/flow-shell"
import { Mascot, SpeechBubble } from "@/components/mascot"
import { useProfile } from "@/lib/use-profile"
import {
  QUESTIONS,
  scoreAssessment,
  type Answers,
  type Modality,
} from "@/lib/assessment"
import { cn } from "@/lib/utils"

const MODALITY_META: Record<
  Modality,
  { label: string; icon: typeof Eye; tip: string }
> = {
  visual: { label: "Look", icon: Eye, tip: "A see-it question" },
  audio: { label: "Listen", icon: Volume2, tip: "A hear-it question" },
  text: { label: "Read", icon: BookOpenText, tip: "A read-it question" },
}

export function AssessmentFlow() {
  const router = useRouter()
  const { profile, ready, update } = useProfile()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [spoke, setSpoke] = useState(false)
  const startedRef = useRef(false)

  // guard: must be onboarded first
  useEffect(() => {
    if (ready && !profile.onboarded) {
      router.replace("/")
    }
  }, [ready, profile.onboarded, router])

  const question = QUESTIONS[index]
  const total = QUESTIONS.length
  const progress = ((index + 1) / total) * 100
  const selected = answers[question.id]
  const Meta = MODALITY_META[question.modality]

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.95
    u.pitch = 1.15
    window.speechSynthesis.speak(u)
    setSpoke(true)
  }

  // auto-read audio questions once when they appear
  useEffect(() => {
    setSpoke(false)
    startedRef.current = false
    if (question.modality === "audio" && question.spoken) {
      const t = setTimeout(() => {
        if (!startedRef.current) {
          startedRef.current = true
          speak(question.spoken!)
        }
      }, 400)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  function choose(style: Answers[string]) {
    setAnswers((prev) => ({ ...prev, [question.id]: style }))
  }

  function back() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    if (index > 0) setIndex((i) => i - 1)
  }

  function next() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    if (index < total - 1) {
      setIndex((i) => i + 1)
      return
    }
    // finish: score & persist
    const result = scoreAssessment(answers)
    update({
      assessmentComplete: true,
      primaryStyle: result.primary,
      percentages: result.percentages,
      scores: result.scores,
      sparks: 50,
    })
    router.push("/results")
  }

  const audioNeedsListen = question.modality === "audio" && !spoke

  return (
    <FlowShell
      progress={progress}
      onBack={index > 0 ? back : undefined}
      canContinue={!!selected}
      onContinue={next}
      continueLabel={index === total - 1 ? "SEE MY RESULT" : "CHECK"}
    >
      <div className="flex flex-col gap-6">
        {/* modality chip */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Meta.icon className="h-3.5 w-3.5" />
            {Meta.label}
          </span>
          <span className="text-xs text-muted-foreground">
            Question {index + 1} of {total}
          </span>
        </div>

        {/* mascot + prompt */}
        <div className="flex items-start gap-4">
          <Mascot size={84} className="mt-1" animate={false} />
          <div className="flex flex-1 flex-col gap-3">
            <SpeechBubble tail="left">{question.prompt}</SpeechBubble>
            {question.helper && (
              <p className="text-sm text-muted-foreground">{question.helper}</p>
            )}
            {question.modality === "audio" && question.spoken && (
              <button
                type="button"
                onClick={() => speak(question.spoken!)}
                className={cn(
                  "inline-flex w-fit items-center gap-2 rounded-2xl border-2 border-b-4 px-4 py-2 text-sm font-bold transition-all active:translate-y-0.5",
                  audioNeedsListen
                    ? "border-secondary/50 bg-secondary text-secondary-foreground"
                    : "border-border bg-card text-card-foreground",
                )}
              >
                <Volume2 className="h-4 w-4" />
                {audioNeedsListen ? "Tap to listen" : "Play again"}
              </button>
            )}
          </div>
        </div>

        {/* options */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {question.options.map((opt) => {
            const isSel = selected === opt.style
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => choose(opt.style)}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border-2 border-b-4 p-4 text-left transition-all active:translate-y-0.5",
                  isSel
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground/40",
                )}
              >
                <span className="text-2xl" aria-hidden>
                  {opt.emoji}
                </span>
                <span className="flex-1 font-bold leading-snug">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </FlowShell>
  )
}
