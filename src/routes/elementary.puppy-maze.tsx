import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Play, RotateCcw, X } from "lucide-react";
import { GameShell, StarBurst } from "@/components/kinesthetic/GameShell";
import { Mascot } from "@/components/kinesthetic/Mascot";
import { saveModuleMetrics } from "@/lib/kinesthetic-store";

export const Route = createFileRoute("/elementary/puppy-maze")({
  head: () => ({
    meta: [
      { title: "Lost Puppy Maze — Elementary Quests" },
      { name: "description", content: "Move rocks. Make a path for the puppy to get home." },
    ],
  }),
  component: PuppyMaze,
});

const COLS = 7;
const ROWS = 7;
const START = { r: 0, c: 0 };
const GOAL  = { r: ROWS - 1, c: COLS - 1 };

const KEY = (r: number, c: number) => `${r},${c}`;
// Pre-placed rocks (the puzzle the child must rearrange)
const INITIAL_ROCKS: string[] = [
  "1,1","1,2","1,3","1,4",
  "3,2","3,3","3,4","3,5","3,6",
  "5,0","5,1","5,2","5,3","5,5",
];

type Mode = "move" | "remove";

function bfs(rocks: Set<string>): { r: number; c: number }[] | null {
  if (rocks.has(KEY(START.r, START.c)) || rocks.has(KEY(GOAL.r, GOAL.c))) return null;
  const prev = new Map<string, string | null>();
  prev.set(KEY(START.r, START.c), null);
  const q: { r: number; c: number }[] = [START];
  while (q.length) {
    const cur = q.shift()!;
    if (cur.r === GOAL.r && cur.c === GOAL.c) {
      const out: { r: number; c: number }[] = [];
      let k: string | null = KEY(cur.r, cur.c);
      while (k) { const [r, c] = k.split(",").map(Number); out.unshift({ r: r!, c: c! }); k = prev.get(k) ?? null; }
      return out;
    }
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as const) {
      const nr = cur.r + dr, nc = cur.c + dc;
      if (nr<0||nc<0||nr>=ROWS||nc>=COLS) continue;
      const k = KEY(nr, nc);
      if (rocks.has(k) || prev.has(k)) continue;
      prev.set(k, KEY(cur.r, cur.c));
      q.push({ r: nr, c: nc });
    }
  }
  return null;
}

