import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Play, RotateCcw, X } from "lucide-react";
import { GameShell, StarBurst } from "@/components/kinesthetic/GameShell";
import { Mascot } from "@/components/kinesthetic/Mascot";
import { saveModuleMetrics } from "@/lib/kinesthetic-store";

export const Route = createFileRoute("/elementary/playground")({
  head: () => ({
    meta: [
      { title: "Build a Playground — Elementary Quests" },
      { name: "description", content: "Snap slide pieces into a tower and test with a ball." },
    ],
  }),
  component: Playground,
});

/* Build area: 4 vertical levels × 4 horizontal columns.
 * Pieces (drag from tray, snap into a level):
 *   ladder     — entry on the left, ball drops onto level
 *   slide-r    — moves ball one column right + down
 *   slide-l    — moves ball one column left  + down
 *   straight   — stays in same column going down
 *   landing    — exit pad at the bottom (only valid in bottom row)
 *
 * Ball begins at level 0, column 0 (top-left). Each level it travels through
 * the piece in its current column. If empty or piece direction would push
 * out of bounds, it FALLS through air and lands missed.
 */

const LEVELS = 4;
const COLS = 4;

type PieceKind = "ladder" | "slide-r" | "slide-l" | "straight" | "landing";
interface Slot { level: number; col: number; piece: PieceKind | null; }

const PIECE_INVENTORY: { kind: PieceKind; count: number; label: string }[] = [
  { kind: "ladder",   count: 1, label: "Top ladder" },
  { kind: "slide-r",  count: 2, label: "Slide ↘" },
  { kind: "slide-l",  count: 2, label: "Slide ↙" },
  { kind: "straight", count: 2, label: "Straight ↓" },
  { kind: "landing",  count: 1, label: "Landing" },
];

