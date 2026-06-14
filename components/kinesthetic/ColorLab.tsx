import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"
import { Droplet, Sparkles, RotateCcw, Check, X } from "lucide-react"
import { GameShell, StarBurst, MascotMessage } from "./GameShell"
import { saveModuleMetrics } from "@/lib/kinesthetic-store"

type Primary = "R" | "Y" | "B"
type TargetColor = "purple" | "orange" | "green"

const PRIMARIES: { id: Primary; name: string; cssVar: string; rgb: [number, number, number] }[] = [
  { id: "R", name: "Red",    cssVar: "#ef4444", rgb: [239, 68, 68] },
  { id: "Y", name: "Yellow", cssVar: "#eab308", rgb: [234, 179, 8] },
  { id: "B", name: "Blue",   cssVar: "#3b82f6", rgb: [59, 130, 246] },
]

const CHALLENGES: { target: TargetColor; label: string; recipe: Primary[]; cssVar: string }[] = [
  { target: "purple", label: "Purple", recipe: ["R", "B"], cssVar: "#a855f7" },
  { target: "orange", label: "Orange", recipe: ["R", "Y"], cssVar: "#f97316" },
  { target: "green",  label: "Green",  recipe: ["B", "Y"], cssVar: "#22c55e" },
]

function blendDrops(drops: Primary[]): string {
  if (drops.length === 0) return "transparent"
  const [r, g, b] = drops.reduce<[number, number, number]>(
    (acc, d) => {
      const c = PRIMARIES.find((p) => p.id === d)!.rgb
      return [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]]
    },
    [0, 0, 0],
  )
  const n = drops.length
  return `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`
}

function detectColor(drops: Primary[]): TargetColor | "brown" | "single" | "empty" {
  if (drops.length === 0) return "empty"
  const set = new Set(drops)
  if (set.size === 1) return "single"
  if (set.size === 3) return "brown"
  if (set.has("R") && set.has("B")) return "purple"
  if (set.has("R") && set.has("Y")) return "orange"
  if (set.has("B") && set.has("Y")) return "green"
  return "brown"
}

