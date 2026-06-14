// Lightweight session metrics for Visual module — survives navigation
// Keyed in localStorage

export interface VisualMetrics {
  completed: boolean
  score: number // 0-100 score for the block/level
}

const KEY = "visual.metrics.v1"

type Store = Record<number, VisualMetrics> // Key is levelIndex

function read(): Store {
  if (typeof window === "undefined") return {}
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") }
  catch { return {} }
}

function write(s: Store) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function saveVisualMetrics(levelIndex: number, m: VisualMetrics) {
  const s = read()
  s[levelIndex] = m
  write(s)
}

export function getVisualMetrics(levelIndex: number): VisualMetrics | undefined {
  return read()[levelIndex]
}

export function getAllVisualMetrics(): Store {
  return read()
}

export function clearVisualMetrics() {
  write({})
}