function Playground() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<Slot[]>(() => {
    const s: Slot[] = [];
    for (let l = 0; l < LEVELS; l++) for (let c = 0; c < COLS; c++) s.push({ level: l, col: c, piece: null });
    return s;
  });
  const [trayCounts, setTrayCounts] = useState<Record<PieceKind, number>>(() =>
    Object.fromEntries(PIECE_INVENTORY.map((p) => [p.kind, p.count])) as Record<PieceKind, number>,
  );
  const [phase, setPhase] = useState<"build" | "running" | "success" | "failed">("build");
  const [ballPos, setBallPos] = useState<{ level: number; col: number } | null>(null);

  const slotRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const startRef = useRef(Date.now());
  const attemptsRef = useRef(0);
  const retriesRef = useRef(0);
  const firstFailedRef = useRef(false);
  const configs = useRef<Set<string>>(new Set());

  function slotAt(level: number, col: number) { return slots.find((s) => s.level === level && s.col === col)!; }

  function tryDropPiece(kind: PieceKind, clientX: number, clientY: number) {
    if (phase !== "build") return;
    let target: { level: number; col: number } | null = null;
    slotRefs.current.forEach((el, k) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        const [l, c] = k.split(":").map(Number); target = { level: l!, col: c! };
      }
    });
    const t = target as { level: number; col: number } | null;
    if (!t) return;
    if (slotAt(t.level, t.col).piece) return;
    if (kind === "ladder"  && t.level !== 0) return;
    if (kind === "landing" && t.level !== LEVELS - 1) return;
    if (trayCounts[kind] <= 0) return;
    setSlots((ps) => ps.map((s) => (s.level === t.level && s.col === t.col ? { ...s, piece: kind } : s)));
    setTrayCounts((t) => ({ ...t, [kind]: t[kind] - 1 }));
  }

  function pickBack(level: number, col: number) {
    if (phase !== "build") return;
    const slot = slotAt(level, col);
    if (!slot.piece) return;
    setTrayCounts((t) => ({ ...t, [slot.piece!]: t[slot.piece!] + 1 }));
    setSlots((ps) => ps.map((s) => (s.level === level && s.col === col ? { ...s, piece: null } : s)));
  }

  function reset() {
    setSlots((ps) => ps.map((s) => ({ ...s, piece: null })));
    setTrayCounts(Object.fromEntries(PIECE_INVENTORY.map((p) => [p.kind, p.count])) as Record<PieceKind, number>);
    setPhase("build");
    setBallPos(null);
  }

  // Run simulation
  function test() {
    if (phase !== "build") return;
    attemptsRef.current += 1;
    configs.current.add(slots.map((s) => s.piece ?? ".").join(""));
    const ladder = slots.find((s) => s.piece === "ladder");
    if (!ladder) {
      if (!firstFailedRef.current) firstFailedRef.current = true; else retriesRef.current += 1;
      setPhase("failed"); setTimeout(() => setPhase("build"), 1400); return;
    }
    setPhase("running");
    setBallPos({ level: 0, col: ladder.col });
  }

  useEffect(() => {
    if (phase !== "running" || !ballPos) return;
    const { level, col } = ballPos;
    const cur = slotAt(level, col).piece;
    const t = setTimeout(() => {
      if (!cur) { setPhase("failed"); setTimeout(() => setPhase("build"), 1400); if (!firstFailedRef.current) firstFailedRef.current = true; else retriesRef.current += 1; return; }
      if (cur === "landing") { setPhase("success"); return; }
      let nextCol = col;
      if (cur === "slide-r") nextCol = col + 1;
      else if (cur === "slide-l") nextCol = col - 1;
      // straight / ladder: stays
      const nextLevel = level + 1;
      if (nextLevel >= LEVELS || nextCol < 0 || nextCol >= COLS) {
        setPhase("failed");
        if (!firstFailedRef.current) firstFailedRef.current = true; else retriesRef.current += 1;
        setTimeout(() => setPhase("build"), 1400); return;
      }
      setBallPos({ level: nextLevel, col: nextCol });
    }, 360);
    return () => clearTimeout(t);
  }, [phase, ballPos, slots]);

  function finish() {
    saveModuleMetrics("playground", {
      attempts: attemptsRef.current,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: retriesRef.current,
      improved: retriesRef.current > 0 && phase === "success",
      experimentation: Math.min(1, configs.current.size / 4),
      completed: true,
    });
    navigate({ to: "/kinesthetic/results" });
  }

  const placed = slots.filter((s) => s.piece).length;
  const progress = phase === "success" ? 1 : Math.min(0.85, 0.1 + placed / 8 * 0.5 + attemptsRef.current * 0.12);

  return (
    <GameShell title="Build a Playground" subtitle="Slide the ball to the bottom!" progress={progress}>
      <div className="card-pop p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <Mascot size={80} mood={phase === "success" ? "cheer" : phase === "failed" ? "thinking" : "happy"}
            message={
              phase === "success" ? "Yes! The ball landed!"
              : phase === "failed" ? "Ball fell off. Connect the slide!"
              : "Top: ladder. Bottom: landing. Slides in between!"
            } />
        </div>

        {/* Build grid */}
        <div className="relative mx-auto mt-5 max-w-xl rounded-3xl border-2 border-border bg-[oklch(0.96_0.04_240)] p-2 sm:p-3">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {slots.map((s) => (
              <div
                key={`${s.level}:${s.col}`}
                ref={(el) => { slotRefs.current.set(`${s.level}:${s.col}`, el); }}
                onClick={() => pickBack(s.level, s.col)}
                className={`relative aspect-square rounded-xl border-2 border-dashed ${
                  s.level === 0 ? "border-secondary-shadow/50 bg-secondary/20"
                  : s.level === LEVELS - 1 ? "border-primary/40 bg-primary/10"
                  : "border-border bg-white/60"
                }`}
              >
                {s.piece && <PieceVisual kind={s.piece} />}
                {ballPos && ballPos.level === s.level && ballPos.col === s.col && (
                  <motion.span layoutId="ball" className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_3px_0_0_var(--color-accent-shadow)]" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">Top row = ladder · Bottom row = landing</p>
        </div>

        {/* Tray */}
        <div className="mt-5">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Drag pieces in</p>
          <div className="flex min-h-24 flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-3">
            {PIECE_INVENTORY.map((p) => (
              <TrayPiece key={p.kind} kind={p.kind} count={trayCounts[p.kind]} onDrop={(x, y) => tryDropPiece(p.kind, x, y)} />
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={test} disabled={phase !== "build"} className="btn-chunky">
            <Play className="h-5 w-5" /> Drop the ball
          </button>
          <button onClick={reset} disabled={phase === "running"} className="btn-chunky btn-chunky-ghost">
            <RotateCcw className="h-5 w-5" /> Clear
          </button>
        </div>

        <AnimatePresence>
          {phase === "failed" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 font-bold text-destructive">
              <X className="h-5 w-5" /> The ball didn't make it. Reshape the slide!
            </motion.div>
          )}
          {phase === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="relative mt-4 rounded-2xl border-2 border-primary/40 bg-primary/15 px-4 py-3 font-bold text-primary-shadow">
              <StarBurst />
              <div className="flex items-center gap-2"><Check className="h-5 w-5" /> Playground complete!</div>
              <div className="mt-3"><button onClick={finish} className="btn-chunky">See my results</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  );
}

function PieceVisual({ kind }: { kind: PieceKind }) {
  if (kind === "ladder")   return <svg viewBox="0 0 40 40" className="absolute inset-1"><rect x="14" y="2" width="4" height="36" fill="oklch(0.55 0.13 60)" /><rect x="22" y="2" width="4" height="36" fill="oklch(0.55 0.13 60)" />{[8,16,24,32].map((y)=><rect key={y} x="12" y={y} width="16" height="3" fill="oklch(0.45 0.1 50)"/>)}</svg>;
  if (kind === "landing")  return <svg viewBox="0 0 40 40" className="absolute inset-1"><rect x="2" y="26" width="36" height="10" rx="4" fill="var(--paint-green)" stroke="oklch(0.4 0.1 145)" strokeWidth="2"/></svg>;
  if (kind === "straight") return <svg viewBox="0 0 40 40" className="absolute inset-1"><rect x="14" y="0" width="12" height="40" rx="4" fill="var(--paint-yellow)" stroke="oklch(0.5 0.12 80)" strokeWidth="2"/></svg>;
  if (kind === "slide-r")  return <svg viewBox="0 0 40 40" className="absolute inset-1"><path d="M 4 4 L 36 36 L 28 40 L -4 8 Z" fill="var(--paint-orange)" stroke="oklch(0.5 0.15 50)" strokeWidth="2"/></svg>;
  return <svg viewBox="0 0 40 40" className="absolute inset-1"><path d="M 36 4 L 4 36 L 12 40 L 44 8 Z" fill="var(--paint-purple)" stroke="oklch(0.4 0.15 305)" strokeWidth="2"/></svg>;
}

function TrayPiece({ kind, count, onDrop }: { kind: PieceKind; count: number; onDrop: (x: number, y: number) => void }) {
  const controls = useDragControls();
  if (count <= 0) return (
    <div className="relative h-16 w-16 rounded-xl border-2 border-border bg-card/60 opacity-40">
      <div className="relative h-full w-full"><PieceVisual kind={kind} /></div>
    </div>
  );
  return (
    <motion.div
      drag dragControls={controls} dragSnapToOrigin whileDrag={{ scale: 1.1, zIndex: 50 }}
      onDragEnd={(_e, info) => onDrop(info.point.x, info.point.y)}
      className="relative h-16 w-16 cursor-grab touch-none select-none rounded-xl border-2 border-border bg-card shadow-[0_4px_0_0_var(--color-border)] active:cursor-grabbing"
    >
      <div className="relative h-full w-full"><PieceVisual kind={kind} /></div>
      <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-accent text-xs font-extrabold text-accent-foreground shadow-[0_2px_0_0_var(--color-accent-shadow)]">
        {count}
      </span>
    </motion.div>
  );
}
