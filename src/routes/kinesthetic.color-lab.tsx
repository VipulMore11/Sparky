import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Droplet, Sparkles, RotateCcw, Check, X } from "lucide-react";
import { GameShell, StarBurst } from "@/components/kinesthetic/GameShell";
import { Mascot } from "@/components/kinesthetic/Mascot";
import { saveModuleMetrics } from "@/lib/kinesthetic-store";

export const Route = createFileRoute("/kinesthetic/color-lab")({
  head: () => ({
    meta: [
      { title: "Color Discovery Lab — Kinesthetic Play" },
      { name: "description", content: "Mix paints and discover new colors." },
    ],
  }),
  component: ColorLab,
});

type Primary = "R" | "Y" | "B";
type TargetColor = "purple" | "orange" | "green";

const PRIMARIES: { id: Primary; name: string; cssVar: string; rgb: [number, number, number] }[] = [
  { id: "R", name: "Red",    cssVar: "var(--paint-red)",    rgb: [220, 60, 60] },
  { id: "Y", name: "Yellow", cssVar: "var(--paint-yellow)", rgb: [240, 200, 60] },
  { id: "B", name: "Blue",   cssVar: "var(--paint-blue)",   rgb: [60, 110, 230] },
];

const CHALLENGES: { target: TargetColor; label: string; recipe: Primary[]; cssVar: string }[] = [
  { target: "purple", label: "Purple", recipe: ["R", "B"], cssVar: "var(--paint-purple)" },
  { target: "orange", label: "Orange", recipe: ["R", "Y"], cssVar: "var(--paint-orange)" },
  { target: "green",  label: "Green",  recipe: ["B", "Y"], cssVar: "var(--paint-green)" },
];

function blendDrops(drops: Primary[]): string {
  if (drops.length === 0) return "oklch(0.95 0.01 95)";
  const [r, g, b] = drops.reduce<[number, number, number]>(
    (acc, d) => {
      const c = PRIMARIES.find((p) => p.id === d)!.rgb;
      return [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]];
    },
    [0, 0, 0],
  );
  const n = drops.length;
  return `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`;
}

function detectColor(drops: Primary[]): TargetColor | "brown" | "single" | "empty" {
  if (drops.length === 0) return "empty";
  const set = new Set(drops);
  if (set.size === 1) return "single";
  if (set.size === 3) return "brown";
  if (set.has("R") && set.has("B")) return "purple";
  if (set.has("R") && set.has("Y")) return "orange";
  if (set.has("B") && set.has("Y")) return "green";
  return "brown";
}

