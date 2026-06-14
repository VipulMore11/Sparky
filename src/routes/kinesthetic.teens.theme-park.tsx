import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GameShell, FooterBar } from "@/components/kinesthetic/GameShell";
import { CompleteOverlay } from "@/components/kinesthetic/CompleteOverlay";
import { useKinestheticStore, computeKinestheticScore } from "@/lib/kinesthetic-store";
import { Play, Sparkles } from "lucide-react";

export const Route = createFileRoute("/kinesthetic/teens/theme-park")({
  head: () => ({ meta: [{ title: "Theme Park Builder" }] }),
  component: Game,
});

const ROWS = 5, COLS = 6;
const TILES = [
  { id: 0, emoji: "", label: "Empty", thrill: 0, food: 0, cost: 0 },
  { id: 1, emoji: "🎢", label: "Coaster", thrill: 8, food: 0, cost: 30 },
  { id: 2, emoji: "🎡", label: "Wheel", thrill: 4, food: 0, cost: 20 },
  { id: 3, emoji: "🍔", label: "Food", thrill: 0, food: 5, cost: 10 },
  { id: 4, emoji: "🌳", label: "Tree", thrill: 1, food: 0, cost: 3 },
];

function Game() {
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [price, setPrice] = useState(15);
  const [experiments, setExperiments] = useState(0);
  const [iterations, setIterations] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [visitors, setVisitors] = useState<{ id: number; x: number; y: number; happy: boolean }[]>([]);
  const [done, setDone] = useState(false);
  const record = useKinestheticStore((s) => s.record);

  const stats = grid.flat().reduce((a, id) => {
    const t = TILES[id]; a.thrill += t.thrill; a.food += t.food; a.cost += t.cost; return a;
  }, { thrill: 0, food: 0, cost: 0 });

  const happiness = Math.max(0, Math.min(100, Math.round(stats.thrill * 2 + stats.food * 3 - Math.max(0, price - 15) * 4 + Math.min(stats.food, 15))));

  const tap = (r: number, c: number) => {
    setGrid((g) => g.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? (v + 1) % TILES.length : v))));
    setIterations((i) => i + 1);
  };

  const simulate = async () => {
    setSimulating(true);
    setExperiments((e) => e + 1);
    const n = 14;
    const vs = Array.from({ length: n }, (_, i) => ({ id: i, x: Math.random() * 100, y: 110, happy: Math.random() * 100 < happiness }));
    setVisitors(vs);
    for (let s = 0; s < 8; s++) {
      await new Promise((r) => setTimeout(r, 140));
      setVisitors((cur) => cur.map((v) => ({ ...v, y: v.y - 14, x: v.x + (Math.random() - 0.5) * 5 })));
    }
    setHistory((h) => [...h, happiness]);
    setSimulating(false);
    setTimeout(() => setVisitors([]), 500);
  };

  const finish = () => {
    const improved = history.length >= 2 && history[history.length - 1] > history[0];
    const ks = computeKinestheticScore({ experiments, iterations, retries: 0, improved });
    record({ id: "theme-park", title: "Theme Park Builder", experiments, iterations, retries: 0, improved, completedAt: Date.now(), kinestheticScore: ks });
    setDone(true);
  };

  const progress = Math.min(1, experiments / 4);

  return (
    <GameShell title="Theme Park Builder" subtitle="Tap tiles to cycle 🎢 🎡 🍔 🌳 · adjust price · simulate visitors" progress={progress} accent="yellow">
      <div className="card-pop !p-3 relative overflow-hidden">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}>
          {grid.map((row, r) =>
            row.map((v, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => tap(r, c)}
                className="aspect-square rounded-lg border-2 flex items-center justify-center text-xl transition-transform active:scale-95"
                style={{ background: v === 0 ? "color-mix(in oklab, var(--duo-green) 8%, white)" : "white", borderColor: "var(--border)" }}
              >
                {TILES[v].emoji}
              </button>
            ))
          )}
        </div>
        {visitors.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {visitors.map((v) => (
              <span key={v.id} className="absolute text-lg transition-all duration-150" style={{ left: `${v.x}%`, top: `${v.y}%` }}>
                {v.happy ? "😄" : "😐"}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card-pop !p-3 mt-3 grid grid-cols-3 gap-2 text-center">
        <div><div className="text-[10px] uppercase font-bold text-muted-foreground">Thrill</div><div className="text-xl font-extrabold" style={{ color: "var(--duo-red)" }}>{stats.thrill}</div></div>
        <div><div className="text-[10px] uppercase font-bold text-muted-foreground">Food</div><div className="text-xl font-extrabold" style={{ color: "var(--duo-orange)" }}>{stats.food}</div></div>
        <div><div className="text-[10px] uppercase font-bold text-muted-foreground">Cost</div><div className="text-xl font-extrabold" style={{ color: "var(--duo-blue)" }}>${stats.cost}</div></div>
      </div>

      <div className="card-pop !p-3 mt-3">
        <div className="flex justify-between text-xs font-bold"><span>🎟️ Ticket price</span><span style={{ color: "var(--duo-yellow-dark)" }}>${price}</span></div>
        <input type="range" min={5} max={40} value={price} onChange={(e) => { setPrice(+e.target.value); setIterations((i) => i + 1); }} className="w-full accent-[color:var(--duo-yellow-dark)] mt-1" />
        <div className="mt-2 flex justify-between text-xs font-bold"><span>Visitor happiness</span><span style={{ color: "var(--duo-green-dark)" }}>{happiness}%</span></div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden mt-1"><div className="h-full transition-all" style={{ width: `${happiness}%`, background: "var(--duo-green)" }} /></div>
        {history.length > 0 && (
          <div className="mt-2 text-[11px] text-muted-foreground">Past: {history.map((h, i) => <span key={i} className="chip ml-1" style={{ background: "var(--secondary)" }}>{h}%</span>)}</div>
        )}
      </div>

      <FooterBar>
        <div className="text-xs font-bold flex items-center gap-2 flex-1"><Sparkles className="size-4 text-[color:var(--duo-yellow-dark)]" />Iter {iterations}</div>
        <button disabled={simulating} onClick={simulate} className="btn-pop btn-pop-yellow text-sm disabled:opacity-40"><Play className="size-4 mr-2 fill-current" />{simulating ? "Running..." : `Simulate #${experiments + 1}`}</button>
        {experiments > 0 && <button onClick={finish} className="btn-pop text-sm">Finish</button>}
      </FooterBar>

      {done && (
        <CompleteOverlay
          title="Park is alive!"
          score={computeKinestheticScore({ experiments, iterations, retries: 0, improved: history.length >= 2 && history[history.length - 1] > history[0] })}
          message="You explored many configurations before settling."
          stats={[
            { label: "Simulations", value: experiments },
            { label: "Adjustments", value: iterations },
            { label: "Best happiness", value: history.length ? `${Math.max(...history)}%` : "—" },
            { label: "Improved", value: history.length >= 2 && history[history.length - 1] > history[0] ? "Yes" : "No" },
          ]}
        />
      )}
    </GameShell>
  );
}