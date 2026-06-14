"use client"

import { useGame } from "@/lib/game-store"
import { AGE_CONTENT } from "@/lib/content"
import type { Lesson } from "@/lib/types"
import { Check, Lock, Star, BookOpen, PenLine } from "lucide-react"
import { cn } from "@/lib/utils"

function modalityCounts(lesson: Lesson) {
  let reading = 0
  let writing = 0
  for (const s of lesson.steps) {
    if (s.kind === "intro") continue
    if (s.modality === "reading") reading++
    else writing++
  }
  return { reading, writing }
}

export function LearningPath({ onStart }: { onStart: (lessonId: string) => void }) {
  const { state } = useGame()
  if (!state.age) return null
  const content = AGE_CONTENT[state.age]

  // Build a flat ordered list across worlds to compute unlock state
  let globalIndex = -1

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <header className="mb-6">
        <p className="text-sm font-bold text-primary">{content.label}</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Hi {state.learnerName || "Explorer"}, ready to learn?</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Follow the path. Each stop is a 1–4 minute read &amp; write challenge.
        </p>
      </header>

      <div className="flex flex-col gap-10">
        {content.worlds.map((world) => (
          <section key={world.id} aria-label={world.title}>
            {/* World banner */}
            <div className="mb-6 flex items-center gap-3 rounded-3xl bg-gradient-to-r from-primary to-primary/70 p-5 text-primary-foreground">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-foreground/20 text-xl font-black">
                {world.title.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-extrabold leading-tight">{world.title}</h2>
                <p className="text-sm font-semibold text-primary-foreground/80">{world.tagline}</p>
              </div>
            </div>

            {/* Path of lessons */}
            <ol className="relative flex flex-col items-center gap-3">
              {world.lessons.map((lesson, i) => {
                globalIndex++
                const completed = state.completedLessons.includes(lesson.id)
                const stars = state.lessonStars[lesson.id] ?? 0
                // unlocked if first overall, or previous lesson in this world completed,
                // or it is already completed
                const prev = world.lessons[i - 1]
                const unlocked = completed || globalIndex === 0 || (prev ? state.completedLessons.includes(prev.id) : true)
                const isCurrent = unlocked && !completed
                const offset = i % 2 === 0 ? "sm:-translate-x-16" : "sm:translate-x-16"
                const { reading, writing } = modalityCounts(lesson)

                return (
                  <li key={lesson.id} className={cn("w-full max-w-md transition-transform", offset)}>
                    <button
                      type="button"
                      disabled={!unlocked}
                      onClick={() => unlocked && onStart(lesson.id)}
                      className={cn(
                        "group flex w-full items-center gap-4 rounded-3xl border-2 p-4 text-left transition-all",
                        !unlocked && "cursor-not-allowed border-border bg-muted/50 opacity-70",
                        unlocked && !completed && "border-primary bg-card ring-4 ring-primary/15 hover:ring-primary/25",
                        completed && "border-primary/30 bg-primary/5 hover:border-primary/60",
                      )}
                    >
                      {/* Node circle */}
                      <span
                        className={cn(
                          "relative flex size-14 shrink-0 items-center justify-center rounded-2xl text-primary-foreground shadow-sm",
                          completed && "bg-primary",
                          isCurrent && "bg-primary",
                          !unlocked && "bg-muted-foreground/40",
                        )}
                      >
                        {!unlocked ? (
                          <Lock className="size-6" />
                        ) : completed ? (
                          <Check className="size-7" strokeWidth={3} />
                        ) : (
                          <span className="text-lg font-black">{globalIndex + 1}</span>
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base font-extrabold">{lesson.title}</span>
                        <span className="block truncate text-sm font-semibold text-muted-foreground">
                          {lesson.subtitle}
                        </span>
                        <span className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
                          <span className="flex items-center gap-1 text-accent-foreground">
                            <BookOpen className="size-3.5" /> {reading}
                          </span>
                          <span className="flex items-center gap-1 text-primary">
                            <PenLine className="size-3.5" /> {writing}
                          </span>
                          <span className="text-xp-foreground">+{lesson.xp} XP</span>
                        </span>
                      </span>

                      {/* Stars */}
                      <span className="flex shrink-0 flex-col items-center gap-1">
                        <span className="flex gap-0.5">
                          {[0, 1, 2].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "size-3.5",
                                s < stars ? "fill-xp text-xp" : "fill-muted text-muted-foreground/40",
                              )}
                            />
                          ))}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
