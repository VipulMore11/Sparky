"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define types for the experiment flow data structure
interface ExperimentNode {
    id: string;
    label: string;
    type: string;
    position: { x: number, y: number };
    gameType: string | null;
    config: Record<string, any>;
    branchingConditions?: BranchingCondition[];
    randomizationConfig?: RandomizationConfig | null;
}

interface ExperimentConnection {
    id: string;
    source: string;
    target: string;
    type?: string;
    label?: string | null;
    animated?: boolean;
    style?: any;
    conditionId?: string | null;
    isRandomization?: boolean;
}

interface BranchingCondition {
    id: string;
    parameter: string;
    operator: string;
    value: any;
    targetNodeId?: string;
    description?: string;
}

interface RandomizationConfig {
    type: string;
    targets: string[];
    blockSize?: number;
    seed?: number;
    counterbalancing?: boolean;
    counterbalanceGroups?: string[][];
    constraints?: any[];
}

interface ExperimentFlow {
    experimentInfo: {
        version: string;
        createdAt: string;
        updatedAt: string;
    };
    nodes: ExperimentNode[];
    connections: ExperimentConnection[];
    flow: {
        nodeMap: Record<string, {
            id: string;
            label: string;
            type: string;
            outgoing: {
                targetId: string;
                edgeId: string;
                condition: string | null;
                isConditional: boolean;
                isRandomization: boolean;
            }[];
            incoming: {
                sourceId: string;
                edgeId: string;
            }[];
        }>;
        startNodes: string[];
        endNodes: string[];
        conditionalPaths: Record<string, {
            conditionId: string;
            parameter: string;
            operator: string;
            value: any;
            targetNodeId?: string;
            description?: string | null;
        }[]>;
        randomizationMap: Record<string, RandomizationConfig>;
    };
}

interface ParticipantData {
    id: string;
    scores: Record<string, any>;
}

