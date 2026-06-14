"use client"

import { useState } from "react"
import {
  Star,
  Lock,
  Gift,
  Dumbbell,
  Trophy,
  Check,
  X,
  BookText,
} from "lucide-react"
import { Mascot, SpeechBubble } from "@/components/mascot"
import { useProfile } from "@/lib/use-profile"
import { LEARNING_STYLES, type StyleKey } from "@/lib/learning-styles"
import { getStages, MODULE_SECTIONS, type Stage, type StageKind } from "@/lib/stages"
import { cn } from "@/lib/utils"

const KIND_ICON: Record<StageKind, typeof Star> = {
  lesson: Star,
  chest: Gift,
  practice: Dumbbell,
  trophy: Trophy,
}

// horizontal offsets to create the winding Duolingo path
const OFFSETS = [0, -64, -96, -64, 0, 64]

export function StagePath({ style }: { style: StyleKey }) {
  const { profile, update } = useProfile()
  const stages = getStages(style)
  const section = MODULE_SECTIONS[style]
  const meta = LEARNING_STYLES[style]
  const completed = profile.progress[style] ?? 0
  const [openStage, setOpenStage] = useState<{ stage: Stage; index: number } | null>(
    null,
  )

  const [activeLessonIndex, setActiveLessonIndex] = useState<number | null>(null)

  const [showGuide, setShowGuide] = useState(false)

  function status(index: number): "done" | "active" | "locked" {
    if (index < completed) return "done"
    if (index === completed) return "active"
    return "locked"
  }

  function completeStage(index: number) {
    if (index === completed) {
      update({
        progress: { ...profile.progress, [style]: completed + 1 },
        sparks: profile.sparks + 10,
      })
    }
    setOpenStage(null)
  }

  const handleStartStage = (index: number) => {
    if (style === "auditory") {
      setActiveLessonIndex(index)
      setOpenStage(null)
    } else {
      completeStage(index)
    }
  }

  if (activeLessonIndex !== null && style === "auditory") {
    // Dynamically import to avoid circular dependencies if any
    const { AuditoryLearningLesson } = require("@/components/auditory/AuditoryApp")
    return (
      <AuditoryLearningLesson
        levelIndex={activeLessonIndex}
        onComplete={(score: number) => {
          if (activeLessonIndex === completed) completeStage(activeLessonIndex)
          setActiveLessonIndex(null)
        }}
        onClose={() => setActiveLessonIndex(null)}
      />
    )
  }

  const points = stages.map((stage, i) => {
    const hasBadge = status(i) === "active"
    const badgeHeight = 32 // 24px badge + 8px gap
    const buttonHeight = 64
    const nodeHeight = (hasBadge ? badgeHeight : 0) + buttonHeight
    return {
      hasBadge,
      nodeHeight,
      offset: OFFSETS[i % OFFSETS.length],
    }
  })

  let currentY = 0
  const pathPoints = points.map((p) => {
    const cy = currentY + (p.hasBadge ? 32 : 0) + 32
    currentY += p.nodeHeight + 24 // 24 is gap-6
    return { x: p.offset, y: cy }
  })

  return (
    <div className="flex flex-col items-center">
      {/* unit banner */}
      <div
        className="flex w-full max-w-xl items-center justify-between rounded-2xl border-b-4 px-5 py-4 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => setShowGuide(true)}
        style={{
          background: meta.colorVar,
          borderColor: "color-mix(in oklab, black 25%, transparent)",
          color: "var(--background)",
        }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-wide opacity-80">
            {section.section}
          </p>
          <h2 className="text-lg font-extrabold">{section.unit}</h2>
          <p className="text-xs font-semibold opacity-90">{section.subtitle}</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl bg-black/20 px-3 py-2 text-xs font-extrabold hover:bg-black/30 transition-colors">
          <BookText className="h-4 w-4" />
          GUIDE
        </button>
      </div>

      {/* winding node path */}
      <div className="relative mt-10 flex w-full flex-col items-center gap-6 pb-10">
        {/* SVG Path Connections */}
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none z-0"
          aria-hidden="true"
        >
          <g style={{ transform: "translateX(50%)" }}>
            {pathPoints.map((p, i) => {
              if (i === pathPoints.length - 1) return null
              const next = pathPoints[i + 1]
              const isDone = status(i) === "done"
              // Use primary color for completed paths, border color for locked
              const strokeColor = isDone ? "var(--primary)" : "var(--border)"
              
              return (
                <path
                  key={i}
                  d={`M ${p.x} ${p.y} C ${p.x} ${p.y + 40}, ${next.x} ${next.y - 40}, ${next.x} ${next.y}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="14"
                  strokeLinecap="round"
                />
              )
            })}
          </g>
        </svg>

        {stages.map((stage, i) => {
          const st = status(i)
          const Icon = KIND_ICON[stage.kind]
          const offset = OFFSETS[i % OFFSETS.length]
          return (
            <div
              key={stage.id}
              className="relative z-10 flex w-full justify-center"
              style={{ transform: `translateX(${offset}px)` }}
            >
              <div className="flex flex-col items-center gap-2">
                {st === "active" && (
                  <span className="animate-bounce rounded-lg bg-card px-3 py-1 text-xs font-extrabold uppercase text-foreground shadow border-2 border-border">
                    Start
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => st !== "locked" && setOpenStage({ stage, index: i })}
                  disabled={st === "locked"}
                  aria-label={`${stage.title} — ${st}`}
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full border-b-[6px] transition-all active:translate-y-1 active:border-b-2",
                    st === "locked" &&
                      "cursor-not-allowed border-border/60 bg-muted text-muted-foreground",
                  )}
                  style={
                    st !== "locked"
                      ? {
                          background: st === "done" ? "var(--primary)" : meta.colorVar,
                          borderColor: "color-mix(in oklab, black 30%, transparent)",
                          color: "var(--background)",
                        }
                      : undefined
                  }
                >
                  {st === "done" ? (
                    <Check className="h-7 w-7" />
                  ) : st === "locked" ? (
                    <Lock className="h-6 w-6" />
                  ) : (
                    <Icon className="h-7 w-7" />
                  )}
                </button>
              </div>

              {/* mascot peeking near the active node */}
              {st === "active" && (
                <Mascot
                  size={72}
                  animate={false}
                  className="absolute left-[calc(50%+72px)] top-1/2 -translate-y-1/2"
                />
              )}
            </div>
          )
        })}
      </div>

      {/* stage dialog */}
      {openStage && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenStage(null)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border-2 border-border bg-card p-6 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: meta.colorVar, color: "var(--background)" }}
                >
                  {(() => {
                    const I = KIND_ICON[openStage.stage.kind]
                    return <I className="h-6 w-6" />
                  })()}
                </span>
                <div>
                  <h3 className="text-lg font-extrabold">{openStage.stage.title}</h3>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {meta.shortName} module · Stage {openStage.index + 1}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenStage(null)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <Mascot size={64} animate={false} />
              <SpeechBubble tail="left" className="text-sm">
                {style === "auditory"
                  ? "Ready for a listening challenge?"
                  : `This stage is a placeholder for now — soon it'll have a fun ${meta.shortName.toLowerCase()}-style activity!`}
              </SpeechBubble>
            </div>

            <button
              type="button"
              onClick={() => handleStartStage(openStage.index)}
              className="mt-5 w-full rounded-2xl border-b-4 border-primary/40 bg-primary py-3 text-base font-extrabold tracking-wide text-primary-foreground transition-all active:translate-y-0.5 active:border-b-2"
            >
              {openStage.index < completed ? "REVIEW (+0)" : (style === "auditory" ? "START LESSON" : "COMPLETE (+10 Sparks)")}
            </button>
          </div>
        </div>
      )}

      {/* Guide dialog */}
      {showGuide && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border-2 border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-extrabold" style={{ color: meta.colorVar }}>
                {meta.name} Guide
              </h2>
              <button
                onClick={() => setShowGuide(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <p>
                <strong>Welcome to the Auditory path!</strong>
              </p>
              <p>
                If you are an auditory learner, you learn best through listening and speaking. You might notice that you:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Remember what people say better than what they look like.</li>
                <li>Like to talk things through or read out loud to understand them.</li>
                <li>Follow spoken directions well.</li>
                <li>Enjoy music, rhythms, and patterns in sound.</li>
              </ul>
              
              <div className="mt-6 p-4 rounded-xl bg-muted border border-border">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Mascot size={32} /> Tips for this Path
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Make sure your sound is on! You will be asked to listen to prompts, match sounds, and even repeat phrases into your microphone to practice. Don't be afraid to speak up—your voice is the best tool for learning here!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-8 w-full rounded-2xl border-b-4 border-primary/40 bg-primary py-3 text-base font-extrabold text-primary-foreground active:translate-y-0.5 active:border-b-2"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