export function ColorLab({ onComplete, onClose, progress: baseProgress }: { onComplete: (s: number) => void; onClose: () => void; progress: number }) {
  const [phase, setPhase] = useState<"intro" | "tutorial" | "play" | "retentionWait" | "retentionAsk" | "done">("intro")
  const [challengeIdx, setChallengeIdx] = useState(0)
  const [drops, setDrops] = useState<Primary[]>([])
  const [feedback, setFeedback] = useState<"idle" | "right" | "wrong">("idle")
  const [tutorialStep, setTutorialStep] = useState(0)
  const [retentionLeft, setRetentionLeft] = useState(8)

  const startRef = useRef<number>(Date.now())
  const attemptsRef = useRef(0)
  const firstFailedRef = useRef(false)
  const retriesRef = useRef(0)
  const challengeAttemptsRef = useRef<number[]>([])
  const retentionCorrectRef = useRef(false)

  useEffect(() => { startRef.current = Date.now() }, [])

  useEffect(() => {
    if (phase !== "tutorial") return
    setTutorialStep(0)
    const t1 = setTimeout(() => setTutorialStep(1), 800)
    const t2 = setTimeout(() => setTutorialStep(2), 1900)
    const t3 = setTimeout(() => setTutorialStep(3), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [phase])

  useEffect(() => {
    if (phase !== "retentionWait") return
    setRetentionLeft(8)
    const id = setInterval(() => {
      setRetentionLeft((v) => {
        if (v <= 1) { clearInterval(id); setPhase("retentionAsk"); setDrops([]); return 0 }
        return v - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  const challenge = CHALLENGES[challengeIdx]
  const progress = useMemo(() => {
    if (phase === "intro" || phase === "tutorial") return 5
    if (phase === "done") return 100
    if (phase === "retentionAsk" || phase === "retentionWait") return 90
    return 10 + (challengeIdx / CHALLENGES.length) * 75
  }, [phase, challengeIdx])

  const bowlColor = blendDrops(drops)

  function addDrop(p: Primary) {
    if (feedback !== "idle") return
    if (drops.length >= 6) return
    setDrops((d) => [...d, p])
  }

  function clearBowl() {
    setDrops([])
    setFeedback("idle")
  }

  function mix() {
    if (drops.length < 2) return
    attemptsRef.current += 1
    challengeAttemptsRef.current[challengeIdx] = (challengeAttemptsRef.current[challengeIdx] ?? 0) + 1
    const result = detectColor(drops)
    if (result === challenge.target) {
      setFeedback("right")
      setTimeout(() => {
        setFeedback("idle")
        setDrops([])
        if (challengeIdx + 1 < CHALLENGES.length) {
          setChallengeIdx((i) => i + 1)
        } else {
          setPhase("retentionWait")
        }
      }, 1400)
    } else {
      setFeedback("wrong")
      if (!firstFailedRef.current) firstFailedRef.current = true
      retriesRef.current += 1
      setTimeout(() => setFeedback("idle"), 900)
    }
  }

  function retentionMix() {
    attemptsRef.current += 1
    const result = detectColor(drops)
    if (result === "purple") {
      retentionCorrectRef.current = true
      setFeedback("right")
      setTimeout(() => finish(), 1300)
    } else {
      setFeedback("wrong")
      retriesRef.current += 1
      setTimeout(() => { setFeedback("idle"); setDrops([]) }, 900)
    }
  }

  function finish() {
    const xs = challengeAttemptsRef.current.filter(Boolean)
    let improved = false
    if (xs.length >= 2) improved = xs[xs.length - 1]! <= xs[0]!
    saveModuleMetrics("color-lab", {
      attempts: attemptsRef.current,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: retriesRef.current,
      improved,
      retentionScore: retentionCorrectRef.current ? 1 : 0,
      completed: true,
    })
    setPhase("done")
    setTimeout(() => onComplete(100), 1400)
  }

  return (
    <GameShell title="Color Discovery Lab" subtitle="Mix to discover!" progress={progress} onClose={onClose}>
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-6 sm:p-8 bg-card rounded-3xl border-2 border-border shadow-sm">
            <MascotMessage mood="cheer" message="Want to see something magic? Two colors can make a NEW one!" />
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => setPhase("tutorial")} className="h-14 px-6 rounded-2xl bg-primary text-primary-foreground font-extrabold text-lg transition-transform active:scale-95 shadow-[0_4px_0_0_var(--color-primary-shadow)] border-2 border-primary-shadow hover:brightness-110">Show me!</button>
              <button onClick={() => setPhase("play")} className="h-14 px-6 rounded-2xl bg-transparent border-2 border-border text-foreground font-extrabold text-lg transition-transform active:scale-95 hover:bg-muted">Skip to play</button>
            </div>
          </motion.div>
        )}

        {phase === "tutorial" && (
          <motion.div key="tutorial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="card relative grid gap-6 p-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center bg-card rounded-3xl border-2 border-border shadow-sm">
              <PaintBucket label="Red" color="#ef4444" pulse={tutorialStep === 0} />
              <div className="flex flex-col items-center gap-3">
                <Bowl
                  color={tutorialStep === 0 ? "transparent" : tutorialStep === 1 ? "#ef4444" : "#a855f7"}
                  level={tutorialStep === 0 ? 0 : tutorialStep === 1 ? 0.5 : 1}
                />
                <p className="font-extrabold text-center text-lg text-foreground">
                  {tutorialStep === 0 && "Drop 1: Red"}
                  {tutorialStep === 1 && "Drop 2: Blue"}
                  {tutorialStep === 2 && "Mix…"}
                  {tutorialStep >= 3 && "✨ Purple! ✨"}
                </p>
              </div>
              <PaintBucket label="Blue" color="#3b82f6" pulse={tutorialStep === 1} />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <MascotMessage mood="wow" message="Red + Blue = Purple. Your turn!" />
              <button
                onClick={() => { setPhase("play"); setDrops([]) }}
                disabled={tutorialStep < 3}
                className="h-14 px-6 rounded-2xl bg-primary text-primary-foreground font-extrabold text-lg transition-transform active:scale-95 shadow-[0_4px_0_0_var(--color-primary-shadow)] border-2 border-primary-shadow disabled:opacity-50"
              >
                I'm ready!
              </button>
            </div>
          </motion.div>
        )}

        {(phase === "play" || phase === "retentionAsk") && (
          <motion.div key="play" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="card mb-5 flex items-center justify-between gap-4 p-4 sm:p-5 bg-card rounded-3xl border-2 border-border shadow-sm">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  {phase === "retentionAsk" ? "Remember?" : `Challenge ${challengeIdx + 1} of ${CHALLENGES.length}`}
                </p>
                <p className="font-extrabold text-xl">Make <span style={{ color: phase === "retentionAsk" ? "#a855f7" : challenge.cssVar }}>{phase === "retentionAsk" ? "Purple" : challenge.label}</span></p>
              </div>
              <div
                className="h-14 w-14 rounded-2xl border-2 border-border shadow-sm"
                style={{ backgroundColor: phase === "retentionAsk" ? "#a855f7" : challenge.cssVar }}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-1">
                {PRIMARIES.map((p) => (
                  <PaintBucket
                    key={p.id}
                    label={p.name}
                    color={p.cssVar}
                    onTap={() => addDrop(p.id)}
                  />
                ))}
              </div>

              <div className="relative flex flex-col items-center gap-3">
                <Bowl color={bowlColor} level={Math.min(1, drops.length / 4)} shake={feedback === "wrong"} glow={feedback === "right"} />
                <div className="flex gap-2 min-h-7">
                  {drops.map((d, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-4 w-4 rounded-full border border-border"
                      style={{ backgroundColor: PRIMARIES.find((p) => p.id === d)!.cssVar }}
                    />
                  ))}
                </div>
                {feedback === "right" && <StarBurst />}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={phase === "retentionAsk" ? retentionMix : mix}
                  disabled={drops.length < 2 || feedback !== "idle"}
                  className="h-14 px-6 flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-extrabold text-lg transition-transform active:scale-95 shadow-[0_4px_0_0_var(--color-primary-shadow)] border-2 border-primary-shadow disabled:opacity-50"
                >
                  <Sparkles className="h-5 w-5" /> Mix!
                </button>
                <button
                  onClick={clearBowl}
                  disabled={drops.length === 0 || feedback !== "idle"}
                  className="h-14 px-6 flex items-center justify-center gap-2 rounded-2xl bg-transparent border-2 border-border text-foreground font-extrabold text-lg transition-transform active:scale-95 hover:bg-muted disabled:opacity-50"
                >
                  <RotateCcw className="h-5 w-5" /> Start over
                </button>
                <p className="mt-2 text-center text-xs text-muted-foreground font-bold">
                  Tap a paint to add a drop. Try different combos!
                </p>
              </div>
            </div>

            <AnimatePresence>
              {feedback === "wrong" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-5 flex items-center justify-center gap-2 rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 font-bold text-destructive"
                >
                  <X className="h-5 w-5" /> Hmm, not quite — keep experimenting!
                </motion.div>
              )}
              {feedback === "right" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="mt-5 flex items-center justify-center gap-2 rounded-2xl border-2 border-success/40 bg-success/15 px-4 py-3 font-bold text-success"
                >
                  <Check className="h-5 w-5" /> Yes! You made it!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {phase === "retentionWait" && (
          <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card p-8 text-center bg-card rounded-3xl border-2 border-border shadow-sm">
            <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-accent text-accent-foreground border-2 border-accent-shadow">
              <span className="font-extrabold text-4xl">{retentionLeft}</span>
            </div>
            <h2 className="font-extrabold text-2xl">Playground break!</h2>
            <p className="mt-2 text-muted-foreground font-bold">Take a quick wiggle. Then we have one more thing…</p>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card relative p-10 text-center bg-card rounded-3xl border-2 border-border shadow-sm">
            <StarBurst />
            <h2 className="font-extrabold text-3xl text-success">All done!</h2>
            <p className="mt-2 text-muted-foreground font-bold">Taking you to results…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  )
}

function PaintBucket({ label, color, onTap, pulse = false }: { label: string; color: string; onTap?: () => void; pulse?: boolean }) {
  return (
    <motion.button
      whileTap={onTap ? { scale: 0.92 } : undefined}
      onClick={onTap}
      disabled={!onTap}
      className={`group relative flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-border bg-card p-3 shadow-sm transition active:translate-y-1 ${onTap ? "" : "opacity-80"} ${pulse ? "animate-pulse" : ""}`}
    >
      <div
        className="relative h-20 w-20 overflow-hidden rounded-b-[2rem] rounded-t-md border-2 border-border shadow-inner"
        style={{ backgroundColor: color }}
      >
        <div className="absolute inset-x-2 top-1 h-2 rounded-full bg-white/40" />
      </div>
      <span className="font-extrabold text-sm">{label}</span>
      {onTap && (
        <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground border-2 border-primary-shadow">
          +
        </span>
      )}
    </motion.button>
  )
}

function Bowl({ color, level, shake = false, glow = false }: { color: string; level: number; shake?: boolean; glow?: boolean }) {
  return (
    <motion.div
      animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
      className="relative h-44 w-52"
    >
      <div
        className={`absolute inset-0 overflow-hidden rounded-b-[6rem] rounded-t-2xl border-[3px] border-border bg-card shadow-inner ${glow ? "ring-8 ring-success/30" : ""}`}
      >
        <motion.div
          initial={false}
          animate={{ height: `${Math.max(0.1, level) * 100}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          className="absolute inset-x-0 bottom-0"
          style={{ backgroundColor: color }}
        >
          <div className="absolute inset-x-0 top-0 h-2 bg-white/30" />
        </motion.div>
      </div>
      <div className="absolute -top-2 left-1/2 h-5 w-[110%] -translate-x-1/2 rounded-full border-[3px] border-border bg-card shadow-sm" />
      <Droplet className="absolute -top-10 left-1/2 -translate-x-1/2 text-primary animate-bounce" />
    </motion.div>
  )
}
