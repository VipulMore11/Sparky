import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Play, RotateCcw, X, Droplets } from "lucide-react"
import { GameShell, StarBurst, MascotMessage } from "./GameShell"
import { saveModuleMetrics } from "@/lib/kinesthetic-store"

const COLS = 7
const ROWS = 6
const SOURCE = { r: 0, c: 0 }
const PLANT = { r: ROWS - 1, c: COLS - 1 }

type Cell = { r: number; c: number }
const key = (r: number, c: number) => `${r},${c}`

function findPath(placed: Set<string>): Cell[] | null {
  const walkable = new Set(placed)
  walkable.add(key(SOURCE.r, SOURCE.c))
  walkable.add(key(PLANT.r, PLANT.c))
  const queue: Cell[] = [SOURCE]
  const prev = new Map<string, string | null>()
  prev.set(key(SOURCE.r, SOURCE.c), null)
  while (queue.length) {
    const cur = queue.shift()!
    if (cur.r === PLANT.r && cur.c === PLANT.c) {
      const path: Cell[] = []
      let cKey: string | null = key(cur.r, cur.c)
      while (cKey) {
        const [r, c] = cKey.split(",").map(Number)
        path.unshift({ r: r!, c: c! })
        cKey = prev.get(cKey) ?? null
      }
      return path
    }
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      const nr = cur.r + dr, nc = cur.c + dc
      if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) continue
      const k = key(nr, nc)
      if (!walkable.has(k) || prev.has(k)) continue
      prev.set(k, key(cur.r, cur.c))
      queue.push({ r: nr, c: nc })
    }
  }
  return null
}

