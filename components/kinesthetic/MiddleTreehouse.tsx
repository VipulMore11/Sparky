import { AnimatePresence, motion } from "framer-motion"
import { useRef, useState } from "react"
import { Hammer, Play, RotateCcw, Wind, Check, X } from "lucide-react"
import { GameShell, MascotMessage, StarBurst } from "./GameShell"
import { saveModuleMetrics } from "@/lib/kinesthetic-store"

type Slot = "supports" | "walls" | "roof"

const PALETTE: Record<Slot, { id: string; label: string; emoji: string; s: number }[]> = {
  supports: [
    { id: "twig", label: "Twigs", emoji: "🥢", s: 2 },
    { id: "plank", label: "Planks", emoji: "🪵", s: 6 },
    { id: "steel", label: "Steel", emoji: "🔩", s: 10 },
  ],
  walls: [
    { id: "paper", label: "Paper", emoji: "📄", s: 1 },
    { id: "wood", label: "Wood", emoji: "🟫", s: 6 },
    { id: "brick", label: "Brick", emoji: "🧱", s: 9 },
  ],
  roof: [
    { id: "leaf", label: "Leaves", emoji: "🍃", s: 2 },
    { id: "tin", label: "Tin Sheet", emoji: "⬜", s: 6 },
    { id: "tile", label: "Tile", emoji: "🟧", s: 8 },
  ],
}

const TARGET = 22

