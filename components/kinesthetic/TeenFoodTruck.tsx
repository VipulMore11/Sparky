import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { Play, TrendingUp, Clock, Check } from "lucide-react"
import { GameShell, MascotMessage, StarBurst } from "./GameShell"
import { saveModuleMetrics } from "@/lib/kinesthetic-store"

const ROUNDS = 3
const BUDGET = 30
const ROUND_MS = 35_000
const PATIENCE_MS = 9_000
const SPAWN_MS = 2_200

const INGREDIENTS = [
  { id: "bun",   emoji: "🍞", label: "Buns",    color: "#eab308" },
  { id: "patty", emoji: "🥩", label: "Patties", color: "#ef4444" },
  { id: "fries", emoji: "🍟", label: "Fries",   color: "#f59e0b" },
] as const
type IngId = (typeof INGREDIENTS)[number]["id"]

const ORDER_POOL: IngId[][] = [
  ["bun", "patty"],
  ["fries"],
  ["bun", "patty", "fries"],
  ["patty"],
  ["bun", "fries"],
  ["fries", "patty"],
  ["bun", "patty", "patty"],
]

type Customer = {
  uid: number
  want: IngId[]
  spawnAt: number
  served?: boolean
  happy?: boolean
  reason?: "served" | "wrong" | "timeout"
}

