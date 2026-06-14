import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { GameShell, FooterBar } from "@/components/kinesthetic/GameShell";
import { CompleteOverlay } from "@/components/kinesthetic/CompleteOverlay";
import { useKinestheticStore, computeKinestheticScore } from "@/lib/kinesthetic-store";
import { RotateCw, Sparkles, Trash2, Wand2 } from "lucide-react";

export const Route = createFileRoute("/kinesthetic/teens/dream-room")({
  head: () => ({ meta: [{ title: "Dream Room" }] }),
  component: Game,
});

/* ------------------------- Config ------------------------- */
const GRID = { rows: 6, cols: 7 };
const BUDGET = 1000, SPACE_MAX = GRID.rows * GRID.cols, POWER_MAX = 20;

type Cat = "sleep" | "work" | "lounge" | "tech" | "decor";
type Item = {
  id: string;
  emoji: string;
  label: string;
  cost: number;
  power: number;
  w: number; h: number;
  cat: Cat;
};

const CATALOG: Item[] = [
  { id: "bed",     emoji: "🛏️",  label: "Bed",         cost: 300, power: 0, w: 3, h: 2, cat: "sleep" },
  { id: "desk",    emoji: "🪑",  label: "Desk",        cost: 150, power: 1, w: 2, h: 1, cat: "work" },
  { id: "chair",   emoji: "💺",  label: "Chair",       cost: 60,  power: 0, w: 1, h: 1, cat: "work" },
  { id: "shelf",   emoji: "📚",  label: "Bookshelf",   cost: 120, power: 0, w: 2, h: 1, cat: "work" },
  { id: "sofa",    emoji: "🛋️",  label: "Sofa",        cost: 250, power: 0, w: 3, h: 1, cat: "lounge" },
  { id: "tv",      emoji: "📺",  label: "TV",          cost: 200, power: 6, w: 2, h: 1, cat: "tech" },
  { id: "console", emoji: "🎮",  label: "Console",     cost: 180, power: 4, w: 1, h: 1, cat: "tech" },
  { id: "speaker", emoji: "🔊",  label: "Speaker",     cost: 120, power: 3, w: 1, h: 1, cat: "tech" },
  { id: "lamp",    emoji: "💡",  label: "Lamp",        cost: 50,  power: 2, w: 1, h: 1, cat: "decor" },
  { id: "plant",   emoji: "🪴",  label: "Plant",       cost: 30,  power: 0, w: 1, h: 1, cat: "decor" },
  { id: "rug",     emoji: "🟪",  label: "Rug",         cost: 80,  power: 0, w: 2, h: 2, cat: "decor" },
  { id: "fridge",  emoji: "🧊",  label: "Mini Fridge", cost: 200, power: 8, w: 1, h: 2, cat: "tech" },
];

type Vibe = { id: string; label: string; emoji: string; want: Partial<Record<Cat, number>>; tip: string };
const VIBES: Vibe[] = [
  { id: "cozy",       label: "Cozy",       emoji: "🕯️", want: { sleep: 1, lounge: 1, decor: 3 }, tip: "soft & inviting" },
  { id: "productive", label: "Productive", emoji: "📈", want: { work: 3, decor: 1, sleep: 1 },   tip: "focus zone" },
  { id: "gamer",      label: "Gamer",      emoji: "🎮", want: { tech: 3, lounge: 1, sleep: 1 },  tip: "tech-heavy" },
];

type Placed = Item & { uid: string; row: number; col: number; rot: 0 | 1 };

