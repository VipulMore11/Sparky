import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { GameShell, FooterBar } from "@/components/kinesthetic/GameShell";
import { CompleteOverlay } from "@/components/kinesthetic/CompleteOverlay";
import { useKinestheticStore, computeKinestheticScore } from "@/lib/kinesthetic-store";
import { Check, ArrowRight, Delete } from "lucide-react";

export const Route = createFileRoute("/kinesthetic/teens/escape-room")({
  head: () => ({ meta: [{ title: "Escape Room Engineer" }] }),
  component: Game,
});

function Game() {
  const [stage, setStage] = useState(0);
  const [retries, setRetries] = useState(0);
  const [experiments, setExperiments] = useState(0);
  const [done, setDone] = useState(false);
  const record = useKinestheticStore((s) => s.record);

  const next = () => setStage((s) => s + 1);
  const finish = () => {
    const ks = computeKinestheticScore({ experiments, iterations: 0, retries, improved: retries > 0 && stage >= 3 });
    record({ id: "escape-room", title: "Escape Room Engineer", experiments, iterations: 0, retries, improved: retries > 0, completedAt: Date.now(), kinestheticScore: ks });
    setDone(true);
  };

  const progress = stage / 3;

  return (
    <GameShell title="Escape Room Engineer" subtitle={`Room ${Math.min(stage + 1, 3)} of 3 · Find the way out 🗝️`} progress={progress} accent="red">
      {stage === 0 && <WireMatch onSolve={() => { next(); setExperiments((e) => e + 1); }} onRetry={() => setRetries((r) => r + 1)} />}
      {stage === 1 && <CodeLock onSolve={() => { next(); setExperiments((e) => e + 1); }} onRetry={() => setRetries((r) => r + 1)} />}
      {stage === 2 && <PathDraw onSolve={() => { next(); setExperiments((e) => e + 1); }} onRetry={() => setRetries((r) => r + 1)} />}
      {stage >= 3 && (
        <div className="card-pop !p-6 text-center">
          <div className="text-6xl">🚪</div>
          <div className="text-xl font-extrabold mt-2">You escaped!</div>
          <button onClick={finish} className="btn-pop btn-pop-red mt-4">See results <ArrowRight className="ml-2 size-4" /></button>
        </div>
      )}

      {done && (
        <CompleteOverlay
          title="Escape successful!"
          score={computeKinestheticScore({ experiments, iterations: 0, retries, improved: retries > 0 })}
          message="You learned by interacting with the environment."
          stats={[
            { label: "Puzzles", value: 3 },
            { label: "Retries", value: retries },
            { label: "Style", value: "Hands-on" },
            { label: "Result", value: "Free!" },
          ]}
        />
      )}
    </GameShell>
  );
}

// ===== Puzzle 1: Wire Match =====
const WIRES = [
  { id: "r", color: "var(--duo-red)", label: "🔴" },
  { id: "b", color: "var(--duo-blue)", label: "🔵" },
  { id: "y", color: "var(--duo-yellow-dark)", label: "🟡" },
  { id: "g", color: "var(--duo-green)", label: "🟢" },
];
function shuffle<T>(arr: T[]) { return arr.slice().sort(() => Math.random() - 0.5); }