export function TeenFoodTruck({
  onComplete,
  onClose,
  progress: baseProgress,
}: {
  onComplete: (s: number) => void
  onClose: () => void
  progress: number
}) {
  const [phase, setPhase] = useState<"prep" | "rush" | "recap" | "done">("prep")
  const [round, setRound] = useState(0)
  const [alloc, setAlloc] = useState<Record<IngId, number>>({ bun: 10, patty: 10, fries: 10 })
  const [lastAlloc, setLastAlloc] = useState<Record<IngId, number> | null>(null)
  const [strategyChanges, setStrategyChanges] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [shortageHistory, setShortageHistory] = useState<Partial<Record<IngId, number>>[]>([])

  const [stock, setStock] = useState<Record<IngId, number>>({ bun: 0, patty: 0, fries: 0 })
  const [queue, setQueue] = useState<Customer[]>([])
  const [served, setServed] = useState<Customer[]>([])
  const [combo, setCombo] = useState(0)
  const [tick, setTick] = useState(0)
  const [floaters, setFloaters] = useState<{ id: number; text: string; color: string; x: number }[]>([])
  
  const startedAt = useRef(0)
  const uidRef = useRef(1)
  const flUid = useRef(1)
  const shortagesRef = useRef<Partial<Record<IngId, number>>>({})
  const [done, setDone] = useState(false)
  
  const gameStartRef = useRef(Date.now())

  const total = alloc.bun + alloc.patty + alloc.fries
  const over = total > BUDGET
  const elapsed = phase === "rush" ? Math.min(ROUND_MS, tick - startedAt.current) : 0
  const remaining = Math.max(0, ROUND_MS - elapsed)

  useEffect(() => {
    if (phase !== "rush") return
    let raf = 0
    const loop = () => { setTick(Date.now()); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  useEffect(() => {
    if (phase !== "rush") return
    const targetCount = 6 + round * 2
    let spawned = 0
    let timeoutId = 0 as unknown as number
    const spawn = () => {
      if (spawned >= targetCount) return
      spawned++
      const want = ORDER_POOL[(spawned + round) % ORDER_POOL.length]!
      setQueue((q) => [...q, { uid: uidRef.current++, want, spawnAt: Date.now() }])
      const jitter = SPAWN_MS - Math.min(900, round * 250) + (Math.random() * 600 - 300)
      timeoutId = window.setTimeout(spawn, Math.max(700, jitter))
    }
    timeoutId = window.setTimeout(spawn, 400)
    return () => clearTimeout(timeoutId)
  }, [phase, round])

  useEffect(() => {
    if (phase !== "rush") return
    const now = Date.now()
    setQueue((q) => {
      const stillWaiting: Customer[] = []
      const expired: Customer[] = []
      for (const c of q) {
        if (now - c.spawnAt > PATIENCE_MS) expired.push({ ...c, served: true, happy: false, reason: "timeout" })
        else stillWaiting.push(c)
      }
      if (expired.length) {
        setServed((s) => [...s, ...expired])
        setCombo(0)
      }
      return stillWaiting
    })
    if (remaining <= 0) endRound()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  const startRound = () => {
    if (over) return
    if (lastAlloc && (Object.keys(alloc) as IngId[]).some((k) => lastAlloc[k] !== alloc[k])) {
      setStrategyChanges((s) => s + 1)
    }
    setLastAlloc({ ...alloc })
    setStock({ ...alloc })
    setQueue([]); setServed([]); setCombo(0)
    shortagesRef.current = {}
    uidRef.current = 1
    startedAt.current = Date.now()
    setTick(Date.now())
    setPhase("rush")
  }

  const floater = (text: string, color: string) => {
    const id = flUid.current++
    const x = 20 + Math.random() * 60
    setFloaters((f) => [...f, { id, text, color, x }])
    setTimeout(() => setFloaters((f) => f.filter((it) => it.id !== id)), 900)
  }

  const serve = (c: Customer) => {
    if (c.served) return
    const need = c.want
    const canMake = need.every((k) => stock[k]! >= need.filter((w) => w === k).length)
    if (!canMake) {
      need.forEach((k) => {
        if (stock[k]! < need.filter((w) => w === k).length) {
          shortagesRef.current[k] = (shortagesRef.current[k] || 0) + 1
        }
      })
      setServed((s) => [...s, { ...c, served: true, happy: false, reason: "wrong" }])
      setQueue((q) => q.filter((x) => x.uid !== c.uid))
      setCombo(0)
      floater("Out of stock!", "#ef4444")
      return
    }
    const nextStock = { ...stock }
    need.forEach((k) => { nextStock[k]!-- })
    setStock(nextStock)
    setServed((s) => [...s, { ...c, served: true, happy: true, reason: "served" }])
    setQueue((q) => q.filter((x) => x.uid !== c.uid))
    setCombo((c) => c + 1)
    floater(`+${10 + combo * 2}`, "#22c55e")
  }

  const endRound = () => {
    if (phase !== "rush") return
    const happy = served.filter((c) => c.happy).length
    const tot = served.length || 1
    const sc = Math.round((happy / tot) * 100)
    setScores((s) => [...s, sc])
    setShortageHistory((h) => [...h, { ...shortagesRef.current }])
    setQueue([])
    setPhase("recap")
  }

  const nextRound = () => {
    if (round + 1 >= ROUNDS) { finish(); return }
    setRound((r) => r + 1)
    setPhase("prep")
  }

  const finish = () => {
    saveModuleMetrics("food-truck", {
      attempts: scores.length + 1,
      timeSpentMs: Date.now() - gameStartRef.current,
      retriesAfterFail: 0,
      improved: scores.length >= 2 && scores[scores.length - 1]! > scores[0]!,
      experimentation: Math.min(1, strategyChanges / 3),
      completed: true,
    })
    setDone(true)
    setPhase("done")
  }

  const progress = (round + (phase === "recap" || phase === "done" ? 1 : phase === "rush" ? elapsed / ROUND_MS : 0)) / ROUNDS

  return (
    <GameShell title="Food Truck Challenge" subtitle="Allocate ingredients → survive the rush. Adjust each round." progress={progress * 100} onClose={onClose}>
      <div className="card p-5 sm:p-6 bg-card rounded-3xl border-2 border-border shadow-sm">
        <div className="flex flex-col md:flex-row items-start justify-between gap-5 mb-6">
          <MascotMessage 
            mood={phase === "done" ? "cheer" : "happy"} 
            message={phase === "done" ? "Great job running the food truck!" : phase === "prep" ? "Prep your ingredients based on what you think people will order." : "The lunch rush is here! Serve them quickly."} 
          />
        </div>

        {phase === "prep" && (
          <PrepPanel round={round} alloc={alloc} setAlloc={setAlloc} total={total} over={over} scores={scores} shortages={shortageHistory[shortageHistory.length - 1]} lastAlloc={lastAlloc} onStart={startRound} />
        )}
        
        {phase === "rush" && (
          <RushPanel stock={stock} queue={queue} combo={combo} remaining={remaining} floaters={floaters} onServe={serve} onEnd={endRound} />
        )}
        
        {phase === "recap" && (
          <RecapPanel round={round} served={served} score={scores[scores.length - 1] ?? 0} shortages={shortagesRef.current} leftover={stock} onNext={nextRound} />
        )}

        {phase === "done" && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-4 rounded-2xl border-2 border-success/40 bg-success/15 px-4 py-8 font-bold text-success text-center">
              <StarBurst />
              <div className="text-4xl mb-3">🍔🍟</div>
              <div className="flex items-center justify-center gap-2 text-xl"><Check className="h-6 w-6" /> Shift over!</div>
              <div className="mt-4"><button onClick={() => onComplete(100)} className="h-14 px-8 rounded-2xl bg-success text-success-foreground font-extrabold text-lg shadow-[0_4px_0_0_var(--color-success-shadow)] border-2 border-success-shadow active:scale-95 transition-transform">Complete Mission</button></div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </GameShell>
  )
}

function PrepPanel({
  round, alloc, setAlloc, total, over, scores, shortages, lastAlloc, onStart
}: {
  round: number; alloc: Record<IngId, number>; setAlloc: React.Dispatch<React.SetStateAction<Record<IngId, number>>>
  total: number; over: boolean; scores: number[]; shortages?: Partial<Record<IngId, number>>; lastAlloc: Record<IngId, number> | null; onStart: () => void
}) {
  const tip = shortages && Object.entries(shortages).sort((a, b) => (b[1]! - a[1]!))[0]
  
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-3xl border-2 border-border bg-muted/30">
      <div className="flex items-center justify-between mb-4">
        <div className="px-3 py-1 rounded-xl bg-blue-100 text-blue-800 font-bold text-xs">
          ROUND {round + 1} OF {ROUNDS}
        </div>
        <div className={`px-3 py-1 rounded-xl font-bold text-xs ${over ? "bg-red-500 text-white" : "bg-green-100 text-green-800"}`}>
          ${total} / ${BUDGET} Budget
        </div>
      </div>

      {tip && (
        <div className="mb-4 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 p-3 text-sm flex items-center gap-2 text-orange-800">
          <TrendingUp className="size-5 text-orange-500" />
          Last round you ran out of <b className="mx-1">{INGREDIENTS.find((i) => i.id === tip[0])?.label}</b>! Try adding more.
        </div>
      )}

      <div className="space-y-5">
        {INGREDIENTS.map((it) => {
          const v = alloc[it.id]
          const diff = lastAlloc ? v - lastAlloc[it.id] : 0
          return (
            <div key={it.id} className="p-3 rounded-2xl bg-white border border-border shadow-sm">
              <div className="flex items-center justify-between font-bold mb-2">
                <span className="text-lg">{it.emoji} {it.label}</span>
                <span className="flex items-center gap-2 text-lg">
                  {diff !== 0 && (
                    <span className="text-xs font-extrabold" style={{ color: diff > 0 ? "#16a34a" : "#ef4444" }}>
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  )}
                  <span style={{ color: it.color }}>{v}</span>
                </span>
              </div>
              <input type="range" min={0} max={20} value={v}
                onChange={(e) => setAlloc((a) => ({ ...a, [it.id]: +e.target.value }))}
                className="w-full h-2 rounded-lg appearance-none bg-slate-200 cursor-pointer" style={{ accentColor: it.color }} />
            </div>
          )
        })}
      </div>

      {scores.length > 0 && (
        <div className="mt-5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2">Past rounds</div>
          <div className="flex gap-2 flex-wrap">
            {scores.map((s, i) => (
              <span key={i} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${s >= 70 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                R{i + 1}: {s}%
              </span>
            ))}
          </div>
        </div>
      )}

      <button onClick={onStart} disabled={over} className="w-full mt-6 h-14 rounded-2xl bg-blue-500 text-white font-extrabold text-lg shadow-[0_4px_0_0_#2563eb] border-2 border-blue-600 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
        <Play className="size-5 fill-current" /> Start Lunch Rush
      </button>
    </motion.div>
  )
}

function RushPanel({
  stock, queue, combo, remaining, floaters, onServe, onEnd
}: {
  stock: Record<IngId, number>; queue: Customer[]; combo: number; remaining: number;
  floaters: { id: number; text: string; color: string; x: number }[]; onServe: (c: Customer) => void; onEnd: () => void
}) {
  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-3">
        {INGREDIENTS.map((it) => {
          const v = stock[it.id]
          return (
            <div key={it.id} className={`rounded-2xl border-2 p-3 text-center transition-colors ${v <= 0 ? "border-red-500 bg-red-50" : "border-border bg-white"}`}>
              <div className="text-3xl mb-1">{it.emoji}</div>
              <div className={`text-2xl font-black ${v <= 1 ? "text-red-600" : "text-foreground"}`}>{v}</div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground">{it.label}</div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-muted/50 border-2 border-border">
        <div className="flex items-center gap-2">
          <Clock className={`size-5 ${remaining < 8000 ? "text-red-500" : "text-muted-foreground"}`} />
          <span className={`font-black text-xl tabular-nums ${remaining < 8000 ? "text-red-500" : "text-foreground"}`}>
            {(remaining / 1000).toFixed(1)}s
          </span>
        </div>
        {combo >= 3 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-3 py-1 rounded-xl bg-green-500 text-white font-bold text-sm">🔥 ×{combo} combo!</motion.span>}
      </div>

      <div className="mt-4 space-y-3 min-h-[200px] p-4 rounded-3xl bg-muted/30 border-2 border-border">
        <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-1">Queue · {queue.length} waiting</div>
        
        {queue.length === 0 && (
          <div className="text-center text-sm font-bold text-muted-foreground py-8">
            {remaining > 0 ? "Looking out the window... 👀" : "Wrapping up..."}
          </div>
        )}
        
        <AnimatePresence>
          {queue.map((c) => <CustomerCard key={c.uid} c={c} onServe={() => onServe(c)} />)}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        {floaters.map((f) => (
          <motion.div key={f.id} initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -40 }} transition={{ duration: 0.9 }} className="absolute text-xl font-black z-50 drop-shadow-md" style={{ left: `${f.x}%`, top: "40%", color: f.color }}>
            {f.text}
          </motion.div>
        ))}
      </div>

      <button onClick={onEnd} className="w-full mt-4 h-12 rounded-2xl bg-amber-500 text-white font-bold text-lg shadow-[0_4px_0_0_#d97706] border-2 border-amber-600 active:scale-95 transition-transform">
        End Shift Early
      </button>
    </div>
  )
}

function CustomerCard({ c, onServe }: { c: Customer; onServe: () => void }) {
  const [, force] = useState(0)
  useEffect(() => { const id = setInterval(() => force((x) => x + 1), 100); return () => clearInterval(id) }, [])
  const age = Date.now() - c.spawnAt
  const pct = Math.max(0, 1 - age / PATIENCE_MS)
  const mood = pct > 0.66 ? "🙂" : pct > 0.33 ? "😐" : "😠"
  
  return (
    <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} onClick={onServe} className="w-full p-3 rounded-2xl bg-white border border-border flex items-center gap-4 active:scale-[0.98] transition-transform shadow-sm">
      <div className="text-4xl">{mood}</div>
      <div className="flex-1 text-left">
        <div className="text-xl mb-2">
          {c.want.map((w, i) => <span key={i} className="mr-1">{INGREDIENTS.find((it) => it.id === w)?.emoji}</span>)}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full transition-[width] duration-100" style={{ width: `${pct * 100}%`, background: pct > 0.5 ? "#22c55e" : pct > 0.25 ? "#eab308" : "#ef4444" }} />
        </div>
      </div>
      <div className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold border border-blue-200">Serve</div>
    </motion.button>
  )
}

function RecapPanel({
  round, served, score, shortages, leftover, onNext
}: {
  round: number; served: Customer[]; score: number;
  shortages: Partial<Record<IngId, number>>; leftover: Record<IngId, number>; onNext: () => void
}) {
  const happy = served.filter((c) => c.happy).length
  const timeouts = served.filter((c) => c.reason === "timeout").length
  const wrong = served.filter((c) => c.reason === "wrong").length
  const topShort = Object.entries(shortages).sort((a, b) => (b[1]! - a[1]!))[0]
  const wasted = (Object.entries(leftover) as [IngId, number][]).filter(([, v]) => v > 3)
  
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-5 rounded-3xl border-2 border-border bg-white text-center shadow-sm">
      <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs mb-4">ROUND {round + 1} RECAP</div>
      
      <div className="flex justify-center items-baseline gap-2 mb-6">
        <span className="text-7xl font-black text-blue-600">{score}</span>
        <span className="text-lg font-bold text-muted-foreground">% happy</span>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-green-50 border border-green-200 text-center">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">Served</div>
          <div className="text-2xl font-black text-green-700">{happy}</div>
        </div>
        <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-center">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">Walked Off</div>
          <div className="text-2xl font-black text-orange-700">{timeouts}</div>
        </div>
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-center">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">Stockouts</div>
          <div className="text-2xl font-black text-red-700">{wrong}</div>
        </div>
      </div>
      
      <div className="space-y-3 text-sm text-left">
        {topShort && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
            🚨 Short on <b>{INGREDIENTS.find((i) => i.id === topShort[0])?.label}</b> ({topShort[1]} times). Add more next round.
          </div>
        )}
        {wasted.length > 0 && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-orange-800">
            🗑️ Leftover: {wasted.map(([k, v]) => `${INGREDIENTS.find((i) => i.id === k)?.emoji} ${v}`).join(" · ")}. You over-allocated.
          </div>
        )}
        {!topShort && wasted.length === 0 && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-green-800 font-bold">🎯 Solid balance! Try pushing the budget further next time.</div>
        )}
      </div>

      <button onClick={onNext} className="w-full mt-6 h-14 rounded-2xl bg-blue-500 text-white font-extrabold text-lg shadow-[0_4px_0_0_#2563eb] border-2 border-blue-600 active:scale-95 transition-transform">
        {round + 1 >= ROUNDS ? "See results" : `Next round (${round + 2}/${ROUNDS})`}
      </button>
    </motion.div>
  )
}
