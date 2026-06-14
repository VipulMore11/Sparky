import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Trophy, Home, RotateCcw } from "lucide-react";
import { useMemo } from "react";
import { Mascot } from "@/components/kinesthetic/Mascot";
import { clearMetrics, getAllMetrics, kinestheticScore, type ModuleId, EARLY_MODULES, ELEMENTARY_MODULES } from "@/lib/kinesthetic-store";

export const Route = createFileRoute("/kinesthetic/results")({
  head: () => ({
    meta: [
      { title: "Your Results — Kinesthetic Play" },
      { name: "description", content: "How your child explored, retried, and improved." },
    ],
  }),
  component: Results,
});

const LABELS: Record<ModuleId, { title: string; emoji: string }> = {
  "color-lab":      { title: "Color Discovery Lab", emoji: "🎨" },
  "bridge-builder": { title: "Bridge Builder",      emoji: "🦊" },
  "water-path":     { title: "Water Path",          emoji: "💧" },
  "animal-house":   { title: "Animal House Builder", emoji: "🏠" },
  "garden":         { title: "Garden Creator",       emoji: "🌻" },
  "puppy-maze":     { title: "Lost Puppy Maze",      emoji: "🐶" },
  "playground":     { title: "Build a Playground",   emoji: "🛝" },
};

function Results() {
  const all = getAllMetrics();
  const allIds: ModuleId[] = [...EARLY_MODULES, ...ELEMENTARY_MODULES];
  const completed = allIds.map((id) => ({ id, m: all[id] })).filter((e) => e.m?.completed);

  const overall = useMemo(() => {
    if (completed.length === 0) return 0;
    return Math.round(completed.reduce((s, e) => s + kinestheticScore(e.m!), 0) / completed.length);
  }, [completed]);

  const verdict =
    overall >= 75 ? "Strong kinesthetic learner!"
    : overall >= 50 ? "Likely kinesthetic — keep watching."
    : overall > 0   ? "Mixed signals so far."
    : "Play a game to see results.";

  return (
    <div className="min-h-screen w-full">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-6">
        <Link to="/" className="btn-chunky btn-chunky-ghost !text-sm !px-4 !py-2"><Home className="h-4 w-4" /> Home</Link>
        <h1 className="kinetic-display text-xl">Your results</h1>
        <div className="w-[88px]" />
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pt-6 pb-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="card-pop relative overflow-hidden p-6 text-center">
          <div className="pointer-events-none absolute inset-0 opacity-40"
            style={{ background: "radial-gradient(circle at 50% 0%, var(--sunshine) 0, transparent 60%)" }} />
          <Trophy className="mx-auto h-12 w-12 text-secondary-shadow" />
          <p className="mt-2 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Kinesthetic evidence</p>
          <p className="kinetic-display mt-1 text-6xl text-primary-shadow">{overall}</p>
          <p className="mt-1 text-sm text-muted-foreground">out of 100 · {completed.length} game{completed.length === 1 ? "" : "s"} played</p>
          <p className="kinetic-display mt-4 text-xl">{verdict}</p>
          <div className="mt-5 flex justify-center"><Mascot mood={overall >= 50 ? "cheer" : "happy"} /></div>
        </motion.div>

        <Group title="Early Childhood · 3–5" ids={EARLY_MODULES} all={all} />
        <Group title="Elementary · 6–8"      ids={ELEMENTARY_MODULES} all={all} />

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-chunky">Play more</Link>
          <button onClick={() => { clearMetrics(); window.location.reload(); }} className="btn-chunky btn-chunky-ghost">
            <RotateCcw className="h-4 w-4" /> Reset results
          </button>
        </div>
      </main>
    </div>
  );
}

function Group({ title, ids, all }: { title: string; ids: ModuleId[]; all: ReturnType<typeof getAllMetrics> }) {
  return (
    <section className="mt-8">
      <p className="mb-2 px-1 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">{title}</p>
      <div className="grid gap-3">
        {ids.map((id, i) => {
          const m = all[id];
          const score = m ? kinestheticScore(m) : 0;
          return (
            <motion.div key={id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="card-pop p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-2xl">{LABELS[id].emoji}</div>
                  <div>
                    <h3 className="kinetic-display text-base">{LABELS[id].title}</h3>
                    <p className="text-xs text-muted-foreground">{m?.completed ? "Completed" : "Not played yet"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="kinetic-display text-2xl text-primary-shadow">{score}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">score</p>
                </div>
              </div>
              {m && (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Stat label="Attempts" value={m.attempts} />
                  <Stat label="Retries"  value={m.retriesAfterFail} />
                  <Stat label="Improved" value={m.improved ? "Yes" : "No"} />
                  <Stat label="Time"     value={`${Math.round(m.timeSpentMs / 1000)}s`} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border-2 border-border bg-muted/40 px-3 py-2 text-center">
      <p className="kinetic-display text-base text-foreground">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}
