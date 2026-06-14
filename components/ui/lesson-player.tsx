"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useGame } from "@/lib/game-store"
import { findLesson } from "@/lib/content"
import type { Step, StepAttempt, Modality, AgeGroup } from "@/lib/types"
import { gradeStep, isAnswerReady } from "@/lib/grading"
import { StepView } from "@/components/step-views"
import { Button } from "@/components/ui/button"
import { X, Heart, Check, ArrowRight, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { SessionSummary } from "@/components/session-summary"
import type { FinishResult } from "@/components/session-summary"

type Phase = "answering" | "correct" | "wrong"

function stepModality(step: Step): Modality | null {
  if (step.kind === "intro") return null
  return step.modality
}

export function LessonPlayer({
  lessonId,
  age,
  onExit,
  onGoToDashboard,
}: {
  lessonId: string
  age: AgeGroup
  onExit: () => void
  onGoToDashboard: () => void
}) {
  const { state, loseHeart, finishLesson } = useGame()
  const lesson = useMemo(() => findLesson(age, lessonId), [age, lessonId])

  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<unknown>(null)
  const [phase, setPhase] = useState<Phase>("answering")
  const [hintUsed, setHintUsed] = useState(false)
  const [retries, setRetries] = useState(0)
  const [failed, setFailed] = useState(false)
  const [result, setResult] = useState<FinishResult | null>(null)

  const startRef = useRef<number>(Date.now())
  const sessionStartRef = useRef<number>(Date.now())
  const attemptsRef = useRef<StepAttempt[]>([])

  const heartsRef = useRef(state.hearts)
  useEffect(() => {
    heartsRef.current = state.hearts
  }, [state.hearts])

  if (!lesson) return null
  const step = lesson.steps[index]
  const total = lesson.steps.length
  const progressPct = Math.round((index / total) * 100)
  const modality = stepModality(step)
  const isGraded = step.kind !== "intro"

  // reset per-step transient state
  useEffect(() => {
    setAnswer(step.kind === "read-order" ? [] : step.kind === "match" ? {} : null)
    setPhase("answering")
    setHintUsed(false)
    setRetries(0)
    startRef.current = Date.now()
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  function recordAttempt(correct: boolean) {
    if (!isGraded) return
    attemptsRef.current.push({
      lessonId,
      stepKind: step.kind,
      modality,
      correct,
      timeMs: Date.now() - startRef.current,
      hintUsed,
      retries,
      timestamp: Date.now(),
    })
  }

  function handleCheck() {
    if (!isGraded) {
      goNext()
      return
    }
    const correct = gradeStep(step, answer)
    if (correct) {
      setPhase("correct")
    } else {
      setPhase("wrong")
    }
  }

  function commitAndNext(correct: boolean) {
    recordAttempt(correct)
    if (!correct) {
      loseHeart()
      if (heartsRef.current - 1 <= 0) {
        setFailed(true)
        return
      }
    }
    goNext()
  }

  function goNext() {
    if (index + 1 >= total) {
      finalize()
    } else {
      setIndex((i) => i + 1)
    }
  }

  function tryAgain() {
    // counts as a retry on the same step; reset to answering
    setRetries((r) => r + 1)
    setPhase("answering")
    startRef.current = Date.now()
  }

  function finalize() {
    const res = finishLesson({
      lessonId,
      age,
      attempts: attemptsRef.current,
      baseXp: lesson!.xp,
      durationMs: Date.now() - sessionStartRef.current,
    })
    const reading = attemptsRef.current.filter((a) => a.modality === "reading")
    const writing = attemptsRef.current.filter((a) => a.modality === "writing")
    setResult({
      xpEarned: res.xpEarned,
      stars: res.stars,
      newBadges: res.newBadges.map((b) => ({ id: b.id, name: b.name, icon: b.icon })),
      readingCorrect: reading.filter((a) => a.correct).length,
      readingTotal: reading.length,
      writingCorrect: writing.filter((a) => a.correct).length,
      writingTotal: writing.length,
      lessonTitle: lesson!.title,
    })
  }

  // ---- Failure screen (out of hearts) ----
  if (failed) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-heart/10">
          <Heart className="size-10 text-heart" />
        </div>
        <h2 className="mt-6 text-2xl font-extrabold">Out of hearts!</h2>
        <p className="mt-2 max-w-sm text-pretty leading-relaxed text-muted-foreground">
          Take a breath and try this lesson again. Hearts refill each day, and practice makes progress.
        </p>
        <Button onClick={onExit} size="lg" className="mt-6 h-13 rounded-2xl px-8 font-extrabold">
          Back to path
        </Button>
      </div>
    )
  }

  // ---- Summary screen ----
  if (result) {
    return (
      <SessionSummary
        result={result}
        onContinue={onExit}
        onViewStats={onGoToDashboard}
      />
    )
  }

  const ready = isAnswerReady(step, answer)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar: close + progress + hearts */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onExit}
          aria-label="Quit lesson"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-6" />
        </button>
        <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex items-center gap-1 font-extrabold text-heart">
          <Heart className="size-5 fill-heart" />
          {state.hearts}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-5 py-6">
          {step.kind === "intro" ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="flex size-16 items-center justify-center rounded-3xl bg-primary/15 text-2xl font-black text-primary">
                {index + 1}
              </div>
              <h2 className="mt-5 text-2xl font-extrabold text-balance">{step.title}</h2>
              <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ) : (
            <StepView
              step={step}
              answer={answer}
              setAnswer={setAnswer}
              locked={phase !== "answering"}
              correct={phase === "answering" ? null : phase === "correct"}
              onHint={() => setHintUsed(true)}
            />
          )}
        </div>
      </div>

      {/* Feedback + footer */}
      <Footer
        phase={phase}
        step={step}
        ready={ready}
        isGraded={isGraded}
        onCheck={handleCheck}
        onContinue={() => commitAndNext(phase === "correct")}
        onTryAgain={tryAgain}
      />
    </div>
  )
}

