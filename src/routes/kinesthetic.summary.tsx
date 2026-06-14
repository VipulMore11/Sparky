import { createFileRoute, Link } from "@tanstack/react-router";
import { useKinestheticStore } from "@/lib/kinesthetic-store";
import { Trophy, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/kinesthetic/summary")({
  head: () => ({ meta: [{ title: "Your Kinesthetic Profile" }] }),
  component: Summary,
});

function Summary() {
  const { results } = useKinestheticStore();
  const list = Object.values(results);
  const avg = list.length ? Math.round(list.reduce((s, r) => s + r.kinestheticScore, 0) / list.length) : 0;
  const totalExp = list.reduce((s, r) => s + r.experiments, 0);
  const totalIter = list.reduce((s, r) => s + r.iterations, 0);
  const totalRetry = list.reduce((s, r) => s + r.retries, 0);
  const improved = list.filter((r) => r.improved).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link to="/kinesthetic" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground gap-1">
          <ArrowLeft className="size-4" /> Back to modules
        </Link>
        <div className="card-pop mt-4 text-center !p-8" style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--duo-green) 12%, white), white)" }}>
          <Trophy className="size-12 mx-auto text-[color:var(--duo-yellow-dark)]" />
          <div className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mt-3">Kinesthetic Signal Score</div>
          <div className="text-7xl font-black mt-1" style={{ color: "var(--duo-green-dark)" }}>{avg}</div>
          <div className="text-sm text-muted-foreground">across {list.length} of 8 challenges</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <Tile label="Experiments" value={totalExp} color="var(--duo-blue)" />
          <Tile label="Iterations" value={totalIter} color="var(--duo-purple)" />
          <Tile label="Retries" value={totalRetry} color="var(--duo-orange)" />
          <Tile label="Improved" value={`${improved}/${list.length || 0}`} color="var(--duo-green-dark)" />
        </div>

        <h2 className="mt-8 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Per-module results</h2>
        <div className="mt-3 space-y-2">
          {list.length === 0 && (
            <p className="text-sm text-muted-foreground">Play a module to see results here.</p>
          )}
          {list.map((r) => (
            <div key={r.id} className="card-pop !p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-extrabold">{r.title}</div>
                <div className="text-xs text-muted-foreground">
                  {r.experiments} experiments · {r.iterations} iterations · {r.retries} retries {r.improved && "· improved"}
                </div>
              </div>
              <div className="text-2xl font-black" style={{ color: "var(--duo-green-dark)" }}>{r.kinestheticScore}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="card-pop !p-3 text-center">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
    </div>
  );
}