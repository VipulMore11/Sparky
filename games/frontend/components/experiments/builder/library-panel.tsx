"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { LibraryModule } from "./types"
import { useEffect, useState } from "react"
import pb from "@/lib/pb"

const MODULES: Record<string, LibraryModule[]> = {
  "Games & Tasks": [
    // Cognitive Games
    {
      id: "stroop-sprint",
      label: "Stroop Sprint",
      type: "game",
      color: "#FF5757",
      description: "Test cognitive inhibition by naming colors vs. reading words",
      gameType: "cognitive",
      presetConfig: { trials: 24, responseKeys: "Z/M", difficulty: "medium" },
      category: "game"
    },
    {
      id: "trail-tracker",
      label: "Trail Tracker",
      type: "game",
      color: "#4CAF50",
      description: "Connect numbered/lettered points in sequence to test executive function",
      gameType: "cognitive",
      presetConfig: { complexity: "medium", timeLimit: 60 },
      category: "game"
    },

    // Perception-Reaction Games
    {
      id: "flash-reflex",
      label: "Flash Reflex",
      type: "game",
      color: "#2196F3",
      description: "Measure reaction time to visual stimuli",
      gameType: "perception-reaction",
      presetConfig: { trials: 15, stimulusType: "visual" },
      category: "game"
    },
    {
      id: "blink-gap",
      label: "Blink Gap",
      type: "game",
      color: "#9C27B0",
      description: "Test attentional blink and temporal processing",
      gameType: "perception-reaction",
      presetConfig: { trials: 20, targetFrequency: 0.3 },
      category: "game"
    },

    // Decision-Making Games
    {
      id: "risk-run",
      label: "Risk Run",
      type: "game",
      color: "#E91E63",
      description: "Evaluate risk-taking behavior in decision-making scenarios",
      gameType: "decision-making",
      presetConfig: { scenarios: 12, riskLevels: "varied", timeLimit: 180 },
      category: "game"
    },
    {
      id: "trust-trade",
      label: "Trust Trade",
      type: "game",
      color: "#3F51B5",
      description: "Measure trust and cooperation in social exchange scenarios",
      gameType: "decision-making",
      presetConfig: { rounds: 10, partnerStrategy: "conditional", initialTrust: "neutral" },
      category: "game"
    },

    // Social-Emotional Games
  ]
}

function ModulePill({ mod }: { mod: LibraryModule }) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({
        id: mod.id,
        label: mod.label,
        type: mod.type,
        presetConfig: mod.presetConfig || {},
        color: mod.color,
        gameType: mod.gameType,
        category: mod.category
      }),
    )
    event.dataTransfer.effectAllowed = "move"
  }

  // Style based on component type/category
  let colorStyle = {}
  if (mod.color) {
    colorStyle = {
      borderLeft: `4px solid ${mod.color}`,
      paddingLeft: "12px",
    }
  }

  // Badge colors based on category
  const getBadgeStyle = () => {
    if (mod.color) {
      return { backgroundColor: mod.color, color: '#fff' }
    }
    return {}
  }

  // Function to get badge variant based on module type
  const getBadgeVariant = () => {
    if (mod.type === "game") return "default"
    if (mod.type === "condition" || mod.type === "randomizer") return "outline"
    if (mod.type === "sequence" || mod.type === "loop") return "secondary"
    return "secondary"
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onDragStart={onDragStart}
      draggable
      className="group rounded-md border p-3 text-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring w-full overflow-hidden"
      style={colorStyle}
      aria-label={`Drag ${mod.label} to canvas`}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="font-medium truncate flex-1 min-w-0">{mod.label}</span>
        <Badge
          variant={getBadgeVariant()}
          className="capitalize flex-shrink-0 text-xs"
          style={getBadgeStyle()}
        >
          {mod.type}
        </Badge>
      </div>

      {mod?.description ? (
        <p className="mt-1 text-xs text-muted-foreground break-words line-clamp-2 leading-relaxed">
          {mod.description}
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">Drag to canvas</p>
      )}

      <div className="mt-2 flex gap-1 items-center flex-wrap">
        {mod.gameType && (
          <Badge variant="outline" className="text-xs truncate max-w-[80px]">
            {mod.gameType}
          </Badge>
        )}

        {mod.category && (
          <Badge variant="secondary" className="text-xs truncate max-w-[80px]">
            {mod.category}
          </Badge>
        )}
      </div>
    </div>
  )
}

export default function LibraryPanel() {
  const [customModules, setCustomModules] = useState<LibraryModule[]>([])

  useEffect(() => {
    async function getData() {
      try {
        const records = await pb.collection('custom_games').getFullList()

        const mapped: LibraryModule[] = (records || []).map((r: any) => {
          let payload: any = {}
          try {
            payload = r.data ? JSON.parse(r.data) : {}
          } catch (e) {
            payload = r.data || {}
          }

          return {
            id: `custom-${r.id}`,
            label: payload.title ?? payload.name ?? `Custom Game ${r.id}`,
            type: "game",
            color: payload.color ?? "#6b21a8",
            description: payload.description ?? "User created custom game",
            gameType: payload.gameType ?? "custom",
            presetConfig: payload ?? {},
            category: "custom",
          }
        })

        setCustomModules(mapped)
      } catch (error) {
        // silent fail — optional: console.error(error)
      }
    }

    getData()
  }, [])

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-sm">Component Library</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-2">
          <div className="grid gap-4 pb-4">
            {customModules.length > 0 && (
              <div key="custom-games" className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground truncate">Custom Games</div>
                <div className="grid gap-2">
                  {customModules.map((m) => (
                    <ModulePill key={m.id} mod={m} />
                  ))}
                </div>
              </div>
            )}
            {Object.entries(MODULES).map(([group, items]) => (
              <div key={group} className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground truncate">{group}</div>
                <div className="grid gap-2">
                  {items.map((m) => (
                    <ModulePill key={m.id} mod={m} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