function feedbackText(step: Step): string {
  switch (step.kind) {
    case "read-choice":
      return `Correct answer: ${step.options[step.answer]}`
    case "read-order":
      return `Correct order: ${step.items.join(" → ")}`
    case "write-fill":
      return `Accepted answer: ${step.answers[0]}`
    case "write-short":
      return `Try to include ideas like: ${step.keywords.slice(0, 4).join(", ")}.`
    case "match":
      return "Review the correct matches and try the next one."
    default:
      return ""
  }
}

function Footer({
  phase,
  step,
  ready,
  isGraded,
  onCheck,
  onContinue,
  onTryAgain,
}: {
  phase: Phase
  step: Step
  ready: boolean
  isGraded: boolean
  onCheck: () => void
  onContinue: () => void
  onTryAgain: () => void
}) {
  const canRetry = step.kind === "write-short" || step.kind === "write-fill"
  const sample = step.kind === "write-short" ? step.sample : null

  return (
    <div
      className={cn(
        "border-t-2 transition-colors",
        phase === "correct" && "border-success/30 bg-success/10",
        phase === "wrong" && "border-destructive/30 bg-destructive/10",
        phase === "answering" && "border-border bg-background",
      )}
    >
      <div className="mx-auto max-w-2xl px-5 py-4">
        {phase === "correct" && (
          <div className="mb-3 flex items-start gap-2 font-extrabold text-success">
            <Check className="mt-0.5 size-5 shrink-0" strokeWidth={3} />
            <div>
              <p>Nice work!</p>
              {sample && <p className="text-sm font-semibold text-success/80">Example: {sample}</p>}
            </div>
          </div>
        )}
        {phase === "wrong" && (
          <div className="mb-3 flex items-start gap-2 font-extrabold text-destructive">
            <X className="mt-0.5 size-5 shrink-0" strokeWidth={3} />
            <div>
              <p>Not quite.</p>
              <p className="text-sm font-semibold text-destructive/80">{feedbackText(step)}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {phase === "answering" && (
            <Button
              onClick={onCheck}
              disabled={isGraded && !ready}
              size="lg"
              className="h-13 flex-1 rounded-2xl text-base font-extrabold"
            >
              {isGraded ? "Check" : "Continue"}
              {!isGraded && <ArrowRight className="size-5" />}
            </Button>
          )}
          {phase === "correct" && (
            <Button onClick={onContinue} size="lg" className="h-13 flex-1 rounded-2xl bg-success text-base font-extrabold text-success-foreground hover:bg-success/90">
              Continue
              <ArrowRight className="size-5" />
            </Button>
          )}
          {phase === "wrong" && (
            <>
              {canRetry && (
                <Button
                  onClick={onTryAgain}
                  size="lg"
                  variant="outline"
                  className="h-13 flex-1 rounded-2xl text-base font-extrabold"
                >
                  <RotateCcw className="size-5" />
                  Try again
                </Button>
              )}
              <Button
                onClick={onContinue}
                size="lg"
                className="h-13 flex-1 rounded-2xl bg-destructive text-base font-extrabold text-primary-foreground hover:bg-destructive/90"
              >
                Continue
                <ArrowRight className="size-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
