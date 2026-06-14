import { useState } from "react"
import { InteractionLayout } from "./InteractionLayout"
import type { VisualInteractionProps } from "./types"

export function LabelDiagram(props: VisualInteractionProps) {
  const { level, onComplete, onNext, ttsSpeak } = props
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle")
  
  // which label is currently selected from the word bank
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  
  // map of dropZoneId -> label placed there
  const [placements, setPlacements] = useState<Record<string, string>>({})

  const dropZones = level.dropZones || []
  const allLabels = dropZones.map(dz => dz.label)
  const unusedLabels = allLabels.filter(lbl => !Object.values(placements).includes(lbl))

  const handleZoneClick = (zoneId: string) => {
    if (status !== "idle") return

    // If a label is selected, place it
    if (selectedLabel) {
      setPlacements(prev => ({ ...prev, [zoneId]: selectedLabel }))
      setSelectedLabel(null)
    } 
    // If we click a zone that already has a label, remove it back to the bank
    else if (placements[zoneId]) {
      const newPlacements = { ...placements }
      delete newPlacements[zoneId]
      setPlacements(newPlacements)
    }
  }

  const handleCheck = () => {
    // Check if every zone has the correct label
    const isCorrect = dropZones.every(dz => placements[dz.id] === dz.label)
    if (isCorrect) {
      setStatus("correct")
      onComplete(100)
    } else {
      setStatus("incorrect")
    }
  }

  const handleContinue = () => {
    if (status === "correct") onNext()
    else {
      setStatus("idle")
      // We could optionally reset placements here, or let them just fix the wrong ones
    }
  }

  const allPlaced = Object.keys(placements).length === dropZones.length

  return (
    <InteractionLayout
      question={level.question}
      ttsSpeak={ttsSpeak || (() => {})}
      onSkip={() => {
        onComplete(0)
        onNext()
      }}
      onCheck={handleCheck}
      onContinue={handleContinue}
      canCheck={allPlaced}
      status={status}
      progress={props.progress}
      onClose={props.onClose}
    >
      <div className="flex flex-col items-center w-full max-w-xl gap-8">
        
        {/* The Diagram Area */}
        <div className="relative w-full aspect-video bg-muted rounded-3xl border-4 border-border overflow-hidden flex items-center justify-center">
          
          {/* Base Diagram Rendering */}
          <div className="text-9xl opacity-50">
            {level.diagramType === "House" && "🏠"}
            {level.diagramType === "Tree" && "🌳"}
            {level.diagramType === "Flower" && "🌻"}
            {!level.diagramType && "🖼️"}
          </div>

          {/* Drop Zones */}
          {dropZones.map((zone) => {
            const placedLabel = placements[zone.id]
            const isWrong = status === "incorrect" && placedLabel !== zone.label

            return (
              <button
                key={zone.id}
                onClick={() => handleZoneClick(zone.id)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                  placedLabel
                    ? isWrong
                      ? "bg-destructive/10 text-destructive border-destructive animate-[shake_0.5s_ease-in-out]"
                      : "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-dashed border-border hover:bg-muted/80"
                }`}
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
              >
                {placedLabel || "Tap to place"}
              </button>
            )
          })}
        </div>

        {/* Word Bank */}
        <div className="flex flex-wrap gap-3 justify-center">
          {unusedLabels.map((lbl, i) => (
            <button
              key={i}
              onClick={() => status === "idle" && setSelectedLabel(selectedLabel === lbl ? null : lbl)}
              className={`px-6 py-3 rounded-2xl font-bold border-b-4 transition-all ${
                selectedLabel === lbl
                  ? "bg-primary text-primary-foreground border-primary translate-y-1 border-b-0"
                  : "bg-card text-foreground border-border hover:bg-muted"
              }`}
            >
              {lbl}
            </button>
          ))}
          {unusedLabels.length === 0 && (
            <div className="text-muted-foreground font-bold py-3">All labels placed!</div>
          )}
        </div>

      </div>
    </InteractionLayout>
  )
}
