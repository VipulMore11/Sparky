"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, Sparkles, ArrowRight } from "lucide-react"
import { Mascot, SpeechBubble } from "@/components/mascot"
import { useProfile } from "@/lib/use-profile"
import {
  LEARNING_STYLES,
  RECOMMENDATIONS,
  STUDY_TIPS,
  STYLE_ORDER,
  type StyleKey,
} from "@/lib/learning-styles"
import { cn } from "@/lib/utils"

export function ResultsView() {
  const router = useRouter()
  const { profile, ready } = useProfile()

  useEffect(() => {
    if (ready && (!profile.assessmentComplete || !profile.primaryStyle)) {
      router.replace("/")
    }
  }, [ready, profile.assessmentComplete, profile.primaryStyle, router])

  if (!ready || !profile.primaryStyle || !profile.percentages) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        Loading your result…
      </div>
    )
  }

  const primary = profile.primaryStyle
  const style = LEARNING_STYLES[primary]
  const Icon = style.icon
  const age = profile.ageGroup ?? "middle"
  const recs = RECOMMENDATIONS[primary][age]
  const tips = STUDY_TIPS[primary]

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      {/* hero */}
      <div className="flex flex-col items-center gap-5 text-center">
        <SpeechBubble>
          {profile.name ? `${profile.name}, you` : "You"}&apos;re mostly a{" "}
          {style.shortName} learner!
        </SpeechBubble>
        <Mascot size={150} />
      </div>

      {/* primary style card */}
      <section
        className="mt-6 rounded-3xl border-2 border-b-4 p-6"
        style={{ borderColor: style.colorVar, background: `color-mix(in oklab, ${style.colorVar} 12%, transparent)` }}
      >
        <div className="flex items-center gap-4">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: style.colorVar, color: "var(--background)" }}
          >
            <Icon className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold">{style.name}</h1>
            <p className="text-sm font-semibold" style={{ color: style.colorVar }}>
              {style.tagline}
            </p>
          </div>
        </div>
        <p className="mt-4 text-pretty leading-relaxed text-foreground/90">
          {style.description}
        </p>
      </section>

      {/* learning-style mix */}
      <section className="mt-6 rounded-3xl border-2 border-border bg-card p-6">
        <h2 className="text-lg font-extrabold">Your learning mix</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Most kids are a blend. Here&apos;s how yours broke down:
        </p>
        <div className="mt-4 flex flex-col gap-4">
          {STYLE_ORDER.map((k: StyleKey) => {
            const s = LEARNING_STYLES[k]
            const pct = profile.percentages![k]
            return (
              <div key={k} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm font-bold">
                  {s.shortName}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: s.colorVar }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm font-bold tabular-nums">
                  {pct}%
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* how to learn — tools */}
      <section className="mt-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-extrabold">
            How to learn your way — tools for you
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          We don&apos;t tell you what to learn — just the best ways and tools to
          learn it as a {style.shortName.toLowerCase()} learner.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {recs.map((rec) => (
            <div
              key={rec.name}
              className="rounded-2xl border-2 border-border bg-card p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-extrabold">{rec.name}</h3>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                    rec.free
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {rec.free ? "Free" : "Paid"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{rec.what}</p>
              <p className="mt-2 text-sm leading-relaxed">{rec.how}</p>
            </div>
          ))}
        </div>
      </section>

      {/* study tips */}
      <section className="mt-6 rounded-3xl border-2 border-border bg-card p-6">
        <h2 className="text-lg font-extrabold">Study tricks that suit you</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* cta */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 rounded-2xl border-b-4 border-primary/40 bg-primary px-10 py-4 text-base font-extrabold tracking-wide text-primary-foreground transition-all hover:brightness-105 active:translate-y-0.5 active:border-b-2"
        >
          GO TO MY LEARNING PATH
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </main>
  )
}
