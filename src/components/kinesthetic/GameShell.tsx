import { Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "motion/react";

interface GameShellProps {
  title: string;
  subtitle?: string;
  progress: number; // 0–1
  lives?: number;
  children: ReactNode;
}

export function GameShell({ title, subtitle, progress, lives = 3, children }: GameShellProps) {
  return (
    <div className="min-h-screen w-full">
      {/* Top HUD */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b-2 border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 sm:gap-4">
          <Link
            to="/"
            className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-border bg-card shadow-[0_4px_0_0_var(--color-border)] hover:brightness-95 active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-border)]"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-muted ring-2 ring-border">
            <motion.div
              initial={false}
              animate={{ width: `${Math.round(progress * 100)}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="h-full rounded-full bg-primary"
              style={{ boxShadow: "inset 0 -4px 0 0 var(--color-primary-shadow)" }}
            />
            <div className="pointer-events-none absolute inset-y-0 left-2 top-0 h-1 w-[calc(100%-1rem)] rounded-full bg-white/40 mt-1" />
          </div>

          <div className="flex items-center gap-1 rounded-2xl border-2 border-border bg-card px-3 py-1.5 shadow-[0_4px_0_0_var(--color-border)]">
            <Heart className="h-5 w-5 fill-accent text-accent" />
            <span className="kinetic-display text-lg text-accent-shadow">{lives}</span>
          </div>
        </div>

        <div className="mx-auto flex max-w-5xl items-baseline gap-2 px-4 pb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h1 className="kinetic-display text-lg sm:text-xl">{title}</h1>
          {subtitle && <span className="text-sm text-muted-foreground">— {subtitle}</span>}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6">{children}</main>
    </div>
  );
}

export function StarBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => {
        const palette = ["var(--paint-red)", "var(--paint-yellow)", "var(--paint-blue)", "var(--paint-green)", "var(--paint-purple)", "var(--paint-orange)"];
        const angle = (i / 18) * Math.PI * 2;
        return (
          <span
            key={i}
            className="confetti-burst absolute left-1/2 top-1/2 h-3 w-3 rounded-sm"
            style={{
              backgroundColor: palette[i % palette.length],
              transform: `translate(${Math.cos(angle) * 4}px, ${Math.sin(angle) * 4}px)`,
              animationDelay: `${i * 20}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
