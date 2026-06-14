"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Play, Sparkles } from "lucide-react"
import { FlowShell } from "@/components/flow-shell"
import { Mascot, SpeechBubble } from "@/components/mascot"
import { useProfile } from "@/lib/use-profile"
import { AGE_GROUPS, type AgeGroup } from "@/lib/learning-styles"
import { cn } from "@/lib/utils"

const STEPS = ["intro", "mission", "video", "video-quiz", "age", "name", "ready"] as const
type Step = (typeof STEPS)[number]

/** Short, kid-friendly STEM video (SciShow Kids – "What Is Engineering?") */
const YOUTUBE_VIDEO_ID = "owHF9iLyxic"

type VideoQuizOption = {
  id: string
  emoji: string
  label: string
  correct: boolean
}

const VIDEO_QUIZ_QUESTION =
  "What do engineers do?"

const VIDEO_QUIZ_OPTIONS: VideoQuizOption[] = [
  { id: "a", emoji: "🔧", label: "Design and build things to solve problems", correct: true },
  { id: "b", emoji: "🎨", label: "Only paint and draw pictures", correct: false },
  { id: "c", emoji: "🍕", label: "Cook food for people", correct: false },
  { id: "d", emoji: "📖", label: "Only read books all day", correct: false },
]

export function OnboardingFlow() {
  const router = useRouter()
  const { profile, ready, update } = useProfile()
  const [stepIndex, setStepIndex] = useState(0)
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null)
  const [name, setName] = useState("")
  const [videoAnswer, setVideoAnswer] = useState<string | null>(null)
  const [showVideoResult, setShowVideoResult] = useState(false)

  // resume: if they already finished the assessment, send them to the dashboard
  useEffect(() => {
    if (ready && profile.assessmentComplete) {
      router.replace("/learn")
    }
  }, [ready, profile.assessmentComplete, router])

  // prefill if partially onboarded
  useEffect(() => {
    if (ready) {
      if (profile.ageGroup) setAgeGroup(profile.ageGroup)
      if (profile.name) setName(profile.name)
    }
  }, [ready, profile.ageGroup, profile.name])

  const step: Step = STEPS[stepIndex]
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  function back() {
    if (stepIndex > 0) {
      if (step === "video-quiz") {
        setVideoAnswer(null)
        setShowVideoResult(false)
      }
      setStepIndex((i) => i - 1)
    }
  }

  function next() {
    if (step === "age" && ageGroup) update({ ageGroup })
    if (step === "name") update({ name: name.trim(), onboarded: true })
    if (step === "ready") {
      update({ name: name.trim(), ageGroup: ageGroup ?? undefined, onboarded: true })
      router.push("/assessment")
      return
    }
    if (step === "video-quiz") {
      setShowVideoResult(false)
      setVideoAnswer(null)
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
  }

  function handleVideoQuizAnswer(optionId: string) {
    setVideoAnswer(optionId)
    setShowVideoResult(true)
  }

  const canContinue =
    step === "age"
      ? !!ageGroup
      : step === "name"
        ? name.trim().length > 0
        : step === "video-quiz"
          ? showVideoResult
          : true

  const continueLabel = step === "ready" ? "START QUEST" : "CONTINUE"

  return (
    <FlowShell
      progress={progress}
      onBack={stepIndex > 0 ? back : undefined}
      canContinue={canContinue}
      onContinue={next}
      continueLabel={continueLabel}
    >
      {step === "intro" && (
        <div className="flex flex-col items-center gap-6 text-center">
          <SpeechBubble>Hi there! I&apos;m Sparky!</SpeechBubble>
          <Mascot size={160} />
          <p className="max-w-md text-pretty text-muted-foreground">
            Welcome to SparkPath. I help kids discover the way they learn STEM
            best — then show them the perfect tools to learn their way.
          </p>
        </div>
      )}

      {step === "mission" && (
        <div className="flex items-start gap-4">
          <Mascot size={96} className="mt-2" />
          <div className="flex flex-col gap-4">
            <SpeechBubble tail="left">
              Everyone&apos;s brain is different — and that&apos;s a superpower!
            </SpeechBubble>
            <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
              Some kids learn by seeing, some by listening, some by reading, and
              some by doing. Let&apos;s find out which one is most like you, so
              learning feels easy and fun.
            </p>
          </div>
        </div>
      )}

      {step === "video" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <Mascot size={88} className="mt-1" />
            <div className="flex flex-col gap-2">
              <SpeechBubble tail="left">
                Let&apos;s watch a short video together! 🎬
              </SpeechBubble>
              <p className="text-sm text-muted-foreground">
                Watch this fun STEM video, then I&apos;ll ask you a question about it.
              </p>
            </div>
          </div>

          {/* YouTube embed with premium styling */}
          <div className="relative mx-auto w-full max-w-2xl">
            {/* Glowing border effect */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary via-secondary to-primary opacity-50 blur-md" />
            <div className="relative overflow-hidden rounded-2xl border-2 border-border bg-black shadow-2xl">
              {/* Video badge */}
              <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 backdrop-blur-sm">
                <Play className="h-3 w-3 fill-red-500 text-red-500" />
                <span className="text-xs font-bold text-white">STEM Video</span>
              </div>
              {/* 16:9 responsive embed */}
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
                  title="STEM Video – What Is Engineering?"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            {/* Sparkle decorations */}
            <Sparkles className="absolute -right-3 -top-3 h-6 w-6 text-secondary animate-pulse" />
            <Sparkles className="absolute -bottom-2 -left-2 h-5 w-5 text-primary animate-pulse delay-300" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            ▶ Press play and watch the video, then tap <strong>CONTINUE</strong> when you&apos;re ready!
          </p>
        </div>
      )}

      {step === "video-quiz" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <Mascot size={88} className="mt-1" />
            <div className="flex flex-col gap-2">
              <SpeechBubble tail="left">
                Nice job watching! Let&apos;s see what you learned 🧠
              </SpeechBubble>
              <p className="text-sm font-medium text-foreground">
                {VIDEO_QUIZ_QUESTION}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {VIDEO_QUIZ_OPTIONS.map((opt) => {
              const isSelected = videoAnswer === opt.id
              const isCorrect = opt.correct
              const showFeedback = showVideoResult

              let borderClass =
                "border-border bg-card hover:border-muted-foreground/40"
              if (showFeedback && isSelected && isCorrect) {
                borderClass = "border-emerald-500 bg-emerald-500/10"
              } else if (showFeedback && isSelected && !isCorrect) {
                borderClass = "border-red-400 bg-red-400/10"
              } else if (showFeedback && isCorrect) {
                borderClass = "border-emerald-500/50 bg-emerald-500/5"
              } else if (isSelected) {
                borderClass = "border-primary bg-primary/10"
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => !showVideoResult && handleVideoQuizAnswer(opt.id)}
                  disabled={showVideoResult}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border-2 border-b-4 p-4 text-left transition-all",
                    !showVideoResult && "active:translate-y-0.5",
                    borderClass,
                    showVideoResult && "cursor-default",
                  )}
                >
                  <span className="text-2xl" aria-hidden>
                    {showFeedback && isSelected ? (isCorrect ? "✅" : "❌") : opt.emoji}
                  </span>
                  <span className="flex-1 font-bold leading-snug">{opt.label}</span>
                  {showFeedback && isCorrect && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {showVideoResult && (
            <div
              className={cn(
                "rounded-2xl border-2 p-4 text-center text-sm font-semibold transition-all",
                VIDEO_QUIZ_OPTIONS.find((o) => o.id === videoAnswer)?.correct
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
              )}
            >
              {VIDEO_QUIZ_OPTIONS.find((o) => o.id === videoAnswer)?.correct
                ? "🎉 Amazing! Engineers design and build things to solve real problems!"
                : "🌟 Not quite, but great try! Engineers design and build things to solve problems. You'll learn all about it!"}
            </div>
          )}
        </div>
      )}

      {step === "age" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <Mascot size={88} className="mt-1" />
            <SpeechBubble tail="left">How old are you?</SpeechBubble>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AGE_GROUPS.map((g) => {
              const selected = ageGroup === g.key
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setAgeGroup(g.key)}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border-2 border-b-4 p-4 text-left transition-all active:translate-y-0.5",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-muted-foreground/40",
                  )}
                >
                  <span className="text-3xl" aria-hidden>
                    {g.emoji}
                  </span>
                  <span className="flex-1">
                    <span className="block font-extrabold">{g.label}</span>
                    <span className="block text-sm text-muted-foreground">
                      {g.range}
                    </span>
                  </span>
                  {selected && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {step === "name" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <Mascot size={88} className="mt-1" />
            <SpeechBubble tail="left">What should I call you?</SpeechBubble>
          </div>
          <div className="max-w-md">
            <label htmlFor="kid-name" className="sr-only">
              Your name
            </label>
            <input
              id="kid-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) next()
              }}
              placeholder="Type your name or nickname"
              autoComplete="off"
              maxLength={20}
              className="w-full rounded-2xl border-2 border-border bg-card px-5 py-4 text-lg font-bold text-card-foreground outline-none transition-colors placeholder:font-normal placeholder:text-muted-foreground focus:border-primary"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              No accounts, no passwords — this just stays on your device.
            </p>
          </div>
        </div>
      )}

      {step === "ready" && (
        <div className="flex flex-col items-center gap-6 text-center">
          <SpeechBubble>
            Awesome{name ? `, ${name.trim()}` : ""}! Ready for a quick quest?
          </SpeechBubble>
          <Mascot size={150} />
          <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
            I&apos;ll ask you {" "}a few fun questions — some you&apos;ll see,
            some you&apos;ll hear, and some you&apos;ll read. There are no wrong
            answers. Just pick what feels most like you!
          </p>
        </div>
      )}
    </FlowShell>
  )
}
