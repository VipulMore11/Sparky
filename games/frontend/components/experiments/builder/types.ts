export type ModuleType = "task" | "logic" | "advanced" | "end" | "connector" | "game" | "condition" | "randomizer" | "sequence" | "loop"

export type BuilderNodeData = {
  label: string
  type: ModuleType
  config: Record<string, any>
  color?: string
  gameType?: string
  branchingConditions?: BranchingCondition[]
  conditionRules?: ConditionRule[]
  randomizationConfig?: RandomizationConfig
  loopConfig?: LoopConfig
  sequenceConfig?: SequenceConfig
}

export type LibraryModule = {
  id: string
  label: string
  type: ModuleType
  presetConfig?: Record<string, any>
  description?: string
  color?: string
  gameType?: string
  category?: "flow-control" | "game" | "data" | "stimulus" | "response"
}

export type BranchingCondition = {
  id: string
  type: string
  parameter: string
  operator: string
  value: any
  targetNodeId?: string
  description?: string
  logicalOperator?: "AND" | "OR" | "NOT"
  nextConditionId?: string // For chaining conditions
}

// Enhanced conditional logic
export type ConditionRule = {
  id: string
  name: string
  conditions: ConditionGroup[]
  thenTargetId?: string
  elseTargetId?: string
  description?: string
}

export type ConditionGroup = {
  id: string
  conditions: ConditionCriteria[]
  logicalOperator: "AND" | "OR"
}

export type ConditionCriteria = {
  id: string
  source: "variable" | "response" | "score" | "time" | "counter" | "custom"
  variable?: string
  parameter: string
  operator: "==" | "!=" | ">" | "<" | ">=" | "<=" | "contains" | "starts-with" | "ends-with" | "matches-regex"
  value: any
  valueType: "string" | "number" | "boolean" | "array" | "object" | "regex"
  description?: string
}

// Advanced randomization types
export type RandomizationConfig = {
  type: "block" | "complete" | "stratified" | "latin-square" | "adaptive"
  targets: string[] // IDs of nodes to randomize
  blockSize?: number
  stratificationVariables?: string[]
  constraints?: RandomizationConstraint[]
  seed?: number // For reproducible randomization
  counterbalancing?: boolean
  counterbalanceGroups?: string[][]
}

export type RandomizationConstraint = {
  id: string
  type: "no-consecutive-repeats" | "equal-distribution" | "min-distance" | "custom"
  parameters: Record<string, any>
  description?: string
}

// Loop configuration for repeated trials
export type LoopConfig = {
  iterations: number | "until-condition"
  iterationVariable?: string
  exitCondition?: ConditionGroup
  targetsToReset?: string[] // IDs of nodes that should reset on each iteration
  collectDataAcrossIterations?: boolean
}

// Sequential presentation configuration
export type SequenceConfig = {
  items: SequenceItem[]
  presentationMode: "sequential" | "simultaneous" | "staggered"
  timingParameters: {
    stimulusDuration?: number
    interStimulusInterval?: number
    responseWindow?: number
  }
  randomizeOrder?: boolean
  adaptiveDifficulty?: boolean
  adaptiveParameters?: {
    initialDifficulty: number
    stepSize: number
    targetAccuracy: number
  }
}

export type SequenceItem = {
  id: string
  content: StimulusContent
  correctResponse?: any
  category?: string
  difficulty?: number
  tags?: string[]
  metadata?: Record<string, any>
}

export type StimulusContent = {
  type: "text" | "image" | "audio" | "video" | "composite"
  value: string | string[] | Record<string, any>
  format?: string
  size?: { width?: number, height?: number }
  duration?: number
  position?: { x: number, y: number }
}

export type SavedNode = {
  id: string
  position: { x: number; y: number }
  data: BuilderNodeData
  type: string
}

export type SavedEdge = {
  id: string
  source: string
  target: string
  type?: string
  markerEnd?: any
  style?: any
  sourceHandle?: string
  targetHandle?: string
}

export type SavedFlow = {
  nodes: SavedNode[]
  edges: SavedEdge[]
  viewport?: { x: number; y: number; zoom: number }
}
