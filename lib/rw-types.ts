import { type AgeGroup } from "./learning-styles"

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
