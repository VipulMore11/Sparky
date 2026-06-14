"use client"

import Link from "next/link"
import { Sparkles, Star, Gamepad2 } from "lucide-react"
import {
  LEARNING_STYLES,
  STYLE_ORDER,
  type StyleKey,
} from "@/lib/learning-styles"
import { useProfile } from "@/lib/use-profile"
import { cn } from "@/lib/utils"

type SidebarProps = {
  active: StyleKey | "games"
}

export function Sidebar({ active }: SidebarProps) {
  const { profile } = useProfile()

  return (
    <aside className="hidden h-svh w-64 shrink-0 flex-col border-r border-border bg-sidebar px-3 py-5 lg:flex">
      <Link href="/learn" className="mb-6 flex items-center gap-2 px-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </span>
        <span className="text-2xl font-extrabold tracking-tight text-primary">
          SparkPath
        </span>
      </Link>

      <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Learner Modules
      </p>

      <nav className="flex flex-col gap-1">
        {STYLE_ORDER.map((key) => {
          const style = LEARNING_STYLES[key]
          const Icon = style.icon
          const isActive = key === active
          const isPrimary = profile.primaryStyle === key
          return (
            <Link
              key={key}
              href={`/learn/${key}`}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-extrabold uppercase tracking-wide transition-colors",
                isActive
                  ? "border-border bg-accent"
                  : "border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{
                  background: style.colorVar,
                  color: "var(--background)",
                }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1">{style.shortName}</span>
              {isPrimary && (
                <span title="Your top style">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                </span>
              )}
            </Link>
          )
        })}
        
        <div className="my-2 h-px bg-border" />
        
        <Link
          href="/learn/games"
          className={cn(
            "flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-extrabold uppercase tracking-wide transition-colors",
            active === "games"
              ? "border-border bg-accent"
              : "border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground",
          )}
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white"
          >
            <Gamepad2 className="h-4 w-4" />
          </span>
          <span className="flex-1">Games</span>
        </Link>
      </nav>

      <div className="mt-auto px-3 pt-4">
        <Link
          href="/results"
          className="block text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          View my results
        </Link>
        <Link
          href="/"
          className="mt-2 block text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          Retake assessment
        </Link>
      </div>
    </aside>
  )
}

/** Mobile top nav of the same modules. */
export function MobileModuleNav({ active }: SidebarProps) {
  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-border bg-sidebar px-3 py-3 lg:hidden">
      {STYLE_ORDER.map((key) => {
        const style = LEARNING_STYLES[key]
        const Icon = style.icon
        const isActive = key === active
        return (
          <Link
            key={key}
            href={`/learn/${key}`}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-extrabold uppercase",
              isActive ? "border-border bg-accent" : "border-transparent text-muted-foreground",
            )}
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-lg"
              style={{ background: style.colorVar, color: "var(--background)" }}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            {style.shortName}
          </Link>
        )
      })}
      
      <Link
        href="/learn/games"
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-extrabold uppercase",
          active === "games" ? "border-border bg-accent" : "border-transparent text-muted-foreground",
        )}
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500 text-white"
        >
          <Gamepad2 className="h-3.5 w-3.5" />
        </span>
        Games
      </Link>
    </nav>
  )
}
