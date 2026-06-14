import { AnimatePresence, motion, useDragControls } from "framer-motion"
import { useMemo, useRef, useState } from "react"
import { Check, Play, RotateCcw, X } from "lucide-react"
import { GameShell, StarBurst, MascotMessage } from "./GameShell"
import { saveModuleMetrics } from "@/lib/kinesthetic-store"

type PieceKind = "square" | "triangle" | "tall"
interface Piece { id: string; kind: PieceKind; plot: number | null; slot: number | null }

const ANIMALS = [
  { emoji: "🐰", name: "Bunny", bg: "#eab308" },
  { emoji: "🐻", name: "Bear", bg: "#f97316" },
  { emoji: "🦉", name: "Owl", bg: "#a855f7" },
]

function initialPieces(): Piece[] {
  const out: Piece[] = []
  for (let i = 0; i < 6; i++) out.push({ id: `sq${i}`, kind: "square", plot: null, slot: null })
  for (let i = 0; i < 3; i++) out.push({ id: `tr${i}`, kind: "triangle", plot: null, slot: null })
  for (let i = 0; i < 2; i++) out.push({ id: `ta${i}`, kind: "tall", plot: null, slot: null })
  return out
}

export function AnimalHouse({ onComplete, onClose, progress: baseProgress }: { onComplete: (s: number) => void; onClose: () => void; progress: number }) {
  const [pieces, setPieces] = useState<Piece[]>(initialPieces)
  const [phase, setPhase] = useState<"build" | "testing" | "success" | "failed">("build")
  const [shake, setShake] = useState<number | null>(null)
  const slotRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())

  const startRef = useRef(Date.now())
  const attemptsRef = useRef(0)
  const retriesRef = useRef(0)
  const firstFailedRef = useRef(false)
  const uniqueConfigs = useRef<Set<string>>(new Set())

  function getAt(plot: number, slot: number) {
    return pieces.find((p) => p.plot === plot && p.slot === slot) ?? null
  }

  function tryPlace(piece: Piece, clientX: number, clientY: number) {
    let target: { plot: number; slot: number } | null = null
    slotRefs.current.forEach((el, k) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        const [p, s] = k.split(":").map(Number)
        target = { plot: p!, slot: s! }
      }
    })
    const t = target as { plot: number; slot: number } | null
    if (!t) return
    const { plot, slot } = t
    if (getAt(plot, slot)) return
    if (slot > 0 && !getAt(plot, slot - 1)) return
    setPieces((ps) => ps.map((p) => (p.id === piece.id ? { ...p, plot, slot } : p)))
  }

  function pickUp(id: string) {
    if (phase !== "build") return
    setPieces((ps) => {
      const target = ps.find((p) => p.id === id)
      if (!target || target.plot == null) return ps
      return ps.map((p) => {
        if (p.id === id) return { ...p, plot: null, slot: null }
        if (p.plot === target.plot && p.slot != null && target.slot != null && p.slot > target.slot) {
          return { ...p, plot: null, slot: null }
        }
        return p
      })
    })
  }

  function reset() {
    setPieces((ps) => ps.map((p) => ({ ...p, plot: null, slot: null })))
    setPhase("build")
  }

  function test() {
    if (phase !== "build") return
    attemptsRef.current += 1
    const sig = pieces.map((p) => `${p.id}:${p.plot ?? "x"}.${p.slot ?? "x"}`).sort().join("|")
    uniqueConfigs.current.add(sig)

    setPhase("testing")
    const verdicts = ANIMALS.map((_, plot) => {
      const b = getAt(plot, 0)
      const m = getAt(plot, 1)
      const t = getAt(plot, 2)
      const wallsOK = b?.kind === "square" && m?.kind === "square"
      const roofOK = t?.kind === "triangle"
      return wallsOK && roofOK
    })

    setTimeout(() => {
      if (verdicts.every(Boolean)) {
        setPhase("success")
      } else {
        const firstBad = verdicts.findIndex((v) => !v)
        setShake(firstBad)
        if (!firstFailedRef.current) firstFailedRef.current = true
        else retriesRef.current += 1
        setTimeout(() => {
          setShake(null)
          setPieces((ps) => ps.map((p) => (p.plot === firstBad ? { ...p, plot: null, slot: null } : p)))
          setPhase("failed")
          setTimeout(() => setPhase("build"), 1000)
        }, 700)
      }
    }, 600)
  }

  function finish() {
    saveModuleMetrics("animal-house", {
      attempts: attemptsRef.current,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: retriesRef.current,
      improved: retriesRef.current > 0 && phase === "success",
      experimentation: Math.min(1, uniqueConfigs.current.size / 4),
      completed: true,
    })
    onComplete(100)
  }

  const placed = pieces.filter((p) => p.plot != null)
  const allHoused = ANIMALS.every((_, i) => getAt(i, 0) && getAt(i, 1) && getAt(i, 2))
  const progress = phase === "success" ? 100 : 10 + Math.min(80, placed.length / 9 * 60 + attemptsRef.current * 10)

  return (
    <GameShell title="Animal House Builder" subtitle="Build for all three!" progress={progress} onClose={onClose}>
      <div className="card relative p-4 sm:p-6 bg-card rounded-3xl border-2 border-border shadow-sm">
        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {ANIMALS.map((a, plot) => (
            <div key={plot} className="flex flex-col items-center">
              <p className="font-extrabold text-sm sm:text-base">{a.name}'s spot</p>
              <motion.div animate={shake === plot ? { x: [0, -8, 8, -6, 6, 0], rotate: [0, -2, 2, -1, 1, 0] } : { x: 0, rotate: 0 }} transition={{ duration: 0.6 }} className="relative mt-2 flex w-full flex-col-reverse items-center gap-1.5">
                {[0, 1, 2].map((slot) => {
                  const piece = getAt(plot, slot)
                  return (
                    <div key={slot} ref={(el) => { slotRefs.current.set(`${plot}:${slot}`, el) }} className={`relative grid w-full place-items-center rounded-xl border-2 transition-colors ${piece ? "border-transparent" : "border-border bg-muted border-dashed"}`} style={{ height: 64 }}>
                      {piece && (
                        <button onClick={() => pickUp(piece.id)} className="absolute inset-1 cursor-pointer">
                          <PieceShape kind={piece.kind} bg={a.bg} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </motion.div>
              <div className="mt-2 grid h-12 w-full place-items-center rounded-2xl border-2 border-border text-2xl shadow-sm" style={{ background: a.bg }}>
                {a.emoji}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Drag the right pieces</p>
            <p className="text-xs font-bold text-muted-foreground">{pieces.filter((p) => p.plot == null).length} left</p>
          </div>
          <div className="flex min-h-24 flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/50 p-3">
            {pieces.filter((p) => p.plot == null).map((p) => (
              <DraggablePiece key={p.id} piece={p} disabled={phase !== "build"} onDrop={(x, y) => tryPlace(p, x, y)} />
            ))}
            {allHoused && <p className="text-sm font-bold text-muted-foreground">All pieces placed — tap Test!</p>}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={test} disabled={phase !== "build" || !allHoused} className="h-14 px-6 flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-extrabold text-lg transition-transform active:scale-95 shadow-[0_4px_0_0_var(--color-primary-shadow)] border-2 border-primary-shadow disabled:opacity-50">
            <Play className="h-5 w-5" /> Test houses
          </button>
          <button onClick={reset} disabled={phase === "testing"} className="h-14 px-6 flex items-center justify-center gap-2 rounded-2xl bg-transparent border-2 border-border text-foreground font-extrabold text-lg transition-transform active:scale-95 hover:bg-muted disabled:opacity-50">
            <RotateCcw className="h-5 w-5" /> Clear
          </button>
          <div className="ml-auto">
            <MascotMessage mood={phase === "success" ? "cheer" : phase === "failed" ? "thinking" : "happy"} message={phase === "success" ? "All three animals are home!" : phase === "failed" ? "Crashed! Try a stronger stack." : "Walls go low, roof on top!"} />
          </div>
        </div>

        <AnimatePresence>
          {phase === "failed" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 font-bold text-destructive">
              <X className="h-5 w-5" /> A house fell over. Squares first, triangle on top.
            </motion.div>
          )}
          {phase === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-4 rounded-2xl border-2 border-success/40 bg-success/15 px-4 py-3 font-bold text-success">
              <StarBurst />
              <div className="flex items-center gap-2"><Check className="h-5 w-5" /> Three sturdy houses!</div>
              <div className="mt-3"><button onClick={finish} className="h-14 px-6 rounded-2xl bg-success text-success-foreground font-extrabold text-lg shadow-[0_4px_0_0_var(--color-success-shadow)] border-2 border-success-shadow active:scale-95 transition-transform">Next quest</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  )
}

function PieceShape({ kind, bg }: { kind: PieceKind; bg: string }) {
  if (kind === "triangle") {
    return (
      <svg viewBox="0 0 60 56" className="h-full w-full">
        <polygon points="30,4 56,52 4,52" fill={bg} stroke="rgba(0,0,0,0.2)" strokeWidth="3" strokeLinejoin="round" />
        <polygon points="30,12 50,48 10,48" fill="white" opacity="0.18" />
      </svg>
    )
  }
  if (kind === "tall") {
    return <div className="h-full w-1/2 mx-auto rounded-md border-2 border-amber-900/40" style={{ background: "#fbbf24", boxShadow: "inset 0 -6px 0 0 rgba(0,0,0,0.18)" }} />
  }
  return <div className="h-full w-full rounded-md border-2 border-amber-900/40" style={{ background: "#fcd34d", boxShadow: "inset 0 -6px 0 0 rgba(0,0,0,0.18)" }} />
}

function DraggablePiece({ piece, disabled, onDrop }: { piece: Piece; disabled?: boolean; onDrop: (x: number, y: number) => void }) {
  const controls = useDragControls()
  const w = piece.kind === "tall" ? 32 : 56
  const h = 56
  return (
    <motion.div drag={!disabled} dragControls={controls} dragSnapToOrigin whileDrag={{ scale: 1.1, zIndex: 50 }} onDragEnd={(_e, info) => onDrop(info.point.x, info.point.y)} className="cursor-grab touch-none select-none active:cursor-grabbing" style={{ width: w, height: h }}>
      <PieceShape kind={piece.kind} bg="#eab308" />
    </motion.div>
  )
}