function WireMatch({ onSolve, onRetry }: { onSolve: () => void; onRetry: () => void }) {
  // Initialize with stable order to avoid SSR/client hydration mismatch,
  // then shuffle once on the client after mount.
  const [right, setRight] = useState(WIRES);
  useEffect(() => { setRight(shuffle(WIRES)); }, []);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [drag, setDrag] = useState<string | null>(null);

  const allCorrect = Object.keys(matches).length === WIRES.length && WIRES.every((w) => matches[w.id] === w.id);
  const tryDrop = (rightId: string) => {
    if (!drag) return;
    setMatches((m) => ({ ...m, [drag]: rightId }));
    setDrag(null);
  };
  useEffect(() => {
    if (Object.keys(matches).length === WIRES.length && !allCorrect) {
      onRetry();
      setTimeout(() => setMatches({}), 600);
    }
    if (allCorrect) setTimeout(onSolve, 600);
  }, [matches]);

  return (
    <div className="card-pop !p-4">
      <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">🔌 Connect each wire to its color</div>
      <div className="grid grid-cols-2 gap-6 items-center">
        <div className="space-y-3">
          {WIRES.map((w) => (
            <div
              key={w.id}
              draggable
              onDragStart={() => setDrag(w.id)}
              className="h-12 rounded-xl flex items-center justify-end pr-4 text-white font-bold cursor-grab active:cursor-grabbing"
              style={{ background: w.color, opacity: matches[w.id] ? 0.4 : 1 }}
            >
              ━━{w.label}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {right.map((w) => {
            const matched = Object.entries(matches).find(([, v]) => v === w.id);
            return (
              <div
                key={w.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => tryDrop(w.id)}
                className="h-12 rounded-xl border-2 border-dashed flex items-center pl-4 font-bold transition-all"
                style={{
                  borderColor: matched ? (matched[0] === w.id ? "var(--duo-green)" : "var(--duo-red)") : "var(--border)",
                  background: matched ? "color-mix(in oklab, " + (matched[0] === w.id ? "var(--duo-green)" : "var(--duo-red)") + " 15%, white)" : "white",
                }}
              >
                {w.label}━━
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== Puzzle 2: Code Lock =====
function CodeLock({ onSolve, onRetry }: { onSolve: () => void; onRetry: () => void }) {
  const SECRET = "4271";
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const submit = () => {
    if (code.length !== 4) return;
    if (code === SECRET) {
      setFeedback("✓ Unlocked");
      setTimeout(onSolve, 600);
    } else {
      let hit = 0, near = 0;
      for (let i = 0; i < 4; i++) {
        if (code[i] === SECRET[i]) hit++;
        else if (SECRET.includes(code[i])) near++;
      }
      setFeedback(`${hit} correct · ${near} in wrong place`);
      onRetry();
      setTimeout(() => { setCode(""); setFeedback(null); }, 1200);
    }
  };

  return (
    <div className="card-pop !p-4">
      <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">🔢 Crack the 4-digit lock</div>
      <div className="flex justify-center gap-2 my-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="size-14 rounded-xl border-2 border-border flex items-center justify-center text-2xl font-black" style={{ background: code[i] ? "color-mix(in oklab, var(--duo-red) 12%, white)" : "white" }}>
            {code[i] ?? ""}
          </div>
        ))}
      </div>
      {feedback && <div className="text-center text-sm font-bold mb-2" style={{ color: feedback.startsWith("✓") ? "var(--duo-green-dark)" : "var(--duo-orange)" }}>{feedback}</div>}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} onClick={() => code.length < 4 && setCode(code + n)} className="btn-pop btn-pop-red !py-3 text-lg">{n}</button>
        ))}
        <button onClick={() => setCode(code.slice(0, -1))} className="btn-pop btn-pop-yellow !py-3"><Delete className="size-5" /></button>
        <button onClick={() => code.length < 4 && setCode(code + 0)} className="btn-pop btn-pop-red !py-3 text-lg">0</button>
        <button onClick={submit} disabled={code.length !== 4} className="btn-pop !py-3 disabled:opacity-40"><Check className="size-5" /></button>
      </div>
      <div className="text-[11px] text-muted-foreground mt-2 text-center">Hint: try anything — the lock will tell you what's right.</div>
    </div>
  );
}

// ===== Puzzle 3: Path Draw =====
const PSIZE = 6;
const PWALLS = new Set(["1,1", "1,2", "1,3", "3,2", "3,3", "3,4", "2,4", "4,1"]);
const PSTART = { r: 5, c: 0 }, PEND = { r: 0, c: 5 };

function PathDraw({ onSolve, onRetry }: { onSolve: () => void; onRetry: () => void }) {
  const [path, setPath] = useState<{ r: number; c: number }[]>([PSTART]);
  const [drawing, setDrawing] = useState(false);
  const failedRef = useRef(false);

  const enter = (r: number, c: number) => {
    if (!drawing) return;
    if (PWALLS.has(`${r},${c}`)) { fail(); return; }
    const last = path[path.length - 1];
    if (last.r === r && last.c === c) return;
    if (Math.abs(last.r - r) + Math.abs(last.c - c) !== 1) return;
    // backtrack
    if (path.length >= 2 && path[path.length - 2].r === r && path[path.length - 2].c === c) {
      setPath((p) => p.slice(0, -1)); return;
    }
    if (path.some((p) => p.r === r && p.c === c)) return;
    setPath((p) => [...p, { r, c }]);
    if (r === PEND.r && c === PEND.c) { setDrawing(false); setTimeout(onSolve, 500); }
  };

  const fail = () => {
    if (failedRef.current) return;
    failedRef.current = true;
    setDrawing(false);
    onRetry();
    setTimeout(() => { setPath([PSTART]); failedRef.current = false; }, 700);
  };

  return (
    <div className="card-pop !p-3">
      <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">✏️ Trace a path from 🟢 to 🚪 (no walls)</div>
      <div
        className="grid gap-0.5 select-none touch-none"
        style={{ gridTemplateColumns: `repeat(${PSIZE}, minmax(0,1fr))` }}
        onPointerDown={() => setDrawing(true)}
        onPointerUp={() => setDrawing(false)}
        onPointerLeave={() => setDrawing(false)}
      >
        {Array.from({ length: PSIZE }).map((_, r) =>
          Array.from({ length: PSIZE }).map((_, c) => {
            const wall = PWALLS.has(`${r},${c}`);
            const inPath = path.some((p) => p.r === r && p.c === c);
            const isStart = r === PSTART.r && c === PSTART.c;
            const isEnd = r === PEND.r && c === PEND.c;
            return (
              <div
                key={`${r}-${c}`}
                onPointerEnter={() => enter(r, c)}
                onPointerDown={() => { if (isStart) setDrawing(true); }}
                className="aspect-square rounded-md flex items-center justify-center text-base"
                style={{
                  background: wall ? "var(--muted-foreground)" : inPath ? "color-mix(in oklab, var(--duo-red) 35%, white)" : "white",
                  border: "2px solid var(--border)",
                }}
              >
                {isStart ? "🟢" : isEnd ? "🚪" : ""}
              </div>
            );
          })
        )}
      </div>
      <div className="text-[11px] text-muted-foreground mt-2 text-center">Press & drag from the green tile.</div>
    </div>
  );
}