import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";

interface Props {
  title: string;
  score: number;
  stats: { label: string; value: React.ReactNode }[];
  message?: string;
}

export function CompleteOverlay({ title, score, stats, message }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-pop-in">
      <div className="w-full max-w-md card-pop !p-6 animate-pop-in" style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--duo-green) 14%, white), white)" }}>
        <div className="flex items-center gap-2 chip" style={{ background: "var(--duo-green)", color: "white" }}>
          <Sparkles className="size-3.5" /> CHALLENGE COMPLETE
        </div>
        <h2 className="text-2xl font-extrabold mt-3">{title}</h2>
        {message && <p className="text-sm text-muted-foreground mt-1">{message}</p>}
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-6xl font-black" style={{ color: "var(--duo-green-dark)" }}>{score}</span>
          <span className="text-sm font-bold text-muted-foreground">/ 100 kinesthetic signal</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border-2 border-border p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className="text-xl font-extrabold">{s.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <Link to="/kinesthetic" className="btn-pop flex-1 text-sm justify-center">
            More games <ArrowRight className="ml-2 size-4" />
          </Link>
          <Link to="/kinesthetic/summary" className="btn-pop btn-pop-blue text-sm justify-center">
            Results
          </Link>
        </div>
      </div>
    </div>
  );
}