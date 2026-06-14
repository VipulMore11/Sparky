import { useState, useEffect } from "react"
import { Volume2, X, Heart, ArrowRight, Check, RotateCcw } from "lucide-react"
import { Mascot } from "@/components/mascot"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface InteractionLayoutProps {
  question: string
  ttsSpeak: (text: string) => void
  children: React.ReactNode
  onSkip: () => void
  onCheck: () => void
  onContinue: () => void
  canCheck: boolean
  status: "idle" | "correct" | "incorrect"
  progress?: number // 0 to 100
  onClose?: () => void
}

import Confetti from "react-confetti"

export function InteractionLayout({
  question,
  ttsSpeak,
  children,
  onSkip,
  onCheck,
  onContinue,
  canCheck,
  status,
  progress = 20,
  onClose,
}: InteractionLayoutProps) {
  useEffect(() => {
    // Auto-play the question on mount 
    ttsSpeak(question)
  }, [question, ttsSpeak])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      {/* Top Bar */}
      <div className="flex h-16 items-center gap-4 px-5">
        <button
          onClick={onClose}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-7 w-7" />
        </button>
        
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-1.5 font-extrabold text-destructive text-xl">
          <Heart className="h-6 w-6 fill-destructive" />
          <span>5</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center w-full px-4 pb-32">
        <div className="flex items-start gap-4 mb-8 w-full max-w-2xl">
          <Mascot size={100} animate={true} />
          
          <div className="flex flex-col items-start gap-2 pt-4">
            <div className="relative bg-card text-foreground p-5 rounded-3xl rounded-tl-none font-bold text-xl md:text-2xl border-2 border-border flex items-center gap-4">
              <button 
                onClick={() => ttsSpeak(question)}
                className="text-primary hover:opacity-80 transition-opacity active:scale-95 shrink-0"
              >
                <Volume2 className="h-8 w-8" />
              </button>
              <span className="leading-tight">{question}</span>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center animate-in slide-in-from-right-4 duration-300">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 border-t-2 transition-colors",
        status === "correct" && "border-primary/30 bg-primary/10",
        status === "incorrect" && "border-destructive/30 bg-destructive/10",
        status === "idle" && "border-border bg-background"
      )}>
        {status === "correct" && <Confetti recycle={false} numberOfPieces={200} />}
        <div className="max-w-2xl mx-auto px-5 py-4 sm:py-6 flex flex-col gap-4 relative">
          
          {status === "correct" && (
            <div className="mb-2 flex items-start gap-4 font-extrabold text-primary animate-in slide-in-from-bottom-2">
              <div className="hidden sm:block -ml-16 -mt-24">
                <Mascot size={140} animate={true} />
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-5" strokeWidth={4} />
                  </div>
                  <p className="text-2xl">Awesome work!</p>
                </div>
              </div>
            </div>
          )}

          {status === "incorrect" && (
            <div className="mb-2 flex items-start gap-3 font-extrabold text-destructive animate-in slide-in-from-bottom-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                <X className="size-5" strokeWidth={4} />
              </div>
              <p className="text-xl">Not quite, let's try again.</p>
            </div>
          )}

          <div className="flex gap-4">
            {status === "idle" ? (
              <>
                <Button
                  onClick={onSkip}
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 rounded-2xl border-2 text-lg font-extrabold uppercase tracking-wide"
                >
                  Skip
                </Button>
                <Button
                  onClick={onCheck}
                  disabled={!canCheck}
                  size="lg"
                  className={cn(
                    "h-14 flex-1 rounded-2xl text-lg font-extrabold uppercase tracking-wide transition-all",
                    !canCheck ? "bg-muted text-muted-foreground border-b-0" : "bg-primary border-b-4 active:translate-y-1 active:border-b-0"
                  )}
                >
                  Check
                </Button>
              </>
            ) : status === "correct" ? (
              <Button
                onClick={onContinue}
                size="lg"
                className="h-14 flex-1 rounded-2xl border-b-4 border-primary/40 bg-primary text-lg font-extrabold uppercase tracking-wide text-primary-foreground hover:bg-primary transition-all active:translate-y-1 active:border-b-0"
              >
                Continue
                <ArrowRight className="ml-2 size-5" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={onSkip}
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 rounded-2xl border-2 text-lg font-extrabold uppercase tracking-wide"
                >
                  Skip
                </Button>
                <Button
                  onClick={onContinue}
                  size="lg"
                  className="h-14 flex-1 rounded-2xl border-b-4 border-destructive/40 bg-destructive text-lg font-extrabold uppercase tracking-wide text-primary-foreground transition-all hover:bg-destructive active:translate-y-1 active:border-b-0"
                >
                  <RotateCcw className="mr-2 size-5" />
                  Try Again
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
