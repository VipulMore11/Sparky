import { create } from "zustand";

export type ModuleId =
  | "ice-cream"
  | "treehouse"
  | "water-park"
  | "pet-robot"
  | "dream-room"
  | "food-truck"
  | "theme-park"
  | "escape-room";

export interface ModuleResult {
  id: ModuleId;
  title: string;
  experiments: number; // # of attempts / tests run
  iterations: number; // # of redesigns
  retries: number; // # of failed retries
  improved: boolean; // did performance improve over time
  completedAt: number;
  kinestheticScore: number; // 0-100
}

interface State {
  results: Record<string, ModuleResult>;
  record: (r: ModuleResult) => void;
  reset: () => void;
}

export const useKinestheticStore = create<State>((set) => ({
  results: {},
  record: (r) =>
    set((s) => ({ results: { ...s.results, [r.id]: r } })),
  reset: () => set({ results: {} }),
}));

export function computeKinestheticScore(opts: {
  experiments: number;
  iterations: number;
  retries: number;
  improved: boolean;
}) {
  // Higher experiments + iterations + improvement = stronger kinesthetic signal
  const base = Math.min(40, opts.experiments * 6);
  const iter = Math.min(30, opts.iterations * 5);
  const retry = Math.min(15, opts.retries * 3);
  const improve = opts.improved ? 15 : 0;
  return Math.min(100, base + iter + retry + improve);
}