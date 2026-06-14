import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Play, RotateCcw, X, Droplets } from "lucide-react";
import { GameShell, StarBurst } from "@/components/kinesthetic/GameShell";
import { Mascot } from "@/components/kinesthetic/Mascot";
import { saveModuleMetrics } from "@/lib/kinesthetic-store";

export const Route = createFileRoute("/kinesthetic/water-path")({
  head: () => ({
    meta: [
      { title: "Water Path — Kinesthetic Play" },
      { name: "description", content: "Draw a path to send water to the thirsty plant." },
    ],
  }),
  component: WaterPath,
});

const COLS = 7;
const ROWS = 6;
const SOURCE = { r: 0, c: 0 };
const PLANT = { r: ROWS - 1, c: COLS - 1 };

type Cell = { r: number; c: number };
const key = (r: number, c: number) => `${r},${c}`;

function findPath(placed: Set<string>): Cell[] | null {
  // BFS from SOURCE → PLANT, passing through cells in `placed` (plus source/plant).
  const walkable = new Set(placed);
  walkable.add(key(SOURCE.r, SOURCE.c));
  walkable.add(key(PLANT.r, PLANT.c));
  const queue: Cell[] = [SOURCE];
  const prev = new Map<string, string | null>();
  prev.set(key(SOURCE.r, SOURCE.c), null);
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.r === PLANT.r && cur.c === PLANT.c) {
      // reconstruct
      const path: Cell[] = [];
      let cKey: string | null = key(cur.r, cur.c);
      while (cKey) {
        const [r, c] = cKey.split(",").map(Number);
        path.unshift({ r: r!, c: c! });
        cKey = prev.get(cKey) ?? null;
      }
      return path;
    }
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      const nr = cur.r + dr, nc = cur.c + dc;
      if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) continue;
      const k = key(nr, nc);
      if (!walkable.has(k) || prev.has(k)) continue;
      prev.set(k, key(cur.r, cur.c));
      queue.push({ r: nr, c: nc });
    }
  }
  return null;
}

