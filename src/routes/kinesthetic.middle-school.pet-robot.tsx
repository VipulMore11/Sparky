import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GameShell, FooterBar } from "@/components/kinesthetic/GameShell";
import { CompleteOverlay } from "@/components/kinesthetic/CompleteOverlay";
import { useKinestheticStore, computeKinestheticScore } from "@/lib/kinesthetic-store";
import { Play, Trash2, ArrowUp, RotateCcw, RotateCw } from "lucide-react";

export const Route = createFileRoute("/kinesthetic/middle-school/pet-robot")({
  head: () => ({ meta: [{ title: "Pet Rescue Robot" }] }),
  component: Game,
});

const SIZE = 5;
const START = { r: 4, c: 0, dir: 0 }; // 0=right
const GOAL = { r: 0, c: 4 };
const WALLS = new Set(["2,1", "2,2", "1,3"]);

type Block = "F" | "L" | "R";

function Game() {
  const [seq, setSeq] = useState<Block[]>([]);
  const [robot, setRobot] = useState(START);
  const [running, setRunning] = useState(false);
  const [runs, setRuns] = useState(0);
  const [debugs, setDebugs] = useState(0);
  const [results, setResults] = useState<("ok" | "fail")[]>([]);
  const [done, setDone] = useState(false);
  const [lastSeqLen, setLastSeqLen] = useState(0);
  const record = useKinestheticStore((s) => s.record);

  const add = (b: Block) => setSeq((s) => [...s, b]);
  const remove = (i: number) => { setSeq((s) => s.filter((_, j) => j !== i)); setDebugs((d) => d + 1); };
  const clear = () => { if (seq.length) setDebugs((d) => d + 1); setSeq([]); setRobot(START); };

  const run = async () => {
    if (running || seq.length === 0) return;
    setRunning(true);
    setRobot(START);
    setRuns((r) => r + 1);
    if (runs > 0 && seq.length !== lastSeqLen) setDebugs((d) => d + 1);
    setLastSeqLen(seq.length);
    let cur = { ...START };
    let crashed = false;
    for (const b of seq) {
      await new Promise((res) => setTimeout(res, 280));
      if (b === "L") cur = { ...cur, dir: (cur.dir + 3) % 4 };
      else if (b === "R") cur = { ...cur, dir: (cur.dir + 1) % 4 };
      else {
        const dr = [0, 1, 0, -1][cur.dir];
        const dc = [1, 0, -1, 0][cur.dir];
        const nr = cur.r + dr, nc = cur.c + dc;
        if (nr < 0 || nc < 0 || nr >= SIZE || nc >= SIZE || WALLS.has(`${nr},${nc}`)) {
          crashed = true;
          break;
        }
        cur = { ...cur, r: nr, c: nc };
      }
      setRobot(cur);
    }
    const won = !crashed && cur.r === GOAL.r && cur.c === GOAL.c;
    setResults((r) => [...r, won ? "ok" : "fail"]);
    setRunning(false);
    if (won) setTimeout(finish, 700);
  };

  const finish = () => {
    const improved = results.includes("fail") && results[results.length - 1] !== "fail";
    const score = computeKinestheticScore({ experiments: runs, iterations: 0, retries: debugs, improved });
    record({ id: "pet-robot", title: "Pet Rescue Robot", experiments: runs, iterations: 0, retries: debugs, improved, completedAt: Date.now(), kinestheticScore: score });
    setDone(true);
  };

  const progress = Math.min(1, runs / 3);

  return (
    <GameShell title="Pet Rescue Robot" subtitle="Stack movement blocks → rescue the pet 🐶" progress={progress} accent="purple">
      <div className="card-pop !p-3">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0,1fr))` }}>
          {Array.from({ length: SIZE }).map((_, r) =>
            Array.from({ length: SIZE }).map((_, c) => {
              const isWall = WALLS.has(`${r},${c}`);
              const isGoal = r === GOAL.r && c === GOAL.c;
              const isBot = robot.r === r && robot.c === c;
              return (
                <div
                  key={`${r}-${c}`}
                  className="aspect-square rounded-lg border-2 flex items-center justify-center text-xl relative"
                  style={{
                    background: isWall ? "var(--muted-foreground)" : "white",
                    borderColor: "var(--border)",
                  }}
                >
                  {isGoal && !isBot && <span>🐶</span>}
                  {isBot && (
                    <div className="text-2xl transition-transform" style={{ transform: `rotate(${[0, 90, 180, 270][robot.dir]}deg)` }}>🤖</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Movement blocks</div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        <BlockBtn onClick={() => add("F")} bg="var(--duo-purple)" icon={<ArrowUp className="size-5" />} label="Forward" />
        <BlockBtn onClick={() => add("L")} bg="var(--duo-blue)" icon={<RotateCcw className="size-5" />} label="Turn Left" />
        <BlockBtn onClick={() => add("R")} bg="var(--duo-blue)" icon={<RotateCw className="size-5" />} label="Turn Right" />
      </div>

      <div className="mt-4 card-pop !p-3 min-h-[64px]">
        <div className="flex flex-wrap gap-1.5">
          {seq.length === 0 && <span className="text-xs text-muted-foreground py-1">Tap blocks above to build a sequence →</span>}
          {seq.map((b, i) => (
            <button
              key={i}
              onClick={() => remove(i)}
              className="size-9 rounded-lg text-white font-bold flex items-center justify-center animate-pop-in"
              style={{ background: b === "F" ? "var(--duo-purple)" : "var(--duo-blue)" }}
              title="Remove"
            >
              {b === "F" ? <ArrowUp className="size-4" /> : b === "L" ? <RotateCcw className="size-4" /> : <RotateCw className="size-4" />}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Runs: {runs}</span>·<span>Debugs: {debugs}</span>
          <div className="ml-auto flex gap-1">{results.map((r, i) => <span key={i} className={`size-2.5 rounded-full ${r === "ok" ? "bg-[color:var(--duo-green)]" : "bg-[color:var(--duo-red)]"}`} />)}</div>
        </div>
      </div>

      <FooterBar>
        <button onClick={clear} className="btn-pop btn-pop-yellow text-sm"><Trash2 className="size-4" /></button>
        <button onClick={run} disabled={running || seq.length === 0} className="btn-pop btn-pop-purple flex-1 disabled:opacity-40">
          <Play className="size-4 mr-2 fill-current" /> {running ? "Running..." : `Run #${runs + 1}`}
        </button>
        {runs > 0 && <button onClick={finish} className="btn-pop text-sm">Finish</button>}
      </FooterBar>

      {done && (
        <CompleteOverlay
          title="Pet rescued!"
          score={computeKinestheticScore({ experiments: runs, iterations: 0, retries: debugs, improved: results.includes("fail") && results[results.length - 1] === "ok" })}
          message="Trial-and-error debugging = kinesthetic learning in action."
          stats={[
            { label: "Runs", value: runs },
            { label: "Debugs", value: debugs },
            { label: "Crashes", value: results.filter((r) => r === "fail").length },
            { label: "Solved", value: results.includes("ok") ? "✓" : "—" },
          ]}
        />
      )}
    </GameShell>
  );
}

function BlockBtn({ onClick, bg, icon, label }: { onClick: () => void; bg: string; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className="card-pop !p-3 flex flex-col items-center gap-1 active:translate-y-0.5">
      <div className="size-10 rounded-xl flex items-center justify-center text-white" style={{ background: bg }}>{icon}</div>
      <span className="text-[11px] font-bold">{label}</span>
    </button>
  );
}