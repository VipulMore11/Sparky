import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { ArrowUp, Play, RotateCcw, RotateCw, Trash2, Check, X } from "lucide-react"
import { GameShell, MascotMessage, StarBurst } from "./GameShell"
import { saveModuleMetrics } from "@/lib/kinesthetic-store"

const SIZE = 5
const START = { r: 4, c: 0, dir: 0 } // 0=right
const GOAL = { r: 0, c: 4 }
const WALLS = new Set(["2,1", "2,2", "1,3"])

type Block = "F" | "L" | "R"

export function MiddlePetRobot({
  onComplete,
  onClose,
  progress: baseProgress,
}: {
  onComplete: (s: number) => void
  onClose: () => void
  progress: number
}) {
  const [seq, setSeq] = useState<Block[]>([])
  const [robot, setRobot] = useState(START)
  const [phase, setPhase] = useState<"plan" | "running" | "success" | "crashed">("plan")
  const [runs, setRuns] = useState(0)
  const [debugs, setDebugs] = useState(0)
  const [lastSeqLen, setLastSeqLen] = useState(0)

  const startRef = useRef(Date.now())
  const attemptsRef = useRef(0)
  const retriesRef = useRef(0)
  const firstFailedRef = useRef(false)
  const uniqueConfigs = useRef<Set<string>>(new Set())

  const add = (b: Block) => {
    if (phase !== "plan") return
    setSeq((s) => [...s, b])
  }
  
  const remove = (i: number) => {
    if (phase !== "plan") return
    setSeq((s) => s.filter((_, j) => j !== i))
    setDebugs((d) => d + 1)
  }
  
  const clear = () => {
    if (phase !== "plan") return
    if (seq.length) setDebugs((d) => d + 1)
    setSeq([])
    setRobot(START)
    setPhase("plan")
  }

  const run = async () => {
    if (phase !== "plan" || seq.length === 0) return
    setPhase("running")
    setRobot(START)
    setRuns((r) => r + 1)
    attemptsRef.current += 1
    
    uniqueConfigs.current.add(seq.join(","))

    if (runs > 0 && seq.length !== lastSeqLen) setDebugs((d) => d + 1)
    setLastSeqLen(seq.length)
    
    let cur = { ...START }
    let crashed = false
    
    for (const b of seq) {
      await new Promise((res) => setTimeout(res, 280))
      if (b === "L") cur = { ...cur, dir: (cur.dir + 3) % 4 }
      else if (b === "R") cur = { ...cur, dir: (cur.dir + 1) % 4 }
      else {
        const dr = [0, 1, 0, -1][cur.dir]!
        const dc = [1, 0, -1, 0][cur.dir]!
        const nr = cur.r + dr, nc = cur.c + dc
        if (nr < 0 || nc < 0 || nr >= SIZE || nc >= SIZE || WALLS.has(`${nr},${nc}`)) {
          crashed = true
          break
        }
        cur = { ...cur, r: nr, c: nc }
      }
      setRobot(cur)
    }
    
    const won = !crashed && cur.r === GOAL.r && cur.c === GOAL.c
    if (won) {
      setPhase("success")
    } else {
      setPhase("crashed")
      if (!firstFailedRef.current) firstFailedRef.current = true
      else retriesRef.current += 1
      setTimeout(() => {
        setPhase("plan")
        setRobot(START)
      }, 1500)
    }
  }

  function finish() {
    saveModuleMetrics("pet-robot", {
      attempts: attemptsRef.current,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: retriesRef.current,
      improved: retriesRef.current > 0 && phase === "success",
      experimentation: Math.min(1, uniqueConfigs.current.size / 4),
      completed: true,
    })
    onComplete(100)
  }

  const progress = phase === "success" ? 100 : Math.min(85, runs * 15 + seq.length * 2)

  return (
    <GameShell title="Pet Rescue Robot" subtitle="Stack movement blocks to rescue the pet!" progress={progress} onClose={onClose}>
      <div className="card p-5 sm:p-6 bg-card rounded-3xl border-2 border-border shadow-sm">
        <div className="flex flex-col md:flex-row items-start justify-between gap-5">
          <MascotMessage 
            mood={phase === "success" ? "cheer" : phase === "crashed" ? "thinking" : "happy"} 
            message={phase === "success" ? "You programmed it perfectly!" : phase === "crashed" ? "Oops! The robot crashed." : "Give the robot instructions to reach the puppy."} 
          />
          <div className="rounded-2xl border-2 border-border bg-muted px-4 py-2 text-center shrink-0">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Runs</p>
            <p className="font-extrabold text-xl text-primary">{runs}</p>
          </div>
        </div>

        <div className="relative mx-auto mt-6 select-none rounded-3xl border-2 border-border bg-muted/30 p-2 sm:p-4" style={{ maxWidth: 400 }}>
          <div className="grid gap-1.5 touch-none" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
            {Array.from({ length: SIZE }).map((_, r) =>
              Array.from({ length: SIZE }).map((_, c) => {
                const isWall = WALLS.has(`${r},${c}`)
                const isGoal = r === GOAL.r && c === GOAL.c
                const isBot = robot.r === r && robot.c === c
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`aspect-square rounded-xl border-2 flex items-center justify-center text-xl sm:text-3xl relative transition-all ${isWall ? "border-amber-900 bg-amber-800" : "border-border bg-background"}`}
                  >
                    {isGoal && !isBot && <span className="absolute inset-0 grid place-items-center animate-bounce">🐶</span>}
                    {isBot && (
                      <motion.div layout className="absolute inset-0 grid place-items-center transition-transform" style={{ transform: `rotate(${[0, 90, 180, 270][robot.dir]}deg)` }}>🤖</motion.div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3">Commands</p>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => add("F")} disabled={phase !== "plan"} className="flex flex-col items-center justify-center py-4 rounded-2xl bg-indigo-100 text-indigo-700 border-2 border-indigo-200 active:scale-95 transition-transform disabled:opacity-50 font-bold">
              <ArrowUp className="h-6 w-6 mb-1" /> Forward
            </button>
            <button onClick={() => add("L")} disabled={phase !== "plan"} className="flex flex-col items-center justify-center py-4 rounded-2xl bg-blue-100 text-blue-700 border-2 border-blue-200 active:scale-95 transition-transform disabled:opacity-50 font-bold">
              <RotateCcw className="h-6 w-6 mb-1" /> Turn Left
            </button>
            <button onClick={() => add("R")} disabled={phase !== "plan"} className="flex flex-col items-center justify-center py-4 rounded-2xl bg-blue-100 text-blue-700 border-2 border-blue-200 active:scale-95 transition-transform disabled:opacity-50 font-bold">
              <RotateCw className="h-6 w-6 mb-1" /> Turn Right
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border-2 border-dashed border-border bg-muted/50 p-3 min-h-[80px]">
          <div className="flex flex-wrap gap-2">
            {seq.length === 0 && <span className="text-sm text-muted-foreground font-semibold p-2">Tap commands to build sequence...</span>}
            <AnimatePresence>
              {seq.map((b, i) => (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  key={`${i}-${b}`}
                  onClick={() => remove(i)}
                  disabled={phase !== "plan"}
                  className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl text-white font-bold flex items-center justify-center shadow-sm disabled:opacity-80 ${b === "F" ? "bg-indigo-500" : "bg-blue-500"}`}
                  title="Remove"
                >
                  {b === "F" ? <ArrowUp className="h-5 w-5" /> : b === "L" ? <RotateCcw className="h-5 w-5" /> : <RotateCw className="h-5 w-5" />}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={run} disabled={phase !== "plan" || seq.length === 0} className="h-14 px-6 flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-extrabold text-lg transition-transform active:scale-95 shadow-[0_4px_0_0_var(--color-primary-shadow)] border-2 border-primary-shadow disabled:opacity-50">
            <Play className="h-5 w-5 fill-current" /> {phase === "running" ? "Running..." : "Run Sequence"}
          </button>
          <button onClick={clear} disabled={phase === "running"} className="h-14 px-6 flex items-center justify-center gap-2 rounded-2xl bg-transparent border-2 border-border text-foreground font-extrabold text-lg transition-transform active:scale-95 hover:bg-muted disabled:opacity-50">
            <Trash2 className="h-5 w-5" /> Clear
          </button>
        </div>

        <AnimatePresence>
          {phase === "crashed" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 font-bold text-destructive">
              <X className="h-5 w-5" /> Robot hit a wall or left the grid! Try again.
            </motion.div>
          )}
          {phase === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-4 rounded-2xl border-2 border-success/40 bg-success/15 px-4 py-3 font-bold text-success">
              <StarBurst />
              <div className="flex items-center gap-2"><Check className="h-5 w-5" /> Puppy Rescued!</div>
              <div className="mt-3"><button onClick={finish} className="h-14 px-6 rounded-2xl bg-success text-success-foreground font-extrabold text-lg shadow-[0_4px_0_0_var(--color-success-shadow)] border-2 border-success-shadow active:scale-95 transition-transform">Next quest</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  )
}
