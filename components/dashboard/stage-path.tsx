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
import { RWLessonPlayer } from "./rw-lesson-player"
import { AuditoryLearningLesson } from "../auditory/AuditoryApp"
import { KinestheticApp } from "../kinesthetic/KinestheticApp"

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
  const [activeRWLesson, setActiveRWLesson] = useState<string | null>(null)
  const [activeAuditoryLesson, setActiveAuditoryLesson] = useState<number | null>(null)
  const [activeKinestheticLesson, setActiveKinestheticLesson] = useState<number | null>(null)

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
        className="flex w-full max-w-xl items-center justify-between rounded-2xl border-b-4 px-5 py-4"
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
        <span className="flex items-center gap-1.5 rounded-xl bg-black/20 px-3 py-2 text-xs font-extrabold">
          <BookText className="h-4 w-4" />
          GUIDE
        </span>
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
                  onClick={() => {
                    if (st !== "locked") {
                      if (style === "readwrite" && stage.kind === "lesson") {
                        setActiveRWLesson(stage.id)
                      } else if (style === "auditory") {
                        setActiveAuditoryLesson(i)
                      } else if (style === "kinesthetic") {
                        setActiveKinestheticLesson(i)
                      } else {
                        setOpenStage({ stage, index: i })
                      }
                    }
                  }}
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

        {activeKinestheticLesson !== null && (
          <KinestheticApp
            levelIndex={activeKinestheticLesson}
            onComplete={(score) => {
              if (activeKinestheticLesson === completed) {
                update({
                  progress: { ...profile.progress, [style]: completed + 1 },
                  sparks: profile.sparks + 10,
                })
              }
              setActiveKinestheticLesson(null)
            }}
            onClose={() => setActiveKinestheticLesson(null)}
          />
        )}
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
                This stage is a placeholder for now — soon it&apos;ll have a fun{" "}
                {meta.shortName.toLowerCase()}-style activity!
              </SpeechBubble>
            </div>

            <button
              type="button"
              onClick={() => completeStage(openStage.index)}
              className="mt-5 w-full rounded-2xl border-b-4 border-primary/40 bg-primary py-3 text-base font-extrabold tracking-wide text-primary-foreground transition-all active:translate-y-0.5 active:border-b-2"
            >
              {openStage.index < completed ? "REVIEW (+0)" : "COMPLETE (+10 Sparks)"}
            </button>
          </div>
        </div>
      )}

      {/* interactive read/write player overlay */}
      {activeRWLesson && (
        <RWLessonPlayer
          lessonId={activeRWLesson}
          age={profile.ageGroup}
          onExit={() => setActiveRWLesson(null)}
          onComplete={(xpEarned) => {
            const activeIndex = stages.findIndex(s => s.id === activeRWLesson)
            if (activeIndex === completed) {
              update({
                progress: { ...profile.progress, [style]: completed + 1 },
                sparks: profile.sparks + xpEarned,
              })
            }
            setActiveRWLesson(null)
          }}
        />
      )}

      {/* interactive auditory player overlay */}
      {activeAuditoryLesson !== null && style === "auditory" && (
        <AuditoryLearningLesson
          levelIndex={activeAuditoryLesson}
          onClose={() => setActiveAuditoryLesson(null)}
          onComplete={(score) => {
            if (activeAuditoryLesson === completed) {
              update({
                progress: { ...profile.progress, [style]: completed + 1 },
                sparks: profile.sparks + 10,
              })
            }
            setActiveAuditoryLesson(null)
          }}
        />
      )}
    </div>
  )
}