function ColorLab() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"intro" | "tutorial" | "play" | "retentionWait" | "retentionAsk" | "done">("intro");
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [drops, setDrops] = useState<Primary[]>([]);
  const [feedback, setFeedback] = useState<"idle" | "right" | "wrong">("idle");
  const [tutorialStep, setTutorialStep] = useState(0); // 0 idle, 1 red dropped, 2 blue dropped, 3 mixed
  const [retentionLeft, setRetentionLeft] = useState(8);

  // metrics
  const startRef = useRef<number>(Date.now());
  const attemptsRef = useRef(0);
  const firstFailedRef = useRef(false);
  const retriesRef = useRef(0);
  const challengeAttemptsRef = useRef<number[]>([]);
  const retentionCorrectRef = useRef(false);

  useEffect(() => { startRef.current = Date.now(); }, []);

  // ---- Tutorial auto-play ----
  useEffect(() => {
    if (phase !== "tutorial") return;
    setTutorialStep(0);
    const t1 = setTimeout(() => setTutorialStep(1), 800);
    const t2 = setTimeout(() => setTutorialStep(2), 1900);
    const t3 = setTimeout(() => setTutorialStep(3), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [phase]);

  // ---- Retention timer ----
  useEffect(() => {
    if (phase !== "retentionWait") return;
    setRetentionLeft(8);
    const id = setInterval(() => {
      setRetentionLeft((v) => {
        if (v <= 1) { clearInterval(id); setPhase("retentionAsk"); setDrops([]); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const challenge = CHALLENGES[challengeIdx];
  const progress = useMemo(() => {
    if (phase === "intro" || phase === "tutorial") return 0.05;
    if (phase === "done") return 1;
    if (phase === "retentionAsk" || phase === "retentionWait") return 0.9;
    return 0.1 + (challengeIdx / CHALLENGES.length) * 0.75;
  }, [phase, challengeIdx]);

  const bowlColor = blendDrops(drops);

  function addDrop(p: Primary) {
    if (feedback !== "idle") return;
    if (drops.length >= 6) return;
    setDrops((d) => [...d, p]);
  }

  function clearBowl() {
    setDrops([]);
    setFeedback("idle");
  }

  function mix() {
    if (drops.length < 2) return;
    attemptsRef.current += 1;
    challengeAttemptsRef.current[challengeIdx] = (challengeAttemptsRef.current[challengeIdx] ?? 0) + 1;
    const result = detectColor(drops);
    if (result === challenge.target) {
      setFeedback("right");
      setTimeout(() => {
        setFeedback("idle");
        setDrops([]);
        if (challengeIdx + 1 < CHALLENGES.length) {
          setChallengeIdx((i) => i + 1);
        } else {
          setPhase("retentionWait");
        }
      }, 1400);
    } else {
      setFeedback("wrong");
      if (!firstFailedRef.current) firstFailedRef.current = true;
      retriesRef.current += 1;
      setTimeout(() => setFeedback("idle"), 900);
    }
  }

  function retentionMix() {
    attemptsRef.current += 1;
    const result = detectColor(drops);
    if (result === "purple") {
      retentionCorrectRef.current = true;
      setFeedback("right");
      setTimeout(() => finish(), 1300);
    } else {
      setFeedback("wrong");
      retriesRef.current += 1;
      setTimeout(() => { setFeedback("idle"); setDrops([]); }, 900);
    }
  }

  function finish() {
    // improvement = each challenge solved with steady-or-fewer attempts
    const xs = challengeAttemptsRef.current.filter(Boolean);
    let improved = false;
    if (xs.length >= 2) improved = xs[xs.length - 1]! <= xs[0]!;
    saveModuleMetrics("color-lab", {
      attempts: attemptsRef.current,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: retriesRef.current,
      improved,
      retentionScore: retentionCorrectRef.current ? 1 : 0,
      completed: true,
    });
    setPhase("done");
    setTimeout(() => navigate({ to: "/kinesthetic/results" }), 1400);
  }

  return (
    <GameShell title="Color Discovery Lab" subtitle="Mix to discover!" progress={progress}>
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card-pop p-6 sm:p-8">
            <Mascot mood="cheer" message="Want to see something magic? Two colors can make a NEW one!" />
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => setPhase("tutorial")} className="btn-chunky">Show me!</button>
              <button onClick={() => setPhase("play")} className="btn-chunky btn-chunky-ghost">Skip to play</button>
            </div>
          </motion.div>
        )}

        {phase === "tutorial" && (
          <motion.div key="tutorial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="card-pop relative grid gap-6 p-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <PaintBucket label="Red" color="var(--paint-red)" pulse={tutorialStep === 0} />
              <div className="flex flex-col items-center gap-3">
                <Bowl
                  color={tutorialStep === 0 ? "var(--muted)" : tutorialStep === 1 ? "var(--paint-red)" : "var(--paint-purple)"}
                  level={tutorialStep === 0 ? 0 : tutorialStep === 1 ? 0.5 : 1}
                />
                <p className="kinetic-display text-center text-lg">
                  {tutorialStep === 0 && "Drop 1: Red"}
                  {tutorialStep === 1 && "Drop 2: Blue"}
                  {tutorialStep === 2 && "Mix…"}
                  {tutorialStep >= 3 && "✨ Purple! ✨"}
                </p>
              </div>
              <PaintBucket label="Blue" color="var(--paint-blue)" pulse={tutorialStep === 1} />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Mascot mood="wow" message="Red + Blue = Purple. Your turn!" />
              <button
                onClick={() => { setPhase("play"); setDrops([]); }}
                disabled={tutorialStep < 3}
                className="btn-chunky"
              >
                I'm ready!
              </button>
            </div>
          </motion.div>
        )}

        {(phase === "play" || phase === "retentionAsk") && (
          <motion.div key="play" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Target card */}
            <div className="card-pop mb-5 flex items-center justify-between gap-4 p-4 sm:p-5">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  {phase === "retentionAsk" ? "Remember?" : `Challenge ${challengeIdx + 1} of ${CHALLENGES.length}`}
                </p>
                <p className="kinetic-display text-xl">Make <span style={{ color: "var(--paint-purple)" }}>{phase === "retentionAsk" ? "Purple" : challenge.label}</span></p>
              </div>
              <div
                className="h-14 w-14 rounded-2xl border-2 border-border shadow-[0_4px_0_0_var(--color-border)]"
                style={{ backgroundColor: phase === "retentionAsk" ? "var(--paint-purple)" : challenge.cssVar }}
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
                  className="btn-chunky"
                >
                  <Sparkles className="h-5 w-5" /> Mix!
                </button>
                <button
                  onClick={clearBowl}
                  disabled={drops.length === 0 || feedback !== "idle"}
                  className="btn-chunky btn-chunky-ghost"
                >
                  <RotateCcw className="h-5 w-5" /> Start over
                </button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Tap a paint to add a drop. Try different combos!
                </p>
              </div>
            </div>

            <AnimatePresence>
              {feedback === "wrong" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-5 flex items-center gap-2 rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 font-bold text-destructive"
                >
                  <X className="h-5 w-5" /> Hmm, not quite — keep experimenting!
                </motion.div>
              )}
              {feedback === "right" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="mt-5 flex items-center gap-2 rounded-2xl border-2 border-primary/40 bg-primary/15 px-4 py-3 font-bold text-primary-shadow"
                >
                  <Check className="h-5 w-5" /> Yes! You made it!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {phase === "retentionWait" && (
          <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card-pop p-8 text-center">
            <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-secondary text-secondary-foreground shadow-[0_6px_0_0_var(--color-secondary-shadow)]">
              <span className="kinetic-display text-4xl">{retentionLeft}</span>
            </div>
            <h2 className="kinetic-display text-2xl">Playground break!</h2>
            <p className="mt-2 text-muted-foreground">Take a quick wiggle. Then we have one more thing…</p>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card-pop relative p-10 text-center">
            <StarBurst />
            <h2 className="kinetic-display text-3xl">All done!</h2>
            <p className="mt-2 text-muted-foreground">Taking you to results…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}

/* ----------------- Subcomponents ----------------- */

function PaintBucket({
  label, color, onTap, pulse = false,
}: { label: string; color: string; onTap?: () => void; pulse?: boolean }) {
  return (
    <motion.button
      whileTap={onTap ? { scale: 0.92 } : undefined}
      onClick={onTap}
      disabled={!onTap}
      className={`group relative flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-border bg-card p-3 shadow-[0_6px_0_0_var(--color-border)] transition active:translate-y-1 active:shadow-[0_2px_0_0_var(--color-border)] ${onTap ? "" : "opacity-80"}`}
    >
      <div
        className={`relative h-20 w-20 overflow-hidden rounded-b-[2rem] rounded-t-md border-2 border-foreground/10 ${pulse ? "wobble" : ""}`}
        style={{ backgroundColor: color, boxShadow: "inset 0 -10px 0 0 rgba(0,0,0,0.18), inset 0 4px 0 0 rgba(255,255,255,0.25)" }}
      >
        <div className="absolute inset-x-2 top-1 h-2 rounded-full bg-white/40" />
      </div>
      <span className="kinetic-display text-sm">{label}</span>
      {onTap && (
        <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-accent text-xs font-extrabold text-accent-foreground shadow-[0_2px_0_0_var(--color-accent-shadow)]">
          +
        </span>
      )}
    </motion.button>
  );
}

function Bowl({
  color, level, shake = false, glow = false,
}: { color: string; level: number; shake?: boolean; glow?: boolean }) {
  return (
    <motion.div
      animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
      className="relative h-44 w-52"
    >
      <div
        className={`absolute inset-0 overflow-hidden rounded-b-[6rem] rounded-t-2xl border-[3px] border-foreground/15 bg-white shadow-[inset_0_-14px_0_0_rgba(0,0,0,0.12)] ${glow ? "ring-8 ring-primary/30" : ""}`}
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
      {/* rim */}
      <div className="absolute -top-2 left-1/2 h-5 w-[110%] -translate-x-1/2 rounded-full border-[3px] border-foreground/15 bg-white shadow-[0_3px_0_0_rgba(0,0,0,0.08)]" />
      <Droplet className="absolute -top-10 left-1/2 -translate-x-1/2 text-primary float" />
    </motion.div>
  );
}
