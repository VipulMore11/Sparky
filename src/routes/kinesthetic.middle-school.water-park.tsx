import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GameShell, FooterBar } from "@/components/kinesthetic/GameShell";
import { CompleteOverlay } from "@/components/kinesthetic/CompleteOverlay";
import { useKinestheticStore, computeKinestheticScore } from "@/lib/kinesthetic-store";
import { Droplet, Play, RotateCw, Trash2 } from "lucide-react";

export const Route = createFileRoute("/kinesthetic/middle-school/water-park")({
  head: () => ({ meta: [{ title: "Water Park Designer" }] }),
  component: Game,
});

const COLS = 6;
const ROWS = 5;
const SOURCE = { r: 0, c: 0 };
const POOLS = [
  { r: 4, c: 5 },
  { r: 2, c: 5 },
];

type Cell = { kind: "straight" | "curve"; rot: 0 | 1 | 2 | 3 } | null;

// connection masks: which sides connect [top,right,bottom,left]
function conns(c: Cell): [number, number, number, number] {
  if (!c) return [0, 0, 0, 0];
  const base = c.kind === "straight" ? [1, 0, 1, 0] : [1, 1, 0, 0]; // top-right L
  return rot(base as number[], c.rot) as [number, number, number, number];
}
function rot(a: number[], n: number) {
  const out = [...a];
  for (let i = 0; i < n; i++) out.unshift(out.pop()!);
  return out;
}

