import { Link, useNavigate } from "@tanstack/react-router";
import { X, Heart } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  progress: number; // 0..1
  hearts?: number;
  accent?: "green" | "blue" | "yellow" | "red" | "purple";
  children: ReactNode;
  onExit?: () => void;
}

const accentMap = {
  green: "var(--duo-green)",
  blue: "var(--duo-blue)",
  yellow: "var(--duo-yellow)",
  red: "var(--duo-red)",
  purple: "var(--duo-purple)",
};

export function GameShell({ title, subtitle, progress, hearts, accent = "green", children, onExit }: Props) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 pt-4 pb-3 flex items-center gap-3 max-w-2xl mx-auto w-full">
        <button
          onClick={() => (onExit ? onExit() : navigate({ to: "/kinesthetic" }))}
          className="text-muted-foreground hover:text-foreground p-1.5"
          aria-label="Exit"
        >
          <X className="size-6" />
        </button>
        <div className="flex-1 h-4 rounded-full bg-secondary overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(4, Math.round(progress * 100))}%`,
              backgroundColor: accentMap[accent],
              boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.15), inset 0 4px 0 rgba(255,255,255,0.3)",
            }}
          />
        </div>
        {typeof hearts === "number" && (
          <div className="flex items-center gap-1 font-bold text-[color:var(--duo-red)]">
            <Heart className="size-5 fill-current" />
            <span>{hearts}</span>
          </div>
        )}
      </header>
      <div className="px-4 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <main className="flex-1 px-4 pb-28 pt-4 max-w-2xl mx-auto w-full">{children}</main>
    </div>
  );
}

export function FooterBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed bottom-0 inset-x-0 border-t-2 border-border bg-card/95 backdrop-blur z-30">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {children}
      </div>
    </div>
  );
}

export function Stat({ label, value, color = "var(--duo-blue)" }: { label: string; value: ReactNode; color?: string }) {
  return (
    <div className="card-pop !p-3 text-center min-w-[80px]">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-extrabold" style={{ color }}>{value}</div>
    </div>
  );
}

export { Link };