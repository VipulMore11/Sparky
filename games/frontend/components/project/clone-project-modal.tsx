"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

interface Project {
  id: string
  name: string
  type: "experiment" | "task" | "survey"
  status: "draft" | "active" | "completed" | "paused"
  lastModified: string
  createdAt: string
  description?: string
  participantCount?: number
}

interface CloneProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  onClone: (project: Project) => void
}

export function CloneProjectModal({
  open,
  onOpenChange,
  projects,
  onClone
}: CloneProjectModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")

  const handleClone = () => {
    const selectedProject = projects.find(p => p.id === selectedProjectId)
    if (selectedProject) {
      onClone(selectedProject)
    }
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Clone Existing Project</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Label className="text-sm font-medium">
            Select a project to clone:
          </Label>
          
          <RadioGroup value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={project.id} id={project.id} />
                  <Card className="flex-1 cursor-pointer hover:bg-muted/50" onClick={() => setSelectedProjectId(project.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">{project.name}</p>
                              <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {project.type} • {project.lastModified} • {project.participantCount} participants
                            </p>
                            {project.description && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </RadioGroup>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleClone}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!selectedProjectId}
            >
              Clone Selected Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}