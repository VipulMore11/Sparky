import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { GameShell, FooterBar } from "@/components/kinesthetic/GameShell";
import { CompleteOverlay } from "@/components/kinesthetic/CompleteOverlay";
import { useKinestheticStore, computeKinestheticScore } from "@/lib/kinesthetic-store";
import { Play, RefreshCw, TrendingUp, Clock } from "lucide-react";

export const Route = createFileRoute("/kinesthetic/teens/food-truck")({
  head: () => ({ meta: [{ title: "Food Truck Challenge" }] }),
  component: Game,
});

const ROUNDS = 3;
const BUDGET = 30;
const ROUND_MS = 35_000;
const PATIENCE_MS = 9_000;
const SPAWN_MS = 2_200;

const INGREDIENTS = [
  { id: "bun",   emoji: "🍞", label: "Buns",    color: "var(--duo-yellow-dark)" },
  { id: "patty", emoji: "🥩", label: "Patties", color: "var(--duo-red)" },
  { id: "fries", emoji: "🍟", label: "Fries",   color: "var(--duo-yellow)" },
] as const;
type IngId = (typeof INGREDIENTS)[number]["id"];

const ORDER_POOL: IngId[][] = [
  ["bun", "patty"],
  ["fries"],
  ["bun", "patty", "fries"],
  ["patty"],
  ["bun", "fries"],
  ["fries", "patty"],
  ["bun", "patty", "patty"],
];

type Customer = {
  uid: number;
  want: IngId[];
  spawnAt: number;
  served?: boolean;
  happy?: boolean;
  reason?: "served" | "wrong" | "timeout";
};

