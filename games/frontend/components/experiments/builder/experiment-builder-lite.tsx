"use client"

import type React from "react"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Topbar from "./topbar"
import PropertiesPanel from "./properties-panel"
import BranchingPanel from "./branching-panel"
import RandomizationPanel from "./randomization-panel"
import LibraryPanelLite from "./library-panel-lite"
import type { BranchingCondition, BuilderNodeData, ModuleType, RandomizationConfig, SavedFlow } from "./types"
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  NodeProps,
  NodeTypes,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
  Connection,
  addEdge,
  MarkerType,
  ReactFlowProvider,
  Handle,
  Position,
  EdgeTypes,
  getBezierPath,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '@/lib/utils';

type ModuleColor = { bg: string; border: string }
const TYPE_COLORS: Record<ModuleType, ModuleColor> = {
  task: { bg: "hsl(var(--chart-5) / 0.16)", border: "hsl(var(--chart-5))" }, // purple-ish
  logic: { bg: "hsl(var(--chart-2) / 0.16)", border: "hsl(var(--chart-2))" }, // green
  advanced: { bg: "hsl(var(--chart-3) / 0.22)", border: "hsl(var(--chart-3))" }, // yellow
  end: { bg: "hsl(var(--muted) / 1)", border: "hsl(var(--border))" }, // gray
  connector: { bg: "hsl(var(--primary) / 0.16)", border: "hsl(var(--primary))" } // primary blue for connectors
}

// Styles for connection handles - extra visible with highlight
// Plain function without hooks - can be used anywhere
function createHandleStyle(color: string = '#1a192b', size: number = 16) {
  return {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: '#FFF',
    borderColor: color,
    borderWidth: '2px',
    borderRadius: '50%',
    zIndex: 50,
    // boxShadow: `0 0 8px 2px rgba(${hexToRgb(color) || '26, 25, 43'}, 0.6)`,
    transition: 'transform 0.2s, box-shadow 0.2s',
  };
}

// Custom Node component for experiment modules
function ExperimentNode({ data, selected }: NodeProps<BuilderNodeData>) {
  const color = TYPE_COLORS[data.type];
  const isEndNode = data.type === 'end';
  const handleColor = color.border;

  return (
    <div
      className={cn(
        "rounded-md border p-2 text-sm shadow-sm transition-colors relative",
        selected ? "ring-2 ring-ring" : ""
      )}
      style={{ backgroundColor: color.bg, borderColor: color.border, minWidth: '200px' }}
    >
      {/* Connection point indicator markers */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-transparent border-2 border-dashed border-opacity-50" style={{ borderColor: handleColor }}></div>
      <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 w-8 h-8 rounded-full bg-transparent border-2 border-dashed border-opacity-50" style={{ borderColor: handleColor }}></div>

      {!isEndNode && (
        <>
          <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-8 rounded-full bg-transparent border-2 border-dashed border-opacity-50" style={{ borderColor: handleColor }}></div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-transparent border-2 border-dashed border-opacity-50" style={{ borderColor: handleColor }}></div>
        </>
      )}

      {/* Multiple handles for flexible connections */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={createHandleStyle(handleColor)}
        className="!opacity-100 hover:!opacity-100"
        isConnectable={true}
      />

      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={createHandleStyle(handleColor)}
        className="!opacity-100 hover:!opacity-100"
        isConnectable={true}
      />

      {/* Output handles - not visible for end nodes */}
      {!isEndNode && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            style={createHandleStyle(handleColor)}
            className="!opacity-100 hover:!opacity-100"
            isConnectable={true}
          />

          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom"
            style={createHandleStyle(handleColor)}
            className="!opacity-100 hover:!opacity-100"
            isConnectable={true}
          />
        </>
      )}

      <div className="font-medium">{data.label}</div>
      <div className="mt-1 text-xs text-muted-foreground capitalize">{data.type}</div>
    </div>
  );
}

// Custom static edge
function StaticEdge({ id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }: any) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.4, // More pronounced curve
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={3}
        stroke="hsl(var(--primary))"
        style={{ ...style }}
        markerEnd={markerEnd}
      />
    </>
  );
}

