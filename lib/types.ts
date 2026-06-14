export type AgeGroup = "3-5" | "6-8" | "9-12" | "13-18"

export type Modality = "reading" | "writing"

// A single interactive step within a lesson
export type Step =
  | {
      kind: "intro"
      title: string
      body: string
      emojiFree?: boolean
    }
  | {
      // Reading comprehension multiple choice
      kind: "read-choice"
      modality: "reading"
      passage?: string
      prompt: string
      options: string[]
      answer: number
    }
  | {
      // Reading: put steps/words in the correct order
      kind: "read-order"
      modality: "reading"
      passage?: string
      prompt: string
      items: string[] // already in CORRECT order
    }
  | {
      // Writing: free short answer graded by keywords
      kind: "write-short"
      modality: "writing"
      prompt: string
      hintText: string
      keywords: string[] // lowercase keywords; need `minKeywords` to pass
      minKeywords: number
      sample: string
    }
  | {
      // Writing: fill in the missing word(s)
      kind: "write-fill"
      modality: "writing"
      prompt: string
      before: string
      after: string
      answers: string[] // acceptable answers, lowercase
    }
  | {
      // Reinforcement: match pairs (term -> meaning)
      kind: "match"
      modality: "reading"
      prompt: string
      pairs: { left: string; right: string }[]
    }

export interface Lesson {
  id: string
  title: string
  subtitle: string
  xp: number
  steps: Step[]
}

export interface Skill {
  id: string
  title: string
  description: string
  icon: string // lucide icon name
  lessons: Lesson[]
}

export interface World {
  id: string
  title: string
  tagline: string
  lessons: Lesson[]
}

export interface AgeContent {
  age: AgeGroup
  label: string
  blurb: string
  focus: string[]
  stem: string[]
  worlds: World[]
}

// ---- Progress & analytics ----

export interface StepAttempt {
  lessonId: string
  stepKind: Step["kind"]
  modality: Modality | null
  correct: boolean
  timeMs: number
  hintUsed: boolean
  retries: number
  timestamp: number
}

export interface SessionRecord {
  id: string
  lessonId: string
  age: AgeGroup
  date: string // ISO date (yyyy-mm-dd)
  timestamp: number
  xpEarned: number
  readingCorrect: number
  readingTotal: number
  writingCorrect: number
  writingTotal: number
  avgReadingTimeMs: number
  avgWritingTimeMs: number
  hintsUsed: number
  durationMs: number
}

export interface GameState {
  age: AgeGroup | null
  learnerName: string
  xp: number
  hearts: number
  maxHearts: number
  streak: number
  lastActiveDate: string | null
  dailyGoal: number
  xpToday: number
  completedLessons: string[] // lesson ids
  lessonStars: Record<string, number> // lessonId -> 0..3
  attempts: StepAttempt[]
  sessions: SessionRecord[]
  unlockedBadges: string[] // badge ids
  createdAt: number
}
