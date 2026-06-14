"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { AgeGroup, GameState, StepAttempt, SessionRecord } from "./types"
import { BADGES, computeDerived } from "./badges"

const STORAGE_KEY = "stem-quest-v1"

function todayStr(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string) {
  const da = new Date(a + "T00:00:00")
  const db = new Date(b + "T00:00:00")
  return Math.round((db.getTime() - da.getTime()) / 86400000)
}

function initialState(): GameState {
  return {
    age: null,
    learnerName: "",
    xp: 0,
    hearts: 5,
    maxHearts: 5,
    streak: 0,
    lastActiveDate: null,
    dailyGoal: 40,
    xpToday: 0,
    completedLessons: [],
    lessonStars: {},
    attempts: [],
    sessions: [],
    unlockedBadges: [],
    createdAt: Date.now(),
  }
}

interface FinishLessonInput {
  lessonId: string
  age: AgeGroup
  attempts: StepAttempt[]
  baseXp: number
  durationMs: number
}

interface FinishLessonResult {
  xpEarned: number
  stars: number
  newBadges: typeof BADGES
  session: SessionRecord
}

interface GameContextValue {
  state: GameState
  ready: boolean
  setAge: (age: AgeGroup, name?: string) => void
  loseHeart: () => void
  resetHearts: () => void
  finishLesson: (input: FinishLessonInput) => FinishLessonResult
  resetProgress: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(initialState)
  const [ready, setReady] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as GameState
        // Daily streak/heart maintenance
        const today = todayStr()
        if (parsed.lastActiveDate && parsed.lastActiveDate !== today) {
          parsed.xpToday = 0
          parsed.hearts = parsed.maxHearts // refill hearts daily
          const gap = daysBetween(parsed.lastActiveDate, today)
          if (gap > 1) parsed.streak = 0 // missed a day -> reset
        }
        setState({ ...initialState(), ...parsed })
      }
    } catch {
      // ignore corrupt storage
    }
    setReady(true)
  }, [])

  // Persist
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore quota errors
    }
  }, [state, ready])

  const setAge = useCallback((age: AgeGroup, name?: string) => {
    setState((s) => ({ ...s, age, learnerName: name ?? s.learnerName }))
  }, [])

  const loseHeart = useCallback(() => {
    setState((s) => ({ ...s, hearts: Math.max(0, s.hearts - 1) }))
  }, [])

  const resetHearts = useCallback(() => {
    setState((s) => ({ ...s, hearts: s.maxHearts }))
  }, [])

  const resetProgress = useCallback(() => {
    setState((s) => ({ ...initialState(), age: s.age, learnerName: s.learnerName }))
  }, [])

  const finishLesson = useCallback((input: FinishLessonInput): FinishLessonResult => {
    let result: FinishLessonResult = {
      xpEarned: 0,
      stars: 0,
      newBadges: [],
      session: {} as SessionRecord,
    }

    setState((prev) => {
      const today = todayStr()
      const { attempts, lessonId, age, baseXp, durationMs } = input

      // tally modality stats
      let readingCorrect = 0,
        readingTotal = 0,
        writingCorrect = 0,
        writingTotal = 0,
        readTime = 0,
        writeTime = 0,
        hintsUsed = 0
      for (const a of attempts) {
        if (a.hintUsed) hintsUsed++
        if (a.modality === "reading") {
          readingTotal++
          readTime += a.timeMs
          if (a.correct) readingCorrect++
        } else if (a.modality === "writing") {
          writingTotal++
          writeTime += a.timeMs
          if (a.correct) writingCorrect++
        }
      }

      const totalGraded = readingTotal + writingTotal
      const totalCorrect = readingCorrect + writingCorrect
      const accuracy = totalGraded ? totalCorrect / totalGraded : 1
      const stars = accuracy >= 0.95 ? 3 : accuracy >= 0.75 ? 2 : accuracy >= 0.5 ? 1 : 0

      // XP: base scaled by accuracy + small bonus for stars
      const xpEarned = Math.round(baseXp * (0.5 + 0.5 * accuracy)) + stars * 5

      // streak handling
      let streak = prev.streak
      if (prev.lastActiveDate !== today) {
        if (prev.lastActiveDate && daysBetween(prev.lastActiveDate, today) === 1) {
          streak = prev.streak + 1
        } else {
          streak = 1
        }
      } else if (streak === 0) {
        streak = 1
      }

      const session: SessionRecord = {
        id: `${lessonId}-${Date.now()}`,
        lessonId,
        age,
        date: today,
        timestamp: Date.now(),
        xpEarned,
        readingCorrect,
        readingTotal,
        writingCorrect,
        writingTotal,
        avgReadingTimeMs: readingTotal ? Math.round(readTime / readingTotal) : 0,
        avgWritingTimeMs: writingTotal ? Math.round(writeTime / writingTotal) : 0,
        hintsUsed,
        durationMs,
      }

      const prevStars = prev.lessonStars[lessonId] ?? 0
      const next: GameState = {
        ...prev,
        xp: prev.xp + xpEarned,
        xpToday: (prev.lastActiveDate === today ? prev.xpToday : 0) + xpEarned,
        lastActiveDate: today,
        streak,
        completedLessons: prev.completedLessons.includes(lessonId)
          ? prev.completedLessons
          : [...prev.completedLessons, lessonId],
        lessonStars: { ...prev.lessonStars, [lessonId]: Math.max(prevStars, stars) },
        attempts: [...prev.attempts, ...attempts],
        sessions: [...prev.sessions, session],
      }

      // evaluate badges
      const derived = computeDerived(next)
      const newlyUnlocked = BADGES.filter(
        (b) => !prev.unlockedBadges.includes(b.id) && b.test(next, derived),
      )
      if (newlyUnlocked.length) {
        next.unlockedBadges = [...prev.unlockedBadges, ...newlyUnlocked.map((b) => b.id)]
        next.xp += newlyUnlocked.reduce((sum, b) => sum + b.xpBonus, 0)
      }

      result = { xpEarned, stars, newBadges: newlyUnlocked, session }
      return next
    })

    return result
  }, [])

  return (
    <GameContext.Provider
      value={{ state, ready, setAge, loseHeart, resetHearts, finishLesson, resetProgress }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("useGame must be used within GameProvider")
  return ctx
}