function PuppyMaze() {
  const navigate = useNavigate();
  const [rocks, setRocks] = useState<Set<string>>(() => new Set(INITIAL_ROCKS));
  const [selected, setSelected] = useState<string | null>(null); // a rock chosen to move
  const [phase, setPhase] = useState<"plan" | "walking" | "success" | "blocked">("plan");
  const [step, setStep] = useState(0);
  const [removalsLeft, setRemovalsLeft] = useState(2);
  const [pathHistory, setPathHistory] = useState<number[]>([]); // lengths of attempted paths

  const startRef = useRef(Date.now());
  const attemptsRef = useRef(0);
  const retriesRef = useRef(0);
  const firstFailedRef = useRef(false);
  const triedConfigs = useRef<Set<string>>(new Set());

  const path = useMemo(() => bfs(rocks), [rocks]);

  function onCellClick(r: number, c: number) {
    if (phase !== "plan") return;
    const k = KEY(r, c);
    if ((r === START.r && c === START.c) || (r === GOAL.r && c === GOAL.c)) return;
    if (rocks.has(k)) {
      // Select to move OR delete with limited removals
      if (selected === k) {
        // double-tap: remove if budget left
        if (removalsLeft > 0) {
          setRocks((prev) => { const n = new Set(prev); n.delete(k); return n; });
          setRemovalsLeft((x) => x - 1);
          setSelected(null);
        }
      } else {
        setSelected(k);
      }
      return;
    }
    // empty cell: if a rock is selected, move it here
    if (selected) {
      setRocks((prev) => { const n = new Set(prev); n.delete(selected); n.add(k); return n; });
      setSelected(null);
    }
  }

  function go() {
    if (phase !== "plan") return;
    attemptsRef.current += 1;
    triedConfigs.current.add([...rocks].sort().join("|"));
    if (!path) {
      if (!firstFailedRef.current) firstFailedRef.current = true;
      else retriesRef.current += 1;
      setPhase("blocked");
      setTimeout(() => setPhase("plan"), 1400);
      return;
    }
    setPathHistory((h) => [...h, path.length]);
    setStep(0);
    setPhase("walking");
  }

  useEffect(() => {
    if (phase !== "walking" || !path) return;
    if (step >= path.length) { setPhase("success"); return; }
    const t = setTimeout(() => setStep((s) => s + 1), 220);
    return () => clearTimeout(t);
  }, [phase, step, path]);

  function reset() {
    setRocks(new Set(INITIAL_ROCKS));
    setSelected(null);
    setStep(0);
    setRemovalsLeft(2);
    setPhase("plan");
  }

  function finish() {
    const improved = pathHistory.length >= 2 && pathHistory[pathHistory.length - 1]! <= pathHistory[0]!;
    saveModuleMetrics("puppy-maze", {
      attempts: attemptsRef.current,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: retriesRef.current,
      improved: improved || phase === "success",
      experimentation: Math.min(1, triedConfigs.current.size / 4),
      completed: true,
    });
    navigate({ to: "/elementary/playground" });
  }

  const puppy = phase === "walking" || phase === "success" ? path?.[Math.min(step, (path?.length ?? 1) - 1)] ?? START : START;
  const progress = phase === "success" ? 1 : Math.min(0.85, 0.1 + attemptsRef.current * 0.18 + (selected ? 0.05 : 0));

  return (
    <GameShell title="Lost Puppy Maze" subtitle="Help puppy get home!" progress={progress}>
      <div className="card-pop p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <Mascot size={80}
            mood={phase === "success" ? "cheer" : phase === "blocked" ? "thinking" : "happy"}
            message={
              phase === "success" ? "Yay! Puppy made it home!"
              : phase === "blocked" ? "No way through. Move more rocks!"
              : selected ? "Tap an empty cell to move the rock there."
              : "Tap a rock to pick it up. Double-tap to crush it."
            } />
          <div className="rounded-2xl border-2 border-border bg-muted/30 px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Crushes left</p>
            <p className="kinetic-display text-xl text-primary-shadow">{removalsLeft}</p>
          </div>
        </div>

        <div className="relative mx-auto mt-5 select-none rounded-3xl border-2 border-border p-2"
          style={{ maxWidth: 560, background: "linear-gradient(180deg, oklch(0.95 0.06 145) 0%, oklch(0.9 0.1 145) 100%)" }}>
          <div className="grid touch-none gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {Array.from({ length: ROWS * COLS }).map((_, i) => {
              const r = Math.floor(i / COLS), c = i % COLS;
              const k = KEY(r, c);
              const isStart = r === START.r && c === START.c;
              const isGoal  = r === GOAL.r && c === GOAL.c;
              const isRock  = rocks.has(k);
              const isSel   = selected === k;
              const isPath  = (phase === "walking" || phase === "success") && path?.slice(0, step + 1).some((p) => p.r === r && p.c === c);
              const isPup   = puppy && puppy.r === r && puppy.c === c;
              return (
                <button key={i} onClick={() => onCellClick(r, c)}
                  className={`relative aspect-square rounded-xl border-2 transition-all ${
                    isSel ? "border-primary ring-4 ring-primary/30"
                    : isRock ? "border-[oklch(0.4_0.04_60)]"
                    : isStart ? "border-secondary-shadow bg-secondary/60"
                    : isGoal ? "border-primary bg-primary/15"
                    : isPath ? "border-primary/40 bg-primary/10"
                    : "border-border bg-white/70 hover:bg-white"
                  }`}
                  style={isRock ? { background: "radial-gradient(circle at 30% 30%, oklch(0.7 0.03 60), oklch(0.45 0.03 60))" } : undefined}>
                  {isStart && <span className="absolute inset-0 grid place-items-center text-xl">🏁</span>}
                  {isGoal && <span className="absolute inset-0 grid place-items-center text-xl">🏠</span>}
                  {isPup && !isGoal && !isStart && (
                    <motion.span layoutId="puppy" className="absolute inset-0 grid place-items-center text-2xl drop-shadow">🐶</motion.span>
                  )}
                  {isPup && (isGoal || isStart) && (
                    <motion.span layoutId="puppy" className="absolute -top-2 right-0 text-2xl drop-shadow">🐶</motion.span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={go} disabled={phase !== "plan"} className="btn-chunky">
            <Play className="h-5 w-5" /> Send puppy
          </button>
          <button onClick={reset} disabled={phase === "walking"} className="btn-chunky btn-chunky-ghost">
            <RotateCcw className="h-5 w-5" /> Reset maze
          </button>
        </div>

        <AnimatePresence>
          {phase === "blocked" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 font-bold text-destructive">
              <X className="h-5 w-5" /> Blocked! Move or crush rocks to open a path.
            </motion.div>
          )}
          {phase === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="relative mt-4 rounded-2xl border-2 border-primary/40 bg-primary/15 px-4 py-3 font-bold text-primary-shadow">
              <StarBurst />
              <div className="flex items-center gap-2"><Check className="h-5 w-5" /> Path found in {path?.length} steps!</div>
              <div className="mt-3"><button onClick={finish} className="btn-chunky">Next quest</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  );
}