/* ------------------------- Component ------------------------- */
function Game() {
  const record = useKinestheticStore((s) => s.record);
  const [vibe, setVibe] = useState<Vibe>(VIBES[0]);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [iterations, setIterations] = useState(0);
  const [experiments, setExperiments] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [vibeChanges, setVibeChanges] = useState(0);

  // Pointer drag (works on touch + mouse)
  type Drag =
    | { kind: "new"; item: Item; rot: 0 | 1; x: number; y: number }
    | { kind: "move"; uid: string; x: number; y: number }
    | null;
  const [drag, setDrag] = useState<Drag>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);

  const dims = (it: Item, rot: 0 | 1) => rot === 0 ? { w: it.w, h: it.h } : { w: it.h, h: it.w };

  const canPlace = (row: number, col: number, w: number, h: number, ignoreUid?: string) => {
    if (row < 0 || col < 0 || row + h > GRID.rows || col + w > GRID.cols) return false;
    for (const p of placed) {
      if (ignoreUid && p.uid === ignoreUid) continue;
      const d = dims(p, p.rot);
      if (row < p.row + d.h && row + h > p.row && col < p.col + d.w && col + w > p.col) return false;
    }
    return true;
  };

  const pointToCell = (clientX: number, clientY: number) => {
    const el = gridRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cw = r.width / GRID.cols, ch = r.height / GRID.rows;
    const col = Math.floor((clientX - r.left) / cw);
    const row = Math.floor((clientY - r.top) / ch);
    if (col < 0 || row < 0 || col >= GRID.cols || row >= GRID.rows) return null;
    return { row, col };
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const cell = pointToCell(e.clientX, e.clientY);
      setHover(cell);
      setDrag((d) => d ? { ...d, x: e.clientX, y: e.clientY } : d);
    };
    const up = (e: PointerEvent) => {
      const cell = pointToCell(e.clientX, e.clientY);
      if (cell && drag) {
        if (drag.kind === "new") {
          const d = dims(drag.item, drag.rot);
          const adj = { row: cell.row, col: cell.col };
          // snap so item stays in bounds
          if (adj.col + d.w > GRID.cols) adj.col = GRID.cols - d.w;
          if (adj.row + d.h > GRID.rows) adj.row = GRID.rows - d.h;
          if (canPlace(adj.row, adj.col, d.w, d.h)) {
            setPlaced((p) => [...p, { ...drag.item, uid: `${drag.item.id}-${Date.now()}`, row: adj.row, col: adj.col, rot: drag.rot }]);
            setIterations((i) => i + 1);
          }
        } else {
          const p = placed.find((x) => x.uid === drag.uid);
          if (p) {
            const d = dims(p, p.rot);
            const adj = { row: cell.row, col: cell.col };
            if (adj.col + d.w > GRID.cols) adj.col = GRID.cols - d.w;
            if (adj.row + d.h > GRID.rows) adj.row = GRID.rows - d.h;
            if (canPlace(adj.row, adj.col, d.w, d.h, p.uid)) {
              setPlaced((all) => all.map((x) => x.uid === p.uid ? { ...x, row: adj.row, col: adj.col } : x));
              setIterations((i) => i + 1);
            }
          }
        }
      }
      setDrag(null);
      setHover(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag, placed]);

  const remove = (uid: string) => {
    setPlaced((p) => p.filter((x) => x.uid !== uid));
    setIterations((i) => i + 1);
    if (selected === uid) setSelected(null);
  };

  const rotate = (uid: string) => {
    const p = placed.find((x) => x.uid === uid);
    if (!p) return;
    const next: 0 | 1 = p.rot === 0 ? 1 : 0;
    const d = dims(p, next);
    if (canPlace(p.row, p.col, d.w, d.h, p.uid)) {
      setPlaced((all) => all.map((x) => x.uid === uid ? { ...x, rot: next } : x));
      setIterations((i) => i + 1);
    }
  };

  /* ----- scoring ----- */
  const cost = placed.reduce((s, p) => s + p.cost, 0);
  const space = placed.reduce((s, p) => { const d = dims(p, p.rot); return s + d.w * d.h; }, 0);
  const power = placed.reduce((s, p) => s + p.power, 0);
  const catCounts: Record<Cat, number> = { sleep: 0, work: 0, lounge: 0, tech: 0, decor: 0 };
  placed.forEach((p) => catCounts[p.cat]++);
  const vibeMatch = (() => {
    const want = vibe.want;
    const keys = Object.keys(want) as Cat[];
    let got = 0, total = 0;
    keys.forEach((k) => { total += want[k]!; got += Math.min(want[k]!, catCounts[k]); });
    return total === 0 ? 1 : got / total;
  })();
  const overBudget = Math.max(0, cost - BUDGET);
  const overPower = Math.max(0, power - POWER_MAX);
  const score = Math.max(0, Math.round(
    vibeMatch * 60
    + Math.min(20, placed.length * 2)
    + 20
    - overBudget / 20
    - overPower * 3
  ));

  const test = () => {
    setExperiments((e) => e + 1);
    setHistory((h) => [...h, score]);
  };

  const finish = () => {
    const improved = history.length >= 2 && history[history.length - 1] > history[0];
    const ks = computeKinestheticScore({ experiments, iterations, retries: 0, improved });
    record({ id: "dream-room", title: "Dream Room", experiments, iterations, retries: 0, improved, completedAt: Date.now(), kinestheticScore: ks });
    setDone(true);
  };

  const progress = Math.min(1, (experiments + iterations / 6) / 5);
  const selItem = placed.find((p) => p.uid === selected);

  return (
    <GameShell title="Design Your Dream Room" subtitle="Drag furniture in. Pick a vibe. Hit your goals." progress={progress} accent="purple">
      {/* Vibe picker */}
      <div className="card-pop !p-3">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2">Pick a vibe</div>
        <div className="grid grid-cols-3 gap-2">
          {VIBES.map((v) => {
            const active = v.id === vibe.id;
            return (
              <button
                key={v.id}
                onClick={() => { if (v.id !== vibe.id) { setVibe(v); setVibeChanges((n) => n + 1); } }}
                className="rounded-2xl border-2 p-2 transition-all"
                style={{
                  borderColor: active ? "var(--duo-purple)" : "var(--border)",
                  background: active ? "color-mix(in oklab, var(--duo-purple) 12%, white)" : "white",
                  transform: active ? "translateY(-2px)" : undefined,
                }}
              >
                <div className="text-2xl">{v.emoji}</div>
                <div className="text-xs font-extrabold mt-0.5">{v.label}</div>
                <div className="text-[10px] text-muted-foreground">{v.tip}</div>
              </button>
            );
          })}
        </div>
        {/* vibe checklist */}
        <div className="mt-2 flex flex-wrap gap-1">
          {(Object.keys(vibe.want) as Cat[]).map((c) => {
            const need = vibe.want[c]!;
            const have = catCounts[c];
            const ok = have >= need;
            return (
              <span key={c} className="chip text-[10px]" style={{ background: ok ? "color-mix(in oklab, var(--duo-green) 18%, white)" : "var(--secondary)", color: ok ? "var(--duo-green-dark)" : "var(--foreground)" }}>
                {ok ? "✓" : "•"} {c}: {have}/{need}
              </span>
            );
          })}
        </div>
      </div>

      {/* Meters */}
      <div className="card-pop !p-3 mt-3 space-y-2">
        <Meter label="Budget" value={cost} max={BUDGET} unit="$" color="var(--duo-green)" />
        <Meter label="Space"  value={space} max={SPACE_MAX} unit="sq" color="var(--duo-blue)" />
        <Meter label="Power"  value={power} max={POWER_MAX} unit="kW" color="var(--duo-yellow-dark)" />
      </div>

      {/* Floor plan */}
      <div className="card-pop !p-2 mt-3 select-none touch-none">
        <div
          ref={gridRef}
          className="relative rounded-lg overflow-hidden"
          style={{
            aspectRatio: `${GRID.cols} / ${GRID.rows}`,
            background: "repeating-linear-gradient(45deg, color-mix(in oklab, var(--duo-purple) 4%, white), color-mix(in oklab, var(--duo-purple) 4%, white) 12px, white 12px, white 24px)",
            border: "2px solid var(--border)",
          }}
          onClick={() => setSelected(null)}
        >
          {/* grid lines */}
          <div className="absolute inset-0 grid pointer-events-none"
            style={{ gridTemplateColumns: `repeat(${GRID.cols}, 1fr)`, gridTemplateRows: `repeat(${GRID.rows}, 1fr)` }}>
            {Array.from({ length: GRID.rows * GRID.cols }).map((_, i) => (
              <div key={i} className="border border-dashed border-border/40" />
            ))}
          </div>

          {/* hover preview */}
          {drag && hover && (() => {
            if (drag.kind === "move") {
              const item = placed.find((p) => p.uid === drag.uid);
              if (!item) return null;
              var rot: 0 | 1 = item.rot;
              var d = dims(item, rot);
            } else {
              var rot: 0 | 1 = drag.rot;
              var d = dims(drag.item, rot);
            }
            let row = hover.row, col = hover.col;
            if (col + d.w > GRID.cols) col = GRID.cols - d.w;
            if (row + d.h > GRID.rows) row = GRID.rows - d.h;
            const ok = canPlace(row, col, d.w, d.h, drag.kind === "move" ? drag.uid : undefined);
            return (
              <div className="absolute pointer-events-none rounded-lg border-2"
                style={{
                  left: `${(col / GRID.cols) * 100}%`,
                  top: `${(row / GRID.rows) * 100}%`,
                  width: `${(d.w / GRID.cols) * 100}%`,
                  height: `${(d.h / GRID.rows) * 100}%`,
                  background: ok ? "color-mix(in oklab, var(--duo-green) 25%, transparent)" : "color-mix(in oklab, var(--duo-red) 30%, transparent)",
                  borderColor: ok ? "var(--duo-green)" : "var(--duo-red)",
                }} />
            );
          })()}

          {/* placed items */}
          {placed.map((p) => {
            const d = dims(p, p.rot);
            const isSel = p.uid === selected;
            return (
              <div
                key={p.uid}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setSelected(p.uid);
                  setDrag({ kind: "move", uid: p.uid, x: e.clientX, y: e.clientY });
                }}
                onClick={(e) => e.stopPropagation()}
                className="absolute rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing animate-pop-in"
                style={{
                  left: `${(p.col / GRID.cols) * 100}%`,
                  top: `${(p.row / GRID.rows) * 100}%`,
                  width: `${(d.w / GRID.cols) * 100}%`,
                  height: `${(d.h / GRID.rows) * 100}%`,
                  background: "color-mix(in oklab, var(--duo-purple) 15%, white)",
                  border: `2px solid ${isSel ? "var(--duo-purple)" : "color-mix(in oklab, var(--duo-purple) 50%, white)"}`,
                  boxShadow: isSel ? "0 6px 0 var(--duo-purple-dark, color-mix(in oklab, var(--duo-purple) 70%, black))" : undefined,
                  opacity: drag?.kind === "move" && drag.uid === p.uid ? 0.4 : 1,
                  fontSize: `clamp(18px, ${Math.min(d.w, d.h) * 22}px, 36px)`,
                  transform: p.rot ? "rotate(90deg)" : undefined,
                  transformOrigin: "center",
                }}
                title="Tap to select · drag to move"
              >
                {p.emoji}
              </div>
            );
          })}
        </div>

        {/* selection toolbar */}
        {selItem && (
          <div className="mt-2 flex items-center gap-2 animate-pop-in">
            <div className="chip" style={{ background: "color-mix(in oklab, var(--duo-purple) 15%, white)", color: "var(--duo-purple)" }}>
              {selItem.emoji} {selItem.label}
            </div>
            <button onClick={() => rotate(selItem.uid)} className="btn-pop btn-pop-purple text-xs !py-2">
              <RotateCw className="size-4" />
            </button>
            <button onClick={() => remove(selItem.uid)} className="btn-pop btn-pop-red text-xs !py-2">
              <Trash2 className="size-4" />
            </button>
            <div className="text-[11px] text-muted-foreground">${selItem.cost} · {selItem.power}kW</div>
          </div>
        )}
      </div>

      {/* Catalog */}
      <div className="mt-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Catalog · press & drag in</div>
      <div className="grid grid-cols-4 gap-2 mt-2">
        {CATALOG.map((it) => {
          const dragging = drag?.kind === "new" && drag.item.id === it.id;
          return (
            <div key={it.id}
              onPointerDown={(e) => {
                e.preventDefault();
                setDrag({ kind: "new", item: it, rot: 0, x: e.clientX, y: e.clientY });
              }}
              className="card-pop !p-2 text-center cursor-grab active:cursor-grabbing"
              style={{ opacity: dragging ? 0.4 : 1 }}>
              <div className="text-2xl">{it.emoji}</div>
              <div className="text-[10px] font-extrabold">{it.label}</div>
              <div className="text-[9px] text-muted-foreground">${it.cost}{it.power ? ` · ${it.power}kW` : ""}</div>
            </div>
          );
        })}
      </div>

      {/* drag ghost */}
      {drag && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 text-3xl drop-shadow"
          style={{ left: drag.x, top: drag.y }}>
          {drag.kind === "new" ? drag.item.emoji : placed.find((p) => p.uid === drag.uid)?.emoji}
        </div>
      )}

      <FooterBar>
        <div className="card-pop !p-2 !shadow-none flex-1 flex items-center gap-2">
          <Sparkles className="size-4 text-[color:var(--duo-purple)]" />
          <span className="text-xs font-bold">Vibe</span>
          <span className="text-base font-black tabular-nums" style={{ color: "var(--duo-purple)" }}>
            {Math.round(vibeMatch * 100)}%
          </span>
          <span className="text-xs font-bold ml-2">Score</span>
          <span className="text-base font-black tabular-nums" style={{ color: "var(--duo-green-dark)" }}>{score}</span>
        </div>
        <button onClick={test} className="btn-pop btn-pop-purple text-sm">
          <Wand2 className="size-4 mr-1" /> Test #{experiments + 1}
        </button>
        {experiments > 0 && <button onClick={finish} className="btn-pop text-sm">Finish</button>}
      </FooterBar>

      {done && (
        <CompleteOverlay
          title="Room designed!"
          score={computeKinestheticScore({ experiments, iterations, retries: 0, improved: history.length >= 2 && history[history.length - 1] > history[0] })}
          message="Iterative tweaking = strong kinesthetic optimization."
          stats={[
            { label: "Iterations", value: iterations },
            { label: "Tests", value: experiments },
            { label: "Layout score", value: score },
            { label: "Vibes tried", value: vibeChanges + 1 },
          ]}
        />
      )}
    </GameShell>
  );
}

/* ------------------------- Meter ------------------------- */
function Meter({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const over = value > max;
  return (
    <div>
      <div className="flex justify-between text-xs font-bold">
        <span>{label}</span>
        <span style={{ color: over ? "var(--duo-red)" : "inherit" }}>{value}{unit} / {max}{unit}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden mt-0.5">
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: over ? "var(--duo-red)" : color }} />
      </div>
    </div>
  );
}