function Game() {
  const [grid, setGrid] = useState<Cell[][]>(
    Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null))
  );
  const [tool, setTool] = useState<"straight" | "curve">("straight");
  const [tests, setTests] = useState(0);
  const [iterations, setIterations] = useState(0);
  const [filled, setFilled] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const record = useKinestheticStore((s) => s.record);

  const tap = (r: number, c: number) => {
    if ((r === SOURCE.r && c === SOURCE.c) || POOLS.some((p) => p.r === r && p.c === c)) return;
    setGrid((g) => {
      const ng = g.map((row) => [...row]);
      const cur = ng[r][c];
      if (!cur) ng[r][c] = { kind: tool, rot: 0 };
      else if (cur.kind !== tool) { ng[r][c] = { kind: tool, rot: 0 }; setIterations((i) => i + 1); }
      else if (cur.rot < 3) ng[r][c] = { ...cur, rot: (cur.rot + 1) as 0 | 1 | 2 | 3 };
      else { ng[r][c] = null; setIterations((i) => i + 1); }
      return ng;
    });
  };

  const run = async () => {
    if (running) return;
    setRunning(true);
    setTests((t) => t + 1);
    const reached = new Set<string>();
    const queue: { r: number; c: number; from: number }[] = [{ r: SOURCE.r, c: SOURCE.c, from: -1 }];
    // Source emits to right & down
    while (queue.length) {
      const { r, c, from } = queue.shift()!;
      const key = `${r},${c}`;
      if (reached.has(key)) continue;
      reached.add(key);
      setFilled(new Set(reached));
      await new Promise((res) => setTimeout(res, 90));
      let outs: [number, number, number, number];
      if (r === SOURCE.r && c === SOURCE.c) outs = [0, 1, 1, 0];
      else if (POOLS.some((p) => p.r === r && p.c === c)) outs = [0, 0, 0, 0];
      else outs = conns(grid[r][c]);
      // must connect to incoming side
      if (from >= 0 && !outs[from]) continue;
      const dirs = [
        { dr: -1, dc: 0, side: 0, opp: 2 },
        { dr: 0, dc: 1, side: 1, opp: 3 },
        { dr: 1, dc: 0, side: 2, opp: 0 },
        { dr: 0, dc: -1, side: 3, opp: 1 },
      ];
      for (const d of dirs) {
        if (!outs[d.side]) continue;
        const nr = r + d.dr, nc = c + d.dc;
        if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) continue;
        const target = (nr === SOURCE.r && nc === SOURCE.c) ? [0, 0, 0, 0] :
          POOLS.some((p) => p.r === nr && p.c === nc) ? [1, 1, 1, 1] :
          conns(grid[nr][nc]);
        if (target[d.opp]) queue.push({ r: nr, c: nc, from: d.opp });
      }
    }
    setRunning(false);
    const hit = POOLS.filter((p) => reached.has(`${p.r},${p.c}`)).length;
    if (hit === POOLS.length) {
      setTimeout(finish, 700);
    }
  };

  const finish = () => {
    const improved = tests >= 2;
    const score = computeKinestheticScore({ experiments: tests, iterations, retries: 0, improved });
    record({ id: "water-park", title: "Water Park Designer", experiments: tests, iterations, retries: 0, improved, completedAt: Date.now(), kinestheticScore: score });
    setDone(true);
  };

  const clear = () => { setGrid(Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null))); setFilled(new Set()); setIterations((i) => i + 1); };
  const progress = Math.min(1, tests / 4);

  return (
    <GameShell title="Water Park Designer" subtitle="Build pipes from source 💧 to every pool 🏊" progress={progress} accent="blue">
      <div className="card-pop !p-3">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}>
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isSrc = r === SOURCE.r && c === SOURCE.c;
              const isPool = POOLS.some((p) => p.r === r && p.c === c);
              const lit = filled.has(`${r},${c}`);
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => tap(r, c)}
                  className="aspect-square rounded-lg border-2 flex items-center justify-center text-xl relative transition-colors"
                  style={{
                    background: lit ? "color-mix(in oklab, var(--duo-blue) 30%, white)" : isPool ? "color-mix(in oklab, var(--duo-teal) 25%, white)" : isSrc ? "color-mix(in oklab, var(--duo-blue) 25%, white)" : "white",
                    borderColor: lit ? "var(--duo-blue-dark)" : "var(--border)",
                  }}
                >
                  {isSrc ? "💧" : isPool ? "🏊" : <PipeIcon cell={cell} />}
                </button>
              );
            })
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tool:</span>
          <button onClick={() => setTool("straight")} className="btn-pop !py-1.5 !px-3 text-xs" style={tool === "straight" ? {} : { background: "var(--muted)", color: "var(--muted-foreground)", boxShadow: "0 4px 0 0 var(--border)" }}>━ Straight</button>
          <button onClick={() => setTool("curve")} className="btn-pop !py-1.5 !px-3 text-xs" style={tool === "curve" ? {} : { background: "var(--muted)", color: "var(--muted-foreground)", boxShadow: "0 4px 0 0 var(--border)" }}>↳ Curve</button>
          <span className="ml-auto text-[11px] text-muted-foreground">Tap to place • Tap again to rotate</span>
        </div>
      </div>

      <FooterBar>
        <button onClick={clear} className="btn-pop btn-pop-yellow text-sm"><Trash2 className="size-4" /></button>
        <button onClick={run} disabled={running} className="btn-pop btn-pop-blue flex-1 disabled:opacity-40">
          <Play className="size-4 mr-2 fill-current" /> {running ? "Flowing..." : `Test flow #${tests + 1}`}
        </button>
        {tests > 0 && <button onClick={finish} className="btn-pop text-sm">Finish</button>}
      </FooterBar>

      {done && (
        <CompleteOverlay
          title="Water flowing!"
          score={computeKinestheticScore({ experiments: tests, iterations, retries: 0, improved: tests >= 2 })}
          message="Build → Test → Adjust is the kinesthetic loop."
          stats={[
            { label: "Flow tests", value: tests },
            { label: "Iterations", value: iterations },
            { label: "Pools filled", value: POOLS.length },
            { label: "Strategy", value: "Iterative" },
          ]}
        />
      )}
    </GameShell>
  );
}

function PipeIcon({ cell }: { cell: Cell }) {
  if (!cell) return null;
  const stroke = "var(--duo-blue-dark)";
  return (
    <svg viewBox="0 0 24 24" className="size-full p-1" style={{ transform: `rotate(${cell.rot * 90}deg)` }}>
      {cell.kind === "straight" ? (
        <line x1="12" y1="0" x2="12" y2="24" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
      ) : (
        <path d="M 12 0 L 12 12 L 24 12" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}