// Sample experiment flow data (this would be loaded from the JSON exported from the builder)
const sampleExperimentFlow: ExperimentFlow = {
    experimentInfo: {
        version: "1.0.0",
        createdAt: "2025-10-12T12:00:00.000Z",
        updatedAt: "2025-10-12T12:00:00.000Z"
    },
    nodes: [
        {
            id: "welcome-3fa2c",
            label: "Welcome Screen",
            type: "task",
            position: { x: 100, y: 200 },
            gameType: null,
            config: { message: "Welcome to the experiment" }
        },
        {
            id: "demographics-7b21d",
            label: "Demographics Form",
            type: "task",
            position: { x: 350, y: 200 },
            gameType: null,
            config: { fields: ["age", "gender", "education"] }
        },
        {
            id: "stroop-9a34f",
            label: "Stroop Task",
            type: "game",
            position: { x: 600, y: 100 },
            gameType: "cognitive",
            config: { trials: 20, difficulty: "medium" },
            branchingConditions: [
                {
                    id: "condition-1",
                    parameter: "score",
                    operator: ">",
                    value: 70,
                    targetNodeId: "memory-6d45e",
                    description: "High performers go to memory task"
                },
                {
                    id: "condition-2",
                    parameter: "score",
                    operator: "<=",
                    value: 70,
                    targetNodeId: "attention-2c87b",
                    description: "Lower performers go to attention task"
                }
            ]
        },
        {
            id: "attention-2c87b",
            label: "Attention Task",
            type: "game",
            position: { x: 900, y: 200 },
            gameType: "attention",
            config: { trials: 15, stimulusType: "visual" }
        },
        {
            id: "memory-6d45e",
            label: "Memory Task",
            type: "game",
            position: { x: 900, y: 50 },
            gameType: "memory",
            config: { memoryStimuliCount: 8, presentationTime: 1000 }
        },
        {
            id: "randomizer-8e32f",
            label: "Task Randomizer",
            type: "logic",
            position: { x: 1200, y: 150 },
            gameType: null,
            config: {},
            randomizationConfig: {
                type: "complete",
                targets: ["decision-3c91a", "perception-1f56d"],
                seed: 12345
            }
        },
        {
            id: "decision-3c91a",
            label: "Decision Making",
            type: "game",
            position: { x: 1450, y: 100 },
            gameType: "decision-making",
            config: { scenarios: 5, timeLimit: 30 }
        },
        {
            id: "perception-1f56d",
            label: "Perception Task",
            type: "game",
            position: { x: 1450, y: 200 },
            gameType: "perception-reaction",
            config: { trials: 10, complexity: "medium" }
        },
        {
            id: "debrief-5a67c",
            label: "Debrief Screen",
            type: "end",
            position: { x: 1700, y: 150 },
            gameType: null,
            config: { message: "Thank you for participating!" }
        }
    ],
    connections: [
        {
            id: "e-welcome-demographics",
            source: "welcome-3fa2c",
            target: "demographics-7b21d",
            animated: false
        },
        {
            id: "e-demographics-stroop",
            source: "demographics-7b21d",
            target: "stroop-9a34f",
            animated: false
        },
        {
            id: "e-stroop-memory",
            source: "stroop-9a34f",
            target: "memory-6d45e",
            conditionId: "condition-1",
            animated: true,
            label: "score > 70"
        },
        {
            id: "e-stroop-attention",
            source: "stroop-9a34f",
            target: "attention-2c87b",
            conditionId: "condition-2",
            animated: true,
            label: "score <= 70"
        },
        {
            id: "e-memory-randomizer",
            source: "memory-6d45e",
            target: "randomizer-8e32f",
            animated: false
        },
        {
            id: "e-attention-randomizer",
            source: "attention-2c87b",
            target: "randomizer-8e32f",
            animated: false
        },
        {
            id: "e-rand-randomizer-decision",
            source: "randomizer-8e32f",
            target: "decision-3c91a",
            isRandomization: true,
            animated: true
        },
        {
            id: "e-rand-randomizer-perception",
            source: "randomizer-8e32f",
            target: "perception-1f56d",
            isRandomization: true,
            animated: true
        },
        {
            id: "e-decision-debrief",
            source: "decision-3c91a",
            target: "debrief-5a67c",
            animated: false
        },
        {
            id: "e-perception-debrief",
            source: "perception-1f56d",
            target: "debrief-5a67c",
            animated: false
        }
    ],
    flow: {
        nodeMap: {
            "welcome-3fa2c": {
                id: "welcome-3fa2c",
                label: "Welcome Screen",
                type: "task",
                outgoing: [
                    {
                        targetId: "demographics-7b21d",
                        edgeId: "e-welcome-demographics",
                        condition: null,
                        isConditional: false,
                        isRandomization: false
                    }
                ],
                incoming: []
            },
            "demographics-7b21d": {
                id: "demographics-7b21d",
                label: "Demographics Form",
                type: "task",
                outgoing: [
                    {
                        targetId: "stroop-9a34f",
                        edgeId: "e-demographics-stroop",
                        condition: null,
                        isConditional: false,
                        isRandomization: false
                    }
                ],
                incoming: [
                    {
                        sourceId: "welcome-3fa2c",
                        edgeId: "e-welcome-demographics"
                    }
                ]
            },
            "stroop-9a34f": {
                id: "stroop-9a34f",
                label: "Stroop Task",
                type: "game",
                outgoing: [
                    {
                        targetId: "memory-6d45e",
                        edgeId: "e-stroop-memory",
                        condition: "score > 70",
                        isConditional: true,
                        isRandomization: false
                    },
                    {
                        targetId: "attention-2c87b",
                        edgeId: "e-stroop-attention",
                        condition: "score <= 70",
                        isConditional: true,
                        isRandomization: false
                    }
                ],
                incoming: [
                    {
                        sourceId: "demographics-7b21d",
                        edgeId: "e-demographics-stroop"
                    }
                ]
            },
            "attention-2c87b": {
                id: "attention-2c87b",
                label: "Attention Task",
                type: "game",
                outgoing: [
                    {
                        targetId: "randomizer-8e32f",
                        edgeId: "e-attention-randomizer",
                        condition: null,
                        isConditional: false,
                        isRandomization: false
                    }
                ],
                incoming: [
                    {
                        sourceId: "stroop-9a34f",
                        edgeId: "e-stroop-attention"
                    }
                ]
            },
            "memory-6d45e": {
                id: "memory-6d45e",
                label: "Memory Task",
                type: "game",
                outgoing: [
                    {
                        targetId: "randomizer-8e32f",
                        edgeId: "e-memory-randomizer",
                        condition: null,
                        isConditional: false,
                        isRandomization: false
                    }
                ],
                incoming: [
                    {
                        sourceId: "stroop-9a34f",
                        edgeId: "e-stroop-memory"
                    }
                ]
            },
            "randomizer-8e32f": {
                id: "randomizer-8e32f",
                label: "Task Randomizer",
                type: "logic",
                outgoing: [
                    {
                        targetId: "decision-3c91a",
                        edgeId: "e-rand-randomizer-decision",
                        condition: null,
                        isConditional: false,
                        isRandomization: true
                    },
                    {
                        targetId: "perception-1f56d",
                        edgeId: "e-rand-randomizer-perception",
                        condition: null,
                        isConditional: false,
                        isRandomization: true
                    }
                ],
                incoming: [
                    {
                        sourceId: "memory-6d45e",
                        edgeId: "e-memory-randomizer"
                    },
                    {
                        sourceId: "attention-2c87b",
                        edgeId: "e-attention-randomizer"
                    }
                ]
            },
            "decision-3c91a": {
                id: "decision-3c91a",
                label: "Decision Making",
                type: "game",
                outgoing: [
                    {
                        targetId: "debrief-5a67c",
                        edgeId: "e-decision-debrief",
                        condition: null,
                        isConditional: false,
                        isRandomization: false
                    }
                ],
                incoming: [
                    {
                        sourceId: "randomizer-8e32f",
                        edgeId: "e-rand-randomizer-decision"
                    }
                ]
            },
            "perception-1f56d": {
                id: "perception-1f56d",
                label: "Perception Task",
                type: "game",
                outgoing: [
                    {
                        targetId: "debrief-5a67c",
                        edgeId: "e-perception-debrief",
                        condition: null,
                        isConditional: false,
                        isRandomization: false
                    }
                ],
                incoming: [
                    {
                        sourceId: "randomizer-8e32f",
                        edgeId: "e-rand-randomizer-perception"
                    }
                ]
            },
            "debrief-5a67c": {
                id: "debrief-5a67c",
                label: "Debrief Screen",
                type: "end",
                outgoing: [],
                incoming: [
                    {
                        sourceId: "decision-3c91a",
                        edgeId: "e-decision-debrief"
                    },
                    {
                        sourceId: "perception-1f56d",
                        edgeId: "e-perception-debrief"
                    }
                ]
            }
        },
        startNodes: ["welcome-3fa2c"],
        endNodes: ["debrief-5a67c"],
        conditionalPaths: {
            "stroop-9a34f": [
                {
                    conditionId: "condition-1",
                    parameter: "score",
                    operator: ">",
                    value: 70,
                    targetNodeId: "memory-6d45e",
                    description: "High performers go to memory task"
                },
                {
                    conditionId: "condition-2",
                    parameter: "score",
                    operator: "<=",
                    value: 70,
                    targetNodeId: "attention-2c87b",
                    description: "Lower performers go to attention task"
                }
            ]
        },
        randomizationMap: {
            "randomizer-8e32f": {
                type: "complete",
                targets: ["decision-3c91a", "perception-1f56d"],
                seed: 12345,
                counterbalancing: false
            }
        }
    }
};

