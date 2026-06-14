"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-store"
import { Onboarding } from "@/components/onboarding"
import { Hud } from "@/components/hud"
import { LearningPath } from "@/components/learning-path"
import { LessonPlayer } from "@/components/lesson-player"
import { BadgesView } from "@/components/badges-view"
import { Dashboard } from "@/components/dashboard"
import { Map, Award, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "path" | "badges" | "dashboard"

export function AppShell() {
  const { state, ready } = useGame()
  const [tab, setTab] = useState<Tab>("path")
  const [activeLesson, setActiveLesson] = useState<string | null>(null)

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  if (!state.age) {
    return <Onboarding />
  }

  if (activeLesson) {
    return (
      <LessonPlayer
        lessonId={activeLesson}
        age={state.age}
        onExit={() => setActiveLesson(null)}
        onGoToDashboard={() => {
          setActiveLesson(null)
          setTab("dashboard")
        }}
      />
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "path", label: "Learn", icon: Map },
    { id: "badges", label: "Trophies", icon: Award },
    { id: "dashboard", label: "Progress", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      <Hud />
      <main>
        {tab === "path" && <LearningPath onStart={(id) => setActiveLesson(id)} />}
        {tab === "badges" && <BadgesView />}
        {tab === "dashboard" && <Dashboard />}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-stretch justify-around">
          {tabs.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-bold transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <t.icon className={cn("h-5 w-5", active && "scale-110")} />
                {t.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
