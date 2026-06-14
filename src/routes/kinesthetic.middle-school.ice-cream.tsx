import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { GameShell, FooterBar } from "@/components/kinesthetic/GameShell";
import { CompleteOverlay } from "@/components/kinesthetic/CompleteOverlay";
import { useKinestheticStore, computeKinestheticScore } from "@/lib/kinesthetic-store";
import { Snowflake, FlaskConical, Play } from "lucide-react";

export const Route = createFileRoute("/kinesthetic/middle-school/ice-cream")({
  head: () => ({ meta: [{ title: "Save the Ice Cream" }] }),
  component: Game,
});

const BOXES = [
  { id: "card", label: "Cardboard", emoji: "📦", r: 8 },
  { id: "foam", label: "Foam Box", emoji: "🧊", r: 22 },
  { id: "metal", label: "Metal Tin", emoji: "🥫", r: 4 },
];
const COVERS = [
  { id: "cloth", label: "Cloth", emoji: "🧣", r: 5 },
  { id: "foil", label: "Foil Wrap", emoji: "✨", r: 14 },
  { id: "wool", label: "Wool Blanket", emoji: "🧶", r: 18 },
];
const PACKS = [
  { id: "1", label: "1 Pack", emoji: "❄️", r: 6 },
  { id: "3", label: "3 Packs", emoji: "❄️❄️❄️", r: 16 },
  { id: "gel", label: "Gel Bricks", emoji: "🟦", r: 22 },
];

const TARGET = 50; // minutes

function Game() {
  const [box, setBox] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [pack, setPack] = useState<string | null>(null);
  const [tests, setTests] = useState<number[]>([]);
  const [testing, setTesting] = useState(false);
  const [showResult, setShowResult] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const record = useKinestheticStore((s) => s.record);

  const ready = box && cover && pack;
  const minutes = useMemo(() => {
    if (!ready) return 0;
    const b = BOXES.find((x) => x.id === box)!.r;
    const c = COVERS.find((x) => x.id === cover)!.r;
    const p = PACKS.find((x) => x.id === pack)!.r;
    return b + c + p + Math.floor(Math.random() * 4);
  }, [box, cover, pack, tests.length]);

  const best = tests.length ? Math.max(...tests) : 0;
  const progress = Math.min(1, best / TARGET);

  const runTest = () => {
    if (!ready || testing) return;
    setTesting(true);
    setShowResult(null);
    setTimeout(() => {
      setTests((t) => [...t, minutes]);
      setShowResult(minutes);
      setTesting(false);
      if (minutes >= TARGET) {
        setTimeout(() => finish(), 1200);
      }
    }, 1400);
  };

  const finish = () => {
    const iterations = tests.length;
    const improved = tests.length >= 2 && tests[tests.length - 1] > tests[0];
    const score = computeKinestheticScore({
      experiments: tests.length,
      iterations,
      retries: 0,
      improved,
    });
    record({
      id: "ice-cream",
      title: "Save the Ice Cream",
      experiments: tests.length,
      iterations,
      retries: 0,
      improved,
      completedAt: Date.now(),
      kinestheticScore: score,
    });
    setDone(true);
  };

  return (
    <GameShell
      title="Save the Ice Cream"
      subtitle="Test combinations to keep ice cream frozen the longest 🍦"
      progress={progress}
      accent="blue"
    >
      <Picker label="1. Pick a box" items={BOXES} value={box} onChange={setBox} />
      <Picker label="2. Pick a cover" items={COVERS} value={cover} onChange={setCover} />
      <Picker label="3. Pick ice packs" items={PACKS} value={pack} onChange={setPack} />

      <div className="card-pop mt-6 !p-4">
        <div className="flex items-center gap-3">
          <div className={`size-16 rounded-2xl flex items-center justify-center text-4xl bg-secondary ${testing ? "animate-wiggle" : ""}`}>
            🍦
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Best run</div>
            <div className="text-2xl font-extrabold">{best} <span className="text-sm font-bold text-muted-foreground">/ {TARGET} min</span></div>
            <div className="h-2 bg-secondary rounded-full mt-1 overflow-hidden">
              <div className="h-full transition-all" style={{ width: `${progress * 100}%`, background: "var(--duo-blue)" }} />
            </div>
          </div>
        </div>
        {showResult !== null && (
          <div className="mt-3 text-sm font-bold animate-pop-in" style={{ color: showResult >= best || tests.length <= 1 ? "var(--duo-green-dark)" : "var(--duo-orange)" }}>
            <Snowflake className="inline size-4 mr-1" /> Lasted {showResult} minutes
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tests.map((t, i) => (
            <span key={i} className="chip" style={{ background: "var(--secondary)" }}>
              <FlaskConical className="size-3" /> #{i + 1}: {t}m
            </span>
          ))}
        </div>
      </div>

      <FooterBar>
        <button
          disabled={!ready || testing}
          onClick={runTest}
          className="btn-pop btn-pop-blue flex-1 disabled:opacity-40"
        >
          <Play className="size-4 mr-2 fill-current" /> {testing ? "Testing..." : `Run experiment ${tests.length + 1}`}
        </button>
        {tests.length > 0 && (
          <button onClick={finish} className="btn-pop text-sm">Finish</button>
        )}
      </FooterBar>
      {done && (
        <CompleteOverlay
          title="Ice cream saved!"
          score={computeKinestheticScore({
            experiments: tests.length,
            iterations: tests.length,
            retries: 0,
            improved: tests.length >= 2 && tests[tests.length - 1] > tests[0],
          })}
          message="You learned by testing combinations — classic kinesthetic move."
          stats={[
            { label: "Experiments", value: tests.length },
            { label: "Best time", value: `${best}m` },
            { label: "Improved", value: tests.length >= 2 && tests[tests.length - 1] > tests[0] ? "Yes" : "No" },
            { label: "Target hit", value: best >= TARGET ? "✓" : "—" },
          ]}
        />
      )}
    </GameShell>
  );
}

function Picker<T extends { id: string; label: string; emoji: string }>({ label, items, value, onChange }: { label: string; items: T[]; value: string | null; onChange: (v: string) => void }) {
  return (
    <div className="mt-5">
      <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
      <div className="grid grid-cols-3 gap-2">
        {items.map((it) => {
          const active = value === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onChange(it.id)}
              className="card-pop !p-3 text-center transition-all"
              style={{
                borderColor: active ? "var(--duo-blue)" : undefined,
                boxShadow: active ? "0 4px 0 0 var(--duo-blue-dark)" : undefined,
                transform: active ? "translateY(-2px)" : undefined,
              }}
            >
              <div className="text-2xl">{it.emoji}</div>
              <div className="text-xs font-bold mt-1">{it.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}