export function WaterPath({ onComplete, onClose, progress: baseProgress }: { onComplete: (s: number) => void; onClose: () => void; progress: number }) {
  const [placed, setPlaced] = useState<Set<string>>(new Set())
  const [phase, setPhase] = useState<"build" | "flowing" | "success" | "failed">("build")
  const [flowProgress, setFlowProgress] = useState(0)
  const [attemptCounts, setAttemptCounts] = useState<number[]>([])

  const startRef = useRef<number>(Date.now())
  const attemptsRef = useRef(0)
  const firstFailedRef = useRef(false)
  const retriesRef = useRef(0)
  const draggingValueRef = useRef<"add" | "remove" | null>(null)

  const flowPath = useMemo(() => findPath(placed), [placed])
  const canRelease = placed.size > 0

  const progress = phase === "success" ? 100 : Math.min(85, 10 + attemptsRef.current * 20 + (placed.size / 8) * 30)

  function toggleCell(r: number, c: number) {
    if (phase !== "build") return
    if ((r === SOURCE.r && c === SOURCE.c) || (r === PLANT.r && c === PLANT.c)) return
    setPlaced((prev) => {
      const next = new Set(prev)
      const k = key(r, c)
      if (next.has(k)) next.delete(k); else next.add(k)
      return next
    })
  }

  function paintCell(r: number, c: number) {
    if (phase !== "build" || !draggingValueRef.current) return
    if ((r === SOURCE.r && c === SOURCE.c) || (r === PLANT.r && c === PLANT.c)) return
    const k = key(r, c)
    setPlaced((prev) => {
      const has = prev.has(k)
      if (draggingValueRef.current === "add" && !has) {
        const next = new Set(prev); next.add(k); return next
      }
      if (draggingValueRef.current === "remove" && has) {
        const next = new Set(prev); next.delete(k); return next
      }
      return prev
    })
  }

  function release() {
    if (phase !== "build" || !canRelease) return
    attemptsRef.current += 1
    setAttemptCounts((h) => [...h, placed.size])
    if (!flowPath) {
      if (!firstFailedRef.current) firstFailedRef.current = true
      else retriesRef.current += 1
      setPhase("failed")
      setTimeout(() => setPhase("build"), 1500)
      return
    }
    setPhase("flowing")
    setFlowProgress(0)
  }

  useEffect(() => {
    if (phase !== "flowing" || !flowPath) return
    if (flowProgress >= flowPath.length) {
      setPhase("success")
      return
    }
    const id = setTimeout(() => setFlowProgress((p) => p + 1), 180)
    return () => clearTimeout(id)
  }, [phase, flowProgress, flowPath])

  function reset() {
    setPlaced(new Set())
    setPhase("build")
    setFlowProgress(0)
  }

  function finish() {
    const improved = attemptCounts.length >= 2 && attemptCounts[attemptCounts.length - 1]! <= attemptCounts[0]!
    saveModuleMetrics("water-path", {
      attempts: attemptsRef.current,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: retriesRef.current,
      improved: improved || phase === "success",
      completed: true,
    })
    onComplete(100)
  }

  const flowSet = useMemo(() => {
    if (phase !== "flowing" && phase !== "success") return new Set<string>()
    if (!flowPath) return new Set<string>()
    const limit = phase === "success" ? flowPath.length : flowProgress
    return new Set(flowPath.slice(0, limit).map((c) => key(c.r, c.c)))
  }, [phase, flowProgress, flowPath])

  return (
    <GameShell title="Water Path" subtitle="Help the plant drink!" progress={progress} onClose={onClose}>
      <div className="card p-5 sm:p-6 bg-card rounded-3xl border-2 border-border shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <MascotMessage
            mood={phase === "success" ? "cheer" : phase === "failed" ? "thinking" : "happy"}
            message={phase === "success" ? "Hooray! The plant is happy!" : phase === "failed" ? "Almost! Connect the path with no gaps." : "Tap cells to lay pipe from 💧 to 🌱"}
          />
          <div className="hidden text-right text-xs text-muted-foreground sm:block">
            <p className="font-extrabold uppercase tracking-widest">Pipes</p>
            <p className="font-extrabold text-2xl text-primary">{placed.size}</p>
          </div>
        </div>

        <div className="relative mx-auto mt-5 select-none rounded-3xl border-2 border-border bg-muted p-2 sm:p-3" style={{ maxWidth: 560 }} onPointerUp={() => { draggingValueRef.current = null }} onPointerLeave={() => { draggingValueRef.current = null }}>
          <div className="grid touch-none gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {Array.from({ length: ROWS * COLS }).map((_, i) => {
              const r = Math.floor(i / COLS), c = i % COLS
              const isSource = r === SOURCE.r && c === SOURCE.c
              const isPlant = r === PLANT.r && c === PLANT.c
              const isPlaced = placed.has(key(r, c))
              const isFlowing = flowSet.has(key(r, c))
              return (
                <button
                  key={i}
                  onPointerDown={(e) => {
                    e.preventDefault()
                    if (phase !== "build") return
                    if (isSource || isPlant) return
                    draggingValueRef.current = isPlaced ? "remove" : "add"
                    toggleCell(r, c)
                  }}
                  onPointerEnter={() => paintCell(r, c)}
                  className={`relative aspect-square rounded-xl border-2 transition-colors ${
                    isSource ? "bg-primary border-primary"
                    : isPlant ? "border-success bg-success/20"
                    : isFlowing ? "bg-primary border-primary"
                    : isPlaced ? "bg-foreground/20 border-foreground/30"
                    : "bg-card border-border hover:bg-muted-foreground/10"
                  }`}
                  aria-label={isSource ? "Water source" : isPlant ? "Plant" : `Cell ${r},${c}`}
                >
                  {isSource && <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 1.4, repeat: Infinity }} className="absolute inset-0 grid place-items-center text-xl sm:text-2xl">💧</motion.span>}
                  {isPlant && <motion.span animate={{ scale: phase === "success" ? [1, 1.25, 1] : 1 }} transition={{ duration: 0.6, repeat: phase === "success" ? 3 : 0 }} className="absolute inset-0 grid place-items-center text-xl sm:text-2xl">🌱</motion.span>}
                  {isFlowing && !isSource && !isPlant && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-1 rounded-md bg-primary" />}
                  {isPlaced && !isFlowing && !isSource && !isPlant && <span className="absolute inset-1 rounded-md bg-foreground/40" />}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={release} disabled={!canRelease || phase !== "build"} className="h-14 px-6 flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-extrabold text-lg transition-transform active:scale-95 shadow-[0_4px_0_0_var(--color-primary-shadow)] border-2 border-primary-shadow disabled:opacity-50">
            <Play className="h-5 w-5" /> Release water
          </button>
          <button onClick={reset} disabled={phase === "flowing"} className="h-14 px-6 flex items-center justify-center gap-2 rounded-2xl bg-transparent border-2 border-border text-foreground font-extrabold text-lg transition-transform active:scale-95 hover:bg-muted disabled:opacity-50">
            <RotateCcw className="h-5 w-5" /> Reset
          </button>
          <p className="ml-auto inline-flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <Droplets className="h-4 w-4 text-primary" /> Tap or drag across cells to draw a pipe.
          </p>
        </div>

        <AnimatePresence>
          {phase === "failed" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 font-bold text-destructive">
              <X className="h-5 w-5" /> The water can't get through. Fix the gap!
            </motion.div>
          )}
          {phase === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-4 rounded-2xl border-2 border-success/40 bg-success/15 px-4 py-3 font-bold text-success">
              <StarBurst />
              <div className="flex items-center gap-2"><Check className="h-5 w-5" /> The plant is so happy!</div>
              <div className="mt-3">
                <button onClick={finish} className="h-14 px-6 rounded-2xl bg-success text-success-foreground font-extrabold text-lg shadow-[0_4px_0_0_var(--color-success-shadow)] border-2 border-success-shadow active:scale-95 transition-transform">See my results</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  )
}