// Custom Connector Node with handles on all sides for free connections
function ConnectorNode({ data, selected }: NodeProps<BuilderNodeData>) {
  const color = TYPE_COLORS.connector;
  const handleColor = color.border;

  return (
    <div
      className={cn(
        "rounded-full border p-1 text-sm shadow-sm transition-colors relative",
        selected ? "ring-2 ring-ring" : ""
      )}
      style={{
        backgroundColor: color.bg,
        borderColor: color.border,
        width: '70px',
        height: '70px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Connection point indicator rings */}
      <div className="absolute -top-4 left-[30%] w-8 h-8 rounded-full bg-transparent border-2 border-dashed border-opacity-50" style={{ borderColor: handleColor }}></div>
      <div className="absolute -top-4 left-[70%] w-8 h-8 rounded-full bg-transparent border-2 border-dashed border-opacity-50" style={{ borderColor: handleColor }}></div>

      {/* Handles on all sides for maximum flexibility - now much more visible */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={{
          ...createHandleStyle(handleColor, 16),
          top: '-8px',
          left: '30%',
        }}
        className="!opacity-100 hover:!opacity-100"
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        style={{
          ...createHandleStyle(handleColor, 16),
          top: '-8px',
          left: '70%',
        }}
        className="!opacity-100 hover:!opacity-100"
        isConnectable={true}
      />
      {/* More connection point indicators */}
      <div className="absolute -right-4 top-[30%] w-8 h-8 rounded-full bg-transparent border-2 border-dashed border-opacity-50" style={{ borderColor: handleColor }}></div>
      <div className="absolute -right-4 top-[70%] w-8 h-8 rounded-full bg-transparent border-2 border-dashed border-opacity-50" style={{ borderColor: handleColor }}></div>
      <div className="absolute -bottom-4 left-[30%] w-8 h-8 rounded-full bg-transparent border-2 border-dashed border-opacity-50" style={{ borderColor: handleColor }}></div>
      <div className="absolute -bottom-4 left-[70%] w-8 h-8 rounded-full bg-transparent border-2 border-dashed border-opacity-50" style={{ borderColor: handleColor }}></div>
      <div className="absolute -left-4 top-[30%] w-8 h-8 rounded-full bg-transparent border-2 border-dashed border-opacity-50" style={{ borderColor: handleColor }}></div>
      <div className="absolute -left-4 top-[70%] w-8 h-8 rounded-full bg-transparent border-2 border-dashed border-opacity-50" style={{ borderColor: handleColor }}></div>

      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        style={{
          ...createHandleStyle(handleColor, 16),
          right: '-8px',
          top: '30%',
        }}
        className="!opacity-100 hover:!opacity-100"
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        style={{
          ...createHandleStyle(handleColor, 16),
          right: '-8px',
          top: '70%',
        }}
        className="!opacity-100 hover:!opacity-100"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        style={{
          ...createHandleStyle(handleColor, 16),
          bottom: '-8px',
          left: '30%',
        }}
        className="!opacity-100 hover:!opacity-100"
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        style={{
          ...createHandleStyle(handleColor, 16),
          bottom: '-8px',
          left: '70%',
        }}
        className="!opacity-100 hover:!opacity-100"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        style={{
          ...createHandleStyle(handleColor, 16),
          left: '-8px',
          top: '30%',
        }}
        className="!opacity-100 hover:!opacity-100"
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        style={{
          ...createHandleStyle(handleColor, 16),
          left: '-8px',
          top: '70%',
        }}
        className="!opacity-100 hover:!opacity-100"
        isConnectable={true}
      />

      <div className="font-medium text-xs text-center">{data.label}</div>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ margin: '2px auto' }}
      >
        <path
          d="M5 12H19M12 5L19 12L12 19"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// Node types and edge types registry
const nodeTypes: NodeTypes = {
  experimentModule: ExperimentNode,
  connector: ConnectorNode,
};

const edgeTypes: EdgeTypes = {
  static: StaticEdge,
};

// Main component wrapped in ReactFlow provider
function ExperimentBuilderLiteContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<BuilderNodeData>([]);

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([
    {
      id: "e1-2",
      source: "n1",
      target: "n2",
      type: 'static',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: 'hsl(var(--primary))'
      },
      style: { strokeWidth: 3 }
    },
    {
      id: "e2-3",
      source: "n2",
      target: "n3",
      type: 'static',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: 'hsl(var(--primary))'
      },
      style: { strokeWidth: 3 }
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("properties");
  const [branchingConditions, setBranchingConditions] = useState<Record<string, BranchingCondition[]>>({});
  const [randomizationConfigs, setRandomizationConfigs] = useState<Record<string, RandomizationConfig>>({});
  const { project, getIntersectingNodes } = useReactFlow();

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<BuilderNodeData>) => {
    setSelectedId(node.id);
  }, []);

  // Handle node connections
  const onConnect = useCallback(
    (params: Connection) => {
      const id = `e-${params.source}-${params.target}-${Math.random().toString(36).slice(2, 5)}`;
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id,
            type: 'static',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: 'hsl(var(--primary))'
            },
            style: { strokeWidth: 3 }
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Handle drag over for new nodes
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle dropping new nodes from library panel
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const json = event.dataTransfer.getData('application/x-experiment-module');
      if (!json) return;

      const payload = JSON.parse(json) as { id: string; label: string; type: ModuleType; presetConfig?: any };
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

      // Get the position where the node was dropped
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nid = `${payload.id}-${Math.random().toString(36).slice(2, 7)}`;

      // Determine node type based on module type
      const nodeType = payload.type === 'connector' ? 'connector' : 'experimentModule';

      const newNode: Node<BuilderNodeData> = {
        id: nid,
        type: nodeType,
        position,
        data: {
          label: payload.label,
          type: payload.type,
          config: payload.presetConfig || {}
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedId(nid);
    },
    [project, setNodes]
  );

  const selectedNode = useMemo(() => {
    const node = nodes.find((n) => n.id === selectedId);
    return node ? { id: node.id, data: node.data } : null;
  }, [nodes, selectedId]);

  const handleChangeNode = (next: BuilderNodeData) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === selectedId ? { ...n, data: next } : n))
    );
  };

  // Add handlers for branching and randomization
  const handleUpdateBranching = useCallback(
    (nodeId: string, conditions: BranchingCondition[]) => {
      setBranchingConditions(prev => ({ ...prev, [nodeId]: conditions }));

      // Update node to indicate it has branching
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          return {
            ...n,
            data: {
              ...n.data,
              hasBranching: conditions.length > 0,
              branchingConditions: conditions
            }
          }
        }),
      );

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
  );

  const handleUpdateRandomization = useCallback(
    (nodeId: string, config: RandomizationConfig) => {
      setRandomizationConfigs(prev => ({ ...prev, [nodeId]: config }));

      // Update node to include the randomization config
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          return {
            ...n,
            data: {
              ...n.data,
              randomizationConfig: config
            }
          }
        }),
      );

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
  );

  const { getViewport, setViewport } = useReactFlow();

  const onSave = useCallback(() => {
    const viewport = getViewport();
    const saved: SavedFlow = {
      nodes: nodes.map((n) => ({
        id: n.id,
        position: n.position,
        data: n.data,
        type: n.type
      })),
      edges: edges,
      viewport: viewport
    };
    return saved;
  }, [nodes, edges, getViewport]);

  const onImport = (json: SavedFlow) => {
    try {
      if (json.nodes && Array.isArray(json.nodes)) {
        const importedNodes = json.nodes.map((n: any) => ({
          id: n.id,
          position: n.position || { x: 0, y: 0 },
          type: n.type || 'experimentModule',
          data: n.data as BuilderNodeData,
        }));

        setNodes(importedNodes);

        if (json.edges && Array.isArray(json.edges)) {
          const importedEdges = json.edges.map((e: any) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: 'static',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: 'hsl(var(--primary))'
            },
            style: { strokeWidth: 3 }
          }));

          setEdges(importedEdges);
        }

        // Restore viewport if available
        if (json.viewport) {
          setViewport(json.viewport);
        }
      }
    } catch (error) {
      console.error("Error importing flow:", error);
    }
  };

  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined") {
        const saved = localStorage.getItem("experimentBuilderFlow");
        if (saved) onImport(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const getPreviewItems = useCallback(() => {
    // Sort nodes by y position then x position for a logical order
    const sorted = [...nodes].sort((a, b) =>
      a.position.y - b.position.y || a.position.x - b.position.x
    );
    return sorted.map((n) => ({ id: n.id, label: n.data.label }));
  }, [nodes]);

  // Custom CSS for handles and connections
  const customStyles = `
    .react-flow__handle {
      opacity: 1 !important;
      transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
      filter: drop-shadow(0 0 4px rgba(0,0,0,0.3));
      z-index: 10;
      cursor: crosshair;
    }
    
    .react-flow__handle:hover {
      transform: scale(1.25);
      z-index: 20;
      filter: drop-shadow(0 0 6px rgba(0,0,0,0.5)) brightness(1.1);
    }
    
    .react-flow__handle::after {
      content: '';
      position: absolute;
      top: -5px;
      left: -5px;
      right: -5px;
      bottom: -5px;
      border-radius: 50%;
      background: transparent;
      border: 2px solid transparent;
      z-index: -1;
    }
    
    /* Make connection point indicators more visible on hover */
    .react-flow__node:hover .border-dashed {
      border-color: currentColor;
      border-opacity: 0.8;
    }
    
    .react-flow__edge-path {
      stroke-width: 3;
      transition: stroke-width 0.2s;
    }
    
    .react-flow__edge.selected .react-flow__edge-path {
      stroke-width: 4;
      filter: drop-shadow(0 0 5px hsl(var(--primary)));
    }
    
    /* Make sure handles are above nodes during interaction */
    .react-flow__handle-top,
    .react-flow__handle-bottom,
    .react-flow__handle-left,
    .react-flow__handle-right {
      z-index: 10;
    }
  `;

  return (
    <div className="flex h-full flex-1 flex-col">
      <style>{customStyles}</style>
      <Topbar onSave={onSave} onImport={onImport} getPreviewItems={getPreviewItems} />
      <div className="flex min-h-0 flex-1 gap-3 p-3">
        <aside className="w-64 min-w-64">
          <LibraryPanelLite />
        </aside>

        <section ref={reactFlowWrapper} className="flex min-h-0 flex-1 flex-col">
          <div className="h-full rounded-md border">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              connectionLineType={ConnectionLineType.SmoothStep}
              connectionLineStyle={{
                stroke: 'hsl(var(--primary))',
                strokeWidth: 3
              }}
              defaultEdgeOptions={{
                style: { strokeWidth: 3 }
              }}
              deleteKeyCode={['Backspace', 'Delete']}
              fitView
              attributionPosition="bottom-right"
            >
              <Background color="#ccc" gap={16} size={1} />
              <Controls />
              <MiniMap
                nodeColor={(n) => {
                  const nodeData = n.data as BuilderNodeData;
                  return TYPE_COLORS[nodeData.type]?.bg || '#eee';
                }}
                maskColor="rgba(240, 240, 240, 0.6)"
              />
            </ReactFlow>
          </div>
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
                selectedNode={selectedNode}
                onChange={handleChangeNode}
              />
            </TabsContent>

            <TabsContent value="branching" className="mt-0">
              <BranchingPanel
                selectedNodeId={selectedId}
                nodes={nodes}
                onUpdateBranching={handleUpdateBranching}
                branchingConditions={
                  selectedNode?.data?.branchingConditions ||
                  branchingConditions[selectedId || ''] ||
                  []
                }
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
  );
}

// Wrap with ReactFlow provider
export default function ExperimentBuilderLite() {
  return (
    <ReactFlowProvider>
      <ExperimentBuilderLiteContent />
    </ReactFlowProvider>
  );
}