function WaterPath() {
  const navigate = useNavigate();
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<"build" | "flowing" | "success" | "failed">("build");
  const [flowProgress, setFlowProgress] = useState(0);
  const [attemptCounts, setAttemptCounts] = useState<number[]>([]); // pipe count per attempt

  const startRef = useRef<number>(Date.now());
  const attemptsRef = useRef(0);
  const firstFailedRef = useRef(false);
  const retriesRef = useRef(0);
  const draggingValueRef = useRef<"add" | "remove" | null>(null);

  const flowPath = useMemo(() => findPath(placed), [placed]);
  const canRelease = placed.size > 0;

  const progress = phase === "success" ? 1 : Math.min(0.85, 0.1 + attemptsRef.current * 0.2 + (placed.size / 8) * 0.3);

  // ---- Tap & drag-paint cells ----
  function toggleCell(r: number, c: number) {
    if (phase !== "build") return;
    if ((r === SOURCE.r && c === SOURCE.c) || (r === PLANT.r && c === PLANT.c)) return;
    setPlaced((prev) => {
      const next = new Set(prev);
      const k = key(r, c);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }
  function paintCell(r: number, c: number) {
    if (phase !== "build" || !draggingValueRef.current) return;
    if ((r === SOURCE.r && c === SOURCE.c) || (r === PLANT.r && c === PLANT.c)) return;
    const k = key(r, c);
    setPlaced((prev) => {
      const has = prev.has(k);
      if (draggingValueRef.current === "add" && !has) {
        const next = new Set(prev); next.add(k); return next;
      }
      if (draggingValueRef.current === "remove" && has) {
        const next = new Set(prev); next.delete(k); return next;
      }
      return prev;
    });
  }

  function release() {
    if (phase !== "build" || !canRelease) return;
    attemptsRef.current += 1;
    setAttemptCounts((h) => [...h, placed.size]);
    if (!flowPath) {
      if (!firstFailedRef.current) firstFailedRef.current = true;
      else retriesRef.current += 1;
      setPhase("failed");
      setTimeout(() => setPhase("build"), 1500);
      return;
    }
    setPhase("flowing");
    setFlowProgress(0);
  }

  useEffect(() => {
    if (phase !== "flowing" || !flowPath) return;
    if (flowProgress >= flowPath.length) {
      setPhase("success");
      return;
    }
    const id = setTimeout(() => setFlowProgress((p) => p + 1), 180);
    return () => clearTimeout(id);
  }, [phase, flowProgress, flowPath]);

  function reset() {
    setPlaced(new Set());
    setPhase("build");
    setFlowProgress(0);
  }

  function finish() {
    const improved = attemptCounts.length >= 2 && attemptCounts[attemptCounts.length - 1]! <= attemptCounts[0]!;
    saveModuleMetrics("water-path", {
      attempts: attemptsRef.current,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: retriesRef.current,
      improved: improved || phase === "success",
      completed: true,
    });
    navigate({ to: "/kinesthetic/results" });
  }

  const flowSet = useMemo(() => {
    if (phase !== "flowing" && phase !== "success") return new Set<string>();
    if (!flowPath) return new Set<string>();
    const limit = phase === "success" ? flowPath.length : flowProgress;
    return new Set(flowPath.slice(0, limit).map((c) => key(c.r, c.c)));
  }, [phase, flowProgress, flowPath]);

  return (
    <GameShell title="Water Path" subtitle="Help the plant drink!" progress={progress}>
      <div className="card-pop p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <Mascot
            mood={phase === "success" ? "cheer" : phase === "failed" ? "thinking" : "happy"}
            size={80}
            message={
              phase === "success" ? "Hooray! The plant is happy!"
              : phase === "failed" ? "Almost! Connect the path with no gaps."
              : "Tap cells to lay pipe from 💧 to 🌱"
            }
          />
          <div className="hidden text-right text-xs text-muted-foreground sm:block">
            <p className="font-bold uppercase tracking-widest">Pipes</p>
            <p className="kinetic-display text-2xl text-primary-shadow">{placed.size}</p>
          </div>
        </div>

        {/* Grid */}
        <div
          className="relative mx-auto mt-5 select-none rounded-3xl border-2 border-border bg-[oklch(0.96_0.04_240)] p-2 sm:p-3"
          style={{ maxWidth: 560 }}
          onPointerUp={() => { draggingValueRef.current = null; }}
          onPointerLeave={() => { draggingValueRef.current = null; }}
        >
          <div
            className="grid touch-none gap-1.5"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          >
            {Array.from({ length: ROWS * COLS }).map((_, i) => {
              const r = Math.floor(i / COLS), c = i % COLS;
              const isSource = r === SOURCE.r && c === SOURCE.c;
              const isPlant  = r === PLANT.r && c === PLANT.c;
              const isPlaced = placed.has(key(r, c));
              const isFlowing = flowSet.has(key(r, c));
              return (
                <button
                  key={i}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    if (phase !== "build") return;
                    if (isSource || isPlant) return;
                    draggingValueRef.current = isPlaced ? "remove" : "add";
                    toggleCell(r, c);
                  }}
                  onPointerEnter={() => paintCell(r, c)}
                  className={`relative aspect-square rounded-xl border-2 transition-colors ${
                    isSource ? "bg-water border-water"
                    : isPlant ? "border-primary bg-primary/10"
                    : isFlowing ? "bg-water border-water"
                    : isPlaced ? "bg-[oklch(0.88_0.04_240)] border-[oklch(0.78_0.06_240)]"
                    : "bg-card border-border hover:bg-muted"
                  }`}
                  style={{
                    backgroundColor: isFlowing ? "var(--water)" : undefined,
                    borderColor:    isFlowing ? "var(--water)" : undefined,
                  }}
                  aria-label={isSource ? "Water source" : isPlant ? "Plant" : `Cell ${r},${c}`}
                >
                  {isSource && (
                    <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 1.4, repeat: Infinity }} className="absolute inset-0 grid place-items-center text-xl sm:text-2xl">💧</motion.span>
                  )}
                  {isPlant && (
                    <motion.span animate={{ scale: phase === "success" ? [1, 1.25, 1] : 1 }} transition={{ duration: 0.6, repeat: phase === "success" ? 3 : 0 }} className="absolute inset-0 grid place-items-center text-xl sm:text-2xl">🌱</motion.span>
                  )}
                  {isFlowing && !isSource && !isPlant && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute inset-1 rounded-md"
                      style={{ background: "linear-gradient(180deg, oklch(0.85 0.12 235) 0%, var(--water) 100%)", boxShadow: "inset 0 -3px 0 0 oklch(0.55 0.16 235)" }}
                    />
                  )}
                  {isPlaced && !isFlowing && !isSource && !isPlant && (
                    <span className="absolute inset-1 rounded-md bg-[oklch(0.82_0.05_240)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={release} disabled={!canRelease || phase !== "build"} className="btn-chunky">
            <Play className="h-5 w-5" /> Release water
          </button>
          <button onClick={reset} disabled={phase === "flowing"} className="btn-chunky btn-chunky-ghost">
            <RotateCcw className="h-5 w-5" /> Reset
          </button>
          <p className="ml-auto inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Droplets className="h-4 w-4 text-primary" /> Tap or drag across cells to draw a pipe.
          </p>
        </div>

        <AnimatePresence>
          {phase === "failed" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 font-bold text-destructive">
              <X className="h-5 w-5" /> The water can't get through. Fix the gap!
            </motion.div>
          )}
          {phase === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="relative mt-4 rounded-2xl border-2 border-primary/40 bg-primary/15 px-4 py-3 font-bold text-primary-shadow">
              <StarBurst />
              <div className="flex items-center gap-2"><Check className="h-5 w-5" /> The plant is so happy!</div>
              <div className="mt-3">
                <button onClick={finish} className="btn-chunky">See my results</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  );
}
