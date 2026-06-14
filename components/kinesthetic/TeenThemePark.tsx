import { AnimatePresence, motion } from "framer-motion"
import { useState, useRef } from "react"
import { Play, Sparkles, Check } from "lucide-react"
import { GameShell, MascotMessage, StarBurst } from "./GameShell"
import { saveModuleMetrics } from "@/lib/kinesthetic-store"

const ROWS = 5, COLS = 6
const TILES = [
  { id: 0, emoji: "", label: "Empty", thrill: 0, food: 0, cost: 0 },
  { id: 1, emoji: "🎢", label: "Coaster", thrill: 8, food: 0, cost: 30 },
  { id: 2, emoji: "🎡", label: "Wheel", thrill: 4, food: 0, cost: 20 },
  { id: 3, emoji: "🍔", label: "Food", thrill: 0, food: 5, cost: 10 },
  { id: 4, emoji: "🌳", label: "Tree", thrill: 1, food: 0, cost: 3 },
]

export function TeenThemePark({
  onComplete,
  onClose,
  progress: baseProgress,
}: {
  onComplete: (s: number) => void
  onClose: () => void
  progress: number
}) {
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(0)))
  const [price, setPrice] = useState(15)
  const [experiments, setExperiments] = useState(0)
  const [iterations, setIterations] = useState(0)
  const [history, setHistory] = useState<number[]>([])
  const [simulating, setSimulating] = useState(false)
  const [visitors, setVisitors] = useState<{ id: number; x: number; y: number; happy: boolean }[]>([])
  const [phase, setPhase] = useState<"build" | "success">("build")
  
  const startRef = useRef(Date.now())

  const stats = grid.flat().reduce((a, id) => {
    const t = TILES[id]!
    a.thrill += t.thrill; a.food += t.food; a.cost += t.cost; return a
  }, { thrill: 0, food: 0, cost: 0 })

  const happiness = Math.max(0, Math.min(100, Math.round(stats.thrill * 2 + stats.food * 3 - Math.max(0, price - 15) * 4 + Math.min(stats.food, 15))))

  const tap = (r: number, c: number) => {
    if (simulating || phase === "success") return
    setGrid((g) => g.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? (v + 1) % TILES.length : v))))
    setIterations((i) => i + 1)
  }

  const simulate = async () => {
    if (simulating || phase === "success") return
    setSimulating(true)
    setExperiments((e) => e + 1)
    
    const n = 14
    const vs = Array.from({ length: n }, (_, i) => ({ id: i, x: Math.random() * 100, y: 110, happy: Math.random() * 100 < happiness }))
    setVisitors(vs)
    
    for (let s = 0; s < 8; s++) {
      await new Promise((r) => setTimeout(r, 140))
      setVisitors((cur) => cur.map((v) => ({ ...v, y: v.y - 14, x: v.x + (Math.random() - 0.5) * 5 })))
    }
    
    setHistory((h) => [...h, happiness])
    setSimulating(false)
    setTimeout(() => setVisitors([]), 500)
    
    if (happiness >= 90) {
      setPhase("success")
    }
  }

  const finish = () => {
    saveModuleMetrics("theme-park", {
      attempts: experiments,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: 0,
      improved: history.length >= 2 && history[history.length - 1]! > history[0]!,
      experimentation: Math.min(1, iterations / 20),
      completed: true,
    })
    onComplete(100)
  }

  const progress = phase === "success" ? 100 : Math.min(85, (experiments / 5) * 85)

  return (
    <GameShell title="Theme Park Builder" subtitle="Tap tiles to cycle 🎢 🎡 🍔 🌳 · adjust price · simulate visitors" progress={progress} onClose={onClose}>
      <div className="card p-5 sm:p-6 bg-card rounded-3xl border-2 border-border shadow-sm">
        <div className="flex flex-col md:flex-row items-start justify-between gap-5">
          <MascotMessage 
            mood={phase === "success" ? "cheer" : happiness < 50 && experiments > 0 ? "thinking" : "happy"} 
            message={phase === "success" ? "This park is amazing!" : happiness < 50 && experiments > 0 ? "People aren't very happy. Check your prices or add more thrill rides." : "Build your park by tapping the grid to cycle through rides, food, and trees."} 
          />
        </div>

        <div className="mt-6 p-4 rounded-3xl border-2 border-border bg-amber-50 relative overflow-hidden max-w-sm mx-auto shadow-inner">
          <div className="grid gap-1 touch-none" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}>
            {grid.map((row, r) =>
              row.map((v, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => tap(r, c)}
                  disabled={simulating || phase === "success"}
                  className="aspect-square rounded-xl border-2 flex items-center justify-center text-3xl transition-transform active:scale-95 disabled:active:scale-100"
                  style={{ background: v === 0 ? "rgba(34, 197, 94, 0.1)" : "white", borderColor: v === 0 ? "rgba(34, 197, 94, 0.2)" : "var(--border)" }}
                >
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} key={v}>
                    {TILES[v]!.emoji}
                  </motion.div>
                </button>
              ))
            )}
          </div>
          <AnimatePresence>
            {visitors.length > 0 && (
              <div className="absolute inset-0 pointer-events-none z-10">
                {visitors.map((v) => (
                  <motion.span 
                    key={v.id} 
                    className="absolute text-2xl drop-shadow-md transition-all duration-150 ease-linear" 
                    style={{ left: `${v.x}%`, top: `${v.y}%` }}
                  >
                    {v.happy ? "😄" : "😐"}
                  </motion.span>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl border-2 border-border bg-muted/30 text-center">
            <div className="text-[10px] uppercase font-extrabold text-muted-foreground mb-1">Thrill</div>
            <div className="text-2xl font-black text-red-500">{stats.thrill}</div>
          </div>
          <div className="p-3 rounded-2xl border-2 border-border bg-muted/30 text-center">
            <div className="text-[10px] uppercase font-extrabold text-muted-foreground mb-1">Food</div>
            <div className="text-2xl font-black text-orange-500">{stats.food}</div>
          </div>
          <div className="p-3 rounded-2xl border-2 border-border bg-muted/30 text-center">
            <div className="text-[10px] uppercase font-extrabold text-muted-foreground mb-1">Cost</div>
            <div className="text-2xl font-black text-blue-500">${stats.cost}</div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-3xl border-2 border-border bg-muted/30">
          <div className="flex justify-between items-center mb-2 text-sm font-bold">
            <span className="flex items-center gap-2"><span className="text-xl">🎟️</span> Ticket price</span>
            <span className="px-3 py-1 bg-white border border-border rounded-lg text-lg text-yellow-600">${price}</span>
          </div>
          <input 
            type="range" min={5} max={40} value={price} 
            onChange={(e) => { setPrice(+e.target.value); setIterations((i) => i + 1); }} 
            disabled={simulating || phase === "success"}
            className="w-full h-2 rounded-lg appearance-none bg-slate-200 cursor-pointer accent-yellow-500 mt-2 mb-4" 
          />
          
          <div className="mt-4 pt-4 border-t-2 border-dashed border-border/50">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="uppercase tracking-wider text-muted-foreground">Visitor happiness</span>
              <span className="text-green-600 text-base">{happiness}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
              <div className="h-full transition-all duration-300" style={{ width: `${happiness}%`, background: happiness > 80 ? "#22c55e" : happiness > 50 ? "#eab308" : "#ef4444" }} />
            </div>
            
            {history.length > 0 && (
              <div className="mt-3 text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                <span className="font-bold uppercase tracking-wider">Past Runs:</span>
                {history.map((h, i) => <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-border shadow-sm">{h}%</span>)}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={simulate} disabled={simulating || phase === "success"} className="h-14 px-6 flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-amber-500 text-white font-extrabold text-lg transition-transform active:scale-95 shadow-[0_4px_0_0_#d97706] border-2 border-amber-600 disabled:opacity-50">
            {simulating ? (
              <span className="animate-pulse">Running...</span>
            ) : (
              <><Play className="h-5 w-5 fill-current" /> Simulate Visitors</>
            )}
          </button>
        </div>

        <AnimatePresence>
          {phase === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-4 rounded-2xl border-2 border-success/40 bg-success/15 px-4 py-6 font-bold text-success text-center">
              <StarBurst />
              <div className="flex items-center justify-center gap-2 text-xl mb-4"><Check className="h-6 w-6" /> Your park is a massive success!</div>
              <div><button onClick={finish} className="h-14 px-8 rounded-2xl bg-success text-success-foreground font-extrabold text-lg shadow-[0_4px_0_0_var(--color-success-shadow)] border-2 border-success-shadow active:scale-95 transition-transform">Next quest</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  )
}
