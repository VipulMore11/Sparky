import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Play, RotateCcw, X } from "lucide-react";
import { GameShell, StarBurst } from "@/components/kinesthetic/GameShell";
import { Mascot } from "@/components/kinesthetic/Mascot";
import { saveModuleMetrics } from "@/lib/kinesthetic-store";

export const Route = createFileRoute("/kinesthetic/bridge-builder")({
  head: () => ({
    meta: [
      { title: "Bridge Builder — Kinesthetic Play" },
      { name: "description", content: "Drag blocks to help the fox cross the river." },
    ],
  }),
  component: BridgeBuilder,
});

const SLOTS = 5;        // gap is 5 units wide
const SHORT_COUNT = 4;  // 4 short (1-wide) blocks
const LONG_COUNT  = 2;  // 2 long (2-wide) blocks

type BlockKind = "short" | "long";
interface Block { id: string; kind: BlockKind; placedAt: number | null; } // index of left edge

function makeInitialBlocks(): Block[] {
  const arr: Block[] = [];
  for (let i = 0; i < SHORT_COUNT; i++) arr.push({ id: `s${i}`, kind: "short", placedAt: null });
  for (let i = 0; i < LONG_COUNT;  i++) arr.push({ id: `l${i}`, kind: "long",  placedAt: null });
  return arr;
}

