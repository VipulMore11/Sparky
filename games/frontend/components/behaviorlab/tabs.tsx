"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"

export type Tab = { id: string; label: string; panel: React.ReactNode }

export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id)
  return (
    <div>
      <div role="tablist" aria-label="Feature tabs" className="flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            className={cn(
              "px-4 py-2 rounded-md border",
              active === t.id
                ? "bg-card text-foreground border-b-4 border-primary"
                : "bg-muted text-muted-foreground border-border",
            )}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-border bg-card p-4">
        {tabs.map((t) =>
          t.id === active ? (
            <div key={t.id} role="tabpanel" aria-labelledby={t.id}>
              {t.panel}
            </div>
          ) : null,
        )}
      </div>
    </div>
  )
}
