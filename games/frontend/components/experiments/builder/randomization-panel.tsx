"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { PlusCircle, Trash2, XCircle, InfoIcon, ShuffleIcon } from "lucide-react"
import type { RandomizationConfig, RandomizationConstraint } from "./types"

interface RandomizationPanelProps {
    selectedNodeId?: string | null;
    nodes: any[];
    onUpdateRandomization: (nodeId: string, config: RandomizationConfig) => void;
    randomizationConfig?: RandomizationConfig;
}

const RANDOMIZATION_TYPES = [
    { id: 'block', name: 'Block Randomization', description: 'Ensures balance by randomizing in blocks' },
    { id: 'complete', name: 'Complete Randomization', description: 'Full random ordering of all items' },
    { id: 'stratified', name: 'Stratified Randomization', description: 'Ensures balance across stratification variables' },
    { id: 'latin-square', name: 'Latin Square', description: 'Counterbalancing technique to control for order effects' },
    { id: 'adaptive', name: 'Adaptive Randomization', description: 'Adjusts randomization based on participant responses' },
];

const CONSTRAINT_TYPES = [
    { id: 'no-consecutive-repeats', name: 'No Consecutive Repeats', description: 'Prevents the same stimulus from appearing consecutively' },
    { id: 'equal-distribution', name: 'Equal Distribution', description: 'Ensures equal number of each stimulus type' },
    { id: 'min-distance', name: 'Minimum Distance', description: 'Sets minimum spacing between similar stimuli' },
    { id: 'custom', name: 'Custom Constraint', description: 'Define your own randomization constraint' },
];

