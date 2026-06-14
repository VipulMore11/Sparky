"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { BuilderNodeData } from "./types"

type Props = {
  selectedNode: {
    id: string
    data: BuilderNodeData
  } | null
  onChange: (next: BuilderNodeData) => void
}

type DeleteButtonProps = {
  onDelete: () => void
}

// Add a delete button component
function DeleteButton({ onDelete }: DeleteButtonProps) {
  return (
    <button
      className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2"
      onClick={onDelete}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Delete Node
    </button>
  )
}

export default function PropertiesPanel({ selectedNode, onChange }: Props) {
  if (!selectedNode) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-sm">Properties</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground flex-1 overflow-hidden">
          Select a module to edit its properties.
        </CardContent>
      </Card>
    )
  }

  const { data } = selectedNode

  // Handler for node deletion - will be implemented in the parent component
  const handleDelete = () => {
    if (typeof document === "undefined") return;

    // We'll use the keyboard handler for actual deletion
    // This is just a UI element to make it more discoverable
    const event = new KeyboardEvent('keydown', { key: 'Delete' });
    document.dispatchEvent(event);
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-sm truncate">Properties • {data.label}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="grid gap-4 pt-4">
            <div className="grid gap-1.5">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={data.label}
                onChange={(e) => onChange({ ...data, label: e.target.value })}
                placeholder="Module label"
                className="w-full"
              />
            </div>

            {data.type === "task" && data.label === "Stroop Task" && (
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="trials">Number of trials</Label>
                  <Input
                    id="trials"
                    type="number"
                    min={1}
                    value={data.config.trials ?? 24}
                    onChange={(e) => onChange({ ...data, config: { ...data.config, trials: Number(e.target.value) } })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="keys">Response keys</Label>
                  <Input
                    id="keys"
                    value={data.config.responseKeys ?? "Z/M"}
                    onChange={(e) => onChange({ ...data, config: { ...data.config, responseKeys: e.target.value } })}
                  />
                </div>
              </div>
            )}

            {data.type === "advanced" && data.label === "Visual Search Task" && (
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="setsize">Set size</Label>
                  <Input
                    id="setsize"
                    type="number"
                    min={1}
                    value={data.config.setSize ?? 12}
                    onChange={(e) => onChange({ ...data, config: { ...data.config, setSize: Number(e.target.value) } })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="targetRate">Target present rate</Label>
                  <Input
                    id="targetRate"
                    type="number"
                    step="0.05"
                    min={0}
                    max={1}
                    value={data.config.targetRate ?? 0.5}
                    onChange={(e) => onChange({ ...data, config: { ...data.config, targetRate: Number(e.target.value) } })}
                  />
                </div>
              </div>
            )}

            {data.type === "task" && data.label === "Demographics Form" && (
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="fields">Fields (comma-separated)</Label>
                  <Input
                    id="fields"
                    value={(data.config.fields ?? ["age", "gender"]).join(",")}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        config: { ...data.config, fields: e.target.value.split(",").map((s) => s.trim()) },
                      })
                    }
                  />
                </div>
              </div>
            )}

            {data.type === "logic" && data.label === "Randomizer" && (
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="branches">Branches</Label>
                  <Input
                    id="branches"
                    type="number"
                    min={2}
                    value={data.config.branches ?? 2}
                    onChange={(e) => onChange({ ...data, config: { ...data.config, branches: Number(e.target.value) } })}
                  />
                </div>
              </div>
            )}

            {data.type === "end" && data.label === "Debriefing Screen" && (
              <div className="grid gap-1.5">
                <Label htmlFor="message">Debrief message</Label>
                <Textarea
                  id="message"
                  value={data.config.message ?? "Thanks for participating!"}
                  onChange={(e) => onChange({ ...data, config: { ...data.config, message: e.target.value } })}
                  placeholder="Write a short message for participants"
                  className="w-full min-h-[80px] resize-y"
                />
              </div>
            )}

            {/* Game-specific properties */}
            {data.type === "game" && (
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="gameColor">Game Color</Label>
                    <Input
                      id="gameColor"
                      type="color"
                      value={data.color || "#000000"}
                      onChange={(e) => onChange({ ...data, color: e.target.value })}
                      className="w-full h-10"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="gameType">Game Type</Label>
                    <Select
                      value={data.gameType || "cognitive"}
                      onValueChange={(value) => onChange({ ...data, gameType: value })}
                    >
                      <SelectTrigger id="gameType" className="w-full">
                        <SelectValue placeholder="Select game type" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        <SelectItem value="cognitive">Cognitive</SelectItem>
                        <SelectItem value="memory">Memory</SelectItem>
                        <SelectItem value="attention">Attention</SelectItem>
                        <SelectItem value="executive-function">Executive Function</SelectItem>
                        <SelectItem value="reaction-time">Reaction Time</SelectItem>
                        <SelectItem value="decision-making">Decision Making</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {data.label === "Stroop Sprint" && (
                  <div className="grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="trials">Number of trials</Label>
                      <Input
                        id="trials"
                        type="number"
                        min={1}
                        value={data.config.trials ?? 24}
                        onChange={(e) => onChange({ ...data, config: { ...data.config, trials: Number(e.target.value) } })}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={data.config.difficulty || "medium"}
                        onValueChange={(value) => onChange({ ...data, config: { ...data.config, difficulty: value } })}
                      >
                        <SelectTrigger id="difficulty" className="w-full">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {data.label === "Trail Tracker" && (
                  <div className="grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="complexity">Complexity</Label>
                      <Select
                        value={data.config.complexity || "medium"}
                        onValueChange={(value) => onChange({ ...data, config: { ...data.config, complexity: value } })}
                      >
                        <SelectTrigger id="complexity" className="w-full">
                          <SelectValue placeholder="Select complexity" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="complex">Complex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                      <Input
                        id="timeLimit"
                        type="number"
                        min={10}
                        max={300}
                        value={data.config.timeLimit ?? 60}
                        onChange={(e) => onChange({ ...data, config: { ...data.config, timeLimit: Number(e.target.value) } })}
                      />
                    </div>
                  </div>
                )}

                {data.label === "Flash Reflex" && (
                  <div className="grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="trials">Number of trials</Label>
                      <Input
                        id="trials"
                        type="number"
                        min={5}
                        max={50}
                        value={data.config.trials ?? 15}
                        onChange={(e) => onChange({ ...data, config: { ...data.config, trials: Number(e.target.value) } })}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="stimulusType">Stimulus Type</Label>
                      <Select
                        value={data.config.stimulusType || "visual"}
                        onValueChange={(value) => onChange({ ...data, config: { ...data.config, stimulusType: value } })}
                      >
                        <SelectTrigger id="stimulusType" className="w-full">
                          <SelectValue placeholder="Select stimulus type" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          <SelectItem value="visual">Visual</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {data.label === "Blink Gap" && (
                  <div className="grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="trials">Number of trials</Label>
                      <Input
                        id="trials"
                        type="number"
                        min={10}
                        max={100}
                        value={data.config.trials ?? 20}
                        onChange={(e) => onChange({ ...data, config: { ...data.config, trials: Number(e.target.value) } })}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="targetFrequency">Target Frequency</Label>
                      <div className="flex gap-2 items-center w-full">
                        <Slider
                          id="targetFrequency"
                          min={0.1}
                          max={0.9}
                          step={0.05}
                          value={[data.config.targetFrequency ?? 0.3]}
                          onValueChange={([value]) => onChange({ ...data, config: { ...data.config, targetFrequency: value } })}
                          className="flex-1"
                        />
                        <span className="w-12 text-sm text-right flex-shrink-0">{data.config.targetFrequency ?? 0.3}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />


              </div>
            )}

            {/* Add delete button at the bottom */}
            <DeleteButton onDelete={handleDelete} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
