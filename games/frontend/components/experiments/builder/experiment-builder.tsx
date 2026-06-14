"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  useReactFlow,
} from "reactflow"
import "reactflow/dist/style.css"

import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import LibraryPanel from "./library-panel"
import PropertiesPanel from "./properties-panel"
import BranchingPanel from "./branching-panel"
import RandomizationPanel from "./randomization-panel"
import GameNode from "./game-node"
import Topbar from "./topbar"
import type { BranchingCondition, BuilderNodeData, ModuleType, RandomizationConfig, SavedFlow } from "./types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ModuleColor = {
  bg: string
  border: string
}

const TYPE_COLORS: Record<ModuleType, ModuleColor> = {
  // Using theme chart tokens to align with design system while matching requested hues
  task: { bg: "hsl(var(--chart-5) / 0.16)", border: "hsl(var(--chart-5))" }, // purple-ish
  logic: { bg: "hsl(var(--chart-2) / 0.16)", border: "hsl(var(--chart-2))" }, // green
  advanced: { bg: "hsl(var(--chart-3) / 0.22)", border: "hsl(var(--chart-3))" }, // yellow
  end: { bg: "hsl(var(--muted) / 1)", border: "hsl(var(--border))" }, // gray
  game: { bg: "hsl(var(--chart-1) / 0.16)", border: "hsl(var(--chart-1))" }, // blue
  connector: { bg: "hsl(var(--muted) / 0.5)", border: "hsl(var(--border))" }, // gray
}

// Custom node types
const nodeTypes = {
  gameNode: GameNode,
}

interface CanvasInnerProps {
  initialData?: SavedFlow;
  experimentName?: string;
}