export default function RandomizationPanel({
    selectedNodeId,
    nodes,
    onUpdateRandomization,
    randomizationConfig
}: RandomizationPanelProps) {
    const defaultConfig: RandomizationConfig = {
        type: 'complete',
        targets: [],
        seed: Math.floor(Math.random() * 1000000),
        counterbalancing: false,
    };

    const [config, setConfig] = useState<RandomizationConfig>(randomizationConfig || defaultConfig);
    const [activeTab, setActiveTab] = useState<string>("basic");

    // Get all possible target nodes
    const availableTargets = nodes.filter(node => node.id !== selectedNodeId);

    const handleChangeConfig = (field: keyof RandomizationConfig, value: any) => {
        const updatedConfig = { ...config, [field]: value };
        setConfig(updatedConfig);
        if (selectedNodeId) {
            onUpdateRandomization(selectedNodeId, updatedConfig);
        }
    };

    const handleAddConstraint = () => {
        const newConstraint: RandomizationConstraint = {
            id: `constraint-${Date.now()}`,
            type: 'no-consecutive-repeats',
            parameters: {},
            description: 'Prevent consecutive repetition of stimuli'
        };

        const constraints = [...(config.constraints || []), newConstraint];
        handleChangeConfig('constraints', constraints);
    };

    const handleRemoveConstraint = (constraintId: string) => {
        const constraints = (config.constraints || []).filter(c => c.id !== constraintId);
        handleChangeConfig('constraints', constraints);
    };

    const handleUpdateConstraint = (constraintId: string, field: string, value: any) => {
        const constraints = (config.constraints || []).map(c => {
            if (c.id === constraintId) {
                if (field === 'type') {
                    return { ...c, type: value, parameters: {} };
                } else if (field.startsWith('param.')) {
                    const paramName = field.substring(6);
                    return { ...c, parameters: { ...c.parameters, [paramName]: value } };
                } else {
                    return { ...c, [field]: value };
                }
            }
            return c;
        });

        handleChangeConfig('constraints', constraints);
    };

    const handleAddTarget = (nodeId: string) => {
        if (!config.targets.includes(nodeId)) {
            handleChangeConfig('targets', [...config.targets, nodeId]);
        }
    };

    const handleRemoveTarget = (nodeId: string) => {
        handleChangeConfig('targets', config.targets.filter(id => id !== nodeId));
    };

    const handleAddCounterbalanceGroup = () => {
        const groups = [...(config.counterbalanceGroups || []), []];
        handleChangeConfig('counterbalanceGroups', groups);
    };

    const handleAddToGroup = (groupIndex: number, nodeId: string) => {
        const groups = [...(config.counterbalanceGroups || [])];
        if (groupIndex >= 0 && groupIndex < groups.length) {
            if (!groups[groupIndex].includes(nodeId)) {
                groups[groupIndex] = [...groups[groupIndex], nodeId];
                handleChangeConfig('counterbalanceGroups', groups);
            }
        }
    };

    const handleRemoveFromGroup = (groupIndex: number, nodeId: string) => {
        const groups = [...(config.counterbalanceGroups || [])];
        if (groupIndex >= 0 && groupIndex < groups.length) {
            groups[groupIndex] = groups[groupIndex].filter(id => id !== nodeId);
            handleChangeConfig('counterbalanceGroups', groups);
        }
    };

    return (
        <Card className="h-full  flex flex-col overflow-hidden">
            <CardHeader className="pb-1 flex-shrink-0">
                <CardTitle className="text-sm flex justify-between items-center">
                    <span className="truncate">Randomization</span>
                    {selectedNodeId && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfig(defaultConfig)}
                            className="flex-shrink-0"
                        >
                            <ShuffleIcon className="h-4 w-4 mr-1" />
                            Reset
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-2">
                    <div className="pb-4">
                        {!selectedNodeId ? (
                            <div className="text-sm text-muted-foreground">
                                Select a node to configure randomization and counterbalancing
                            </div>
                        ) : (
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 h-10">
                                    <TabsTrigger value="basic" className="text-xs px-2 truncate">
                                        Basic
                                    </TabsTrigger>
                                    <TabsTrigger value="constraints" className="text-xs px-2 truncate">
                                        Constraints
                                    </TabsTrigger>
                                    <TabsTrigger value="counterbalance" className="text-xs px-2 truncate">
                                        Balance
                                    </TabsTrigger>
                                </TabsList>

                            <TabsContent value="basic" className="space-y-4 mt-2">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Randomization Type</label>
                                    <Select
                                        value={config.type}
                                        onValueChange={(value: any) => handleChangeConfig('type', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select randomization type" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60 overflow-y-auto">
                                            {RANDOMIZATION_TYPES.map(type => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {RANDOMIZATION_TYPES.find(t => t.id === config.type)?.description}
                                    </p>
                                </div>

                                {config.type === 'block' && (
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Block Size</label>
                                        <Input
                                            type="number"
                                            min={2}
                                            value={config.blockSize || 4}
                                            onChange={(e) => handleChangeConfig('blockSize', parseInt(e.target.value) || 4)}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Items will be randomized within blocks of this size
                                        </p>
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Random Seed</label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            value={config.seed || 0}
                                            onChange={(e) => handleChangeConfig('seed', parseInt(e.target.value) || 0)}
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleChangeConfig('seed', Math.floor(Math.random() * 1000000))}
                                            className="flex-shrink-0"
                                        >
                                            <ShuffleIcon className="h-4 w-4 mr-1" />
                                            Randomize
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Setting a specific seed ensures reproducible randomization
                                    </p>
                                </div>

                                <Separator />

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Targets to Randomize</label>
                                    <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[80px]">
                                        {config.targets.length > 0 ? (
                                            config.targets.map(targetId => {
                                                const node = nodes.find(n => n.id === targetId);
                                                return (
                                                    <div
                                                        key={targetId}
                                                        className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded px-2 py-1 text-xs"
                                                    >
                                                        <span>{node?.data?.label || targetId}</span>
                                                        <button onClick={() => handleRemoveTarget(targetId)}>
                                                            <XCircle className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-xs text-muted-foreground">No targets selected</p>
                                        )}
                                    </div>
                                </div>

                                <Select onValueChange={handleAddTarget}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Add target to randomize" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60 overflow-y-auto">
                                        {availableTargets
                                            .filter(node => !config.targets.includes(node.id))
                                            .map(node => (
                                                <SelectItem key={node.id} value={node.id}>
                                                    {node.data?.label || node.id}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </TabsContent>

                            <TabsContent value="constraints" className="space-y-4 mt-2">
                                <div className="grid gap-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium">Randomization Constraints</label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddConstraint}
                                        >
                                            <PlusCircle className="h-4 w-4 mr-1" />
                                            Add
                                        </Button>
                                    </div>

                                    <div className="space-y-3 mt-2">
                                        {(config.constraints || []).length > 0 ? (
                                            (config.constraints || []).map((constraint, index) => (
                                                <div key={constraint.id} className="border rounded-md p-3 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">Constraint {index + 1}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveConstraint(constraint.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <label className="text-xs text-muted-foreground">Type</label>
                                                        <Select
                                                            value={constraint.type}
                                                            onValueChange={(value) => handleUpdateConstraint(constraint.id, 'type', value)}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select constraint type" />
                                                            </SelectTrigger>
                                                            <SelectContent className="max-h-60 overflow-y-auto">
                                                                {CONSTRAINT_TYPES.map(type => (
                                                                    <SelectItem key={type.id} value={type.id}>
                                                                        {type.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {CONSTRAINT_TYPES.find(t => t.id === constraint.type)?.description}
                                                        </p>

                                                        {constraint.type === 'min-distance' && (
                                                            <div className="grid gap-2 mt-1">
                                                                <label className="text-xs text-muted-foreground">Minimum Distance</label>
                                                                <Input
                                                                    type="number"
                                                                    min={1}
                                                                    value={constraint.parameters.distance || 2}
                                                                    onChange={(e) => handleUpdateConstraint(
                                                                        constraint.id,
                                                                        'param.distance',
                                                                        parseInt(e.target.value) || 2
                                                                    )}
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        )}

                                                        {constraint.type === 'equal-distribution' && (
                                                            <div className="grid gap-2 mt-1">
                                                                <label className="text-xs text-muted-foreground">Distribution Category</label>
                                                                <Input
                                                                    type="text"
                                                                    placeholder="E.g., stimulus type, condition"
                                                                    value={constraint.parameters.category || ""}
                                                                    onChange={(e) => handleUpdateConstraint(
                                                                        constraint.id,
                                                                        'param.category',
                                                                        e.target.value
                                                                    )}
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        )}

                                                        {constraint.type === 'custom' && (
                                                            <div className="grid gap-2 mt-1">
                                                                <label className="text-xs text-muted-foreground">Custom Description</label>
                                                                <Input
                                                                    type="text"
                                                                    placeholder="Describe your constraint"
                                                                    value={constraint.description || ""}
                                                                    onChange={(e) => handleUpdateConstraint(
                                                                        constraint.id,
                                                                        'description',
                                                                        e.target.value
                                                                    )}
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-muted-foreground text-center p-4 border border-dashed rounded-md">
                                                No constraints added yet. Add constraints to control how randomization works.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="counterbalance" className="space-y-4 mt-2">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={config.counterbalancing || false}
                                        onCheckedChange={(checked) => handleChangeConfig('counterbalancing', checked)}
                                    />
                                    <label className="text-sm font-medium">Enable Counterbalancing</label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Counterbalancing helps control for order effects by systematically varying the sequence
                                    of stimuli or conditions across participants.
                                </p>

                                {config.counterbalancing && (
                                    <div className="space-y-3 mt-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium">Counterbalance Groups</label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAddCounterbalanceGroup}
                                            >
                                                <PlusCircle className="h-4 w-4 mr-1" />
                                                Add Group
                                            </Button>
                                        </div>

                                        {(config.counterbalanceGroups || []).length > 0 ? (
                                            (config.counterbalanceGroups || []).map((group, groupIndex) => (
                                                <div key={groupIndex} className="border rounded-md p-3 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">Group {groupIndex + 1}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const groups = (config.counterbalanceGroups || [])
                                                                    .filter((_, i) => i !== groupIndex);
                                                                handleChangeConfig('counterbalanceGroups', groups);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[60px]">
                                                        {group.length > 0 ? (
                                                            group.map(nodeId => {
                                                                const node = nodes.find(n => n.id === nodeId);
                                                                return (
                                                                    <div
                                                                        key={nodeId}
                                                                        className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded px-2 py-1 text-xs"
                                                                    >
                                                                        <span>{node?.data?.label || nodeId}</span>
                                                                        <button onClick={() => handleRemoveFromGroup(groupIndex, nodeId)}>
                                                                            <XCircle className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground">No items in this group</p>
                                                        )}
                                                    </div>

                                                    <Select onValueChange={(value) => handleAddToGroup(groupIndex, value)}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Add item to group" />
                                                        </SelectTrigger>
                                                        <SelectContent className="max-h-60 overflow-y-auto">
                                                            {availableTargets
                                                                .filter(node => !group.includes(node.id))
                                                                .map(node => (
                                                                    <SelectItem key={node.id} value={node.id}>
                                                                        {node.data?.label || node.id}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-muted-foreground text-center p-4 border border-dashed rounded-md">
                                                No counterbalance groups added yet. Add groups to define what should be counterbalanced.
                                            </p>
                                        )}

                                        {config.type === 'latin-square' && (
                                            <div className="p-2 border-l-4 border-blue-500 bg-blue-50 rounded-r-md mt-3">
                                                <div className="flex items-start gap-2">
                                                    <InfoIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-medium text-blue-700">Latin Square Design Selected</p>
                                                        <p className="text-xs text-blue-600 mt-1">
                                                            With Latin Square, each group will appear in each position exactly once across participants.
                                                            This helps control for order effects.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}