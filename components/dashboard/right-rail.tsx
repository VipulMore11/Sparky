"use client"

import { Flame, Gem, Heart, Lock, Zap, Trophy } from "lucide-react"
import { useProfile } from "@/lib/use-profile"
import { LEARNING_STYLES } from "@/lib/learning-styles"
import { TOTAL_STAGES } from "@/lib/stages"

export function TopStats() {
  const { profile } = useProfile()
  return (
    <div className="flex items-center justify-end gap-5 px-1 py-3 text-sm font-extrabold">
      <span className="flex items-center gap-1.5 text-[oklch(0.8_0.16_75)]">
        <Flame className="h-5 w-5" />
        {Object.values(profile.progress).reduce((a, b) => a + b, 0)}
      </span>
      <span className="flex items-center gap-1.5 text-secondary">
        <Gem className="h-5 w-5" />
        {profile.sparks}
      </span>
      <span className="flex items-center gap-1.5 text-destructive">
        <Heart className="h-5 w-5 fill-current" />5
      </span>
    </div>
  )
}

import { cn } from "@/lib/utils"

export function RightRail() {
  const { profile } = useProfile()
  const primary = profile.primaryStyle
  const done = primary ? profile.progress[primary] : 0
  
  // Calculate total modules/lessons done across all styles
  const totalModulesDone = Object.values(profile.progress).reduce((a, b) => a + b, 0)
  const remaining = Math.max(0, 3 - totalModulesDone)
  const isLeaderboardUnlocked = remaining === 0

  return (
    <div className="flex w-full flex-col gap-4">
      {/* unlock leaderboards */}
      <section className="rounded-2xl border-2 border-border bg-card p-5">
        <h3 className="font-extrabold">{isLeaderboardUnlocked ? "Leaderboards Unlocked!" : "Unlock Leaderboards!"}</h3>
        <div className="mt-3 flex items-center gap-3">
          <span className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            isLeaderboardUnlocked ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"
          )}>
            {isLeaderboardUnlocked ? <Trophy className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
          </span>
          <p className="text-sm text-muted-foreground">
            {isLeaderboardUnlocked 
              ? "You can now compete with others globally!" 
              : `Complete ${remaining} more ${remaining === 1 ? "lesson" : "lessons"} to start competing`
            }
          </p>
        </div>
      </section>

      {/* daily quests */}
      <section className="rounded-2xl border-2 border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold">Daily Quests</h3>
          <span className="text-xs font-bold text-secondary">VIEW ALL</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Zap className="h-8 w-8 shrink-0 fill-[oklch(0.8_0.16_75)] text-[oklch(0.8_0.16_75)]" />
          <div className="flex-1">
            <p className="text-sm font-bold">Complete 3 Lessons</p>
            <div className="mt-1.5 h-4 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "flex h-full items-center justify-center rounded-full text-[10px] font-bold text-background transition-all",
                  totalModulesDone >= 3 ? "bg-emerald-500" : "bg-[oklch(0.8_0.16_75)]"
                )}
                style={{ width: `${Math.max(15, Math.min(100, (totalModulesDone / 3) * 100))}%` }}
              >
                {Math.min(3, totalModulesDone)} / 3
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* style spotlight (replaces 'create a profile') */}
      {primary && (
        <section className="rounded-2xl border-2 border-border bg-card p-5">
          <h3 className="font-extrabold">Your top style</h3>
          <div className="mt-3 flex items-center gap-3">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: LEARNING_STYLES[primary].colorVar,
                color: "var(--background)",
              }}
            >
              <Trophy className="h-6 w-6" />
            </span>
            <div>
              <p className="font-bold">{LEARNING_STYLES[primary].name}</p>
              <p className="text-xs text-muted-foreground">
                {done}/{TOTAL_STAGES} stages done
              </p>
            </div>
          </div>
        </section>
      )}

      <p className="px-1 text-xs leading-relaxed text-muted-foreground">
        No account needed — your progress is saved right here on this device.
      </p>
    </div>
  )
}
