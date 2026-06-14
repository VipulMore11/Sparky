import { AnimatePresence, motion } from "framer-motion"
import { useRef, useState } from "react"
import { Play, RotateCcw, Trash2, Check, X } from "lucide-react"
import { GameShell, MascotMessage, StarBurst } from "./GameShell"
import { saveModuleMetrics } from "@/lib/kinesthetic-store"

const COLS = 6
const ROWS = 5
const SOURCE = { r: 0, c: 0 }
const POOLS = [
  { r: 4, c: 5 },
  { r: 2, c: 5 },
]

type Cell = { kind: "straight" | "curve"; rot: 0 | 1 | 2 | 3 } | null

// connection masks: which sides connect [top,right,bottom,left]
function conns(c: Cell): [number, number, number, number] {
  if (!c) return [0, 0, 0, 0]
  const base = c.kind === "straight" ? [1, 0, 1, 0] : [1, 1, 0, 0] // top-right L
  return rot(base as number[], c.rot) as [number, number, number, number]
}

function rot(a: number[], n: number) {
  const out = [...a]
  for (let i = 0; i < n; i++) out.unshift(out.pop()!)
  return out
}

export function MiddleWaterPark({
  onComplete,
  onClose,
  progress: baseProgress,
}: {
  onComplete: (s: number) => void
  onClose: () => void
  progress: number
}) {
  const [grid, setGrid] = useState<Cell[][]>(
    Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null))
  )
  const [tool, setTool] = useState<"straight" | "curve">("straight")
  const [filled, setFilled] = useState<Set<string>>(new Set())
  const [phase, setPhase] = useState<"build" | "testing" | "success" | "failed">("build")
  
  const testsRef = useRef(0)
  const iterationsRef = useRef(0)
  const startRef = useRef(Date.now())
  const retriesRef = useRef(0)
  const firstFailedRef = useRef(false)
  const uniqueConfigs = useRef<Set<string>>(new Set())

  const tap = (r: number, c: number) => {
    if (phase !== "build") return
    if ((r === SOURCE.r && c === SOURCE.c) || POOLS.some((p) => p.r === r && p.c === c)) return
    
    setGrid((g) => {
      const ng = g.map((row) => [...row])
      const cur = ng[r]![c]!
      
      if (!cur) {
        ng[r]![c] = { kind: tool, rot: 0 }
      } else if (cur.kind !== tool) {
        ng[r]![c] = { kind: tool, rot: 0 }
        iterationsRef.current += 1
      } else if (cur.rot < 3) {
        ng[r]![c] = { ...cur, rot: (cur.rot + 1) as 0 | 1 | 2 | 3 }
      } else {
        ng[r]![c] = null
        iterationsRef.current += 1
      }
      return ng
    })
  }

  const run = async () => {
    if (phase !== "build") return
    setPhase("testing")
    testsRef.current += 1
    
    const sig = grid.flat().map(c => c ? `${c.kind}${c.rot}` : 'x').join('')
    uniqueConfigs.current.add(sig)

    const reached = new Set<string>()
    const queue: { r: number; c: number; from: number }[] = [{ r: SOURCE.r, c: SOURCE.c, from: -1 }]
    
    while (queue.length) {
      const { r, c, from } = queue.shift()!
      const key = `${r},${c}`
      if (reached.has(key)) continue
      reached.add(key)
      
      setFilled(new Set(reached))
      await new Promise((res) => setTimeout(res, 120))
      
      let outs: [number, number, number, number]
      if (r === SOURCE.r && c === SOURCE.c) outs = [0, 1, 1, 0]
      else if (POOLS.some((p) => p.r === r && p.c === c)) outs = [0, 0, 0, 0]
      else outs = conns(grid[r]![c]!)
      
      if (from >= 0 && !outs[from]) continue
      
      const dirs = [
        { dr: -1, dc: 0, side: 0, opp: 2 },
        { dr: 0, dc: 1, side: 1, opp: 3 },
        { dr: 1, dc: 0, side: 2, opp: 0 },
        { dr: 0, dc: -1, side: 3, opp: 1 },
      ]
      
      for (const d of dirs) {
        if (!outs[d.side]) continue
        const nr = r + d.dr, nc = c + d.dc
        if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) continue
        
        const target = (nr === SOURCE.r && nc === SOURCE.c) ? [0, 0, 0, 0] :
          POOLS.some((p) => p.r === nr && p.c === nc) ? [1, 1, 1, 1] :
          conns(grid[nr]![nc]!)
          
        if (target[d.opp]) queue.push({ r: nr, c: nc, from: d.opp })
      }
    }
    
    const hit = POOLS.filter((p) => reached.has(`${p.r},${p.c}`)).length
    if (hit === POOLS.length) {
      setPhase("success")
    } else {
      setPhase("failed")
      if (!firstFailedRef.current) firstFailedRef.current = true
      else retriesRef.current += 1
      setTimeout(() => {
        setFilled(new Set())
        setPhase("build")
      }, 1500)
    }
  }

  function finish() {
    saveModuleMetrics("water-park", {
      attempts: testsRef.current,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: retriesRef.current,
      improved: testsRef.current >= 2 && phase === "success",
      experimentation: Math.min(1, uniqueConfigs.current.size / 4),
      completed: true,
    })
    onComplete(100)
  }

  const clear = () => { 
    if (phase !== "build") return
    setGrid(Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null)))
    setFilled(new Set())
    iterationsRef.current += 1
  }

  const progress = phase === "success" ? 100 : Math.min(85, testsRef.current * 15)

  return (
    <GameShell title="Water Park Designer" subtitle="Connect pipes so water reaches all pools!" progress={progress} onClose={onClose}>
      <div className="card p-5 sm:p-6 bg-card rounded-3xl border-2 border-border shadow-sm">
        <div className="flex flex-col md:flex-row items-start justify-between gap-5">
          <MascotMessage 
            mood={phase === "success" ? "cheer" : phase === "failed" ? "thinking" : "happy"} 
            message={phase === "success" ? "All pools are filled! Great engineering!" : phase === "failed" ? "Water didn't reach all the pools. Keep trying!" : "Tap to place pipes. Tap again to rotate them."} 
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 bg-blue-50/50 p-3 rounded-2xl border-2 border-border">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Tool:</span>
          <button 
            onClick={() => setTool("straight")} 
            disabled={phase !== "build"}
            className={`h-10 px-4 rounded-xl font-bold border-2 transition-all active:scale-95 ${tool === "straight" ? "bg-blue-500 text-white border-blue-600 shadow-sm" : "bg-white border-border text-foreground"}`}
          >
            ━ Straight
          </button>
          <button 
            onClick={() => setTool("curve")} 
            disabled={phase !== "build"}
            className={`h-10 px-4 rounded-xl font-bold border-2 transition-all active:scale-95 ${tool === "curve" ? "bg-blue-500 text-white border-blue-600 shadow-sm" : "bg-white border-border text-foreground"}`}
          >
            ↳ Curve
          </button>
        </div>

        <div className="relative mx-auto mt-6 select-none rounded-3xl border-2 border-border bg-muted/30 p-2 sm:p-4" style={{ maxWidth: 480 }}>
          <div className="grid gap-1.5 touch-none" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isSrc = r === SOURCE.r && c === SOURCE.c
                const isPool = POOLS.some((p) => p.r === r && p.c === c)
                const lit = filled.has(`${r},${c}`)
                
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => tap(r, c)}
                    disabled={phase !== "build" && !isSrc && !isPool}
                    className={`aspect-square rounded-xl border-2 flex items-center justify-center text-xl sm:text-3xl relative transition-colors ${
                      lit ? "border-blue-500 bg-blue-100" 
                      : isPool ? "border-teal-500 bg-teal-50" 
                      : isSrc ? "border-blue-500 bg-blue-50" 
                      : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {isSrc ? <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>💧</motion.span> : isPool ? (lit ? "🏊‍♂️" : "🕳️") : <PipeIcon cell={cell} lit={lit} />}
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={run} disabled={phase !== "build"} className="h-14 px-6 flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-blue-500 text-white font-extrabold text-lg transition-transform active:scale-95 shadow-[0_4px_0_0_#1d4ed8] border-2 border-blue-600 disabled:opacity-50">
            <Play className="h-5 w-5 fill-current" /> {phase === "testing" ? "Flowing..." : "Turn on Water"}
          </button>
          <button onClick={clear} disabled={phase !== "build"} className="h-14 px-6 flex items-center justify-center gap-2 rounded-2xl bg-transparent border-2 border-border text-foreground font-extrabold text-lg transition-transform active:scale-95 hover:bg-muted disabled:opacity-50">
            <Trash2 className="h-5 w-5" /> Clear
          </button>
        </div>

        <AnimatePresence>
          {phase === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-4 rounded-2xl border-2 border-success/40 bg-success/15 px-4 py-3 font-bold text-success">
              <StarBurst />
              <div className="flex items-center gap-2"><Check className="h-5 w-5" /> The water park is ready to open!</div>
              <div className="mt-3"><button onClick={finish} className="h-14 px-6 rounded-2xl bg-success text-success-foreground font-extrabold text-lg shadow-[0_4px_0_0_var(--color-success-shadow)] border-2 border-success-shadow active:scale-95 transition-transform">Next quest</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  )
}

function PipeIcon({ cell, lit }: { cell: Cell; lit: boolean }) {
  if (!cell) return null
  const stroke = lit ? "#3b82f6" : "var(--muted-foreground)"
  const opacity = lit ? 1 : 0.4
  
  return (
    <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full p-1" style={{ transform: `rotate(${cell.rot * 90}deg)`, opacity }}>
      {cell.kind === "straight" ? (
        <line x1="12" y1="0" x2="12" y2="24" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
      ) : (
        <path d="M 12 0 L 12 12 L 24 12" fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}
