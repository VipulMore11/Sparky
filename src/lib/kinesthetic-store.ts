// Lightweight session metrics — survives navigation between modules.
// Keyed in sessionStorage so refreshing keeps results until the tab closes.

export type AgeGroup = "early" | "elementary";

export type EarlyModuleId = "color-lab" | "bridge-builder" | "water-path";
export type ElementaryModuleId = "animal-house" | "garden" | "puppy-maze" | "playground";
export type ModuleId = EarlyModuleId | ElementaryModuleId;

export interface ModuleMetrics {
  attempts: number;            // total attempts/cycles
  timeSpentMs: number;         // wall time on the module
  retriesAfterFail: number;    // attempts after first failure
  improved: boolean;           // did performance improve across attempts
  retentionScore?: number;     // 0–1 (color-lab, garden)
  experimentation?: number;    // 0–1 — variable/structure exploration
  completed: boolean;
}

const KEY = "kinetic.metrics.v1";

type Store = Partial<Record<ModuleId, ModuleMetrics>>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(sessionStorage.getItem(KEY) ?? "{}"); }
  catch { return {}; }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(s));
}

export function saveModuleMetrics(id: ModuleId, m: ModuleMetrics) {
  const s = read();
  s[id] = m;
  write(s);
}

export function getAllMetrics(): Store { return read(); }

export function clearMetrics() { write({}); }

/** Convert raw metrics to a 0–100 kinesthetic-evidence score. */
export function kinestheticScore(m: ModuleMetrics): number {
  if (!m.completed) return 0;
  let score = 35; // baseline for completing
  if (m.attempts >= 2) score += 12;
  if (m.retriesAfterFail >= 1) score += 13;
  if (m.improved) score += 18;
  if ((m.retentionScore ?? 0) > 0.5) score += 10;
  if ((m.experimentation ?? 0) > 0.5) score += 12;
  return Math.min(100, score);
}

export const EARLY_MODULES: EarlyModuleId[] = ["color-lab", "bridge-builder", "water-path"];
export const ELEMENTARY_MODULES: ElementaryModuleId[] = ["animal-house", "garden", "puppy-maze", "playground"];
