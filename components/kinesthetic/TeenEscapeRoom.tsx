import { AnimatePresence, motion } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { Check, Delete, DoorOpen } from "lucide-react"
import { GameShell, MascotMessage, StarBurst } from "./GameShell"
import { saveModuleMetrics } from "@/lib/kinesthetic-store"

export function TeenEscapeRoom({
  onComplete,
  onClose,
  progress: baseProgress,
}: {
  onComplete: (s: number) => void
  onClose: () => void
  progress: number
}) {
  const [stage, setStage] = useState(0)
  const [retries, setRetries] = useState(0)
  const [experiments, setExperiments] = useState(0)
  const [phase, setPhase] = useState<"playing" | "success">("playing")
  const startRef = useRef(Date.now())

  const next = () => {
    if (stage === 2) {
      setPhase("success")
    } else {
      setStage((s) => s + 1)
    }
  }

  const finish = () => {
    saveModuleMetrics("escape-room", {
      attempts: experiments,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: retries,
      improved: retries > 0 && phase === "success",
      completed: true,
    })
    onComplete(100)
  }

  const progress = phase === "success" ? 100 : (stage / 3) * 85

  return (
    <GameShell title="Escape Room Engineer" subtitle={`Room ${Math.min(stage + 1, 3)} of 3 · Find the way out 🗝️`} progress={progress} onClose={onClose}>
      <div className="card p-5 sm:p-6 bg-card rounded-3xl border-2 border-border shadow-sm">
        <div className="flex flex-col md:flex-row items-start justify-between gap-5">
          <MascotMessage 
            mood={phase === "success" ? "cheer" : "happy"} 
            message={phase === "success" ? "You escaped!" : stage === 0 ? "Connect the wires to fix the door panel." : stage === 1 ? "Crack the 4-digit code to open the lock." : "Trace a path to the exit without hitting the walls."} 
          />
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {stage === 0 && phase === "playing" && (
              <motion.div key="stage0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <WireMatch onSolve={() => { next(); setExperiments((e) => e + 1) }} onRetry={() => setRetries((r) => r + 1)} />
              </motion.div>
            )}
            {stage === 1 && phase === "playing" && (
              <motion.div key="stage1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <CodeLock onSolve={() => { next(); setExperiments((e) => e + 1) }} onRetry={() => setRetries((r) => r + 1)} />
              </motion.div>
            )}
            {stage === 2 && phase === "playing" && (
              <motion.div key="stage2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <PathDraw onSolve={() => { next(); setExperiments((e) => e + 1) }} onRetry={() => setRetries((r) => r + 1)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {phase === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-4 rounded-2xl border-2 border-success/40 bg-success/15 px-4 py-8 font-bold text-success text-center">
              <StarBurst />
              <DoorOpen className="size-16 mx-auto mb-2 text-success" />
              <div className="text-2xl font-black mb-4">You escaped!</div>
              <div><button onClick={finish} className="h-14 px-8 rounded-2xl bg-success text-success-foreground font-extrabold text-lg shadow-[0_4px_0_0_var(--color-success-shadow)] border-2 border-success-shadow active:scale-95 transition-transform">Complete Mission</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  )
}

// ===== Puzzle 1: Wire Match =====
const WIRES = [
  { id: "r", color: "#ef4444", bg: "bg-red-500", label: "🔴" },
  { id: "b", color: "#3b82f6", bg: "bg-blue-500", label: "🔵" },
  { id: "y", color: "#eab308", bg: "bg-yellow-500", label: "🟡" },
  { id: "g", color: "#22c55e", bg: "bg-green-500", label: "🟢" },
]
function shuffle<T>(arr: T[]) { return arr.slice().sort(() => Math.random() - 0.5) }

function WireMatch({ onSolve, onRetry }: { onSolve: () => void; onRetry: () => void }) {
  const [right, setRight] = useState(WIRES)
  useEffect(() => { setRight(shuffle(WIRES)) }, [])
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [drag, setDrag] = useState<string | null>(null)

  const allCorrect = Object.keys(matches).length === WIRES.length && WIRES.every((w) => matches[w.id] === w.id)
  
  const tryDrop = (rightId: string) => {
    if (!drag) return
    setMatches((m) => ({ ...m, [drag]: rightId }))
    setDrag(null)
  }
  
  useEffect(() => {
    if (Object.keys(matches).length === WIRES.length && !allCorrect) {
      onRetry()
      setTimeout(() => setMatches({}), 600)
    }
    if (allCorrect) setTimeout(onSolve, 600)
  }, [matches, allCorrect, onRetry, onSolve])

  return (
    <div className="p-4 rounded-3xl border-2 border-border bg-muted/30">
      <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-4">🔌 Connect each wire to its color</div>
      <div className="grid grid-cols-2 gap-8 items-center max-w-sm mx-auto">
        <div className="space-y-4">
          {WIRES.map((w) => (
            <div
              key={w.id}
              draggable
              onDragStart={() => setDrag(w.id)}
              className={`h-14 rounded-2xl flex items-center justify-end pr-4 text-white font-bold cursor-grab active:cursor-grabbing shadow-sm ${w.bg}`}
              style={{ opacity: matches[w.id] ? 0.4 : 1 }}
            >
              ━━{w.label}
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {right.map((w) => {
            const matched = Object.entries(matches).find(([, v]) => v === w.id)
            const isCorrect = matched && matched[0] === w.id
            return (
              <div
                key={w.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => tryDrop(w.id)}
                className={`h-14 rounded-2xl border-2 border-dashed flex items-center pl-4 font-bold transition-all ${
                  matched 
                    ? isCorrect ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700" 
                    : "border-border bg-background"
                }`}
              >
                {w.label}━━
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ===== Puzzle 2: Code Lock =====
function CodeLock({ onSolve, onRetry }: { onSolve: () => void; onRetry: () => void }) {
  const SECRET = "4271"
  const [code, setCode] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)

  const submit = () => {
    if (code.length !== 4) return
    if (code === SECRET) {
      setFeedback("✓ Unlocked")
      setTimeout(onSolve, 600)
    } else {
      let hit = 0, near = 0
      for (let i = 0; i < 4; i++) {
        if (code[i] === SECRET[i]) hit++
        else if (SECRET.includes(code[i]!)) near++
      }
      setFeedback(`${hit} correct · ${near} in wrong place`)
      onRetry()
      setTimeout(() => { setCode(""); setFeedback(null) }, 1200)
    }
  }

  return (
    <div className="p-4 rounded-3xl border-2 border-border bg-muted/30">
      <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-4">🔢 Crack the 4-digit lock</div>
      
      <div className="max-w-xs mx-auto">
        <div className="flex justify-center gap-3 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`size-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black ${code[i] ? "border-blue-500 bg-blue-50 text-blue-900" : "border-border bg-background text-transparent"}`}>
              {code[i] ?? "0"}
            </div>
          ))}
        </div>
        
        {feedback && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`text-center text-sm font-bold mb-4 p-2 rounded-xl ${feedback.startsWith("✓") ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
            {feedback}
          </motion.div>
        )}
        
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} onClick={() => code.length < 4 && setCode(code + n)} className="h-14 rounded-2xl bg-white border-2 border-border text-xl font-bold shadow-sm active:scale-95 transition-transform hover:bg-muted text-foreground">
              {n}
            </button>
          ))}
          <button onClick={() => setCode(code.slice(0, -1))} className="h-14 rounded-2xl bg-white border-2 border-border flex items-center justify-center shadow-sm active:scale-95 transition-transform hover:bg-muted text-destructive">
            <Delete className="size-6" />
          </button>
          <button onClick={() => code.length < 4 && setCode(code + 0)} className="h-14 rounded-2xl bg-white border-2 border-border text-xl font-bold shadow-sm active:scale-95 transition-transform hover:bg-muted text-foreground">
            0
          </button>
          <button onClick={submit} disabled={code.length !== 4} className="h-14 rounded-2xl bg-blue-500 text-white border-2 border-blue-600 flex items-center justify-center shadow-[0_4px_0_0_#2563eb] active:scale-95 transition-transform disabled:opacity-50">
            <Check className="size-6" />
          </button>
        </div>
        <div className="text-[10px] text-muted-foreground mt-4 text-center font-bold">HINT: Try anything — the lock will tell you what's right.</div>
      </div>
    </div>
  )
}

// ===== Puzzle 3: Path Draw =====
const PSIZE = 6
const PWALLS = new Set(["1,1", "1,2", "1,3", "3,2", "3,3", "3,4", "2,4", "4,1"])
const PSTART = { r: 5, c: 0 }, PEND = { r: 0, c: 5 }

function PathDraw({ onSolve, onRetry }: { onSolve: () => void; onRetry: () => void }) {
  const [path, setPath] = useState<{ r: number; c: number }[]>([PSTART])
  const [drawing, setDrawing] = useState(false)
  const failedRef = useRef(false)

  const enter = (r: number, c: number) => {
    if (!drawing) return
    if (PWALLS.has(`${r},${c}`)) { fail(); return }
    const last = path[path.length - 1]!
    if (last.r === r && last.c === c) return
    if (Math.abs(last.r - r) + Math.abs(last.c - c) !== 1) return
    
    // backtrack
    if (path.length >= 2 && path[path.length - 2]!.r === r && path[path.length - 2]!.c === c) {
      setPath((p) => p.slice(0, -1))
      return
    }
    if (path.some((p) => p.r === r && p.c === c)) return
    
    setPath((p) => [...p, { r, c }])
    if (r === PEND.r && c === PEND.c) { 
      setDrawing(false)
      setTimeout(onSolve, 500) 
    }
  }

  const fail = () => {
    if (failedRef.current) return
    failedRef.current = true
    setDrawing(false)
    onRetry()
    setTimeout(() => { setPath([PSTART]); failedRef.current = false }, 700)
  }

  return (
    <div className="p-4 rounded-3xl border-2 border-border bg-muted/30">
      <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-4">✏️ Trace a path from 🟢 to 🚪 (no walls)</div>
      
      <div
        className="grid gap-1 select-none touch-none max-w-xs mx-auto"
        style={{ gridTemplateColumns: `repeat(${PSIZE}, minmax(0,1fr))` }}
        onPointerDown={() => setDrawing(true)}
        onPointerUp={() => setDrawing(false)}
        onPointerLeave={() => setDrawing(false)}
      >
        {Array.from({ length: PSIZE }).map((_, r) =>
          Array.from({ length: PSIZE }).map((_, c) => {
            const wall = PWALLS.has(`${r},${c}`)
            const inPath = path.some((p) => p.r === r && p.c === c)
            const isStart = r === PSTART.r && c === PSTART.c
            const isEnd = r === PEND.r && c === PEND.c
            
            return (
              <div
                key={`${r}-${c}`}
                onPointerEnter={() => enter(r, c)}
                onPointerDown={() => { if (isStart) setDrawing(true) }}
                className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-colors ${
                  wall ? "bg-amber-800 border-amber-900" : 
                  inPath ? "bg-blue-500 border-blue-600" : 
                  "bg-white border-border hover:bg-slate-100"
                } border-2`}
              >
                {isStart ? "🟢" : isEnd ? "🚪" : ""}
              </div>
            )
          })
        )}
      </div>
      <div className="text-[10px] text-muted-foreground mt-4 text-center font-bold">Press & drag from the green tile.</div>
    </div>
  )
}
