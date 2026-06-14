import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { RotateCw, Trash2, Wand2, Check, X, Sparkles } from "lucide-react"
import { GameShell, MascotMessage, StarBurst } from "./GameShell"
import { saveModuleMetrics } from "@/lib/kinesthetic-store"

/* ------------------------- Config ------------------------- */
const GRID = { rows: 6, cols: 7 }
const BUDGET = 1000, SPACE_MAX = GRID.rows * GRID.cols, POWER_MAX = 20

type Cat = "sleep" | "work" | "lounge" | "tech" | "decor"
type Item = {
  id: string
  emoji: string
  label: string
  cost: number
  power: number
  w: number; h: number
  cat: Cat
}

const CATALOG: Item[] = [
  { id: "bed",     emoji: "🛏️",  label: "Bed",         cost: 300, power: 0, w: 3, h: 2, cat: "sleep" },
  { id: "desk",    emoji: "🪑",  label: "Desk",        cost: 150, power: 1, w: 2, h: 1, cat: "work" },
  { id: "chair",   emoji: "💺",  label: "Chair",       cost: 60,  power: 0, w: 1, h: 1, cat: "work" },
  { id: "shelf",   emoji: "📚",  label: "Bookshelf",   cost: 120, power: 0, w: 2, h: 1, cat: "work" },
  { id: "sofa",    emoji: "🛋️",  label: "Sofa",        cost: 250, power: 0, w: 3, h: 1, cat: "lounge" },
  { id: "tv",      emoji: "📺",  label: "TV",          cost: 200, power: 6, w: 2, h: 1, cat: "tech" },
  { id: "console", emoji: "🎮",  label: "Console",     cost: 180, power: 4, w: 1, h: 1, cat: "tech" },
  { id: "speaker", emoji: "🔊",  label: "Speaker",     cost: 120, power: 3, w: 1, h: 1, cat: "tech" },
  { id: "lamp",    emoji: "💡",  label: "Lamp",        cost: 50,  power: 2, w: 1, h: 1, cat: "decor" },
  { id: "plant",   emoji: "🪴",  label: "Plant",       cost: 30,  power: 0, w: 1, h: 1, cat: "decor" },
  { id: "rug",     emoji: "🟪",  label: "Rug",         cost: 80,  power: 0, w: 2, h: 2, cat: "decor" },
  { id: "fridge",  emoji: "🧊",  label: "Mini Fridge", cost: 200, power: 8, w: 1, h: 2, cat: "tech" },
]

type Vibe = { id: string; label: string; emoji: string; want: Partial<Record<Cat, number>>; tip: string }
const VIBES: Vibe[] = [
  { id: "cozy",       label: "Cozy",       emoji: "🕯️", want: { sleep: 1, lounge: 1, decor: 3 }, tip: "soft & inviting" },
  { id: "productive", label: "Productive", emoji: "📈", want: { work: 3, decor: 1, sleep: 1 },   tip: "focus zone" },
  { id: "gamer",      label: "Gamer",      emoji: "🎮", want: { tech: 3, lounge: 1, sleep: 1 },  tip: "tech-heavy" },
]

type Placed = Item & { uid: string; row: number; col: number; rot: 0 | 1 }

