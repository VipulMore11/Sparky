"use client"

import { useState } from "react"
import { Plus, MoreVertical, FileText, Eye, Copy, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CreateExperimentModal } from "./create-experiment-modal"
import { CloneProjectModal } from "./clone-project-modal"

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

export function MyWork() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Stroop Task Study",
      type: "experiment",
      status: "active",
      lastModified: "2 hours ago",
      createdAt: "2024-10-09",
      description: "Cognitive interference study",
      participantCount: 45
    },
    {
      id: "2",
      name: "Memory Test",
      type: "task",
      status: "draft",
      lastModified: "1 day ago",
      createdAt: "2024-10-08",
      description: "Working memory assessment",
      participantCount: 0
    },
    {
      id: "3",
      name: "User Feedback Survey",
      type: "survey",
      status: "completed",
      lastModified: "3 days ago",
      createdAt: "2024-10-05",
      description: "Post-experiment feedback collection",
      participantCount: 120
    }
  ])
  
  const { toast } = useToast()

  const handleCreateNew = (experimentName: string, type: string, description: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: experimentName,
      type: type as Project['type'],
      status: "draft",
      lastModified: "just now",
      createdAt: new Date().toISOString().split('T')[0],
      description: description || "New project",
      participantCount: 0
    }
    
    setProjects(prev => [newProject, ...prev])
    toast({
      title: "Project Created",
      description: `"${experimentName}" has been created successfully.`,
    })
  }

  const handleCloneExisting = () => {
    setIsCloneModalOpen(true)
  }

  const handleCloneProject = (originalProject: Project) => {
    const clonedProject: Project = {
      ...originalProject,
      id: Date.now().toString(),
      name: `${originalProject.name} (Copy)`,
      status: "draft",
      lastModified: "just now",
      createdAt: new Date().toISOString().split('T')[0],
      participantCount: 0
    }
    
    setProjects(prev => [clonedProject, ...prev])
    setIsCloneModalOpen(false)
    toast({
      title: "Project Cloned",
      description: `"${originalProject.name}" has been cloned successfully.`,
    })
  }

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    setProjects(prev => prev.filter(p => p.id !== projectId))
    toast({
      title: "Project Deleted",
      description: `"${project?.name}" has been deleted.`,
      variant: "destructive"
    })
  }

  const handleEditProject = (projectId: string) => {
    toast({
      title: "Edit Project",
      description: "Edit functionality would open here.",
    })
  }

  const handleViewProject = (projectId: string) => {
    toast({
      title: "View Project",
      description: "Project viewer would open here.",
    })
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

  const recentProjects = projects.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, tushar!</h1>
      </div>

      {/* My Work Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">My Work</CardTitle>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
              {/* Project Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
                  <div className="text-sm text-blue-600">Total Projects</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {projects.filter(p => p.status === 'active').length}
                  </div>
                  <div className="text-sm text-green-600">Active</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {projects.reduce((sum, p) => sum + (p.participantCount || 0), 0)}
                  </div>
                  <div className="text-sm text-orange-600">Total Participants</div>
                </div>
              </div>

              {/* My Projects */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">My Projects</h3>
                  <Button variant="outline" size="sm">
                    See All Projects
                  </Button>
                </div>              {/* Most Recent */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Most Recent</h4>
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
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
                            <p className="text-xs text-muted-foreground mt-1 truncate">{project.description}</p>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProject(project.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProject(project.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCloneProject(project)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>

              {/* New Project Call-to-Action */}
              {projects.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-border rounded-lg text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium mb-2 text-lg">No Projects Yet</h4>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    Create your first experiment, task, or survey to get started with your research
                  </p>
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium mb-2">Create New Project</h4>
                  <p className="text-sm text-muted-foreground mb-4">Start a new experiment, task, or survey</p>
                  <Button 
                    variant="outline"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateExperimentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCreateNew={handleCreateNew}
        onCloneExisting={handleCloneExisting}
      />
      
      <CloneProjectModal
        open={isCloneModalOpen}
        onOpenChange={setIsCloneModalOpen}
        projects={projects}
        onClone={handleCloneProject}
      />
    </div>
  )
}