// Experiment Flow Handler Component
export default function ExperimentFlowHandler() {
    // State for current node, participant data, and experiment progress
    const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
    const [completedNodes, setCompletedNodes] = useState<string[]>([]);
    const [participantData, setParticipantData] = useState<ParticipantData>({
        id: `participant-${Math.random().toString(36).substring(2, 9)}`,
        scores: {}
    });
    const [experimentStarted, setExperimentStarted] = useState(false);
    const [experimentEnded, setExperimentEnded] = useState(false);
    const [flowHistory, setFlowHistory] = useState<string[]>([]);

    // Start the experiment
    const startExperiment = () => {
        const startNodeId = sampleExperimentFlow.flow.startNodes[0];
        setCurrentNodeId(startNodeId);
        setExperimentStarted(true);
        setFlowHistory([startNodeId]);
    };

    // Get the current node data
    const getCurrentNode = (): ExperimentNode | null => {
        if (!currentNodeId) return null;
        return sampleExperimentFlow.nodes.find(node => node.id === currentNodeId) || null;
    };

    // Process completion of a node
    const completeNode = (nodeId: string, result: Record<string, any> = {}) => {
        // Store the results
        setParticipantData(prev => ({
            ...prev,
            scores: {
                ...prev.scores,
                [nodeId]: result
            }
        }));

        // Mark node as completed
        setCompletedNodes(prev => [...prev, nodeId]);

        // Find the next node
        const nextNodeId = findNextNode(nodeId, result);

        if (nextNodeId) {
            setCurrentNodeId(nextNodeId);
            setFlowHistory(prev => [...prev, nextNodeId]);
        } else {
            // If no next node, experiment is over
            setExperimentEnded(true);
        }
    };

    // Find the next node based on current node and results
    const findNextNode = (nodeId: string, result: Record<string, any>): string | null => {
        const nodeInfo = sampleExperimentFlow.flow.nodeMap[nodeId];
        if (!nodeInfo) return null;

        // Check if this is an end node
        if (sampleExperimentFlow.flow.endNodes.includes(nodeId)) {
            return null;
        }

        // Check for conditional branching
        const conditionalPaths = sampleExperimentFlow.flow.conditionalPaths[nodeId];
        if (conditionalPaths && conditionalPaths.length > 0) {
            // Evaluate each condition
            for (const condition of conditionalPaths) {
                const { parameter, operator, value, targetNodeId } = condition;

                // Get the participant's value for this parameter
                const participantValue = result[parameter];

                // Evaluate the condition
                let conditionMet = false;
                switch (operator) {
                    case ">":
                        conditionMet = participantValue > value;
                        break;
                    case "<":
                        conditionMet = participantValue < value;
                        break;
                    case ">=":
                        conditionMet = participantValue >= value;
                        break;
                    case "<=":
                        conditionMet = participantValue <= value;
                        break;
                    case "==":
                        conditionMet = participantValue === value;
                        break;
                    case "!=":
                        conditionMet = participantValue !== value;
                        break;
                }

                if (conditionMet && targetNodeId) {
                    return targetNodeId;
                }
            }
        }

        // Check for randomization
        const randomizationConfig = sampleExperimentFlow.flow.randomizationMap[nodeId];
        if (randomizationConfig && randomizationConfig.targets && randomizationConfig.targets.length > 0) {
            const { targets, seed } = randomizationConfig;

            // Simple randomization (can be enhanced with more complex randomization logic)
            // Use the seed for reproducible randomization if needed
            const randomSeed = seed || Date.now();
            const pseudoRandom = new PseudoRandomWithSeed(randomSeed);
            const randomIndex = Math.floor(pseudoRandom.random() * targets.length);
            return targets[randomIndex];
        }

        // No special routing, just take the first outgoing edge
        if (nodeInfo.outgoing.length > 0) {
            return nodeInfo.outgoing[0].targetId;
        }

        return null;
    };

    // Simple pseudo-random number generator with seed
    class PseudoRandomWithSeed {
        private seed: number;

        constructor(seed: number) {
            this.seed = seed % 2147483647;
            if (this.seed <= 0) this.seed += 2147483646;
        }

        random(): number {
            this.seed = (this.seed * 16807) % 2147483647;
            return this.seed / 2147483647;
        }
    }

    // Reset the experiment
    const resetExperiment = () => {
        setCurrentNodeId(null);
        setCompletedNodes([]);
        setParticipantData({
            id: `participant-${Math.random().toString(36).substring(2, 9)}`,
            scores: {}
        });
        setExperimentStarted(false);
        setExperimentEnded(false);
        setFlowHistory([]);
    };

    // Render a node component based on its type
    const renderNodeComponent = () => {
        const currentNode = getCurrentNode();
        if (!currentNode) return null;

        // Mock node components based on type
        switch (currentNode.type) {
            case "task":
                if (currentNode.label.includes("Welcome")) {
                    return <WelcomeNodeComponent node={currentNode} onComplete={completeNode} />;
                } else if (currentNode.label.includes("Demographics")) {
                    return <DemographicsNodeComponent node={currentNode} onComplete={completeNode} />;
                }
                return <TaskNodeComponent node={currentNode} onComplete={completeNode} />;

            case "game":
                return <GameNodeComponent node={currentNode} onComplete={completeNode} />;

            case "logic":
                // Logic nodes like randomizers are automatically processed
                setTimeout(() => {
                    completeNode(currentNode.id, {});
                }, 1000);
                return (
                    <div className="flex flex-col items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
                        <p>Processing {currentNode.label}...</p>
                    </div>
                );

            case "end":
                return <EndNodeComponent node={currentNode} onComplete={completeNode} />;

            default:
                return <div>Unknown node type: {currentNode.type}</div>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Experiment Flow Handler</CardTitle>
                    <CardDescription>
                        This component demonstrates how to use the JSON flow data to control the sequence of games
                        in an experiment, including conditional branching and randomization.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!experimentStarted && !experimentEnded && (
                        <div className="text-center p-6">
                            <h2 className="text-xl font-bold mb-4">Sample Experiment</h2>
                            <p className="mb-4">This demo shows how to handle experiment flow with branching and randomization</p>
                            <Button onClick={startExperiment} className="mt-4">Start Experiment</Button>
                        </div>
                    )}

                    {experimentStarted && !experimentEnded && renderNodeComponent()}

                    {experimentEnded && (
                        <div className="text-center p-6">
                            <h2 className="text-xl font-bold mb-4">Experiment Completed!</h2>
                            <p className="mb-4">Thank you for participating.</p>
                            <Button onClick={resetExperiment} className="mt-4">Restart Experiment</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Display experiment progress */}
            {experimentStarted && (
                <Card>
                    <CardHeader>
                        <CardTitle>Experiment Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <p><strong>Participant ID:</strong> {participantData.id}</p>
                            <p><strong>Completed Nodes:</strong> {completedNodes.length}</p>
                            <p><strong>Current Node:</strong> {getCurrentNode()?.label || 'None'}</p>
                        </div>

                        <h3 className="font-semibold mb-2">Flow Path:</h3>
                        <div className="bg-muted p-3 rounded-md">
                            {flowHistory.map((nodeId, index) => {
                                const node = sampleExperimentFlow.nodes.find(n => n.id === nodeId);
                                return (
                                    <div key={index} className="flex items-center mb-1">
                                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground mr-2">
                                            {index + 1}
                                        </span>
                                        <span>{node?.label || nodeId}</span>
                                        {index < flowHistory.length - 1 && <span className="mx-2">→</span>}
                                    </div>
                                );
                            })}
                        </div>

                        <h3 className="font-semibold mt-4 mb-2">Collected Data:</h3>
                        <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
                            {JSON.stringify(participantData.scores, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// Mock node components
const WelcomeNodeComponent: React.FC<{
    node: ExperimentNode,
    onComplete: (nodeId: string, result: any) => void
}> = ({ node, onComplete }) => {
    return (
        <div className="text-center p-6">
            <h2 className="text-2xl font-bold mb-4">{node.label}</h2>
            <p className="mb-8">{node.config.message}</p>
            <Button onClick={() => onComplete(node.id, {})}>Continue</Button>
        </div>
    );
};

const DemographicsNodeComponent: React.FC<{
    node: ExperimentNode,
    onComplete: (nodeId: string, result: any) => void
}> = ({ node, onComplete }) => {
    const [formData, setFormData] = useState<Record<string, string>>({});

    const handleSubmit = () => {
        onComplete(node.id, formData);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{node.label}</h2>
            <div className="space-y-4 mb-6">
                {node.config.fields.map((field: string) => (
                    <div key={field} className="grid">
                        <label className="text-sm font-medium mb-1">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                        <input
                            type="text"
                            className="border p-2 rounded-md"
                            onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                        />
                    </div>
                ))}
            </div>
            <Button onClick={handleSubmit}>Submit</Button>
        </div>
    );
};

const TaskNodeComponent: React.FC<{
    node: ExperimentNode,
    onComplete: (nodeId: string, result: any) => void
}> = ({ node, onComplete }) => {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{node.label}</h2>
            <p className="mb-8">Complete this task to continue</p>
            <Button onClick={() => onComplete(node.id, {})}>Mark as Complete</Button>
        </div>
    );
};

const GameNodeComponent: React.FC<{
    node: ExperimentNode,
    onComplete: (nodeId: string, result: any) => void
}> = ({ node, onComplete }) => {
    const [score, setScore] = useState<number>(0);
    const [simulationComplete, setSimulationComplete] = useState<boolean>(false);

    // Simulate a game completion
    useEffect(() => {
        // In a real implementation, this would be replaced by actual game completion
        const timer = setTimeout(() => {
            const randomScore = Math.floor(Math.random() * 100);
            setScore(randomScore);
            setSimulationComplete(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const handleComplete = () => {
        onComplete(node.id, {
            score,
            timeSpent: Math.floor(Math.random() * 60) + 30, // Random time between 30-90 seconds
            accuracy: Math.floor(Math.random() * 100),
            completedAt: new Date().toISOString()
        });
    };

    // Look for conditional paths
    const conditionalPaths = sampleExperimentFlow.flow.conditionalPaths[node.id] || [];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{node.label}</h2>
            <div className="mb-6">
                <p className="mb-2"><strong>Game Type:</strong> {node.gameType}</p>
                <p><strong>Configuration:</strong></p>
                <pre className="bg-muted p-2 rounded-md text-xs mt-1">
                    {JSON.stringify(node.config, null, 2)}
                </pre>
            </div>

            {simulationComplete ? (
                <div className="mb-6">
                    <Alert>
                        <AlertTitle>Game Completed</AlertTitle>
                        <AlertDescription>
                            You scored {score} points in this {node.gameType} task!
                        </AlertDescription>
                    </Alert>

                    {conditionalPaths.length > 0 && (
                        <div className="mt-4 p-3 border rounded-md">
                            <p className="font-semibold mb-2">Branching Logic:</p>
                            {conditionalPaths.map((path, index) => (
                                <div key={index} className="text-sm mb-1">
                                    If {path.parameter} {path.operator} {path.value} → {
                                        sampleExperimentFlow.nodes.find(n => n.id === path.targetNodeId)?.label || path.targetNodeId
                                    }
                                </div>
                            ))}
                            <div className="mt-2 text-sm font-medium">
                                Based on your score ({score}), you will proceed to: {
                                    conditionalPaths.find(path => {
                                        if (path.operator === '>' && score > path.value) return true;
                                        if (path.operator === '>=' && score >= path.value) return true;
                                        if (path.operator === '<' && score < path.value) return true;
                                        if (path.operator === '<=' && score <= path.value) return true;
                                        if (path.operator === '==' && score === path.value) return true;
                                        return false;
                                    })?.description || 'Next task'
                                }
                            </div>
                        </div>
                    )}

                    <Button onClick={handleComplete} className="mt-4">Continue to Next Task</Button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
                    <p>Simulating game completion...</p>
                </div>
            )}
        </div>
    );
};

const EndNodeComponent: React.FC<{
    node: ExperimentNode,
    onComplete: (nodeId: string, result: any) => void
}> = ({ node, onComplete }) => {
    return (
        <div className="text-center p-6">
            <h2 className="text-2xl font-bold mb-4">{node.label}</h2>
            <p className="mb-8">{node.config.message}</p>
            <Button onClick={() => onComplete(node.id, {})}>Complete Experiment</Button>
        </div>
    );
};