"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { PlusCircle, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BranchingCondition } from "./types"

// Condition types for branching logic
const CONDITION_TYPES = [
    { id: 'score', name: 'Score' },
    { id: 'completion-time', name: 'Completion Time' },
    { id: 'error-rate', name: 'Error Rate' },
    { id: 'accuracy', name: 'Accuracy' },
    { id: 'response-time', name: 'Response Time' },
    { id: 'performance-level', name: 'Performance Level' },
    { id: 'trial-number', name: 'Trial Number' },
    { id: 'session-time', name: 'Session Time' },
    { id: 'custom-variable', name: 'Custom Variable' },
];

// Operators for conditions
const OPERATORS = [
    { id: '>', name: 'Greater Than' },
    { id: '<', name: 'Less Than' },
    { id: '>=', name: 'Greater Than or Equal To' },
    { id: '<=', name: 'Less Than or Equal To' },
    { id: '==', name: 'Equal To' },
    { id: '!=', name: 'Not Equal To' },
    { id: 'contains', name: 'Contains' },
    { id: 'starts-with', name: 'Starts With' },
    { id: 'ends-with', name: 'Ends With' },
    { id: 'matches-regex', name: 'Matches Regex' },
];

// Value types for conditions
const VALUE_TYPES = [
    { id: 'number', name: 'Number' },
    { id: 'string', name: 'Text' },
    { id: 'boolean', name: 'Yes/No' },
    { id: 'array', name: 'List' },
];

interface BranchingPanelProps {
    selectedNodeId?: string | null;
    nodes: any[];
    onUpdateBranching: (nodeId: string, conditions: BranchingCondition[]) => void;
    branchingConditions?: BranchingCondition[];
}

export default function BranchingPanel({
    selectedNodeId,
    nodes,
    onUpdateBranching,
    branchingConditions = []
}: BranchingPanelProps) {
    const [conditions, setConditions] = useState<BranchingCondition[]>(branchingConditions);

    // Get available target nodes (excluding the currently selected node)
    const availableTargets = nodes.filter(node => node.id !== selectedNodeId);

    const handleAddCondition = () => {
        const newCondition: BranchingCondition = {
            id: `condition-${Date.now()}`,
            type: CONDITION_TYPES[0].id,
            parameter: CONDITION_TYPES[0].id,
            operator: OPERATORS[0].id,
            value: 0
        };

        setConditions([...conditions, newCondition]);
        if (selectedNodeId) {
            onUpdateBranching(selectedNodeId, [...conditions, newCondition]);
        }
    };

    const handleRemoveCondition = (conditionId: string) => {
        const updatedConditions = conditions.filter(c => c.id !== conditionId);
        setConditions(updatedConditions);
        if (selectedNodeId) {
            onUpdateBranching(selectedNodeId, updatedConditions);
        }
    };

    const handleConditionChange = (conditionId: string, field: keyof BranchingCondition, value: any) => {
        const updatedConditions = conditions.map(c => {
            if (c.id === conditionId) {
                return { ...c, [field]: value };
            }
            return c;
        });

        setConditions(updatedConditions);
        if (selectedNodeId) {
            onUpdateBranching(selectedNodeId, updatedConditions);
        }
    };

    return (
        <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-between">
                    <span>Conditional Branching</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-2">
                    <div className="space-y-4 pb-4">
                        {!selectedNodeId ? (
                            <div className="text-sm text-muted-foreground">
                                Select a node to configure branching logic
                            </div>
                        ) : (
                            // Simple Mode
                            <>
                                <div className="text-sm font-medium">
                                    Configure simple conditions for node branching
                                </div>

                                {conditions.map((condition, index) => (
                                    <div key={condition.id} className="space-y-3 rounded-md border p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Condition {index + 1}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveCondition(condition.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-xs text-muted-foreground">Parameter</label>
                                                    <Select
                                                        value={condition.parameter}
                                                        onValueChange={(value) => handleConditionChange(condition.id, 'parameter', value)}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select parameter" />
                                                        </SelectTrigger>
                                                        <SelectContent className="max-h-60 overflow-y-auto">
                                                            {CONDITION_TYPES.map(type => (
                                                                <SelectItem key={type.id} value={type.id}>
                                                                    {type.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground">Operator</label>
                                                    <Select
                                                        value={condition.operator}
                                                        onValueChange={(value) => handleConditionChange(condition.id, 'operator', value)}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select operator" />
                                                        </SelectTrigger>
                                                        <SelectContent className="max-h-60 overflow-y-auto">
                                                            {OPERATORS.map(op => (
                                                                <SelectItem key={op.id} value={op.id}>
                                                                    {op.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs text-muted-foreground">Value</label>
                                                <Input
                                                    type={condition.operator === 'contains' || condition.operator === 'starts-with' || condition.operator === 'ends-with' ? "text" : "number"}
                                                    value={condition.value}
                                                    onChange={(e) => {
                                                        const value = condition.operator === 'contains' || condition.operator === 'starts-with' || condition.operator === 'ends-with'
                                                            ? e.target.value
                                                            : parseFloat(e.target.value) || 0;
                                                        handleConditionChange(condition.id, 'value', value);
                                                    }}
                                                    className="w-full"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs text-muted-foreground">Target Node</label>
                                                <Select
                                                    value={condition.targetNodeId || ""}
                                                    onValueChange={(value) => handleConditionChange(condition.id, 'targetNodeId', value)}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select target node" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-60 overflow-y-auto">
                                                        {availableTargets.map(node => (
                                                            <SelectItem key={node.id} value={node.id}>
                                                                {node.data?.label || node.id}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <label className="text-xs text-muted-foreground">Description</label>
                                                <Input
                                                    type="text"
                                                    placeholder="Optional description"
                                                    value={condition.description || ""}
                                                    onChange={(e) => handleConditionChange(condition.id, 'description', e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={handleAddCondition}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Condition
                                </Button>
                            </>
                        )}

                        <div className="text-xs text-muted-foreground mt-4">
                            <p>
                                These conditions define how participants flow between different games based on their performance.
                                Each condition can direct to a different next game or task.
                            </p>
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}