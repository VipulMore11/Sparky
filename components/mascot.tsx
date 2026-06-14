"use client"

import { cn } from "@/lib/utils"

type MascotProps = {
  size?: number
  className?: string
  /** subtle idle bob animation */
  animate?: boolean
}

/**
 * Placeholder mascot image. Swap /public/mascot.png (or this src)
 * with an animated GIF loop later — the component API stays the same.
 */
export function Mascot({ size = 120, className, animate = true }: MascotProps) {
  return (
    <div
      className={cn("relative shrink-0", animate && "animate-bounce-slow", className)}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-x-4 bottom-1 h-3 rounded-[50%] bg-black/30 blur-[2px]"
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/mascot.png"
        alt="Sparky, your friendly STEM guide"
        width={size}
        height={size}
        className="relative h-full w-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
      />
    </div>
  )
}

type SpeechBubbleProps = {
  children: React.ReactNode
  className?: string
  /** which side the little tail points */
  tail?: "bottom" | "left" | "none"
}

export function SpeechBubble({ children, className, tail = "bottom" }: SpeechBubbleProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 border-border bg-card px-5 py-3 text-pretty text-base font-bold leading-relaxed text-card-foreground md:text-lg",
        className,
      )}
    >
      {children}
      {tail === "bottom" && (
        <span
          className="absolute -bottom-2 left-8 h-4 w-4 rotate-45 border-b-2 border-r-2 border-border bg-card"
          aria-hidden
        />
      )}
      {tail === "left" && (
        <span
          className="absolute -left-2 top-6 h-4 w-4 rotate-45 border-b-2 border-l-2 border-border bg-card"
          aria-hidden
        />
      )}
    </div>
  )
}