function BridgeBuilder() {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<Block[]>(makeInitialBlocks);
  const [phase, setPhase] = useState<"build" | "testing" | "success" | "failed">("build");
  const [attempt, setAttempt] = useState(0);
  const [coverageHistory, setCoverageHistory] = useState<number[]>([]);
  const [walkStep, setWalkStep] = useState(0);

  const startRef = useRef<number>(Date.now());
  const attemptsRef = useRef(0);
  const firstFailedRef = useRef(false);
  const retriesRef = useRef(0);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const coveredSet = useMemo(() => {
    const s = new Set<number>();
    for (const b of blocks) {
      if (b.placedAt === null) continue;
      s.add(b.placedAt);
      if (b.kind === "long") s.add(b.placedAt + 1);
    }
    return s;
  }, [blocks]);

  const allCovered = coveredSet.size === SLOTS;

  const progress = phase === "success" ? 1 : Math.min(0.9, 0.1 + (attempt * 0.18) + (coveredSet.size / SLOTS) * 0.4);

  // ---- Drop logic ----
  function tryPlace(block: Block, clientX: number, clientY: number) {
    // find slot under pointer
    let targetSlot = -1;
    for (let i = 0; i < SLOTS; i++) {
      const el = slotRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top - 30 && clientY <= r.bottom + 60) {
        targetSlot = i;
        break;
      }
    }
    if (targetSlot < 0) return false;

    // For long blocks, snap so it covers targetSlot and targetSlot+1 if possible
    let placeAt = targetSlot;
    if (block.kind === "long") {
      if (targetSlot >= SLOTS - 1) placeAt = SLOTS - 2;
    }

    // Check overlap with other placed blocks
    const otherCovered = new Set<number>();
    for (const b of blocks) {
      if (b.id === block.id || b.placedAt === null) continue;
      otherCovered.add(b.placedAt);
      if (b.kind === "long") otherCovered.add(b.placedAt + 1);
    }
    if (otherCovered.has(placeAt)) return false;
    if (block.kind === "long" && otherCovered.has(placeAt + 1)) return false;

    setBlocks((bs) => bs.map((b) => (b.id === block.id ? { ...b, placedAt: placeAt } : b)));
    return true;
  }

  function returnBlock(id: string) {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, placedAt: null } : b)));
  }

  // ---- Testing ----
  function startTest() {
    if (phase !== "build") return;
    attemptsRef.current += 1;
    setAttempt((a) => a + 1);
    setCoverageHistory((h) => [...h, coveredSet.size]);
    setPhase("testing");
    setWalkStep(0);
  }

  useEffect(() => {
    if (phase !== "testing") return;
    if (walkStep > SLOTS) {
      setPhase("success");
      return;
    }
    const id = setTimeout(() => {
      // After last step, success
      if (walkStep === SLOTS) {
        setWalkStep((s) => s + 1);
        return;
      }
      // Check if current slot is covered
      if (!coveredSet.has(walkStep)) {
        if (!firstFailedRef.current) firstFailedRef.current = true;
        else retriesRef.current += 1;
        setPhase("failed");
        return;
      }
      setWalkStep((s) => s + 1);
    }, 500);
    return () => clearTimeout(id);
  }, [phase, walkStep, coveredSet]);

  function resetForRetry() {
    setBlocks((bs) => bs.map((b) => ({ ...b, placedAt: null })));
    setWalkStep(0);
    setPhase("build");
  }

  function finishAndContinue() {
    const improved = coverageHistory.length >= 2 && coverageHistory[coverageHistory.length - 1]! > coverageHistory[0]!;
    saveModuleMetrics("bridge-builder", {
      attempts: attemptsRef.current,
      timeSpentMs: Date.now() - startRef.current,
      retriesAfterFail: retriesRef.current,
      improved: improved || phase === "success",
      completed: true,
    });
    navigate({ to: "/kinesthetic/water-path" });
  }

  return (
    <GameShell title="Bridge Builder" subtitle="Cross the river!" progress={progress}>
      <div className="card-pop relative overflow-hidden p-4 sm:p-6">
        {/* Scene */}
        <div className="relative mx-auto" style={{ maxWidth: 700 }}>
          {/* Sky */}
          <div className="rounded-2xl" style={{ background: "linear-gradient(180deg, var(--sky) 0%, oklch(0.96 0.04 200) 100%)" }}>
            {/* Banks + river */}
            <div className="relative h-64 sm:h-72">
              {/* Left bank */}
              <div className="absolute bottom-0 left-0 h-28 w-[18%] rounded-bl-2xl" style={{ background: "var(--grass)" }}>
                <div className="absolute -top-2 inset-x-0 h-3 rounded-full" style={{ background: "oklch(0.86 0.18 145)" }} />
              </div>
              {/* Right bank */}
              <div className="absolute bottom-0 right-0 h-28 w-[18%] rounded-br-2xl" style={{ background: "var(--grass)" }}>
                <div className="absolute -top-2 inset-x-0 h-3 rounded-full" style={{ background: "oklch(0.86 0.18 145)" }} />
                <div className="absolute -top-12 right-3 text-3xl">🌳</div>
              </div>
              {/* Water */}
              <div className="absolute bottom-0 left-[18%] right-[18%] h-20 overflow-hidden" style={{ background: "linear-gradient(180deg, var(--water) 0%, oklch(0.62 0.16 235) 100%)" }}>
                <motion.div
                  animate={{ x: [0, 20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-x-0 top-2 h-2 rounded-full bg-white/40"
                />
                <motion.div
                  animate={{ x: [0, -20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-x-0 top-7 h-1.5 rounded-full bg-white/30"
                />
              </div>

              {/* Bridge slots row */}
              <div className="absolute bottom-20 left-[18%] right-[18%] flex">
                {Array.from({ length: SLOTS }).map((_, i) => (
                  <div
                    key={i}
                    ref={(el) => { slotRefs.current[i] = el; }}
                    className="relative flex-1 border-x border-white/30"
                    style={{ height: 36 }}
                  >
                    <div className="absolute inset-x-1 bottom-0 h-1.5 rounded-full bg-white/40" />
                  </div>
                ))}
              </div>

              {/* Placed blocks overlay */}
              <div className="pointer-events-none absolute bottom-20 left-[18%] right-[18%] flex">
                {Array.from({ length: SLOTS }).map((_, i) => {
                  const block = blocks.find((b) => b.placedAt === i);
                  if (!block) return <div key={i} className="flex-1" />;
                  return (
                    <div
                      key={i}
                      className="pointer-events-auto relative -mb-1"
                      style={{ flex: block.kind === "long" ? 2 : 1 }}
                    >
                      <button
                        onClick={() => phase === "build" && returnBlock(block.id)}
                        className="block h-9 w-full rounded-md border-2 border-amber-900/40"
                        style={{
                          background: block.kind === "long"
                            ? "repeating-linear-gradient(90deg, oklch(0.6 0.13 60) 0 14px, oklch(0.55 0.13 55) 14px 28px)"
                            : "repeating-linear-gradient(90deg, oklch(0.7 0.14 75) 0 14px, oklch(0.65 0.14 70) 14px 28px)",
                          boxShadow: "0 4px 0 0 oklch(0.4 0.1 50 / 0.5)",
                        }}
                        aria-label="Remove block"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Fox walking */}
              <Fox phase={phase} walkStep={walkStep} />

              {/* Sun */}
              <div className="absolute right-4 top-3 h-12 w-12 rounded-full" style={{ background: "var(--sunshine)", boxShadow: "0 0 30px 6px oklch(0.92 0.16 95 / 0.6)" }} />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Drag blocks to the bridge</p>
            <p className="text-xs text-muted-foreground">{coveredSet.size} / {SLOTS} covered</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 p-3 min-h-24">
            {blocks.filter((b) => b.placedAt === null).map((b) => (
              <DraggableBlock
                key={b.id}
                block={b}
                disabled={phase !== "build"}
                onDrop={(x, y) => tryPlace(b, x, y)}
              />
            ))}
            {blocks.every((b) => b.placedAt !== null) && (
              <p className="text-sm text-muted-foreground">All blocks placed. Test your bridge!</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={startTest} disabled={phase !== "build"} className="btn-chunky">
            <Play className="h-5 w-5" /> Test bridge
          </button>
          <button onClick={resetForRetry} disabled={phase === "testing"} className="btn-chunky btn-chunky-ghost">
            <RotateCcw className="h-5 w-5" /> Reset
          </button>
          <div className="ml-auto">
            <Mascot mood={phase === "success" ? "cheer" : phase === "failed" ? "thinking" : "happy"} size={70}
              message={
                phase === "build" ? "Place blocks across the river!"
                : phase === "testing" ? "Here we go…"
                : phase === "failed" ? "Oh no! Try a new way."
                : "You did it!"} />
          </div>
        </div>

        <AnimatePresence>
          {phase === "failed" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 font-bold text-destructive">
              <X className="h-5 w-5" /> The bridge had a gap. Adjust and try again!
            </motion.div>
          )}
          {phase === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="relative mt-4 rounded-2xl border-2 border-primary/40 bg-primary/15 px-4 py-3 font-bold text-primary-shadow">
              <StarBurst />
              <div className="flex items-center gap-2"><Check className="h-5 w-5" /> The fox made it across!</div>
              <div className="mt-3">
                <button onClick={finishAndContinue} className="btn-chunky">Next game</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  );
}

function DraggableBlock({ block, disabled, onDrop }: { block: Block; disabled?: boolean; onDrop: (x: number, y: number) => boolean }) {
  const controls = useDragControls();
  const width = block.kind === "long" ? 110 : 56;
  return (
    <motion.div
      drag={!disabled}
      dragControls={controls}
      dragSnapToOrigin
      whileDrag={{ scale: 1.08, zIndex: 50 }}
      onDragEnd={(_e, info) => onDrop(info.point.x, info.point.y)}
      className="cursor-grab active:cursor-grabbing touch-none select-none rounded-md border-2 border-amber-900/40"
      style={{
        width, height: 36,
        background: block.kind === "long"
          ? "repeating-linear-gradient(90deg, oklch(0.6 0.13 60) 0 14px, oklch(0.55 0.13 55) 14px 28px)"
          : "repeating-linear-gradient(90deg, oklch(0.7 0.14 75) 0 14px, oklch(0.65 0.14 70) 14px 28px)",
        boxShadow: "0 4px 0 0 oklch(0.4 0.1 50 / 0.5)",
      }}
      aria-label={block.kind === "long" ? "Long block" : "Short block"}
    />
  );
}

function Fox({ phase, walkStep }: { phase: "build" | "testing" | "success" | "failed"; walkStep: number }) {
  const startPct = 9;            // sits on left bank center
  const endPct   = 91;
  const bandStart = 18;          // gap region 18%..82%
  const bandEnd   = 82;
  let leftPct = startPct;
  let falling = false;
  if (phase === "testing" || phase === "failed" || phase === "success") {
    const step = Math.min(walkStep, SLOTS + 1);
    leftPct = bandStart + (step / SLOTS) * (bandEnd - bandStart);
    if (step > SLOTS) leftPct = endPct;
    if (phase === "failed") falling = true;
  }
  return (
    <motion.div
      initial={false}
      animate={{ left: `${leftPct}%`, y: falling ? 80 : phase === "testing" ? [0, -10, 0] : 0, rotate: falling ? 180 : 0, opacity: falling && walkStep > SLOTS ? 0 : 1 }}
      transition={phase === "testing" ? { left: { type: "tween", duration: 0.4 }, y: { duration: 0.4, repeat: Infinity } } : { duration: 0.6 }}
      className="absolute bottom-[88px] -translate-x-1/2"
      style={{ left: `${leftPct}%` }}
    >
      <span className="text-4xl drop-shadow-md" role="img" aria-label="fox">🦊</span>
    </motion.div>
  );
}
