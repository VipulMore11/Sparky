import { ArrowLeft, Heart, Sparkles } from "lucide-react"
import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Mascot } from "@/components/mascot"

interface GameShellProps {
  title: string
  subtitle?: string
  progress: number // 0–100
  lives?: number
  onClose: () => void
  children: ReactNode
}

export function GameShell({ title, subtitle, progress, lives = 3, onClose, children }: GameShellProps) {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col font-sans">
      {/* Top HUD */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b-2 border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 sm:gap-4">
          <button
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-border bg-card shadow-[0_4px_0_0_var(--color-border)] hover:brightness-95 active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-border)]"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-muted ring-2 ring-border">
            <motion.div
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="h-full rounded-full bg-primary"
            />
          </div>

          <div className="flex items-center gap-1 rounded-2xl border-2 border-border bg-card px-3 py-1.5 shadow-[0_4px_0_0_var(--color-border)]">
            <Heart className="h-5 w-5 fill-destructive text-destructive" />
            <span className="font-extrabold text-lg text-destructive">{lives}</span>
          </div>
        </div>

        <div className="mx-auto flex max-w-5xl items-baseline gap-2 px-4 pb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="font-extrabold text-lg sm:text-xl">{title}</h1>
          {subtitle && <span className="text-sm font-bold text-muted-foreground">— {subtitle}</span>}
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 pb-24 pt-6">{children}</main>
    </div>
  )
}

export function StarBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => {
        const palette = ["#ef4444", "#eab308", "#3b82f6", "#22c55e", "#a855f7", "#f97316"]
        const angle = (i / 18) * Math.PI * 2
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 h-3 w-3 rounded-sm animate-ping"
            style={{
              backgroundColor: palette[i % palette.length],
              transform: `translate(${Math.cos(angle) * 40}px, ${Math.sin(angle) * 40}px)`,
              animationDelay: `${i * 20}ms`,
            }}
          />
        )
      })}
    </div>
  )
}

export function MascotMessage({ message, mood = "happy" }: { message: string; mood?: string }) {
  return (
    <div className="flex items-end gap-3">
      <Mascot size={90} animate={true} />
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        key={message}
        className="relative max-w-xs rounded-2xl border-2 border-border bg-card px-4 py-3 text-base font-bold text-foreground shadow-[0_4px_0_0_var(--color-border)] mb-4"
      >
        <span className="absolute -left-2 bottom-4 h-4 w-4 rotate-45 border-b-2 border-l-2 border-border bg-card" />
        {message}
      </motion.div>
    </div>
  )
}