export function MiddleTreehouse({
  onComplete,
  onClose,
  progress: baseProgress,
}: {
  onComplete: (s: number) => void
  onClose: () => void
  progress: number
}) {
  const [build, setBuild] = useState<Partial<Record<Slot, string>>>({})
  const [dragging, setDragging] = useState<{ slot: Slot; id: string } | null>(null)
  const [tests, setTests] = useState<number[]>([])
  const [phase, setPhase] = useState<"build" | "testing" | "success" | "failed">("build")
  const [redesigns, setRedesigns] = useState(0)
  
  const startRef = useRef(Date.now())
  const retriesRef = useRef(0)
  const firstFailedRef = useRef(false)
  const uniqueConfigs = useRef<Set<string>>(new Set())

  const ready = build.supports && build.walls && build.roof
  const stability = ready
    ? PALETTE.supports.find((p) => p.id === build.supports)!.s +
      PALETTE.walls.find((p) => p.id === build.walls)!.s +
      PALETTE.roof.find((p) => p.id === build.roof)!.s
    : 0

  const best = tests.length ? Math.max(...tests) : 0

  const drop = (slot: Slot) => {
    if (!dragging || dragging.slot !== slot) return
    if (build[slot]) setRedesigns((r) => r + 1)
    setBuild((b) => ({ ...b, [slot]: dragging.id }))
    setDragging(null)
  }

  const test = () => {
    if (!ready || phase !== "build") return
    setPhase("testing")
    
    uniqueConfigs.current.add(`${build.supports}-${build.walls}-${build.roof}`)

    setTimeout(() => {
      setTests((t) => [...t, stability])
      
      if (stability >= TARGET) {
        setPhase("success")
      } else {
        setPhase("failed")
        if (!firstFailedRef.current) firstFailedRef.current = true
        else retriesRef.current += 1
        
        setTimeout(() => {
          setPhase("build")
        }, 2000)
      }
    }, 1500)
  }

  function finish() {
    saveModuleMetrics("treehouse", {
      attempts: tests.length,
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
    <GameShell title="Strongest Treehouse" subtitle="Build a house that survives the wind storm!" progress={progress} onClose={onClose}>
      <div className="card p-5 sm:p-6 bg-card rounded-3xl border-2 border-border shadow-sm">
        <div className="flex flex-col md:flex-row items-start justify-between gap-5">
          <MascotMessage 
            mood={phase === "success" ? "cheer" : phase === "failed" ? "thinking" : "happy"} 
            message={phase === "success" ? "It held up to the storm perfectly!" : phase === "failed" ? "Oh no! It blew down. Use stronger materials." : "Drag supports, walls, and a roof into place."} 
          />
          <div className="rounded-2xl border-2 border-border bg-muted px-4 py-2 text-center shrink-0">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Stability</p>
            <p className={`font-extrabold text-xl ${stability >= TARGET && phase === "success" ? "text-success" : "text-primary"}`}>{stability} <span className="text-sm font-bold text-muted-foreground">/ {TARGET}</span></p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <div 
            className="relative w-full max-w-sm h-56 rounded-3xl overflow-hidden border-2 border-border"
            style={{ background: "linear-gradient(180deg, #e0f2fe 0%, #dcfce7 100%)" }}
          >
            <motion.div 
              animate={phase === "testing" ? { x: [-4, 4, -8, 8, -4, 4, 0], rotate: [-1, 1, -2, 2, -1, 1, 0] } : {}} 
              transition={{ duration: 1.5 }}
              className="absolute inset-0 flex flex-col items-center justify-end pb-4"
            >
              <Drop slot="roof" value={build.roof} onDrop={drop} dragging={dragging} />
              <Drop slot="walls" value={build.walls} onDrop={drop} dragging={dragging} />
              <Drop slot="supports" value={build.supports} onDrop={drop} dragging={dragging} />
            </motion.div>
            
            <AnimatePresence>
              {phase === "testing" && (
                <motion.div 
                  initial={{ x: -100, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                >
                  <Wind className="h-12 w-12 text-blue-500 animate-pulse" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {(["supports", "walls", "roof"] as Slot[]).map((slot) => (
            <div key={slot}>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground mb-2">{slot}</div>
              <div className="grid grid-cols-3 gap-2">
                {PALETTE[slot].map((p) => {
                  const active = build[slot] === p.id
                  return (
                    <button
                      key={p.id}
                      draggable={phase === "build"}
                      onDragStart={() => setDragging({ slot, id: p.id })}
                      onClick={() => {
                        if (phase !== "build") return
                        if (build[slot]) setRedesigns((r) => r + 1)
                        setBuild((b) => ({ ...b, [slot]: p.id }))
                      }}
                      disabled={phase !== "build"}
                      className={`flex flex-col items-center justify-center py-2 sm:py-3 rounded-2xl border-2 transition-all cursor-grab active:cursor-grabbing disabled:opacity-80 disabled:cursor-not-allowed ${
                        active 
                          ? "border-amber-500 bg-amber-50 text-amber-900 shadow-[0_4px_0_0_#f59e0b]" 
                          : "border-border bg-background hover:bg-muted text-foreground shadow-sm"
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl mb-1">{p.emoji}</div>
                      <div className="text-[10px] sm:text-xs font-bold leading-tight">{p.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={test} disabled={!ready || phase !== "build"} className="h-14 px-6 flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-amber-500 text-white font-extrabold text-lg transition-transform active:scale-95 shadow-[0_4px_0_0_#d97706] border-2 border-amber-600 disabled:opacity-50">
            <Play className="h-5 w-5 fill-current" /> {phase === "testing" ? "Wind Blowing..." : "Wind Test"}
          </button>
          <button onClick={() => { setBuild({}); setRedesigns((r) => r + 1) }} disabled={phase !== "build"} className="h-14 px-6 flex items-center justify-center gap-2 rounded-2xl bg-transparent border-2 border-border text-foreground font-extrabold text-lg transition-transform active:scale-95 hover:bg-muted disabled:opacity-50">
            <RotateCcw className="h-5 w-5" /> Reset
          </button>
        </div>

        <AnimatePresence>
          {phase === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-4 rounded-2xl border-2 border-success/40 bg-success/15 px-4 py-3 font-bold text-success">
              <StarBurst />
              <div className="flex items-center gap-2"><Check className="h-5 w-5" /> The treehouse survived the storm!</div>
              <div className="mt-3"><button onClick={finish} className="h-14 px-6 rounded-2xl bg-success text-success-foreground font-extrabold text-lg shadow-[0_4px_0_0_var(--color-success-shadow)] border-2 border-success-shadow active:scale-95 transition-transform">Next quest</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  )
}

function Drop({ slot, value, onDrop, dragging }: { slot: Slot; value?: string; onDrop: (s: Slot) => void; dragging: { slot: Slot; id: string } | null }) {
  const item = value ? PALETTE[slot].find((p) => p.id === value) : null
  const active = dragging?.slot === slot
  const sizes: Record<Slot, string> = { roof: "w-32 h-10", walls: "w-28 h-20", supports: "w-36 h-12" }
  
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(slot)}
      className={`${sizes[slot]} rounded-xl border-2 border-dashed flex items-center justify-center text-3xl transition-all shadow-sm -mt-2 first:mt-0 ${
        active ? "border-amber-500 bg-amber-50/80 scale-105 z-10" : "border-amber-900/20 bg-white/80"
      }`}
    >
      {item ? (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>{item.emoji}</motion.span>
      ) : (
        <Hammer className="h-5 w-5 text-amber-900/30" />
      )}
    </div>
  )
}
