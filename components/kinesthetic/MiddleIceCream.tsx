import { AnimatePresence, motion } from "framer-motion"
import { useMemo, useRef, useState } from "react"
import { Play, Check, X, Snowflake, FlaskConical } from "lucide-react"
import { GameShell, MascotMessage, StarBurst } from "./GameShell"
import { saveModuleMetrics } from "@/lib/kinesthetic-store"

const BOXES = [
  { id: "card", label: "Cardboard", emoji: "📦", r: 8 },
  { id: "foam", label: "Foam Box", emoji: "🧊", r: 22 },
  { id: "metal", label: "Metal Tin", emoji: "🥫", r: 4 },
]
const COVERS = [
  { id: "cloth", label: "Cloth", emoji: "🧣", r: 5 },
  { id: "foil", label: "Foil Wrap", emoji: "✨", r: 14 },
  { id: "wool", label: "Wool Blanket", emoji: "🧶", r: 18 },
]
const PACKS = [
  { id: "1", label: "1 Pack", emoji: "❄️", r: 6 },
  { id: "3", label: "3 Packs", emoji: "❄️❄️❄️", r: 16 },
  { id: "gel", label: "Gel Bricks", emoji: "🟦", r: 22 },
]

const TARGET = 50 // minutes

export function MiddleIceCream({
  onComplete,
  onClose,
  progress: baseProgress,
}: {
  onComplete: (s: number) => void
  onClose: () => void
  progress: number
}) {
  const [box, setBox] = useState<string | null>(null)
  const [cover, setCover] = useState<string | null>(null)
  const [pack, setPack] = useState<string | null>(null)
  const [tests, setTests] = useState<number[]>([])
  const [phase, setPhase] = useState<"build" | "testing" | "success" | "failed">("build")
  const [showResult, setShowResult] = useState<number | null>(null)

  const startRef = useRef(Date.now())
  const attemptsRef = useRef(0)
  const retriesRef = useRef(0)
  const firstFailedRef = useRef(false)
  const uniqueConfigs = useRef<Set<string>>(new Set())

  const ready = box && cover && pack
  
  const minutes = useMemo(() => {
    if (!ready) return 0
    const b = BOXES.find((x) => x.id === box)!.r
    const c = COVERS.find((x) => x.id === cover)!.r
    const p = PACKS.find((x) => x.id === pack)!.r
    return b + c + p + Math.floor(Math.random() * 4) // Slight randomness like the original
  }, [box, cover, pack, tests.length])

  const best = tests.length ? Math.max(...tests) : 0
  
  const runTest = () => {
    if (!ready || phase !== "build") return
    setPhase("testing")
    setShowResult(null)
    
    attemptsRef.current += 1
    uniqueConfigs.current.add(`${box}-${cover}-${pack}`)

    setTimeout(() => {
      setTests((t) => [...t, minutes])
      setShowResult(minutes)
      
      if (minutes >= TARGET) {
        setPhase("success")
      } else {
        setPhase("failed")
        if (!firstFailedRef.current) firstFailedRef.current = true
        else retriesRef.current += 1
        
        setTimeout(() => {
          setPhase("build")
        }, 2000)
      }
    }, 1400)
  }

  function finish() {
    saveModuleMetrics("ice-cream", {
      attempts: attemptsRef.current,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: retriesRef.current,
      improved: tests.length >= 2 && tests[tests.length - 1]! > tests[0]!,
      experimentation: Math.min(1, uniqueConfigs.current.size / 4),
      completed: true,
    })
    onComplete(100)
  }

  const progress = phase === "success" ? 100 : Math.min(85, (best / TARGET) * 70 + tests.length * 5)

  return (
    <GameShell title="Save the Ice Cream" subtitle="Find the best insulators to keep it frozen!" progress={progress} onClose={onClose}>
      <div className="card p-5 sm:p-6 bg-card rounded-3xl border-2 border-border shadow-sm">
        <div className="flex flex-col md:flex-row items-start justify-between gap-5">
          <MascotMessage 
            mood={phase === "success" ? "cheer" : phase === "failed" ? "thinking" : "happy"} 
            message={phase === "success" ? "Wow! It stayed frozen for so long!" : phase === "failed" ? "It melted too fast! Try better insulators." : "Mix and match materials to reach 50 minutes!"} 
          />
          <div className="rounded-2xl border-2 border-border bg-muted px-4 py-2 text-center shrink-0">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Best Time</p>
            <p className={`font-extrabold text-xl ${best >= TARGET ? "text-success" : "text-primary"}`}>{best} <span className="text-sm font-bold text-muted-foreground">/ {TARGET}</span></p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center p-4 rounded-3xl border-2 border-border bg-blue-50/50">
          <motion.div 
            animate={phase === "testing" ? { rotate: [-5, 5, -5, 5, 0], scale: [1, 1.1, 1] } : {}} 
            transition={{ duration: 0.5, repeat: phase === "testing" ? Infinity : 0 }}
            className="text-6xl drop-shadow-md mb-2"
          >
            🍦
          </motion.div>
          
          <div className="w-full max-w-sm h-3 bg-muted rounded-full mt-2 overflow-hidden border border-border">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${Math.min(100, (best / TARGET) * 100)}%` }} />
          </div>
          
          <AnimatePresence mode="wait">
            {showResult !== null && phase === "failed" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-sm font-extrabold text-amber-600 flex items-center">
                <Snowflake className="inline size-4 mr-1" /> Melted after {showResult} minutes
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 space-y-4">
          <Picker label="1. Pick a box" items={BOXES} value={box} onChange={setBox} disabled={phase !== "build"} />
          <Picker label="2. Pick a cover" items={COVERS} value={cover} onChange={setCover} disabled={phase !== "build"} />
          <Picker label="3. Pick ice packs" items={PACKS} value={pack} onChange={setPack} disabled={phase !== "build"} />
        </div>

        {tests.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-2">Experiment History</p>
            <div className="flex flex-wrap gap-2">
              {tests.map((t, i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-muted border border-border text-xs font-bold text-muted-foreground flex items-center">
                  <FlaskConical className="size-3 mr-1.5 opacity-70" /> #{i + 1}: {t}m
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={runTest} disabled={!ready || phase !== "build"} className="h-14 px-6 flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-blue-500 text-white font-extrabold text-lg transition-transform active:scale-95 shadow-[0_4px_0_0_#1e3a8a] border-2 border-blue-700 disabled:opacity-50">
            <Play className="h-5 w-5 fill-current" /> {phase === "testing" ? "Testing..." : `Run Experiment #${tests.length + 1}`}
          </button>
        </div>

        <AnimatePresence>
          {phase === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-4 rounded-2xl border-2 border-success/40 bg-success/15 px-4 py-3 font-bold text-success">
              <StarBurst />
              <div className="flex items-center gap-2"><Check className="h-5 w-5" /> Kept frozen for {showResult} minutes! Target reached!</div>
              <div className="mt-3"><button onClick={finish} className="h-14 px-6 rounded-2xl bg-success text-success-foreground font-extrabold text-lg shadow-[0_4px_0_0_var(--color-success-shadow)] border-2 border-success-shadow active:scale-95 transition-transform">Next quest</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  )
}

function Picker<T extends { id: string; label: string; emoji: string }>({ 
  label, 
  items, 
  value, 
  onChange,
  disabled
}: { 
  label: string; 
  items: T[]; 
  value: string | null; 
  onChange: (v: string) => void;
  disabled: boolean
}) {
  return (
    <div>
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground mb-2">{label}</div>
      <div className="grid grid-cols-3 gap-2">
        {items.map((it) => {
          const active = value === it.id
          return (
            <button
              key={it.id}
              onClick={() => onChange(it.id)}
              disabled={disabled}
              className={`flex flex-col items-center justify-center py-2 sm:py-3 rounded-2xl border-2 transition-all disabled:opacity-80 active:scale-95 ${
                active 
                  ? "border-blue-500 bg-blue-50 text-blue-800 shadow-[0_4px_0_0_#3b82f6]" 
                  : "border-border bg-background hover:bg-muted text-foreground shadow-sm"
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-1">{it.emoji}</div>
              <div className="text-[10px] sm:text-xs font-bold leading-tight">{it.label}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