function Game() {
  const record = useKinestheticStore((s) => s.record);
  const [phase, setPhase] = useState<"prep" | "rush" | "recap" | "done">("prep");
  const [round, setRound] = useState(0);
  const [alloc, setAlloc] = useState<Record<IngId, number>>({ bun: 10, patty: 10, fries: 10 });
  const [lastAlloc, setLastAlloc] = useState<Record<IngId, number> | null>(null);
  const [strategyChanges, setStrategyChanges] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [shortageHistory, setShortageHistory] = useState<Partial<Record<IngId, number>>[]>([]);

  const [stock, setStock] = useState<Record<IngId, number>>({ bun: 0, patty: 0, fries: 0 });
  const [queue, setQueue] = useState<Customer[]>([]);
  const [served, setServed] = useState<Customer[]>([]);
  const [combo, setCombo] = useState(0);
  const [tick, setTick] = useState(0);
  const [floaters, setFloaters] = useState<{ id: number; text: string; color: string; x: number }[]>([]);
  const startedAt = useRef(0);
  const uidRef = useRef(1);
  const flUid = useRef(1);
  const shortagesRef = useRef<Partial<Record<IngId, number>>>({});
  const [done, setDone] = useState(false);

  const total = alloc.bun + alloc.patty + alloc.fries;
  const over = total > BUDGET;
  const elapsed = phase === "rush" ? Math.min(ROUND_MS, tick - startedAt.current) : 0;
  const remaining = Math.max(0, ROUND_MS - elapsed);

  useEffect(() => {
    if (phase !== "rush") return;
    let raf = 0;
    const loop = () => { setTick(Date.now()); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    if (phase !== "rush") return;
    const targetCount = 6 + round * 2;
    let spawned = 0;
    let timeoutId = 0 as unknown as number;
    const spawn = () => {
      if (spawned >= targetCount) return;
      spawned++;
      const want = ORDER_POOL[(spawned + round) % ORDER_POOL.length];
      setQueue((q) => [...q, { uid: uidRef.current++, want, spawnAt: Date.now() }]);
      const jitter = SPAWN_MS - Math.min(900, round * 250) + (Math.random() * 600 - 300);
      timeoutId = window.setTimeout(spawn, Math.max(700, jitter));
    };
    timeoutId = window.setTimeout(spawn, 400);
    return () => clearTimeout(timeoutId);
  }, [phase, round]);

  useEffect(() => {
    if (phase !== "rush") return;
    const now = Date.now();
    setQueue((q) => {
      const stillWaiting: Customer[] = [];
      const expired: Customer[] = [];
      for (const c of q) {
        if (now - c.spawnAt > PATIENCE_MS) expired.push({ ...c, served: true, happy: false, reason: "timeout" });
        else stillWaiting.push(c);
      }
      if (expired.length) {
        setServed((s) => [...s, ...expired]);
        setCombo(0);
      }
      return stillWaiting;
    });
    if (remaining <= 0) endRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const startRound = () => {
    if (over) return;
    if (lastAlloc && (Object.keys(alloc) as IngId[]).some((k) => lastAlloc[k] !== alloc[k])) {
      setStrategyChanges((s) => s + 1);
    }
    setLastAlloc({ ...alloc });
    setStock({ ...alloc });
    setQueue([]); setServed([]); setCombo(0);
    shortagesRef.current = {};
    uidRef.current = 1;
    startedAt.current = Date.now();
    setTick(Date.now());
    setPhase("rush");
  };

  const floater = (text: string, color: string) => {
    const id = flUid.current++;
    const x = 20 + Math.random() * 60;
    setFloaters((f) => [...f, { id, text, color, x }]);
    setTimeout(() => setFloaters((f) => f.filter((it) => it.id !== id)), 900);
  };

  const serve = (c: Customer) => {
    if (c.served) return;
    const need = c.want;
    const canMake = need.every((k) => stock[k] >= need.filter((w) => w === k).length);
    if (!canMake) {
      need.forEach((k) => {
        if (stock[k] < need.filter((w) => w === k).length) {
          shortagesRef.current[k] = (shortagesRef.current[k] || 0) + 1;
        }
      });
      setServed((s) => [...s, { ...c, served: true, happy: false, reason: "wrong" }]);
      setQueue((q) => q.filter((x) => x.uid !== c.uid));
      setCombo(0);
      floater("Out of stock!", "var(--duo-red)");
      return;
    }
    const nextStock = { ...stock };
    need.forEach((k) => { nextStock[k]--; });
    setStock(nextStock);
    setServed((s) => [...s, { ...c, served: true, happy: true, reason: "served" }]);
    setQueue((q) => q.filter((x) => x.uid !== c.uid));
    setCombo((c) => c + 1);
    floater(`+${10 + combo * 2}`, "var(--duo-green)");
  };

  const endRound = () => {
    if (phase !== "rush") return;
    const happy = served.filter((c) => c.happy).length;
    const tot = served.length || 1;
    const sc = Math.round((happy / tot) * 100);
    setScores((s) => [...s, sc]);
    setShortageHistory((h) => [...h, { ...shortagesRef.current }]);
    setQueue([]);
    setPhase("recap");
  };

  const nextRound = () => {
    if (round + 1 >= ROUNDS) { finish(); return; }
    setRound((r) => r + 1);
    setPhase("prep");
  };

  const finish = () => {
    const improved = scores.length >= 2 && scores[scores.length - 1] > scores[0];
    const ks = computeKinestheticScore({ experiments: scores.length, iterations: strategyChanges, retries: 0, improved });
    record({ id: "food-truck", title: "Food Truck Challenge", experiments: scores.length, iterations: strategyChanges, retries: 0, improved, completedAt: Date.now(), kinestheticScore: ks });
    setDone(true);
    setPhase("done");
  };

  const restart = () => { setRound(0); setScores([]); setShortageHistory([]); setPhase("prep"); };

  const progress = (round + (phase === "recap" || phase === "done" ? 1 : phase === "rush" ? elapsed / ROUND_MS : 0)) / ROUNDS;

  return (
    <GameShell title="Food Truck Challenge" subtitle="Allocate ingredients → survive the rush. Adjust each round." progress={progress} accent="red">
      {phase === "prep" && (
        <PrepPanel
          round={round} alloc={alloc} setAlloc={setAlloc} total={total} over={over}
          scores={scores} shortages={shortageHistory[shortageHistory.length - 1]} lastAlloc={lastAlloc}
        />
      )}
      {phase === "rush" && (
        <RushPanel stock={stock} queue={queue} combo={combo} remaining={remaining} floaters={floaters} onServe={serve} />
      )}
      {phase === "recap" && (
        <RecapPanel round={round} served={served} score={scores[scores.length - 1] ?? 0} shortages={shortagesRef.current} leftover={stock} />
      )}

      <FooterBar>
        {phase === "prep" && (
          <>
            <div className="card-pop !p-2 !shadow-none flex-1 flex items-center gap-2">
              <span className="text-xs font-bold">Budget</span>
              <span className="text-base font-black" style={{ color: over ? "var(--duo-red)" : "var(--duo-green-dark)" }}>{total}/{BUDGET}</span>
            </div>
            <button onClick={startRound} disabled={over} className="btn-pop btn-pop-red disabled:opacity-40">
              <Play className="size-4 mr-2 fill-current" /> Start rush
            </button>
          </>
        )}
        {phase === "rush" && (
          <>
            <div className="card-pop !p-2 !shadow-none flex items-center gap-2">
              <Clock className="size-4" />
              <span className="text-base font-black tabular-nums" style={{ color: remaining < 8000 ? "var(--duo-red)" : "var(--foreground)" }}>
                {(remaining / 1000).toFixed(1)}s
              </span>
            </div>
            <div className="card-pop !p-2 !shadow-none flex-1 flex items-center gap-2 justify-center">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Combo</span>
              <span className="text-base font-black" style={{ color: combo > 0 ? "var(--duo-green-dark)" : "var(--muted-foreground)" }}>×{combo}</span>
            </div>
            <button onClick={endRound} className="btn-pop btn-pop-yellow text-sm">End</button>
          </>
        )}
        {phase === "recap" && (
          <button onClick={nextRound} className="btn-pop btn-pop-red flex-1">
            {round + 1 >= ROUNDS ? "See results" : `Next round (${round + 2}/${ROUNDS})`}
          </button>
        )}
        {phase === "done" && (
          <button onClick={restart} className="btn-pop btn-pop-yellow text-sm"><RefreshCw className="size-4 mr-2" /> Play again</button>
        )}
      </FooterBar>

      {done && (
        <CompleteOverlay
          title="Service complete!"
          score={computeKinestheticScore({ experiments: scores.length, iterations: strategyChanges, retries: 0, improved: scores.length >= 2 && scores[scores.length - 1] > scores[0] })}
          message="You discovered the right mix through action."
          stats={[
            { label: "Rounds", value: scores.length },
            { label: "Strategy shifts", value: strategyChanges },
            { label: "Best round", value: scores.length ? `${Math.max(...scores)}%` : "—" },
            { label: "Improved", value: scores.length >= 2 && scores[scores.length - 1] > scores[0] ? "Yes" : "No" },
          ]}
        />
      )}
    </GameShell>
  );
}

function PrepPanel({
  round, alloc, setAlloc, total, over, scores, shortages, lastAlloc,
}: {
  round: number;
  alloc: Record<IngId, number>;
  setAlloc: React.Dispatch<React.SetStateAction<Record<IngId, number>>>;
  total: number; over: boolean; scores: number[];
  shortages?: Partial<Record<IngId, number>>;
  lastAlloc: Record<IngId, number> | null;
}) {
  const tip = shortages && Object.entries(shortages).sort((a, b) => (b[1]! - a[1]!))[0];
  return (
    <div className="card-pop !p-4 animate-pop-in">
      <div className="flex items-center justify-between">
        <div className="chip" style={{ background: "color-mix(in oklab, var(--duo-red) 15%, white)", color: "var(--duo-red)" }}>
          ROUND {round + 1} OF {ROUNDS}
        </div>
        <span className="chip" style={{ background: over ? "var(--duo-red)" : "var(--secondary)", color: over ? "white" : "var(--foreground)" }}>
          ${total} / ${BUDGET}
        </span>
      </div>
      {tip && (
        <div className="mt-3 rounded-xl border-2 border-dashed border-border p-2 text-xs flex items-center gap-2">
          <TrendingUp className="size-4 text-[color:var(--duo-orange)]" />
          Last round you ran out of <b className="mx-1">{INGREDIENTS.find((i) => i.id === tip[0])?.label}</b> · try adding more.
        </div>
      )}
      {INGREDIENTS.map((it) => {
        const v = alloc[it.id];
        const diff = lastAlloc ? v - lastAlloc[it.id] : 0;
        return (
          <div key={it.id} className="mt-4">
            <div className="flex items-center justify-between text-sm font-bold">
              <span>{it.emoji} {it.label}</span>
              <span className="flex items-center gap-2">
                {diff !== 0 && (
                  <span className="text-[10px] font-extrabold" style={{ color: diff > 0 ? "var(--duo-green-dark)" : "var(--duo-red)" }}>
                    {diff > 0 ? `+${diff}` : diff}
                  </span>
                )}
                <span style={{ color: it.color }}>{v}</span>
              </span>
            </div>
            <input type="range" min={0} max={20} value={v}
              onChange={(e) => setAlloc((a) => ({ ...a, [it.id]: +e.target.value }))}
              className="w-full mt-1" style={{ accentColor: it.color }} />
          </div>
        );
      })}
      {scores.length > 0 && (
        <div className="mt-4">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">Past rounds</div>
          <div className="flex gap-1.5 flex-wrap">
            {scores.map((s, i) => (
              <span key={i} className="chip" style={{ background: s >= 70 ? "color-mix(in oklab, var(--duo-green) 18%, white)" : "color-mix(in oklab, var(--duo-red) 15%, white)" }}>
                R{i + 1}: {s}%
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RushPanel({
  stock, queue, combo, remaining, floaters, onServe,
}: {
  stock: Record<IngId, number>;
  queue: Customer[]; combo: number; remaining: number;
  floaters: { id: number; text: string; color: string; x: number }[];
  onServe: (c: Customer) => void;
}) {
  return (
    <div className="relative">
      <div className="card-pop !p-3 grid grid-cols-3 gap-2">
        {INGREDIENTS.map((it) => {
          const v = stock[it.id];
          return (
            <div key={it.id} className="rounded-xl border-2 border-border p-2 text-center" style={{ background: v <= 0 ? "color-mix(in oklab, var(--duo-red) 14%, white)" : "white" }}>
              <div className="text-2xl">{it.emoji}</div>
              <div className="text-2xl font-black tabular-nums" style={{ color: v <= 1 ? "var(--duo-red)" : "var(--foreground)" }}>{v}</div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground">{it.label}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Queue · {queue.length}</div>
        {combo >= 3 && <span className="chip animate-pop-in" style={{ background: "var(--duo-green)", color: "white" }}>🔥 ×{combo} combo!</span>}
      </div>
      <div className="mt-2 space-y-2 min-h-[160px]">
        {queue.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            {remaining > 0 ? "Looking out the window… 👀" : "Wrapping up…"}
          </div>
        )}
        {queue.map((c) => <CustomerCard key={c.uid} c={c} onServe={() => onServe(c)} />)}
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {floaters.map((f) => (
          <div key={f.id} className="absolute text-base font-black"
            style={{ left: `${f.x}%`, top: "30%", color: f.color, animation: "float-up 900ms ease-out forwards" }}>
            {f.text}
          </div>
        ))}
      </div>
      <style>{`@keyframes float-up { from { transform: translateY(0); opacity: 1 } to { transform: translateY(-40px); opacity: 0 } }`}</style>
    </div>
  );
}

function CustomerCard({ c, onServe }: { c: Customer; onServe: () => void }) {
  const [, force] = useState(0);
  useEffect(() => { const id = setInterval(() => force((x) => x + 1), 100); return () => clearInterval(id); }, []);
  const age = Date.now() - c.spawnAt;
  const pct = Math.max(0, 1 - age / PATIENCE_MS);
  const mood = pct > 0.66 ? "🙂" : pct > 0.33 ? "😐" : "😠";
  return (
    <button onClick={onServe} className="w-full card-pop !p-3 flex items-center gap-3 active:translate-y-0.5 transition-transform animate-pop-in">
      <div className="text-3xl">{mood}</div>
      <div className="flex-1 text-left">
        <div className="text-base font-bold">
          {c.want.map((w, i) => <span key={i} className="mr-1">{INGREDIENTS.find((it) => it.id === w)?.emoji}</span>)}
        </div>
        <div className="mt-1 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full transition-[width] duration-100"
            style={{ width: `${pct * 100}%`, background: pct > 0.5 ? "var(--duo-green)" : pct > 0.25 ? "var(--duo-yellow-dark)" : "var(--duo-red)" }} />
        </div>
      </div>
      <div className="chip" style={{ background: "var(--duo-red)", color: "white" }}>Serve</div>
    </button>
  );
}

function RecapPanel({
  round, served, score, shortages, leftover,
}: {
  round: number; served: Customer[]; score: number;
  shortages: Partial<Record<IngId, number>>; leftover: Record<IngId, number>;
}) {
  const happy = served.filter((c) => c.happy).length;
  const timeouts = served.filter((c) => c.reason === "timeout").length;
  const wrong = served.filter((c) => c.reason === "wrong").length;
  const topShort = Object.entries(shortages).sort((a, b) => (b[1]! - a[1]!))[0];
  const wasted = (Object.entries(leftover) as [IngId, number][]).filter(([, v]) => v > 3);
  return (
    <div className="card-pop !p-5 animate-pop-in">
      <div className="chip" style={{ background: "var(--duo-red)", color: "white" }}>ROUND {round + 1} RECAP</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-6xl font-black" style={{ color: "var(--duo-red)" }}>{score}</span>
        <span className="text-sm font-bold text-muted-foreground">% happy</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Stat label="Served" value={happy} color="var(--duo-green-dark)" />
        <Stat label="Walked off" value={timeouts} color="var(--duo-orange)" />
        <Stat label="Out of stock" value={wrong} color="var(--duo-red)" />
      </div>
      <div className="mt-4 space-y-2 text-sm">
        {topShort && (
          <div className="rounded-xl border-2 border-border p-2">
            🚨 Short on <b>{INGREDIENTS.find((i) => i.id === topShort[0])?.label}</b> ({topShort[1]} times). Add more next round.
          </div>
        )}
        {wasted.length > 0 && (
          <div className="rounded-xl border-2 border-border p-2">
            🗑️ Leftover: {wasted.map(([k, v]) => `${INGREDIENTS.find((i) => i.id === k)?.emoji} ${v}`).join(" · ")}. You over-allocated.
          </div>
        )}
        {!topShort && wasted.length === 0 && (
          <div className="rounded-xl border-2 border-border p-2">🎯 Solid balance. Try pushing the budget further.</div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="rounded-2xl border-2 border-border p-3 text-center">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-2xl font-black tabular-nums" style={{ color }}>{value}</div>
    </div>
  );
}