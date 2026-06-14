"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SavedFlow } from "./types"
import { useEffect, useState } from "react"
import pb from "@/lib/pb"

type Props = {
  onSave: () => SavedFlow
  onImport: (json: SavedFlow) => void
  getPreviewItems: () => { id: string; label: string }[]
  defaultExperimentName?: string
}

export default function Topbar({ onSave, onImport, getPreviewItems, defaultExperimentName }: Props) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [experimentName, setExperimentName] = useState(defaultExperimentName || "My Experiment")
  const [experimentDescription, setExperimentDescription] = useState("")
  const [orgID, setOrgId] = useState('')

  // Update experiment name when defaultExperimentName changes
  useEffect(() => {
    if (defaultExperimentName) {
      setExperimentName(defaultExperimentName);
    }
  }, [defaultExperimentName]);

  const handleSave = () => {
    const saved = onSave()
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("experimentBuilderFlow", JSON.stringify(saved))
        toast({ title: "Saved", description: "Flow saved locally." })
      }
    } catch {
      toast({ title: "Save failed", description: "Unable to save flow.", variant: "destructive" })
    }
  }

  useEffect(() => {
    async function getData() {
      try {
        const records = await pb.collection('organizations').getFullList();
        setOrgId(records[0]?.id || '');
      } catch (error) {
        console.error('Error fetching organization data:', error);
      }
    } getData()
  }, [])

  const handlePublish = () => {
    setPublishModalOpen(true);
  };

  const handleSaveAndPublish = async () => {
    const saved = onSave();

    // Create a simplified JSON representation of the flow focusing only on game names and sequence
    const flowJSON = {
      experimentName: experimentName, // Use the name from the modal
      description: experimentDescription, // Use the description from the modal
      createdAt: new Date().toISOString(),
      games: saved.nodes
        .filter(node => node.data.type === 'game')
        .map(node => ({
          id: node.data.label, // id is now the game name
          name: node.data.label,
          gameType: node.data.gameType || 'cognitive'
        })),
      gameFlow: {
        startGameId:
          saved.nodes
            .filter(
              node =>
                !saved.edges.some(edge => edge.target === node.id) &&
                node.data.type === 'game'
            )
            .map(node => node.data.label)[0] || null, // use label instead of id

        sequence: saved.edges
          .filter(
            edge =>
              saved.nodes.find(n => n.id === edge.source)?.data.type === 'game' &&
              saved.nodes.find(n => n.id === edge.target)?.data.type === 'game'
          )
          .map(edge => {
            const sourceNode = saved.nodes.find(n => n.id === edge.source);
            const targetNode = saved.nodes.find(n => n.id === edge.target);
            return {
              fromGameId: sourceNode?.data.label || null,
              toGameId: targetNode?.data.label || null,
              condition: edge.label || null
            };
          }),

        conditions: saved.nodes.reduce((conditions, node) => {
          if (node.data.branchingConditions && node.data.branchingConditions.length > 0) {
            conditions[node.data.label] = node.data.branchingConditions.map(condition => ({
              fromGame: node.data.label,
              parameter: condition.parameter,
              operator: condition.operator,
              value: condition.value,
              toGame: saved.nodes.find(n => n.id === condition.targetNodeId)?.data.label || null
            }));
          }
          return conditions;
        }, {}),

        randomizations: saved.nodes.reduce((rands, node) => {
          if (node.data.randomizationConfig) {
            rands[node.data.label] = {
              fromGame: node.data.label,
              possibleGames:
                node.data.randomizationConfig.targets
                  ?.map(tid => saved.nodes.find(n => n.id === tid)?.data.label)
                  .filter(Boolean) || []
            };
          }
          return rands;
        }, {})
      },
      // Store the complete flow diagram JSON for future editing
      flowDiagram: saved
    };

    console.log(JSON.stringify(flowJSON, null, 2));

    try {
      const postData = {
        created_by: pb.authStore.model?.id,
        is_published: true,
        organization: orgID,
        data: JSON.stringify(flowJSON),
        description: experimentDescription // Also save description at the top level for easy access
      };

      const record = await pb.collection('projects').create(postData);

      toast({
        title: "Published Successfully",
        description: `Experiment "${experimentName}" has been published`
      });

      // Close the modal after successful publish
      setPublishModalOpen(false);
    } catch (error) {
      console.error("Error publishing experiment:", error);
      toast({
        title: "Publish failed",
        description: "Unable to publish experiment.",
        variant: "destructive"
      });
    }
  };


  const handleExport = () => {
    if (typeof document === "undefined") return;

    const saved = onSave()
    const blob = new Blob([JSON.stringify(saved, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "experiment-flow.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      onImport(json)
      toast({ title: "Imported", description: "Flow imported successfully." })
    } catch {
      toast({ title: "Import failed", description: "Invalid JSON file.", variant: "destructive" })
    }
  }

  return (
    <div className="flex items-center gap-2 border-b bg-background px-4 py-2">
      <div className="font-medium">Experiment Builder</div>
      <Separator orientation="vertical" className="mx-2 h-6" />
      <div className="text-xs text-muted-foreground">To delete nodes: Select a node and press Delete key or use Delete button</div>
      <div className="ml-auto flex items-center gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              Preview
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Preview Sequence</DialogTitle>
            </DialogHeader>
            <ol className="list-inside list-decimal space-y-2">
              {getPreviewItems().map((it) => (
                <li key={it.id} className="text-sm">
                  {it.label}
                </li>
              ))}
            </ol>
          </DialogContent>
        </Dialog>

        {/* Publish Modal */}
        <Dialog open={publishModalOpen} onOpenChange={setPublishModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Publish Experiment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="experiment-name">Experiment Name</Label>
                <Input
                  id="experiment-name"
                  value={experimentName}
                  onChange={(e) => setExperimentName(e.target.value)}
                  placeholder="Enter experiment name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="experiment-description">Description</Label>
                <Input
                  id="experiment-description"
                  value={experimentDescription}
                  onChange={(e) => setExperimentDescription(e.target.value)}
                  placeholder="Describe your experiment"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPublishModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveAndPublish}>Publish</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* <Button variant="secondary" size="sm" onClick={handleSave}>
          Save
        </Button> */}
        <Button size="sm" onClick={handlePublish}>
          Publish
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <input
          id="import-json"
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleImportFile(f)
            e.currentTarget.value = ""
          }}
        />
        <label htmlFor="import-json">
          <Button variant="outline" size="sm" asChild>
            <span>Import</span>
          </Button>
        </label>
        <Button variant="outline" size="sm" onClick={handleExport}>
          Export
        </Button>
      </div>
    </div>
  )
}
