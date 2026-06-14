import type { StyleKey } from "./learning-styles"

export type StageKind = "lesson" | "chest" | "practice" | "trophy"

export type Stage = {
  id: string
  title: string
  kind: StageKind
}

/**
 * Placeholder Duolingo-style stages per learner module.
 * Content is intentionally light — to be filled in later.
 */
const BASE_STAGES: Stage[] = [
  { id: "s1", title: "Getting Started", kind: "lesson" },
  { id: "s2", title: "Warm-Up", kind: "lesson" },
  { id: "s3", title: "Treasure Stop", kind: "chest" },
  { id: "s4", title: "Practice Round", kind: "practice" },
  { id: "s5", title: "Level Up", kind: "lesson" },
  { id: "s6", title: "Style Champion", kind: "trophy" },
]

const RW_STAGES: Stage[] = [
  { id: "rw-l1", title: "Reading Challenge", kind: "lesson" },
  { id: "rw-l2", title: "Writing Practice", kind: "lesson" },
  { id: "rw-l3", title: "Logic Check", kind: "lesson" },
  { id: "rw-chest", title: "Treasure Stop", kind: "chest" },
  { id: "rw-trophy", title: "Style Champion", kind: "trophy" },
]

export const MODULE_SECTIONS: Record<
  StyleKey,
  { section: string; unit: string; subtitle: string }
> = {
  visual: {
    section: "SECTION 1, UNIT 1",
    unit: "See It to Learn It",
    subtitle: "Learn with pictures, videos & diagrams",
  },
  auditory: {
    section: "SECTION 1, UNIT 1",
    unit: "Hear It to Learn It",
    subtitle: "Learn with sounds, songs & talking",
  },
  readwrite: {
    section: "SECTION 1, UNIT 1",
    unit: "Read It to Learn It",
    subtitle: "Learn with reading, notes & writing",
  },
  kinesthetic: {
    section: "SECTION 1, UNIT 1",
    unit: "Do It to Learn It",
    subtitle: "Learn by building & experimenting",
  },
}

export function getStages(style: StyleKey): Stage[] {
  if (style === "readwrite") return RW_STAGES
  if (style === "auditory") {
    return Array.from({ length: 20 }).map((_, i) => {
      const isChest = (i + 1) % 5 === 0
      return {
        id: `auditory-${i}`,
        title: isChest ? `Block ${Math.floor(i / 5) + 1} Review` : `Lesson ${i + 1}`,
        kind: isChest ? "chest" : "lesson",
      }
    })
  }
  return BASE_STAGES
}

export const TOTAL_STAGES = Math.max(BASE_STAGES.length, RW_STAGES.length, 20)
