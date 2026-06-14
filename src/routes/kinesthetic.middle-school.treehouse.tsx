import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GameShell, FooterBar } from "@/components/kinesthetic/GameShell";
import { CompleteOverlay } from "@/components/kinesthetic/CompleteOverlay";
import { useKinestheticStore, computeKinestheticScore } from "@/lib/kinesthetic-store";
import { Wind, RotateCcw, Hammer } from "lucide-react";

export const Route = createFileRoute("/kinesthetic/middle-school/treehouse")({
  head: () => ({ meta: [{ title: "Strongest Treehouse" }] }),
  component: Game,
});

type Slot = "supports" | "walls" | "roof";

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
};

const TARGET = 22;

function Game() {
  const [build, setBuild] = useState<Partial<Record<Slot, string>>>({});
  const [dragging, setDragging] = useState<{ slot: Slot; id: string } | null>(null);
  const [tests, setTests] = useState<number[]>([]);
  const [testing, setTesting] = useState(false);
  const [redesigns, setRedesigns] = useState(0);
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(false);
  const record = useKinestheticStore((s) => s.record);

  const ready = build.supports && build.walls && build.roof;
  const stability = ready
    ? PALETTE.supports.find((p) => p.id === build.supports)!.s +
      PALETTE.walls.find((p) => p.id === build.walls)!.s +
      PALETTE.roof.find((p) => p.id === build.roof)!.s
    : 0;

  const best = tests.length ? Math.max(...tests) : 0;
  const progress = Math.min(1, best / TARGET);

  const drop = (slot: Slot) => {
    if (!dragging || dragging.slot !== slot) return;
    if (build[slot]) setRedesigns((r) => r + 1);
    setBuild((b) => ({ ...b, [slot]: dragging.id }));
    setDragging(null);
  };

  const test = () => {
    if (!ready || testing) return;
    setTesting(true);
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setTests((t) => [...t, stability]);
      setTesting(false);
      if (stability >= TARGET) setTimeout(finish, 900);
    }, 1500);
  };

  const finish = () => {
    const improved = tests.length >= 2 && tests[tests.length - 1] > tests[0];
    const score = computeKinestheticScore({
      experiments: tests.length,
      iterations: redesigns,
      retries: 0,
      improved,
    });
    record({
      id: "treehouse",
      title: "Strongest Treehouse",
      experiments: tests.length,
      iterations: redesigns,
      retries: 0,
      improved,
      completedAt: Date.now(),
      kinestheticScore: score,
    });
    setDone(true);
  };

  return (
    <GameShell title="Strongest Treehouse" subtitle="Drag pieces into the slots, then test the wind 🌬️" progress={progress} accent="yellow">
      <div className="card-pop !p-4">
        <div
          className={`relative h-48 rounded-2xl flex items-end justify-center transition-transform ${shake ? "animate-wiggle" : ""}`}
          style={{ background: "linear-gradient(180deg, #cfe9ff, #e6f6e0)" }}
        >
          <div className="flex flex-col items-center">
            <Drop slot="roof" value={build.roof} onDrop={drop} dragging={dragging} />
            <Drop slot="walls" value={build.walls} onDrop={drop} dragging={dragging} />
            <Drop slot="supports" value={build.supports} onDrop={drop} dragging={dragging} />
          </div>
          {testing && (
            <Wind className="absolute left-2 top-4 size-10 text-[color:var(--duo-blue-dark)] animate-pulse" />
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="font-bold">Stability: <span style={{ color: "var(--duo-green-dark)" }}>{stability}</span> / {TARGET}</span>
          <span className="text-xs text-muted-foreground">Tests: {tests.length} · Redesigns: {redesigns}</span>
        </div>
      </div>

      {(["supports", "walls", "roof"] as Slot[]).map((slot) => (
        <div key={slot} className="mt-4">
          <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">{slot}</div>
          <div className="grid grid-cols-3 gap-2">
            {PALETTE[slot].map((p) => (
              <button
                key={p.id}
                draggable
                onDragStart={() => setDragging({ slot, id: p.id })}
                onClick={() => {
                  if (build[slot]) setRedesigns((r) => r + 1);
                  setBuild((b) => ({ ...b, [slot]: p.id }));
                }}
                className="card-pop !p-3 text-center cursor-grab active:cursor-grabbing"
                style={{
                  borderColor: build[slot] === p.id ? "var(--duo-yellow-dark)" : undefined,
                  boxShadow: build[slot] === p.id ? "0 4px 0 0 var(--duo-yellow-dark)" : undefined,
                }}
              >
                <div className="text-2xl">{p.emoji}</div>
                <div className="text-[11px] font-bold mt-0.5">{p.label}</div>
              </button>
            ))}
          </div>
        </div>
      ))}

      <FooterBar>
        <button onClick={() => { setBuild({}); setRedesigns((r) => r + 1); }} className="btn-pop btn-pop-yellow text-sm" aria-label="Reset">
          <RotateCcw className="size-4" />
        </button>
        <button disabled={!ready || testing} onClick={test} className="btn-pop btn-pop-blue flex-1 disabled:opacity-40">
          <Wind className="size-4 mr-2" /> {testing ? "Wind blowing..." : "Wind test"}
        </button>
        {tests.length > 0 && <button onClick={finish} className="btn-pop text-sm">Finish</button>}
      </FooterBar>
      {done && (
        <CompleteOverlay
          title="Treehouse stands!"
          score={computeKinestheticScore({ experiments: tests.length, iterations: redesigns, retries: 0, improved: tests.length >= 2 && tests[tests.length - 1] > tests[0] })}
          message="Repeated redesigns = strong kinesthetic signal."
          stats={[
            { label: "Tests", value: tests.length },
            { label: "Redesigns", value: redesigns },
            { label: "Best stability", value: best },
            { label: "Improved", value: tests.length >= 2 && tests[tests.length - 1] > tests[0] ? "Yes" : "No" },
          ]}
        />
      )}
    </GameShell>
  );
}

function Drop({ slot, value, onDrop, dragging }: { slot: Slot; value?: string; onDrop: (s: Slot) => void; dragging: { slot: Slot; id: string } | null }) {
  const item = value ? PALETTE[slot].find((p) => p.id === value) : null;
  const active = dragging?.slot === slot;
  const sizes: Record<Slot, string> = { roof: "w-28 h-8", walls: "w-24 h-16", supports: "w-32 h-10" };
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(slot)}
      className={`${sizes[slot]} rounded-xl border-2 border-dashed flex items-center justify-center text-xl transition-all ${
        active ? "border-[color:var(--duo-yellow-dark)] bg-yellow-50 scale-105" : "border-border bg-white/60"
      }`}
    >
      {item ? <span className="animate-pop-in">{item.emoji}</span> : <Hammer className="size-4 text-muted-foreground" />}
    </div>
  );
}