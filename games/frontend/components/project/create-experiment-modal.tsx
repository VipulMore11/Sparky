"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface CreateExperimentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateNew: (name: string, type: string, description: string) => void
  onCloneExisting: () => void
}

export function CreateExperimentModal({
  open,
  onOpenChange,
  onCreateNew,
  onCloneExisting
}: CreateExperimentModalProps) {
  const [experimentName, setExperimentName] = useState("New Experiment")
  const [experimentType, setExperimentType] = useState("experiment")
  const [description, setDescription] = useState("")

  const handleCreateNew = () => {
    if (experimentName.trim()) {
      onCreateNew(experimentName.trim(), experimentType, description.trim())
      setExperimentName("New Experiment")
      setDescription("")
      setExperimentType("experiment")
      onOpenChange(false)
    }
  }

  const handleCloneExisting = () => {
    onCloneExisting()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Experiment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="experiment-name" className="text-sm font-medium">
              Please enter a name for your new Experiment
            </Label>
            <Input
              id="experiment-name"
              value={experimentName}
              onChange={(e) => setExperimentName(e.target.value)}
              placeholder="New Experiment"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experiment-type" className="text-sm font-medium">
              Project Type
            </Label>
            <Select value={experimentType} onValueChange={setExperimentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="experiment">Experiment</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="survey">Survey</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your project"
              className="w-full"
              rows={3}
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleCreateNew}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!experimentName.trim()}
            >
              Create New
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCloneExisting}
              className="flex-1"
            >
              Clone Existing
            </Button>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleCreateNew}
              className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!experimentName.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}