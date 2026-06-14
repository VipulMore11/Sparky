import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { Check, Sprout, Sun, CloudRain, Cloud, RotateCcw } from "lucide-react";
import { GameShell, StarBurst } from "@/components/kinesthetic/GameShell";
import { Mascot } from "@/components/kinesthetic/Mascot";
import { saveModuleMetrics } from "@/lib/kinesthetic-store";

export const Route = createFileRoute("/elementary/garden")({
  head: () => ({
    meta: [
      { title: "Garden Creator — Elementary Quests" },
      { name: "description", content: "Tune sun, water, and shade. Grow the happiest flower." },
    ],
  }),
  component: Garden,
});

interface Recipe { water: number; sun: number; shade: number; }
const OPTIMAL: Recipe = { water: 65, sun: 70, shade: 30 };

function happiness(r: Recipe): number {
  // 0..100; penalize distance from OPTIMAL on each axis
  const d =
    Math.abs(r.water - OPTIMAL.water) +
    Math.abs(r.sun   - OPTIMAL.sun) +
    Math.abs(r.shade - OPTIMAL.shade);
  return Math.max(0, Math.round(100 - d / 1.4));
}

function Garden() {
  const navigate = useNavigate();
  const [round, setRound] = useState<1 | 2>(1);
  const [recipe, setRecipe] = useState<Recipe>({ water: 30, sun: 30, shade: 50 });
  const [grown, setGrown] = useState<number | null>(null); // happiness 0..100 or null
  const [phase, setPhase] = useState<"setup" | "growing" | "result" | "done">("setup");

  const startRef = useRef(Date.now());
  const attemptsRef = useRef(0);
  const triedSet = useRef<Set<string>>(new Set());
  const round1Attempts = useRef(0);
  const round2Attempts = useRef(0);
  const round1Best = useRef(0);
  const round2Best = useRef(0);
  const retriesRef = useRef(0);
  const firstFailedRef = useRef(false);

  function tryGrow() {
    if (phase !== "setup") return;
    attemptsRef.current += 1;
    if (round === 1) round1Attempts.current += 1;
    else round2Attempts.current += 1;
    triedSet.current.add(`${Math.round(recipe.water/10)}-${Math.round(recipe.sun/10)}-${Math.round(recipe.shade/10)}`);

    setPhase("growing");
    setTimeout(() => {
      const h = happiness(recipe);
      setGrown(h);
      if (round === 1) round1Best.current = Math.max(round1Best.current, h);
      else round2Best.current = Math.max(round2Best.current, h);
      if (h < 80) {
        if (!firstFailedRef.current) firstFailedRef.current = true;
        else retriesRef.current += 1;
      }
      setPhase("result");
    }, 1300);
  }

  function continueAfterResult() {
    if (grown != null && grown >= 80) {
      if (round === 1) {
        // Move to retention round — keep recipe controls but reset visual
        setRound(2);
        setGrown(null);
        setRecipe({ water: 30, sun: 30, shade: 50 });
        setPhase("setup");
      } else {
        finish();
      }
    } else {
      setGrown(null);
      setPhase("setup");
    }
  }

  function finish() {
    // Retention: round 2 should need ≤ round 1 attempts to reach happy
    const retention =
      round2Attempts.current > 0
        ? Math.max(0, Math.min(1, (round1Attempts.current - round2Attempts.current + 1) / Math.max(1, round1Attempts.current)))
        : 0;
    const improved = round2Best.current >= round1Best.current && round2Attempts.current <= round1Attempts.current;
    saveModuleMetrics("garden", {
      attempts: attemptsRef.current,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: retriesRef.current,
      improved,
      retentionScore: retention,
      experimentation: Math.min(1, triedSet.current.size / 8),
      completed: true,
    });
    setPhase("done");
    setTimeout(() => navigate({ to: "/elementary/puppy-maze" }), 1200);
  }

  const progress = phase === "done" ? 1 : round === 1 ? 0.1 + Math.min(0.45, attemptsRef.current * 0.1) : 0.55 + Math.min(0.4, round2Attempts.current * 0.1);

  return (
    <GameShell title="Garden Creator" subtitle={round === 1 ? "Grow flower #1" : "Round 2 — do it again!"} progress={progress}>
      <div className="card-pop p-5 sm:p-6">
        {/* Scene */}
        <Scene recipe={recipe} happiness={grown} phase={phase} />

        {/* Controls */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Slider icon={<CloudRain className="h-5 w-5" />} label="Water" color="var(--paint-blue)" value={recipe.water}
            onChange={(v) => phase === "setup" && setRecipe((r) => ({ ...r, water: v }))} />
          <Slider icon={<Sun className="h-5 w-5" />} label="Sunlight" color="var(--paint-yellow)" value={recipe.sun}
            onChange={(v) => phase === "setup" && setRecipe((r) => ({ ...r, sun: v }))} />
          <Slider icon={<Cloud className="h-5 w-5" />} label="Shade" color="var(--paint-purple)" value={recipe.shade}
            onChange={(v) => phase === "setup" && setRecipe((r) => ({ ...r, shade: v }))} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={tryGrow} disabled={phase !== "setup"} className="btn-chunky">
            <Sprout className="h-5 w-5" /> Grow!
          </button>
          <button
            onClick={() => phase === "setup" && setRecipe({ water: 30, sun: 30, shade: 50 })}
            disabled={phase !== "setup"}
            className="btn-chunky btn-chunky-ghost"
          >
            <RotateCcw className="h-5 w-5" /> Reset dials
          </button>
          <div className="ml-auto">
            <Mascot size={70}
              mood={grown != null && grown >= 80 ? "cheer" : grown != null ? "thinking" : "happy"}
              message={
                phase === "growing" ? "Growing…"
                : grown == null ? (round === 1 ? "Try a recipe!" : "Remember what worked?")
                : grown >= 80 ? "Look how happy!" : "Tweak it and try again."
              } />
          </div>
        </div>

        <AnimatePresence>
          {phase === "result" && grown != null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`relative mt-5 rounded-2xl border-2 px-4 py-3 font-bold ${
                grown >= 80 ? "border-primary/40 bg-primary/15 text-primary-shadow" : "border-secondary-shadow/40 bg-secondary/30 text-foreground"
              }`}>
              {grown >= 80 && <StarBurst />}
              <div className="flex items-center gap-3">
                <span className="kinetic-display text-2xl">{grown}</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">happiness</span>
                <span className="ml-auto inline-flex items-center gap-2">
                  {grown >= 80 ? <><Check className="h-5 w-5" /> Beautiful!</> : "Try again →"}
                </span>
              </div>
              <button onClick={continueAfterResult} className="btn-chunky mt-3">
                {grown >= 80 ? (round === 1 ? "Grow a second one" : "Finish") : "Tweak"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  );
}

function Scene({ recipe, happiness: h, phase }: { recipe: Recipe; happiness: number | null; phase: "setup" | "growing" | "result" | "done" }) {
  const growth = phase === "growing" ? 0.4 : h == null ? 0.1 : 0.4 + (h / 100) * 0.6;
  const petalCount = h == null ? 6 : Math.max(4, Math.min(10, Math.round(4 + (h / 100) * 6)));
  return (
    <div className="relative mx-auto h-72 max-w-2xl overflow-hidden rounded-3xl border-2 border-border"
      style={{ background: "linear-gradient(180deg, var(--sky) 0%, oklch(0.95 0.07 200) 60%, var(--grass) 60%, var(--grass) 100%)" }}>
      {/* Sun */}
      <motion.div animate={{ scale: 0.7 + recipe.sun / 200 }} className="absolute right-6 top-4 h-16 w-16 rounded-full"
        style={{ background: "var(--sunshine)", boxShadow: "0 0 40px 8px oklch(0.92 0.16 95 / 0.5)" }} />
      {/* Cloud (shade) */}
      <motion.div animate={{ opacity: 0.3 + recipe.shade / 150, x: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity }}
        className="absolute left-6 top-6 h-12 w-24 rounded-full bg-white shadow-md" />
      <motion.div animate={{ opacity: 0.3 + recipe.shade / 150 }}
        className="absolute left-12 top-12 h-10 w-20 rounded-full bg-white shadow-md" />
      {/* Rain */}
      <AnimatePresence>
        {recipe.water > 20 && Array.from({ length: Math.round(recipe.water / 12) }).map((_, i) => (
          <motion.span key={i} initial={{ y: -10, opacity: 0 }} animate={{ y: 180, opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
            className="absolute h-3 w-1 rounded-full bg-water"
            style={{ left: `${15 + (i * 7) % 70}%`, top: 60 }} />
        ))}
      </AnimatePresence>
      {/* Flower */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <motion.div animate={{ height: 30 + growth * 110 }} transition={{ duration: 1.0 }}
          className="mx-auto w-2 rounded-full bg-[oklch(0.5_0.18_145)]" />
        <motion.div animate={{ scale: growth + 0.3 }} transition={{ type: "spring", stiffness: 90, damping: 14 }}
          className="relative -mt-3 mx-auto h-20 w-20">
          {Array.from({ length: petalCount }).map((_, i) => {
            const a = (i / petalCount) * Math.PI * 2;
            return (
              <span key={i} className="absolute left-1/2 top-1/2 h-8 w-5 -translate-x-1/2 -translate-y-full rounded-full"
                style={{ background: h != null && h >= 80 ? "var(--paint-orange)" : "var(--paint-purple)",
                         transform: `translate(-50%, -100%) rotate(${(a * 180) / Math.PI}deg) translateY(-12px)`,
                         transformOrigin: "50% 100%" }} />
            );
          })}
          <span className="absolute inset-0 m-auto h-7 w-7 rounded-full" style={{ background: "var(--paint-yellow)", boxShadow: "inset 0 -3px 0 0 oklch(0.7 0.18 80)" }} />
          {h != null && h >= 80 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-x-0 -bottom-2 text-center text-xs">😊</motion.span>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Slider({ icon, label, value, onChange, color }: { icon: React.ReactNode; label: string; value: number; onChange: (v: number) => void; color: string }) {
  return (
    <label className="block rounded-2xl border-2 border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 kinetic-display text-sm">{icon}{label}</span>
        <span className="kinetic-display text-base" style={{ color }}>{value}</span>
      </div>
      <input
        type="range" min={0} max={100} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[color:var(--color-primary)]"
        style={{ accentColor: color }}
      />
    </label>
  );
}
