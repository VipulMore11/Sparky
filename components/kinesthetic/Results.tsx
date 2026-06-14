import { motion } from "framer-motion"
import { Trophy, Home, RotateCcw } from "lucide-react"
import { useMemo } from "react"
import { MascotMessage } from "./GameShell"
import { clearMetrics, getAllMetrics, kinestheticScore, type ModuleId, EARLY_MODULES, ELEMENTARY_MODULES, MIDDLE_MODULES, TEEN_MODULES } from "@/lib/kinesthetic-store"
import { useProfile } from "@/lib/use-profile"

const LABELS: Record<ModuleId, { title: string; emoji: string }> = {
  "color-lab": { title: "Color Discovery Lab", emoji: "🎨" },
  "bridge-builder": { title: "Bridge Builder", emoji: "🦊" },
  "water-path": { title: "Water Path", emoji: "💧" },
  "animal-house": { title: "Animal House Builder", emoji: "🏠" },
  "garden": { title: "Garden Creator", emoji: "🌻" },
  "puppy-maze": { title: "Lost Puppy Maze", emoji: "🐶" },
  "playground": { title: "Build a Playground", emoji: "🛝" },
  "pet-robot": { title: "Pet Rescue Robot", emoji: "🤖" },
  "ice-cream": { title: "Save the Ice Cream", emoji: "🍦" },
  "treehouse": { title: "Strongest Treehouse", emoji: "🪵" },
  "water-park": { title: "Water Park Designer", emoji: "🏊" },
  "dream-room": { title: "Design Your Dream Room", emoji: "🛋️" },
  "escape-room": { title: "Escape Room Engineer", emoji: "🚪" },
  "food-truck": { title: "Food Truck Challenge", emoji: "🍔" },
  "theme-park": { title: "Theme Park Builder", emoji: "🎢" },
}

export function Results({ onContinue, onClose }: { onContinue: () => void; onClose: () => void }) {
  const { profile } = useProfile()
  const all = getAllMetrics()
  const allIds: ModuleId[] = 
    profile.ageGroup === "early" ? EARLY_MODULES :
    profile.ageGroup === "elementary" ? ELEMENTARY_MODULES :
    profile.ageGroup === "middle" ? MIDDLE_MODULES :
    TEEN_MODULES

  const completed = allIds.map((id) => ({ id, m: all[id] })).filter((e) => e.m?.completed)

  const overall = useMemo(() => {
    if (completed.length === 0) return 0
    return Math.round(completed.reduce((s, e) => s + kinestheticScore(e.m!), 0) / completed.length)
  }, [completed])

  const verdict =
    overall >= 75 ? "Strong kinesthetic learner!"
    : overall >= 50 ? "Likely kinesthetic — keep watching."
    : overall > 0 ? "Mixed signals so far."
    : "Play a game to see results."

  return (
    <div className="min-h-screen w-full bg-background flex flex-col font-sans">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b-2 border-border">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <button onClick={onClose} className="h-11 px-4 flex items-center justify-center gap-2 rounded-2xl bg-transparent border-2 border-border text-foreground font-extrabold text-sm transition-transform active:scale-95 hover:bg-muted">
            <Home className="h-4 w-4" /> Home
          </button>
          <h1 className="font-extrabold text-xl">Your results</h1>
          <div className="w-[88px]" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pt-6 pb-24">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card relative overflow-hidden p-6 text-center bg-card rounded-3xl border-2 border-border shadow-sm">
          <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 50% 0%, var(--sunshine) 0, transparent 60%)" }} />
          <Trophy className="mx-auto h-12 w-12 text-primary" />
          <p className="mt-2 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Kinesthetic evidence</p>
          <p className="font-extrabold mt-1 text-6xl text-primary">{overall}</p>
          <p className="mt-1 text-sm font-bold text-muted-foreground">out of 100 · {completed.length} game{completed.length === 1 ? "" : "s"} played</p>
          <p className="font-extrabold mt-4 text-xl">{verdict}</p>
          <div className="mt-5 flex justify-center"><MascotMessage mood={overall >= 50 ? "cheer" : "happy"} message="I had so much fun playing with you!" /></div>
        </motion.div>

        {profile.ageGroup === "early" && <Group title="Early Childhood · 3–5" ids={EARLY_MODULES} all={all} />}
        {profile.ageGroup === "elementary" && <Group title="Elementary · 6–8" ids={ELEMENTARY_MODULES} all={all} />}
        {profile.ageGroup === "middle" && <Group title="Middle School · 9–12" ids={MIDDLE_MODULES} all={all} />}
        {profile.ageGroup === "teen" && <Group title="Teens · 13+" ids={TEEN_MODULES} all={all} />}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={onContinue} className="h-14 px-6 flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-extrabold text-lg transition-transform active:scale-95 shadow-[0_4px_0_0_var(--color-primary-shadow)] border-2 border-primary-shadow">
            Finish Path
          </button>
          <button onClick={() => { clearMetrics(); window.location.reload() }} className="h-14 px-6 flex items-center justify-center gap-2 rounded-2xl bg-transparent border-2 border-border text-foreground font-extrabold text-lg transition-transform active:scale-95 hover:bg-muted">
            <RotateCcw className="h-5 w-5" /> Reset results
          </button>
        </div>
      </main>
    </div>
  )
}

function Group({ title, ids, all }: { title: string; ids: ModuleId[]; all: ReturnType<typeof getAllMetrics> }) {
  return (
    <section className="mt-8">
      <p className="mb-2 px-1 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">{title}</p>
      <div className="grid gap-3">
        {ids.map((id, i) => {
          const m = all[id]
          const score = m ? kinestheticScore(m) : 0
          return (
            <motion.div key={id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="card p-4 sm:p-5 bg-card rounded-3xl border-2 border-border shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-2xl border-2 border-border">{LABELS[id].emoji}</div>
                  <div>
                    <h3 className="font-extrabold text-base">{LABELS[id].title}</h3>
                    <p className="text-xs font-bold text-muted-foreground">{m?.completed ? "Completed" : "Not played yet"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-2xl text-primary">{score}</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">score</p>
                </div>
              </div>
              {m && (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Stat label="Attempts" value={m.attempts} />
                  <Stat label="Retries" value={m.retriesAfterFail} />
                  <Stat label="Improved" value={m.improved ? "Yes" : "No"} />
                  <Stat label="Time" value={`${Math.round(m.timeSpentMs / 1000)}s`} />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border-2 border-border bg-muted/40 px-3 py-2 text-center">
      <p className="font-extrabold text-base text-foreground">{value}</p>
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  )
}
