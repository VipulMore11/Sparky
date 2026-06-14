"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { X, Heart, Check, ArrowRight, RotateCcw, Trophy, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { findLesson } from "@/lib/rw-content"
import { gradeStep, isAnswerReady } from "@/lib/rw-grading"
import { RWStepViews } from "./rw-step-views"
import type { AgeGroup } from "@/lib/learning-styles"
import type { Step } from "@/lib/rw-types"

type Phase = "answering" | "correct" | "wrong"

interface RWLessonPlayerProps {
  lessonId: string
  age: AgeGroup
  onExit: () => void
  onComplete: (xpEarned: number) => void
}

export function RWLessonPlayer({ lessonId, age, onExit, onComplete }: RWLessonPlayerProps) {
  const lesson = useMemo(() => findLesson(age, lessonId), [age, lessonId])
  
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<unknown>(null)
  const [phase, setPhase] = useState<Phase>("answering")
  const [hearts, setHearts] = useState(5)
  const [failed, setFailed] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  if (!lesson) return null

  const step = lesson.steps[index]
  const total = lesson.steps.length
  const progressPct = Math.round((index / total) * 100)
  const isGraded = step.kind !== "intro"

  // reset per-step transient state
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setAnswer(step.kind === "read-order" ? [] : step.kind === "match" ? {} : null)
    setPhase("answering")
  }, [index, step.kind])

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
    if (correct) {
      setCorrectAnswers((c) => c + 1)
    } else {
      setHearts((h) => {
        const newHearts = Math.max(0, h - 1)
        if (newHearts === 0) setFailed(true)
        return newHearts
      })
      if (hearts - 1 <= 0) return
    }
    goNext()
  }

  function goNext() {
    if (index + 1 >= total) {
      setCompleted(true)
    } else {
      setIndex((i) => i + 1)
    }
  }

  function tryAgain() {
    setPhase("answering")
  }

  // ---- Failure screen ----
  if (failed) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background px-6 text-center">
        <div className="flex size-24 items-center justify-center rounded-full bg-destructive/10">
          <Heart className="size-12 text-destructive" />
        </div>
        <h2 className="mt-8 text-3xl font-extrabold text-foreground">Out of hearts!</h2>
        <p className="mt-4 max-w-sm text-lg text-muted-foreground font-semibold">
          Take a breath and try this lesson again. Practice makes perfect!
        </p>
        <Button onClick={onExit} size="lg" className="mt-8 h-14 rounded-2xl px-10 text-lg font-extrabold uppercase tracking-wide">
          Back to Path
        </Button>
      </div>
    )
  }

  // ---- Summary screen ----
  if (completed) {
    const accuracy = correctAnswers / (total - 1) // subtract intro
    const stars = accuracy >= 0.95 ? 3 : accuracy >= 0.7 ? 2 : accuracy >= 0.4 ? 1 : 0
    const xpEarned = lesson.xp + (stars * 5)

    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
          <div className="flex justify-center">
            <div className="relative flex size-32 items-center justify-center rounded-full bg-primary shadow-xl ring-8 ring-primary/20">
              <Trophy className="size-16 text-primary-foreground" />
              {/* Star decorations */}
              <div className="absolute -top-4 right-0 rotate-12 text-yellow-400">
                <Star className="size-8 fill-current" />
              </div>
              <div className="absolute -left-2 bottom-4 -rotate-12 text-yellow-400">
                <Star className="size-6 fill-current" />
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-extrabold text-primary">Lesson Complete!</h2>
            <p className="mt-2 text-xl font-bold text-foreground">{lesson.title}</p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center rounded-2xl border-2 border-border bg-card py-4">
              <span className="text-sm font-bold uppercase text-muted-foreground">Total XP</span>
              <span className="mt-1 text-3xl font-black text-primary">+{xpEarned}</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl border-2 border-border bg-card py-4">
              <span className="text-sm font-bold uppercase text-muted-foreground">Accuracy</span>
              <span className="mt-1 text-3xl font-black text-foreground">{Math.round(accuracy * 100)}%</span>
            </div>
          </div>

          <Button 
            onClick={() => onComplete(xpEarned)} 
            size="lg" 
            className="mt-8 h-14 w-full rounded-2xl border-b-4 bg-primary text-lg font-extrabold uppercase tracking-wide text-primary-foreground transition-all active:translate-y-1 active:border-b-0"
          >
            Continue
          </Button>
        </div>
      </div>
    )
  }

  const ready = isAnswerReady(step, answer)

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      {/* Top bar: close + progress + hearts */}
      <div className="flex h-16 items-center gap-4 px-5">
        <button
          type="button"
          onClick={onExit}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-7" />
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex items-center gap-1.5 font-extrabold text-destructive text-xl">
          <Heart className="size-6 fill-destructive text-destructive" />
          {hearts}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-5 py-6">
          {step.kind === "intro" ? (
            <div className="flex flex-col items-center py-10 text-center animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex size-20 items-center justify-center rounded-3xl bg-primary text-4xl font-black text-primary-foreground shadow-lg shadow-primary/20">
                {index + 1}
              </div>
              <h2 className="mt-8 text-3xl font-extrabold text-balance text-foreground">{step.title}</h2>
              <p className="mt-4 max-w-md text-lg text-pretty font-medium leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <RWStepViews
                step={step}
                answer={answer}
                setAnswer={setAnswer}
                locked={phase !== "answering"}
                correct={phase === "answering" ? null : phase === "correct"}
                onHint={() => {}}
              />
            </div>
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
        phase === "answering" && "border-border bg-background"
      )}
    >
      <div className="mx-auto max-w-2xl px-5 py-4 sm:py-6">
        {phase === "correct" && (
          <div className="mb-4 flex items-start gap-3 font-extrabold text-success">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
              <Check className="size-5" strokeWidth={4} />
            </div>
            <div>
              <p className="text-xl">Awesome!</p>
              {sample && <p className="mt-1 text-sm font-semibold text-success/80">Example: {sample}</p>}
            </div>
          </div>
        )}
        {phase === "wrong" && (
          <div className="mb-4 flex items-start gap-3 font-extrabold text-destructive">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
              <X className="size-5" strokeWidth={4} />
            </div>
            <div>
              <p className="text-xl">Not quite.</p>
              <p className="mt-1 text-sm font-semibold text-destructive/80">{feedbackText(step)}</p>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {phase === "answering" && (
            <Button
              onClick={onCheck}
              disabled={isGraded && !ready}
              size="lg"
              className={cn(
                "h-14 flex-1 rounded-2xl text-lg font-extrabold uppercase tracking-wide",
                isGraded && !ready ? "bg-muted text-muted-foreground border-b-0" : "bg-primary border-b-4 active:translate-y-1 active:border-b-0 transition-all"
              )}
            >
              {isGraded ? "Check" : "Continue"}
              {!isGraded && <ArrowRight className="ml-2 size-5" />}
            </Button>
          )}
          {phase === "correct" && (
            <Button 
              onClick={onContinue} 
              size="lg" 
              className="h-14 flex-1 rounded-2xl border-b-4 border-success/40 bg-success text-lg font-extrabold uppercase tracking-wide text-success-foreground hover:bg-success transition-all active:translate-y-1 active:border-b-0"
            >
              Continue
              <ArrowRight className="ml-2 size-5" />
            </Button>
          )}
          {phase === "wrong" && (
            <>
              {canRetry && (
                <Button
                  onClick={onTryAgain}
                  size="lg"
                  variant="outline"
                  className="h-14 flex-1 rounded-2xl border-2 text-lg font-extrabold uppercase tracking-wide"
                >
                  <RotateCcw className="mr-2 size-5" />
                  Retry
                </Button>
              )}
              <Button
                onClick={onContinue}
                size="lg"
                className="h-14 flex-1 rounded-2xl border-b-4 border-destructive/40 bg-destructive text-lg font-extrabold uppercase tracking-wide text-primary-foreground transition-all hover:bg-destructive active:translate-y-1 active:border-b-0"
              >
                Continue
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
