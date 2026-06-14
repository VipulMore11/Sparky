import { AnimatePresence, motion, useDragControls } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { Check, Play, RotateCcw, X } from "lucide-react"
import { GameShell, StarBurst, MascotMessage } from "./GameShell"
import { saveModuleMetrics } from "@/lib/kinesthetic-store"

const LEVELS = 4
const COLS = 4

type PieceKind = "ladder" | "slide-r" | "slide-l" | "straight" | "landing"
interface Slot { level: number; col: number; piece: PieceKind | null }

const PIECE_INVENTORY: { kind: PieceKind; count: number; label: string }[] = [
  { kind: "ladder", count: 1, label: "Top ladder" },
  { kind: "slide-r", count: 2, label: "Slide ↘" },
  { kind: "slide-l", count: 2, label: "Slide ↙" },
  { kind: "straight", count: 2, label: "Straight ↓" },
  { kind: "landing", count: 1, label: "Landing" },
]

export function Playground({ onComplete, onClose, progress: baseProgress }: { onComplete: (s: number) => void; onClose: () => void; progress: number }) {
  const [slots, setSlots] = useState<Slot[]>(() => {
    const s: Slot[] = []
    for (let l = 0; l < LEVELS; l++) for (let c = 0; c < COLS; c++) s.push({ level: l, col: c, piece: null })
    return s
  })
  const [trayCounts, setTrayCounts] = useState<Record<PieceKind, number>>(() =>
    Object.fromEntries(PIECE_INVENTORY.map((p) => [p.kind, p.count])) as Record<PieceKind, number>
  )
  const [phase, setPhase] = useState<"build" | "running" | "success" | "failed">("build")
  const [ballPos, setBallPos] = useState<{ level: number; col: number } | null>(null)

  const slotRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const startRef = useRef(Date.now())
  const attemptsRef = useRef(0)
  const retriesRef = useRef(0)
  const firstFailedRef = useRef(false)
  const configs = useRef<Set<string>>(new Set())

  function slotAt(level: number, col: number) { return slots.find((s) => s.level === level && s.col === col)! }

  function tryDropPiece(kind: PieceKind, clientX: number, clientY: number) {
    if (phase !== "build") return
    let target: { level: number; col: number } | null = null
    slotRefs.current.forEach((el, k) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        const [l, c] = k.split(":").map(Number); target = { level: l!, col: c! }
      }
    })
    const t = target as { level: number; col: number } | null
    if (!t) return
    if (slotAt(t.level, t.col).piece) return
    if (kind === "ladder" && t.level !== 0) return
    if (kind === "landing" && t.level !== LEVELS - 1) return
    if (trayCounts[kind] <= 0) return
    setSlots((ps) => ps.map((s) => (s.level === t.level && s.col === t.col ? { ...s, piece: kind } : s)))
    setTrayCounts((tr) => ({ ...tr, [kind]: tr[kind] - 1 }))
  }

  function pickBack(level: number, col: number) {
    if (phase !== "build") return
    const slot = slotAt(level, col)
    if (!slot.piece) return
    setTrayCounts((tr) => ({ ...tr, [slot.piece!]: tr[slot.piece!] + 1 }))
    setSlots((ps) => ps.map((s) => (s.level === level && s.col === col ? { ...s, piece: null } : s)))
  }

  function reset() {
    setSlots((ps) => ps.map((s) => ({ ...s, piece: null })))
    setTrayCounts(Object.fromEntries(PIECE_INVENTORY.map((p) => [p.kind, p.count])) as Record<PieceKind, number>)
    setPhase("build")
    setBallPos(null)
  }

  function test() {
    if (phase !== "build") return
    attemptsRef.current += 1
    configs.current.add(slots.map((s) => s.piece ?? ".").join(""))
    const ladder = slots.find((s) => s.piece === "ladder")
    if (!ladder) {
      if (!firstFailedRef.current) firstFailedRef.current = true; else retriesRef.current += 1
      setPhase("failed"); setTimeout(() => setPhase("build"), 1400); return
    }
    setPhase("running")
    setBallPos({ level: 0, col: ladder.col })
  }

  useEffect(() => {
    if (phase !== "running" || !ballPos) return
    const { level, col } = ballPos
    const cur = slotAt(level, col).piece
    const t = setTimeout(() => {
      if (!cur) { setPhase("failed"); setTimeout(() => setPhase("build"), 1400); if (!firstFailedRef.current) firstFailedRef.current = true; else retriesRef.current += 1; return }
      if (cur === "landing") { setPhase("success"); return }
      let nextCol = col
      if (cur === "slide-r") nextCol = col + 1
      else if (cur === "slide-l") nextCol = col - 1
      const nextLevel = level + 1
      if (nextLevel >= LEVELS || nextCol < 0 || nextCol >= COLS) {
        setPhase("failed")
        if (!firstFailedRef.current) firstFailedRef.current = true; else retriesRef.current += 1
        setTimeout(() => setPhase("build"), 1400); return
      }
      setBallPos({ level: nextLevel, col: nextCol })
    }, 360)
    return () => clearTimeout(t)
  }, [phase, ballPos, slots])

  function finish() {
    saveModuleMetrics("playground", {
      attempts: attemptsRef.current,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: retriesRef.current,
      improved: retriesRef.current > 0 && phase === "success",
      experimentation: Math.min(1, configs.current.size / 4),
      completed: true,
    })
    onComplete(100)
  }

  const placed = slots.filter((s) => s.piece).length
  const progress = phase === "success" ? 100 : Math.min(85, 10 + placed / 8 * 50 + attemptsRef.current * 12)

  return (
    <GameShell title="Build a Playground" subtitle="Slide the ball to the bottom!" progress={progress} onClose={onClose}>
      <div className="card p-5 sm:p-6 bg-card rounded-3xl border-2 border-border shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <MascotMessage mood={phase === "success" ? "cheer" : phase === "failed" ? "thinking" : "happy"} message={phase === "success" ? "Yes! The ball landed!" : phase === "failed" ? "Ball fell off. Connect the slide!" : "Top: ladder. Bottom: landing. Slides in between!"} />
        </div>

        <div className="relative mx-auto mt-5 max-w-xl rounded-3xl border-2 border-border bg-muted/60 p-2 sm:p-3">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {slots.map((s) => (
              <div key={`${s.level}:${s.col}`} ref={(el) => { slotRefs.current.set(`${s.level}:${s.col}`, el) }} onClick={() => pickBack(s.level, s.col)} className={`relative aspect-square rounded-xl border-2 border-dashed ${s.level === 0 ? "border-accent-shadow/50 bg-accent/20" : s.level === LEVELS - 1 ? "border-success-shadow/40 bg-success/10" : "border-border bg-background"}`}>
                {s.piece && <PieceVisual kind={s.piece} />}
                {ballPos && ballPos.level === s.level && ballPos.col === s.col && <motion.span layoutId="ball" className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_3px_0_0_var(--color-primary-shadow)]" />}
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Top row = ladder · Bottom row = landing</p>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Drag pieces in</p>
          <div className="flex min-h-24 flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-3">
            {PIECE_INVENTORY.map((p) => (
              <TrayPiece key={p.kind} kind={p.kind} count={trayCounts[p.kind]} onDrop={(x, y) => tryDropPiece(p.kind, x, y)} />
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={test} disabled={phase !== "build"} className="h-14 px-6 flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-extrabold text-lg transition-transform active:scale-95 shadow-[0_4px_0_0_var(--color-primary-shadow)] border-2 border-primary-shadow disabled:opacity-50">
            <Play className="h-5 w-5" /> Drop the ball
          </button>
          <button onClick={reset} disabled={phase === "running"} className="h-14 px-6 flex items-center justify-center gap-2 rounded-2xl bg-transparent border-2 border-border text-foreground font-extrabold text-lg transition-transform active:scale-95 hover:bg-muted disabled:opacity-50">
            <RotateCcw className="h-5 w-5" /> Clear
          </button>
        </div>

        <AnimatePresence>
          {phase === "failed" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 font-bold text-destructive">
              <X className="h-5 w-5" /> The ball didn't make it. Reshape the slide!
            </motion.div>
          )}
          {phase === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-4 rounded-2xl border-2 border-success/40 bg-success/15 px-4 py-3 font-bold text-success">
              <StarBurst />
              <div className="flex items-center gap-2"><Check className="h-5 w-5" /> Playground complete!</div>
              <div className="mt-3"><button onClick={finish} className="h-14 px-6 rounded-2xl bg-success text-success-foreground font-extrabold text-lg shadow-[0_4px_0_0_var(--color-success-shadow)] border-2 border-success-shadow active:scale-95 transition-transform">See my results</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  )
}

function PieceVisual({ kind }: { kind: PieceKind }) {
  if (kind === "ladder") return <svg viewBox="0 0 40 40" className="absolute inset-1"><rect x="14" y="2" width="4" height="36" fill="#f59e0b" /><rect x="22" y="2" width="4" height="36" fill="#f59e0b" />{[8, 16, 24, 32].map((y) => <rect key={y} x="12" y={y} width="16" height="3" fill="#d97706" />)}</svg>
  if (kind === "landing") return <svg viewBox="0 0 40 40" className="absolute inset-1"><rect x="2" y="26" width="36" height="10" rx="4" fill="#22c55e" stroke="#16a34a" strokeWidth="2" /></svg>
  if (kind === "straight") return <svg viewBox="0 0 40 40" className="absolute inset-1"><rect x="14" y="0" width="12" height="40" rx="4" fill="#3b82f6" stroke="#2563eb" strokeWidth="2" /></svg>
  if (kind === "slide-r") return <svg viewBox="0 0 40 40" className="absolute inset-1"><path d="M 4 4 L 36 36 L 28 40 L -4 8 Z" fill="#ec4899" stroke="#db2777" strokeWidth="2" /></svg>
  return <svg viewBox="0 0 40 40" className="absolute inset-1"><path d="M 36 4 L 4 36 L 12 40 L 44 8 Z" fill="#a855f7" stroke="#9333ea" strokeWidth="2" /></svg>
}

function TrayPiece({ kind, count, onDrop }: { kind: PieceKind; count: number; onDrop: (x: number, y: number) => void }) {
  const controls = useDragControls()
  if (count <= 0) return (
    <div className="relative h-16 w-16 rounded-xl border-2 border-border bg-card opacity-40">
      <div className="relative h-full w-full"><PieceVisual kind={kind} /></div>
    </div>
  )
  return (
    <motion.div drag dragControls={controls} dragSnapToOrigin whileDrag={{ scale: 1.1, zIndex: 50 }} onDragEnd={(_e, info) => onDrop(info.point.x, info.point.y)} className="relative h-16 w-16 cursor-grab touch-none select-none rounded-xl border-2 border-border bg-card shadow-[0_4px_0_0_var(--color-border)] active:cursor-grabbing">
      <div className="relative h-full w-full"><PieceVisual kind={kind} /></div>
      <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-accent text-xs font-extrabold text-accent-foreground shadow-[0_2px_0_0_var(--color-accent-shadow)]">
        {count}
      </span>
    </motion.div>
  )
}