export function TeenDreamRoom({
  onComplete,
  onClose,
  progress: baseProgress,
}: {
  onComplete: (s: number) => void
  onClose: () => void
  progress: number
}) {
  const [vibe, setVibe] = useState<Vibe>(VIBES[0]!)
  const [placed, setPlaced] = useState<Placed[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [iterations, setIterations] = useState(0)
  const [experiments, setExperiments] = useState(0)
  const [history, setHistory] = useState<number[]>([])
  const [phase, setPhase] = useState<"design" | "success">("design")
  const [vibeChanges, setVibeChanges] = useState(0)

  const startRef = useRef(Date.now())
  
  type Drag = { kind: "new"; item: Item; rot: 0 | 1; x: number; y: number } | { kind: "move"; uid: string; x: number; y: number } | null
  const [drag, setDrag] = useState<Drag>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null)

  const dims = (it: Item, rot: 0 | 1) => rot === 0 ? { w: it.w, h: it.h } : { w: it.h, h: it.w }

  const canPlace = (row: number, col: number, w: number, h: number, ignoreUid?: string) => {
    if (row < 0 || col < 0 || row + h > GRID.rows || col + w > GRID.cols) return false
    for (const p of placed) {
      if (ignoreUid && p.uid === ignoreUid) continue
      const d = dims(p, p.rot)
      if (row < p.row + d.h && row + h > p.row && col < p.col + d.w && col + w > p.col) return false
    }
    return true
  }

  const pointToCell = (clientX: number, clientY: number) => {
    const el = gridRef.current
    if (!el) return null
    const r = el.getBoundingClientRect()
    const cw = r.width / GRID.cols, ch = r.height / GRID.rows
    const col = Math.floor((clientX - r.left) / cw)
    const row = Math.floor((clientY - r.top) / ch)
    if (col < 0 || row < 0 || col >= GRID.cols || row >= GRID.rows) return null
    return { row, col }
  }

  useEffect(() => {
    if (!drag) return
    const move = (e: PointerEvent) => {
      const cell = pointToCell(e.clientX, e.clientY)
      setHover(cell)
      setDrag((d) => d ? { ...d, x: e.clientX, y: e.clientY } : d)
    }
    const up = (e: PointerEvent) => {
      const cell = pointToCell(e.clientX, e.clientY)
      if (cell && drag) {
        if (drag.kind === "new") {
          const d = dims(drag.item, drag.rot)
          const adj = { row: cell.row, col: cell.col }
          if (adj.col + d.w > GRID.cols) adj.col = GRID.cols - d.w
          if (adj.row + d.h > GRID.rows) adj.row = GRID.rows - d.h
          if (canPlace(adj.row, adj.col, d.w, d.h)) {
            setPlaced((p) => [...p, { ...drag.item, uid: `${drag.item.id}-${Date.now()}`, row: adj.row, col: adj.col, rot: drag.rot }])
            setIterations((i) => i + 1)
          }
        } else {
          const p = placed.find((x) => x.uid === drag.uid)
          if (p) {
            const d = dims(p, p.rot)
            const adj = { row: cell.row, col: cell.col }
            if (adj.col + d.w > GRID.cols) adj.col = GRID.cols - d.w
            if (adj.row + d.h > GRID.rows) adj.row = GRID.rows - d.h
            if (canPlace(adj.row, adj.col, d.w, d.h, p.uid)) {
              setPlaced((all) => all.map((x) => x.uid === p.uid ? { ...x, row: adj.row, col: adj.col } : x))
              setIterations((i) => i + 1)
            }
          }
        }
      }
      setDrag(null)
      setHover(null)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
  }, [drag, placed])

  const remove = (uid: string) => {
    setPlaced((p) => p.filter((x) => x.uid !== uid))
    setIterations((i) => i + 1)
    if (selected === uid) setSelected(null)
  }

  const rotate = (uid: string) => {
    const p = placed.find((x) => x.uid === uid)
    if (!p) return
    const next: 0 | 1 = p.rot === 0 ? 1 : 0
    const d = dims(p, next)
    if (canPlace(p.row, p.col, d.w, d.h, p.uid)) {
      setPlaced((all) => all.map((x) => x.uid === uid ? { ...x, rot: next } : x))
      setIterations((i) => i + 1)
    }
  }

  const cost = placed.reduce((s, p) => s + p.cost, 0)
  const space = placed.reduce((s, p) => { const d = dims(p, p.rot); return s + d.w * d.h; }, 0)
  const power = placed.reduce((s, p) => s + p.power, 0)
  const catCounts: Record<Cat, number> = { sleep: 0, work: 0, lounge: 0, tech: 0, decor: 0 }
  placed.forEach((p) => catCounts[p.cat]++)
  const vibeMatch = (() => {
    const want = vibe.want
    const keys = Object.keys(want) as Cat[]
    let got = 0, total = 0
    keys.forEach((k) => { total += want[k]!; got += Math.min(want[k]!, catCounts[k]); })
    return total === 0 ? 1 : got / total
  })()
  const overBudget = Math.max(0, cost - BUDGET)
  const overPower = Math.max(0, power - POWER_MAX)
  const score = Math.max(0, Math.round(
    vibeMatch * 60
    + Math.min(20, placed.length * 2)
    + 20
    - overBudget / 20
    - overPower * 3
  ))

  const test = () => {
    setExperiments((e) => e + 1)
    setHistory((h) => [...h, score])
    if (score >= 90) setPhase("success")
  }

  const finish = () => {
    saveModuleMetrics("dream-room", {
      attempts: experiments,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: 0,
      improved: history.length >= 2 && history[history.length - 1]! > history[0]!,
      experimentation: Math.min(1, iterations / 15),
      completed: true,
    })
    onComplete(100)
  }

  const progress = phase === "success" ? 100 : Math.min(85, (experiments / 5) * 85)
  const selItem = placed.find((p) => p.uid === selected)

  return (
    <GameShell title="Design Your Dream Room" subtitle="Drag furniture in. Pick a vibe. Hit your goals." progress={progress} onClose={onClose}>
      <div className="card p-5 sm:p-6 bg-card rounded-3xl border-2 border-border shadow-sm">
        <div className="flex flex-col md:flex-row items-start justify-between gap-5">
          <MascotMessage 
            mood={phase === "success" ? "cheer" : score < 50 && experiments > 0 ? "thinking" : "happy"} 
            message={phase === "success" ? "Perfect design!" : score < 50 && experiments > 0 ? "Check your budget and power usage." : "Design the perfect room based on your chosen vibe."} 
          />
          <div className="rounded-2xl border-2 border-border bg-muted px-4 py-2 text-center shrink-0">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Score</p>
            <p className={`font-extrabold text-xl ${score >= 90 ? "text-success" : "text-primary"}`}>{score}</p>
          </div>
        </div>

        {/* Vibe picker */}
        <div className="mt-6 p-4 rounded-3xl border-2 border-border bg-muted/30">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-3">Pick a vibe</div>
          <div className="grid grid-cols-3 gap-2">
            {VIBES.map((v) => {
              const active = v.id === vibe.id
              return (
                <button
                  key={v.id}
                  onClick={() => { if (v.id !== vibe.id) { setVibe(v); setVibeChanges((n) => n + 1); } }}
                  className={`rounded-2xl border-2 p-3 transition-all ${active ? "border-purple-500 bg-purple-50 text-purple-900 shadow-sm" : "border-border bg-background hover:bg-muted"}`}
                >
                  <div className="text-2xl mb-1">{v.emoji}</div>
                  <div className="text-xs font-bold leading-tight">{v.label}</div>
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(vibe.want) as Cat[]).map((c) => {
              const need = vibe.want[c]!
              const have = catCounts[c]!
              const ok = have >= need
              return (
                <span key={c} className={`px-2 py-1 rounded-xl text-[10px] font-bold border ${ok ? "bg-green-100 text-green-800 border-green-200" : "bg-muted text-muted-foreground border-border"}`}>
                  {ok ? "✓" : "•"} {c}: {have}/{need}
                </span>
              )
            })}
          </div>
        </div>

        {/* Meters */}
        <div className="mt-4 p-4 rounded-3xl border-2 border-border bg-muted/30 grid grid-cols-3 gap-4">
          <Meter label="Budget" value={cost} max={BUDGET} unit="$" color="#10b981" />
          <Meter label="Space"  value={space} max={SPACE_MAX} unit="sq" color="#3b82f6" />
          <Meter label="Power"  value={power} max={POWER_MAX} unit="kW" color="#eab308" />
        </div>

        {/* Floor plan */}
        <div className="mt-6 select-none touch-none mx-auto max-w-sm">
          <div
            ref={gridRef}
            className="relative rounded-2xl overflow-hidden shadow-inner bg-slate-50"
            style={{
              aspectRatio: `${GRID.cols} / ${GRID.rows}`,
              border: "2px solid var(--border)",
              backgroundImage: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
              backgroundSize: `${100 / GRID.cols}% ${100 / GRID.rows}%`
            }}
            onClick={() => setSelected(null)}
          >
            {/* hover preview */}
            {drag && hover && (() => {
              let rot: 0 | 1 = 0
              let d = {w: 1, h: 1}
              if (drag.kind === "move") {
                const item = placed.find((p) => p.uid === drag.uid)
                if (item) { rot = item.rot; d = dims(item, rot) }
              } else {
                rot = drag.rot
                d = dims(drag.item, rot)
              }
              let row = hover.row, col = hover.col
              if (col + d.w > GRID.cols) col = GRID.cols - d.w
              if (row + d.h > GRID.rows) row = GRID.rows - d.h
              const ok = canPlace(row, col, d.w, d.h, drag.kind === "move" ? drag.uid : undefined)
              return (
                <div className="absolute pointer-events-none rounded-lg border-2 z-10"
                  style={{
                    left: `${(col / GRID.cols) * 100}%`,
                    top: `${(row / GRID.rows) * 100}%`,
                    width: `${(d.w / GRID.cols) * 100}%`,
                    height: `${(d.h / GRID.rows) * 100}%`,
                    backgroundColor: ok ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                    borderColor: ok ? "#22c55e" : "#ef4444",
                  }} />
              )
            })()}

            {/* placed items */}
            {placed.map((p) => {
              const d = dims(p, p.rot)
              const isSel = p.uid === selected
              return (
                <div
                  key={p.uid}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    setSelected(p.uid)
                    setDrag({ kind: "move", uid: p.uid, x: e.clientX, y: e.clientY })
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-shadow z-20"
                  style={{
                    left: `${(p.col / GRID.cols) * 100}%`,
                    top: `${(p.row / GRID.rows) * 100}%`,
                    width: `${(d.w / GRID.cols) * 100}%`,
                    height: `${(d.h / GRID.rows) * 100}%`,
                    background: "rgba(167, 139, 250, 0.2)",
                    border: `2px solid ${isSel ? "#8b5cf6" : "rgba(139, 92, 246, 0.5)"}`,
                    boxShadow: isSel ? "0 4px 12px rgba(139, 92, 246, 0.3)" : "none",
                    opacity: drag?.kind === "move" && drag.uid === p.uid ? 0.4 : 1,
                    fontSize: `clamp(16px, ${Math.min(d.w, d.h) * 18}px, 28px)`,
                  }}
                >
                  <div style={{ transform: p.rot ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>
                    {p.emoji}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* selection toolbar */}
        <AnimatePresence>
          {selItem && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-4 p-3 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selItem.emoji}</span>
                <div>
                  <div className="text-xs font-bold text-purple-900">{selItem.label}</div>
                  <div className="text-[10px] text-purple-700">${selItem.cost} · {selItem.power}kW</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => rotate(selItem.uid)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-purple-200 text-purple-700 shadow-sm active:scale-95"><RotateCw className="h-4 w-4" /></button>
                <button onClick={() => remove(selItem.uid)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-red-200 text-red-600 shadow-sm active:scale-95"><Trash2 className="h-4 w-4" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Catalog */}
        <div className="mt-6">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-3">Catalog · Drag into room</div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {CATALOG.map((it) => {
              const dragging = drag?.kind === "new" && drag.item.id === it.id
              return (
                <div key={it.id}
                  onPointerDown={(e) => {
                    e.preventDefault()
                    setDrag({ kind: "new", item: it, rot: 0, x: e.clientX, y: e.clientY })
                  }}
                  className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-all ${dragging ? "opacity-40 border-purple-300 bg-purple-50" : "border-border bg-background hover:bg-muted"}`}
                >
                  <div className="text-2xl mb-1">{it.emoji}</div>
                  <div className="text-[9px] font-bold leading-none">{it.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={test} disabled={phase === "success"} className="h-14 px-6 flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-purple-600 text-white font-extrabold text-lg transition-transform active:scale-95 shadow-[0_4px_0_0_#6d28d9] border-2 border-purple-700 disabled:opacity-50">
            <Wand2 className="h-5 w-5" /> Score Design
          </button>
        </div>

        <AnimatePresence>
          {phase === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-4 rounded-2xl border-2 border-success/40 bg-success/15 px-4 py-3 font-bold text-success">
              <StarBurst />
              <div className="flex items-center gap-2"><Check className="h-5 w-5" /> Dream room complete! Score: {score}</div>
              <div className="mt-3"><button onClick={finish} className="h-14 px-6 rounded-2xl bg-success text-success-foreground font-extrabold text-lg shadow-[0_4px_0_0_var(--color-success-shadow)] border-2 border-success-shadow active:scale-95 transition-transform">Next quest</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* drag ghost */}
      {drag && (
        <div className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-1/2 text-4xl drop-shadow-xl"
          style={{ left: drag.x, top: drag.y }}>
          {drag.kind === "new" ? drag.item.emoji : placed.find((p) => p.uid === drag.uid)?.emoji}
        </div>
      )}
    </GameShell>
  )
}

function Meter({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) {
  const pct = Math.min(100, (value / max) * 100)
  const over = value > max
  return (
    <div>
      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-extrabold mb-1" style={{ color: over ? "#ef4444" : "inherit" }}>
        {value}{unit} <span className="text-xs font-normal text-muted-foreground">/ {max}{unit}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: over ? "#ef4444" : color }} />
      </div>
    </div>
  )
}