function CanvasInner({ initialData, experimentName }: CanvasInnerProps) {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null)
  const { project, toObject, setViewport } = useReactFlow()

  // Start with an empty canvas instead of default nodes
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<BuilderNodeData>[]>([])
  // Start with empty edges array
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<string>("properties")
  const [branchingConditions, setBranchingConditions] = useState<Record<string, BranchingCondition[]>>({})
  const [randomizationConfigs, setRandomizationConfigs] = useState<Record<string, RandomizationConfig>>({})

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!reactFlowWrapper.current) return
      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      const json = e.dataTransfer.getData("application/reactflow")
      if (!json) return
      const payload = JSON.parse(json) as {
        id: string;
        label: string;
        type: ModuleType;
        presetConfig?: any;
        color?: string;
        gameType?: string;
      }
      const position = project({ x: e.clientX - bounds.left, y: e.clientY - bounds.top })
      const nid = `${payload.id}-${Math.random().toString(36).slice(2, 7)}`

      // Use custom node type for games
      if (payload.type === 'game') {
        const newNode: Node<BuilderNodeData> = {
          id: nid,
          type: 'gameNode',
          position,
          data: {
            label: payload.label,
            type: payload.type,
            color: payload.color,
            gameType: payload.gameType,
            config: payload.presetConfig || {}
          }
        }
        setNodes((nds) => nds.concat(newNode))
      } else {
        const color = TYPE_COLORS[payload.type]
        const newNode: Node<BuilderNodeData> = {
          id: nid,
          position,
          data: { label: payload.label, type: payload.type, config: payload.presetConfig || {} },
          style: {
            backgroundColor: color.bg,
            border: `1px solid ${color.border}`,
            borderRadius: 8,
            padding: 8,
          },
        }
        setNodes((nds) => nds.concat(newNode))
      }
      setSelectedId(nid)
    },
    [project, setNodes],
  )

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedId) || null, [nodes, selectedId])

  const handleChangeNode = useCallback(
    (next: BuilderNodeData) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== selectedId) return n

          // For game nodes, preserve the node type and update the data
          if (n.type === 'gameNode') {
            return {
              ...n,
              data: {
                ...next,
                color: next.color || n.data.color,
                gameType: next.gameType || n.data.gameType,
              }
            }
          }

          // For regular nodes, update the style as before
          const color = TYPE_COLORS[next.type]
          return {
            ...n,
            data: next,
            style: {
              ...n.style,
              backgroundColor: color.bg,
              border: `1px solid ${color.border}`,
            },
          }
        }),
      )
    },
    [selectedId, setNodes],
  )

  const handleUpdateBranching = useCallback(
    (nodeId: string, conditions: BranchingCondition[]) => {
      setBranchingConditions(prev => ({ ...prev, [nodeId]: conditions }));

      // Update node to indicate it has branching
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n
          return {
            ...n,
            data: {
              ...n.data,
              hasBranching: conditions.length > 0,
              branchingConditions: conditions
            }
          }
        }),
      )

      // Create or update edges based on branching conditions
      const validConditions = conditions.filter(c => c.targetNodeId);
      if (validConditions.length > 0) {
        const newEdges = validConditions.map(condition => {
          const edgeId = `e-${nodeId}-${condition.targetNodeId}-${condition.id}`;
          return {
            id: edgeId,
            source: nodeId,
            target: condition.targetNodeId as string,
            animated: true,
            label: `${condition.parameter} ${condition.operator} ${condition.value}`,
            labelStyle: { fontSize: 12 },
            style: { stroke: '#FF9800' }
          }
        });

        // Remove any existing condition edges from this node
        setEdges(eds => {
          const filteredEdges = eds.filter(e =>
            !e.id.startsWith(`e-${nodeId}-`) || !e.id.includes('-condition-')
          );
          return [...filteredEdges, ...newEdges];
        });
      }
    },
    [setNodes, setEdges],
  )

  const handleUpdateRandomization = useCallback(
    (nodeId: string, config: RandomizationConfig) => {
      setRandomizationConfigs(prev => ({ ...prev, [nodeId]: config }));

      // Update node to include the randomization config
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n
          return {
            ...n,
            data: {
              ...n.data,
              randomizationConfig: config
            }
          }
        }),
      )

      // Update edges to visualize randomization targets
      if (config.targets && config.targets.length > 0) {
        const newEdges = config.targets.map(targetId => {
          const edgeId = `e-rand-${nodeId}-${targetId}`;
          return {
            id: edgeId,
            source: nodeId,
            target: targetId,
            animated: true,
            style: {
              stroke: '#2196F3',
              strokeDasharray: '5, 5',
              strokeWidth: 2
            },
            type: 'randomization'
          }
        });

        // Remove any existing randomization edges from this node
        setEdges(eds => {
          const filteredEdges = eds.filter(e => !e.id.startsWith(`e-rand-${nodeId}-`));
          return [...filteredEdges, ...newEdges];
        });
      }
    },
    [setNodes, setEdges],
  )

  const onSave = useCallback((): SavedFlow => {
    return toObject()
  }, [toObject])

  const onImport = useCallback(
    (json: SavedFlow) => {
      const nextNodes = (json.nodes || []).map((n: any) => {
        const d = n.data as BuilderNodeData
        const color = TYPE_COLORS[d?.type || "task"]
        return {
          ...n,
          style: {
            ...(n.style || {}),
            backgroundColor: color.bg,
            border: `1px solid ${color.border}`,
            borderRadius: 8,
            padding: 8,
          },
        }
      })
      setNodes(nextNodes)
      setEdges(json.edges || [])
      if (json.viewport) setViewport(json.viewport)
    },
    [setEdges, setNodes, setViewport],
  )

  // Add keyboard handler for node deletion
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    if (selectedId && (event.key === 'Delete' || event.key === 'Backspace')) {
      // Delete the selected node
      setNodes((nds) => nds.filter((n) => n.id !== selectedId));

      // Delete any connected edges
      setEdges((eds) => eds.filter((e) =>
        e.source !== selectedId && e.target !== selectedId
      ));

      // Clear the selection
      setSelectedId(null);
    }
  }, [selectedId, setNodes, setEdges]);

  // Register and clean up keyboard events
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  // Load flow data - prioritize initialData from props, then fall back to localStorage
  useEffect(() => {
    try {
      if (initialData) {
        // If we have initialData from a project, use that
        onImport(initialData);
      } else if (typeof localStorage !== "undefined") {
        // Otherwise try to load from localStorage
        const saved = localStorage.getItem("experimentBuilderFlow");
        if (saved) onImport(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading flow data:", error);
    }
  }, [onImport, initialData])

  const getPreviewItems = useCallback(() => {
    // naive sequence by y then x position
    const sorted = [...nodes].sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x)
    return sorted.map((n) => ({ id: n.id, label: n.data.label }))
  }, [nodes])

  return (
    <div className="flex h-full flex-1 flex-col">
      <Topbar
        onSave={onSave}
        onImport={onImport}
        getPreviewItems={getPreviewItems}
        defaultExperimentName={experimentName}
      />
      <div className="flex min-h-0 flex-1 gap-3 p-3">
        <aside className="w-64 min-w-64">
          <LibraryPanel />
        </aside>
        <section className="flex min-h-0 flex-1 flex-col">
          <Card ref={reactFlowWrapper} className="relative h-full overflow-hidden">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              fitView
              onNodeClick={(_, node) => setSelectedId(node.id)}
              onPaneClick={() => setSelectedId(null)}
            >
              <MiniMap />
              <Controls />
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            </ReactFlow>
          </Card>
        </section>
        <aside className="w-72 min-w-72">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="branching">Branching</TabsTrigger>
              <TabsTrigger value="randomization">Randomize</TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="mt-0">
              <PropertiesPanel
                selectedNode={
                  selectedNode
                    ? {
                      id: selectedNode.id,
                      data: selectedNode.data,
                    }
                    : null
                }
                onChange={handleChangeNode}
              />
            </TabsContent>

            <TabsContent value="branching" className="mt-0">
              <BranchingPanel
                selectedNodeId={selectedId}
                nodes={nodes}
                onUpdateBranching={handleUpdateBranching}
                branchingConditions={selectedNode?.data?.branchingConditions || []}
              />
            </TabsContent>

            <TabsContent value="randomization" className="mt-0">
              <RandomizationPanel
                selectedNodeId={selectedId}
                nodes={nodes}
                onUpdateRandomization={handleUpdateRandomization}
                randomizationConfig={
                  selectedNode?.data?.randomizationConfig ||
                  randomizationConfigs[selectedId || ''] ||
                  undefined
                }
              />
            </TabsContent>
          </Tabs>
        </aside>
      </div>
      <div className="px-3 pb-3">
        <Separator />
      </div>
    </div>
  )
}

interface ExperimentBuilderProps {
  initialData?: SavedFlow;
  experimentName?: string;
}

export default function ExperimentBuilder({ initialData, experimentName }: ExperimentBuilderProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner initialData={initialData} experimentName={experimentName} />
    </ReactFlowProvider>
  )
}
