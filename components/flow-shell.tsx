"use client"

import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

type FlowShellProps = {
  /** 0-100 */
  progress: number
  onBack?: () => void
  canContinue?: boolean
  onContinue?: () => void
  continueLabel?: string
  children: React.ReactNode
  /** hide the footer continue bar entirely */
  hideFooter?: boolean
}

export function FlowShell({
  progress,
  onBack,
  canContinue = true,
  onContinue,
  continueLabel = "CONTINUE",
  children,
  hideFooter = false,
}: FlowShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* top bar with back + progress */}
      <header className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 pt-6 md:pt-8">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          aria-label="Go back"
          className="text-muted-foreground transition-colors enabled:hover:text-foreground disabled:opacity-30"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div
          className="h-4 flex-1 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(4, progress)}%` }}
          />
        </div>
      </header>

      {/* main content */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-10">
        {children}
      </main>

      {/* footer continue bar */}
      {!hideFooter && (
        <footer className="border-t border-border">
          <div className="mx-auto flex w-full max-w-3xl justify-end px-4 py-4">
            <button
              type="button"
              onClick={onContinue}
              disabled={!canContinue}
              className={cn(
                "rounded-2xl border-b-4 px-10 py-3 text-base font-extrabold tracking-wide transition-all active:translate-y-0.5 active:border-b-2",
                canContinue
                  ? "border-primary/40 bg-primary text-primary-foreground hover:brightness-105"
                  : "cursor-not-allowed border-transparent bg-muted text-muted-foreground",
              )}
            >
              {continueLabel}
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}
