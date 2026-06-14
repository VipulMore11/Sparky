"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Stage, Layer, Rect, Text, Group, Circle } from "react-konva";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CheckCircle2, Copy, Play, Save, Trash2, Plus, Router } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import pb from "@/lib/pb";

// Define types for pattern items
interface PatternItem {
    id: string;
    type: 'letter' | 'number' | 'shape' | 'color';
    value: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke?: string;
    strokeWidth?: number;
    fontSize?: number;
    fontFamily?: string;
    fontStyle?: string;
    textFill?: string;
    isSelected: boolean;
    shapeType?: 'square' | 'circle' | 'triangle' | 'hexagon';
}

// Define types for game options
interface GameOption {
    id: string;
    value: string;
    isCorrect: boolean;
}

// Define type for the game configuration
interface GameConfig {
    title: string;
    description: string;
    gridSize: {
        rows: number;
        cols: number;
    };
    cellSize: number;
    patternItems: PatternItem[];
    options: GameOption[];
    gameMode: 'multiple_choice' | 'find_next' | 'complete_pattern';
    difficulty: 'easy' | 'medium' | 'hard';
}

// Colors palette
const COLORS = [
    "#FF6B6B", // Red
    "#48CFAD", // Mint
    "#4FC1E9", // Blue
    "#AC92EC", // Purple
    "#FFCE54", // Yellow
    "#ED5565", // Dark Red
    "#FC6E51", // Orange
    "#A0D468", // Green
    "#EC87C0", // Pink
    "#5D9CEC", // Royal Blue
];

const SHAPES = ['square', 'circle', 'triangle', 'hexagon'];

// For letters and numbers
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";

const PatternMatchingBuilder = () => {
    const router = useRouter();
    // Initialize toast
    const { toast } = useToast();
    // State for the game configuration
    const [gameConfig, setGameConfig] = useState<GameConfig>({
        title: "Pattern Matching Game",
        description: "Find the correct pattern or next item in the sequence",
        gridSize: {
            rows: 2,
            cols: 4
        },
        cellSize: 80,
        patternItems: [],
        options: [
            { id: '1', value: 'A', isCorrect: true },
            { id: '2', value: 'B', isCorrect: false },
            { id: '3', value: 'C', isCorrect: false },
        ],
        gameMode: 'multiple_choice',
        difficulty: 'medium'
    });

    // State for builder UI
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [selectedTabId, setSelectedTabId] = useState<string>("builder");
    const [itemTypeToAdd, setItemTypeToAdd] = useState<'letter' | 'number' | 'shape' | 'color'>('letter');
    const [valueToAdd, setValueToAdd] = useState<string>("A");
    const [colorToAdd, setColorToAdd] = useState<string>(COLORS[0]);
    const [shapeToAdd, setShapeToAdd] = useState<'square' | 'circle' | 'triangle' | 'hexagon'>('square');
    const [previewMode, setPreviewMode] = useState<boolean>(false);
    const [OrgId, setOrgId] = useState("");

    // Selected item from the grid
    const selectedItem = gameConfig.patternItems.find(item => item.id === selectedItemId);

    useEffect(() => {
        async function getData() {
            try {
                const records = await pb.collection('custom_games').getFullList();
                setOrgId(records[0].id);
            } catch (error) {

            }
        } getData()
    }, [])

    // Initialize the grid
    useEffect(() => {
        generateEmptyGrid();
    }, [gameConfig.gridSize]);

    // Generate empty grid based on rows and columns
    const generateEmptyGrid = () => {
        // Clear existing items
        setGameConfig(prev => ({
            ...prev,
            patternItems: []
        }));
    };

    // Generate a cell position based on the grid
    const getCellPosition = (row: number, col: number) => {
        const cellSize = gameConfig.cellSize;
        const gap = 10; // Gap between cells
        const x = col * (cellSize + gap) + 20; // 20px left padding
        const y = row * (cellSize + gap) + 20; // 20px top padding
        return { x, y };
    };

    // Create a new item object
    const createNewItem = (type: 'letter' | 'number' | 'shape' | 'color', value: string, x: number, y: number): PatternItem => {
        const cellSize = gameConfig.cellSize;

        return {
            id: Math.random().toString(36).substring(2),
            type,
            value,
            x,
            y,
            width: cellSize,
            height: cellSize,
            fill: type === 'color' ? value : colorToAdd,
            stroke: '#333333',
            strokeWidth: 2,
            fontSize: cellSize * 0.5,
            fontFamily: 'Arial',
            fontStyle: 'bold',
            textFill: '#FFFFFF',
            isSelected: false,
            shapeType: type === 'shape' ? (value as 'square' | 'circle' | 'triangle' | 'hexagon') : undefined
        };
    };

    // Add a new item to the grid
    const addItemToGrid = (row: number, col: number) => {
        const { x, y } = getCellPosition(row, col);
        const cellSize = gameConfig.cellSize;

        // Check if there's already an item at this position
        const existingItemIndex = gameConfig.patternItems.findIndex(
            item => item.x === x && item.y === y
        );

        if (existingItemIndex !== -1) {
            // Replace the existing item
            const newItems = [...gameConfig.patternItems];
            newItems.splice(existingItemIndex, 1);
            setGameConfig(prev => ({
                ...prev,
                patternItems: newItems
            }));
            return;
        }

        const newItem = createNewItem(
            itemTypeToAdd,
            itemTypeToAdd === 'shape' ? shapeToAdd : valueToAdd,
            x,
            y
        );

        setGameConfig(prev => ({
            ...prev,
            patternItems: [...prev.patternItems, newItem]
        }));
    };

    // Handle drag from asset library
    const handleAssetDragStart = (e: any, type: 'letter' | 'number' | 'shape' | 'color', value: string) => {
        // Set the data for drag operation
        e.dataTransfer.setData('asset_type', type);
        e.dataTransfer.setData('asset_value', value);
        e.dataTransfer.effectAllowed = 'copy';

        // Create a custom drag image for better visual feedback
        const dragPreview = document.createElement('div');
        dragPreview.className = 'drag-preview';

        if (type === 'letter' || type === 'number') {
            // For letters and numbers
            dragPreview.style.width = '60px';
            dragPreview.style.height = '60px';
            dragPreview.style.backgroundColor = type === 'letter' ? '#3b82f6' : '#10b981'; // Blue or Green
            dragPreview.style.color = 'white';
            dragPreview.style.display = 'flex';
            dragPreview.style.alignItems = 'center';
            dragPreview.style.justifyContent = 'center';
            dragPreview.style.borderRadius = '6px';
            dragPreview.style.fontWeight = 'bold';
            dragPreview.style.fontSize = '24px';
            dragPreview.style.fontFamily = 'Arial';
            dragPreview.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            dragPreview.style.opacity = '0.9';
            dragPreview.textContent = value;
        } else if (type === 'shape') {
            // For shapes
            dragPreview.style.width = '60px';
            dragPreview.style.height = '60px';
            dragPreview.style.backgroundColor = '#9333ea'; // Purple
            dragPreview.style.color = 'white';
            dragPreview.style.display = 'flex';
            dragPreview.style.alignItems = 'center';
            dragPreview.style.justifyContent = 'center';
            dragPreview.style.borderRadius = '6px';
            dragPreview.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            dragPreview.style.opacity = '0.9';

            // Add shape visual
            const innerShape = document.createElement('div');
            if (value === 'square') {
                innerShape.style.width = '36px';
                innerShape.style.height = '36px';
                innerShape.style.backgroundColor = 'white';
            } else if (value === 'circle') {
                innerShape.style.width = '36px';
                innerShape.style.height = '36px';
                innerShape.style.backgroundColor = 'white';
                innerShape.style.borderRadius = '50%';
            } else if (value === 'triangle') {
                innerShape.style.width = '0';
                innerShape.style.height = '0';
                innerShape.style.borderLeft = '18px solid transparent';
                innerShape.style.borderRight = '18px solid transparent';
                innerShape.style.borderBottom = '36px solid white';
            } else {
                // Hexagon or other shapes - simple representation
                innerShape.textContent = value.substring(0, 3);
                innerShape.style.color = '#9333ea';
                innerShape.style.backgroundColor = 'white';
                innerShape.style.width = '36px';
                innerShape.style.height = '36px';
                innerShape.style.borderRadius = '50%';
                innerShape.style.display = 'flex';
                innerShape.style.alignItems = 'center';
                innerShape.style.justifyContent = 'center';
                innerShape.style.fontSize = '12px';
                innerShape.style.fontWeight = 'bold';
            }
            dragPreview.appendChild(innerShape);
        } else if (type === 'color') {
            // For colors
            dragPreview.style.width = '60px';
            dragPreview.style.height = '60px';
            dragPreview.style.backgroundColor = value;
            dragPreview.style.borderRadius = '6px';
            dragPreview.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            dragPreview.style.opacity = '0.9';
            dragPreview.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        }

        // Hide the preview element (it needs to be in the DOM for the preview to work)
        dragPreview.style.position = 'absolute';
        dragPreview.style.left = '-9999px';
        document.body.appendChild(dragPreview);

        // Set the drag image
        e.dataTransfer.setDragImage(dragPreview, 30, 30);

        // Clean up the preview element after the drag operation is complete
        setTimeout(() => {
            document.body.removeChild(dragPreview);
        }, 0);
    };

    // Handle drop on the canvas
    const handleCanvasDrop = (e: React.DragEvent) => {
        if (previewMode) return;

        e.preventDefault();

        // Get the stage container
        const stageContainer = document.querySelector('.konva-stage-container');
        if (!stageContainer) return;

        // Get the type and value from the dragged item
        const assetType = e.dataTransfer.getData('asset_type') as 'letter' | 'number' | 'shape' | 'color';
        const assetValue = e.dataTransfer.getData('asset_value');

        if (!assetType || !assetValue) return;

        // Calculate position relative to the stage
        const stageRect = stageContainer.getBoundingClientRect();
        const x = e.clientX - stageRect.left;
        const y = e.clientY - stageRect.top;

        // Find the nearest grid cell
        const cellSize = gameConfig.cellSize;
        const gap = 10;
        const padding = 20;

        // Calculate the closest grid cell
        const col = Math.floor((x - padding) / (cellSize + gap));
        const row = Math.floor((y - padding) / (cellSize + gap));

        // Check if the position is within grid bounds
        if (row >= 0 && row < gameConfig.gridSize.rows &&
            col >= 0 && col < gameConfig.gridSize.cols) {

            // Get the actual position of the cell
            const cellPosition = getCellPosition(row, col);

            // Create and add the new item
            const newItem = createNewItem(assetType, assetValue, cellPosition.x, cellPosition.y);

            // Check if there's already an item at this position
            const existingItemIndex = gameConfig.patternItems.findIndex(
                item => item.x === cellPosition.x && item.y === cellPosition.y
            );

            if (existingItemIndex !== -1) {
                // Replace the existing item
                const newItems = [...gameConfig.patternItems];
                newItems.splice(existingItemIndex, 1, newItem);
                setGameConfig(prev => ({
                    ...prev,
                    patternItems: newItems
                }));
            } else {
                // Add new item
                setGameConfig(prev => ({
                    ...prev,
                    patternItems: [...prev.patternItems, newItem]
                }));

                // Show success toast
                toast({
                    title: "Item Added",
                    description: `Added ${assetType} to the grid`,
                    variant: "success",
                });
            }
        }

        // Reset highlighted cell after drop
        setHighlightedCell(null);
    };

    // Track the currently highlighted cell during drag operations
    const [highlightedCell, setHighlightedCell] = useState<{ row: number, col: number } | null>(null);

    // Handle dragover on canvas
    const handleCanvasDragOver = (e: React.DragEvent) => {
        if (previewMode) return;
        e.preventDefault();

        // Get the stage container
        const stageContainer = document.querySelector('.konva-stage-container');
        if (!stageContainer) return;

        // Calculate position relative to the stage
        const stageRect = stageContainer.getBoundingClientRect();
        const x = e.clientX - stageRect.left;
        const y = e.clientY - stageRect.top;

        // Find the nearest grid cell
        const cellSize = gameConfig.cellSize;
        const gap = 10;
        const padding = 20;

        // Calculate the closest grid cell
        const col = Math.floor((x - padding) / (cellSize + gap));
        const row = Math.floor((y - padding) / (cellSize + gap));

        // Check if the position is within grid bounds
        if (row >= 0 && row < gameConfig.gridSize.rows &&
            col >= 0 && col < gameConfig.gridSize.cols) {

            // Update the highlighted cell in state
            if (!highlightedCell || highlightedCell.row !== row || highlightedCell.col !== col) {
                setHighlightedCell({ row, col });
            }
        } else {
            // Reset highlighted cell if out of bounds
            if (highlightedCell) {
                setHighlightedCell(null);
            }
        }
    };

    // Handle item selection
    const handleItemSelect = (id: string) => {
        setSelectedItemId(id);

        // Update selection state in all items
        setGameConfig(prev => ({
            ...prev,
            patternItems: prev.patternItems.map(item => ({
                ...item,
                isSelected: item.id === id
            }))
        }));
    };

    // Delete selected item
    const deleteSelectedItem = () => {
        if (!selectedItemId) return;

        // Get the item that's being deleted for the toast message
        const itemToDelete = gameConfig.patternItems.find(item => item.id === selectedItemId);

        setGameConfig(prev => ({
            ...prev,
            patternItems: prev.patternItems.filter(item => item.id !== selectedItemId)
        }));

        setSelectedItemId(null);

        // Show toast message
        if (itemToDelete) {
            toast({
                title: "Item Deleted",
                description: `Removed ${itemToDelete.type} from the grid`,
                variant: "destructive",
            });
        }
    };

    // Update item property
    const updateItemProperty = (property: keyof PatternItem, value: any) => {
        if (!selectedItemId) return;

        setGameConfig(prev => ({
            ...prev,
            patternItems: prev.patternItems.map(item =>
                item.id === selectedItemId ? { ...item, [property]: value } : item
            )
        }));
    };

    // Add a new option
    const addOption = () => {
        const newOption: GameOption = {
            id: Math.random().toString(36).substring(2),
            value: String.fromCharCode(65 + gameConfig.options.length % 26), // A, B, C, ...
            isCorrect: false
        };

        setGameConfig(prev => ({
            ...prev,
            options: [...prev.options, newOption]
        }));
    };

    // Delete an option
    const deleteOption = (id: string) => {
        setGameConfig(prev => ({
            ...prev,
            options: prev.options.filter(option => option.id !== id)
        }));
    };

    // Update option value
    const updateOptionValue = (id: string, value: string) => {
        setGameConfig(prev => ({
            ...prev,
            options: prev.options.map(option =>
                option.id === id ? { ...option, value } : option
            )
        }));
    };

    // Set correct option
    const setCorrectOption = (id: string) => {
        setGameConfig(prev => ({
            ...prev,
            options: prev.options.map(option => ({
                ...option,
                isCorrect: option.id === id
            }))
        }));
    };

    // Save game configuration to JSON
    const saveGameConfig = async () => {
        try {
            const configString = JSON.stringify(gameConfig, null, 2);
            console.log(configString);

            const data = {
                "organization": OrgId,
                "created_by": pb.authStore.model?.id,
                "data": configString
            };

            await pb.collection('custom_games').create(data);

            // navigate after successful save
            router.push('/experiment/create-games');
        } catch (error) {
            console.error(error);
            toast({
                title: "Save failed",
                description: "Could not save game configuration.",
                variant: "destructive",
            });
        }
    };

    // Toggle preview mode
    const togglePreviewMode = () => {
        setPreviewMode(!previewMode);
    };

    return (
        <ToastProvider>
            <div className="min-h-screen bg-background text-foreground">
                {/* Header */}
                <header className="bg-card/80 backdrop-blur-sm border-b border-border p-4">
                    <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Pattern Matching Game Builder</h1>
                            <p className="text-muted-foreground">Create your own pattern recognition puzzles</p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant={previewMode ? "default" : "outline"}
                                className={previewMode ? "bg-primary hover:bg-primary/90" : ""}
                                onClick={togglePreviewMode}
                            >
                                <Play className="w-4 h-4 mr-2" />
                                {previewMode ? "Exit Preview" : "Preview Game"}
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="container mx-auto p-4">
                    <Tabs defaultValue="builder" onValueChange={setSelectedTabId} className="w-full">
                        <TabsList className="mb-4 bg-muted">
                            <TabsTrigger value="builder">Game Builder</TabsTrigger>
                            <TabsTrigger value="options">Answer Options</TabsTrigger>
                            <TabsTrigger value="settings">Game Settings</TabsTrigger>
                        </TabsList>

                        {/* Builder Tab */}
                        <TabsContent value="builder" className="flex flex-col lg:flex-row gap-6">
                            {/* Pattern Grid */}
                            <div className="flex-1">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Pattern Grid</CardTitle>
                                        <CardDescription>
                                            Click on cells to add items. {previewMode && "Preview Mode - Click to interact with the game"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div
                                            className="bg-muted/30 rounded-lg p-4 relative overflow-auto konva-stage-container transition-colors cursor-crosshair"
                                            style={{ minHeight: '500px' }}
                                            onDrop={(e) => {
                                                handleCanvasDrop(e);
                                                // Remove highlight effect on drop
                                                e.currentTarget.classList.remove('bg-muted/50', 'border-dashed', 'border-2', 'border-primary');
                                            }}
                                            onDragOver={(e) => {
                                                handleCanvasDragOver(e);
                                                // Add highlight effect
                                                if (!previewMode) {
                                                    e.currentTarget.classList.add('bg-muted/50', 'border-dashed', 'border-2', 'border-primary');
                                                }
                                            }}
                                            onDragLeave={(e) => {
                                                // Remove highlight effect when dragging out
                                                e.currentTarget.classList.remove('bg-muted/50', 'border-dashed', 'border-2', 'border-primary');
                                                // Reset highlighted cell
                                                setHighlightedCell(null);
                                            }}
                                        >
                                            <Stage
                                                width={gameConfig.gridSize.cols * (gameConfig.cellSize + 10) + 40}
                                                height={gameConfig.gridSize.rows * (gameConfig.cellSize + 10) + 40}
                                            >
                                                <Layer>
                                                    {/* Grid background */}
                                                    {Array.from({ length: gameConfig.gridSize.rows }).map((_, rowIndex) =>
                                                        Array.from({ length: gameConfig.gridSize.cols }).map((_, colIndex) => {
                                                            const { x, y } = getCellPosition(rowIndex, colIndex);
                                                            return (
                                                                <Rect
                                                                    key={`cell-${rowIndex}-${colIndex}`}
                                                                    x={x}
                                                                    y={y}
                                                                    width={gameConfig.cellSize}
                                                                    height={gameConfig.cellSize}
                                                                    fill={highlightedCell && highlightedCell.row === rowIndex && highlightedCell.col === colIndex ? "hsl(var(--muted))" : "hsl(var(--card))"}
                                                                    stroke={highlightedCell && highlightedCell.row === rowIndex && highlightedCell.col === colIndex ? "hsl(var(--primary))" : "hsl(var(--border))"}
                                                                    strokeWidth={highlightedCell && highlightedCell.row === rowIndex && highlightedCell.col === colIndex ? 2 : 1}
                                                                    cornerRadius={4}
                                                                    onClick={() => !previewMode && addItemToGrid(rowIndex, colIndex)}
                                                                    onTap={() => !previewMode && addItemToGrid(rowIndex, colIndex)}
                                                                    onMouseEnter={(e) => {
                                                                        if (previewMode) return;
                                                                        const container = e.target.getStage()?.container();
                                                                        if (container) container.style.cursor = 'pointer';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        const container = e.target.getStage()?.container();
                                                                        if (container) container.style.cursor = 'default';
                                                                    }}
                                                                />
                                                            );
                                                        })
                                                    )}

                                                    {/* Pattern items */}
                                                    {gameConfig.patternItems.map(item => {
                                                        if (item.type === 'letter' || item.type === 'number') {
                                                            return (
                                                                <Group key={item.id}>
                                                                    <Rect
                                                                        x={item.x}
                                                                        y={item.y}
                                                                        width={item.width}
                                                                        height={item.height}
                                                                        fill={item.fill}
                                                                        stroke={item.isSelected ? '#FFFFFF' : item.stroke}
                                                                        strokeWidth={item.isSelected ? 3 : item.strokeWidth}
                                                                        cornerRadius={4}
                                                                        onClick={() => !previewMode && handleItemSelect(item.id)}
                                                                        onTap={() => !previewMode && handleItemSelect(item.id)}
                                                                        onMouseEnter={(e) => {
                                                                            if (previewMode) return;
                                                                            const container = e.target.getStage()?.container();
                                                                            if (container) container.style.cursor = 'pointer';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            const container = e.target.getStage()?.container();
                                                                            if (container) container.style.cursor = 'default';
                                                                        }}
                                                                    />
                                                                    <Text
                                                                        x={item.x}
                                                                        y={item.y}
                                                                        width={item.width}
                                                                        height={item.height}
                                                                        text={item.value}
                                                                        fontSize={item.fontSize}
                                                                        fontFamily={item.fontFamily}
                                                                        fontStyle={item.fontStyle}
                                                                        fill={item.textFill}
                                                                        align="center"
                                                                        verticalAlign="middle"
                                                                    />
                                                                </Group>
                                                            );
                                                        } else if (item.type === 'shape') {
                                                            return (
                                                                <Group key={item.id}>
                                                                    {item.shapeType === 'square' ? (
                                                                        <Rect
                                                                            x={item.x}
                                                                            y={item.y}
                                                                            width={item.width}
                                                                            height={item.height}
                                                                            fill={item.fill}
                                                                            stroke={item.isSelected ? '#FFFFFF' : item.stroke}
                                                                            strokeWidth={item.isSelected ? 3 : item.strokeWidth}
                                                                            onClick={() => !previewMode && handleItemSelect(item.id)}
                                                                            onTap={() => !previewMode && handleItemSelect(item.id)}
                                                                            onMouseEnter={(e) => {
                                                                                if (previewMode) return;
                                                                                const container = e.target.getStage()?.container();
                                                                                if (container) container.style.cursor = 'pointer';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                const container = e.target.getStage()?.container();
                                                                                if (container) container.style.cursor = 'default';
                                                                            }}
                                                                        />
                                                                    ) : item.shapeType === 'circle' ? (
                                                                        <Circle
                                                                            x={item.x + item.width / 2}
                                                                            y={item.y + item.height / 2}
                                                                            radius={item.width / 2}
                                                                            fill={item.fill}
                                                                            stroke={item.isSelected ? '#FFFFFF' : item.stroke}
                                                                            strokeWidth={item.isSelected ? 3 : item.strokeWidth}
                                                                            onClick={() => !previewMode && handleItemSelect(item.id)}
                                                                            onTap={() => !previewMode && handleItemSelect(item.id)}
                                                                            onMouseEnter={(e) => {
                                                                                if (previewMode) return;
                                                                                const container = e.target.getStage()?.container();
                                                                                if (container) container.style.cursor = 'pointer';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                const container = e.target.getStage()?.container();
                                                                                if (container) container.style.cursor = 'default';
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        // Triangle or hexagon as a fallback shape
                                                                        <Rect
                                                                            x={item.x}
                                                                            y={item.y}
                                                                            width={item.width}
                                                                            height={item.height}
                                                                            fill={item.fill}
                                                                            stroke={item.isSelected ? '#FFFFFF' : item.stroke}
                                                                            strokeWidth={item.isSelected ? 3 : item.strokeWidth}
                                                                            onClick={() => !previewMode && handleItemSelect(item.id)}
                                                                            onTap={() => !previewMode && handleItemSelect(item.id)}
                                                                        />
                                                                    )}
                                                                </Group>
                                                            );
                                                        } else {
                                                            // Color item (simple colored square)
                                                            return (
                                                                <Rect
                                                                    key={item.id}
                                                                    x={item.x}
                                                                    y={item.y}
                                                                    width={item.width}
                                                                    height={item.height}
                                                                    fill={item.fill}
                                                                    stroke={item.isSelected ? '#FFFFFF' : item.stroke}
                                                                    strokeWidth={item.isSelected ? 3 : item.strokeWidth}
                                                                    cornerRadius={4}
                                                                    onClick={() => !previewMode && handleItemSelect(item.id)}
                                                                    onTap={() => !previewMode && handleItemSelect(item.id)}
                                                                    onMouseEnter={(e) => {
                                                                        if (previewMode) return;
                                                                        const container = e.target.getStage()?.container();
                                                                        if (container) container.style.cursor = 'pointer';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        const container = e.target.getStage()?.container();
                                                                        if (container) container.style.cursor = 'default';
                                                                    }}
                                                                />
                                                            );
                                                        }
                                                    })}
                                                </Layer>
                                            </Stage>

                                            {/* Preview mode overlay with options */}
                                            {previewMode && (
                                                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                                    <div className="bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border flex flex-wrap gap-2 justify-center">
                                                        {gameConfig.options.map(option => (
                                                            <Button
                                                                key={option.id}
                                                                variant="outline"
                                                                className="min-w-[60px]"
                                                                onClick={() => {
                                                                    // Show if correct in preview mode
                                                                    toast({
                                                                        title: option.isCorrect ? "Correct answer!" : "Incorrect",
                                                                        description: option.isCorrect ? "Well done!" : "Try again",
                                                                        variant: option.isCorrect ? "default" : "destructive",
                                                                    });
                                                                }}
                                                            >
                                                                {option.value}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Item Controls */}
                            <div className="lg:w-80">
                                <div className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Asset Library</CardTitle>
                                            <CardDescription>
                                                Drag and drop items onto the grid
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Letter assets */}
                                            <div className="mb-6">
                                                <h3 className="text-md font-semibold mb-2">Letters</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {ALPHABET.split('').map(letter => (
                                                        <div
                                                            key={`letter-${letter}`}
                                                            className="w-10 h-10 flex items-center justify-center bg-accent text-accent-foreground rounded-md cursor-move hover:scale-110 transition-transform shadow-md"
                                                            draggable
                                                            onDragStart={(e) => handleAssetDragStart(e, 'letter', letter)}
                                                        >
                                                            <span className="text-lg font-bold">{letter}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Number assets */}
                                            <div className="mb-6">
                                                <h3 className="text-md font-semibold mb-2">Numbers</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {NUMBERS.split('').map(num => (
                                                        <div
                                                            key={`number-${num}`}
                                                            className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-md cursor-move hover:scale-110 transition-transform shadow-md"
                                                            draggable
                                                            onDragStart={(e) => handleAssetDragStart(e, 'number', num)}
                                                        >
                                                            <span className="text-lg font-bold">{num}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                            </div>

                                            {/* Shape assets */}
                                            <div className="mb-6">
                                                <h3 className="text-md font-semibold mb-2">Shapes</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {SHAPES.map(shape => (
                                                        <div
                                                            key={`shape-${shape}`}
                                                            className="w-10 h-10 flex items-center justify-center bg-secondary text-secondary-foreground rounded-md cursor-move hover:scale-110 transition-transform shadow-md"
                                                            draggable
                                                            onDragStart={(e) => handleAssetDragStart(e, 'shape', shape)}
                                                            title={shape.charAt(0).toUpperCase() + shape.slice(1)}
                                                        >
                                                            {shape === 'square' && <div className="w-6 h-6 bg-background rounded-sm" />}
                                                            {shape === 'circle' && <div className="w-6 h-6 bg-background rounded-full" />}
                                                            {shape === 'triangle' && <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-background" />}
                                                            {shape === 'hexagon' && <div className="w-6 h-6 bg-background rounded-full flex items-center justify-center">
                                                                <span className="text-xs text-secondary">hex</span>
                                                            </div>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Color assets */}
                                            <div className="mb-6">
                                                <h3 className="text-md font-semibold mb-2">Colors</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {COLORS.map(color => (
                                                        <div
                                                            key={`color-${color}`}
                                                            className="w-10 h-10 rounded-md cursor-move hover:scale-110 transition-transform shadow-md border border-border"
                                                            style={{ backgroundColor: color }}
                                                            draggable
                                                            onDragStart={(e) => handleAssetDragStart(e, 'color', color)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-slate-700">
                                                <Button
                                                    variant="destructive"
                                                    className="w-full"
                                                    onClick={deleteSelectedItem}
                                                    disabled={!selectedItemId}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete Selected Item
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Grid settings */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Grid Settings</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="rows">Rows: {gameConfig.gridSize.rows}</Label>
                                                <Slider
                                                    id="rows"
                                                    min={1}
                                                    max={8}
                                                    step={1}
                                                    value={[gameConfig.gridSize.rows]}
                                                    onValueChange={(value) =>
                                                        setGameConfig(prev => ({
                                                            ...prev,
                                                            gridSize: { ...prev.gridSize, rows: value[0] }
                                                        }))
                                                    }
                                                    className="my-2"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="cols">Columns: {gameConfig.gridSize.cols}</Label>
                                                <Slider
                                                    id="cols"
                                                    min={1}
                                                    max={8}
                                                    step={1}
                                                    value={[gameConfig.gridSize.cols]}
                                                    onValueChange={(value) =>
                                                        setGameConfig(prev => ({
                                                            ...prev,
                                                            gridSize: { ...prev.gridSize, cols: value[0] }
                                                        }))
                                                    }
                                                    className="my-2"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="cellSize">Cell Size: {gameConfig.cellSize}px</Label>
                                                <Slider
                                                    id="cellSize"
                                                    min={40}
                                                    max={120}
                                                    step={5}
                                                    value={[gameConfig.cellSize]}
                                                    onValueChange={(value) =>
                                                        setGameConfig(prev => ({
                                                            ...prev,
                                                            cellSize: value[0]
                                                        }))
                                                    }
                                                    className="my-2"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Options Tab */}
                        <TabsContent value="options">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Answer Options</CardTitle>
                                        <CardDescription>
                                            Create options and select the correct answer
                                        </CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={addOption}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Option
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {gameConfig.options.length === 0 ? (
                                            <div className="text-center p-6 border border-dashed border-border rounded-lg">
                                                <p className="text-muted-foreground">No options added yet</p>
                                                <Button variant="outline" className="mt-2" onClick={addOption}>
                                                    Add Your First Option
                                                </Button>
                                            </div>
                                        ) : (
                                            gameConfig.options.map(option => (
                                                <div key={option.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                                                    <div className="w-8 h-8 flex items-center justify-center">
                                                        <input
                                                            type="radio"
                                                            id={`option-${option.id}`}
                                                            name="correct-option"
                                                            checked={option.isCorrect}
                                                            onChange={() => setCorrectOption(option.id)}
                                                            className="w-4 h-4"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Input
                                                            value={option.value}
                                                            onChange={(e) => updateOptionValue(option.id, e.target.value)}
                                                            placeholder="Option value"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {option.isCorrect && (
                                                            <span className="text-primary flex items-center">
                                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                Correct
                                                            </span>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => deleteOption(option.id)}
                                                            className="text-muted-foreground hover:text-destructive"
                                                            disabled={gameConfig.options.length <= 1}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="mt-6 p-3 bg-muted/30 rounded-lg">
                                        <p className="flex items-center text-primary">
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            Make sure to select at least one correct answer
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Game Settings</CardTitle>
                                    <CardDescription>
                                        Configure general game settings and metadata
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="gameTitle">Game Title</Label>
                                            <Input
                                                id="gameTitle"
                                                value={gameConfig.title}
                                                onChange={(e) => setGameConfig(prev => ({ ...prev, title: e.target.value }))}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="gameDescription">Description</Label>
                                            <Input
                                                id="gameDescription"
                                                value={gameConfig.description}
                                                onChange={(e) => setGameConfig(prev => ({ ...prev, description: e.target.value }))}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="difficulty">Difficulty</Label>
                                            <Select
                                                value={gameConfig.difficulty}
                                                onValueChange={(value: any) =>
                                                    setGameConfig(prev => ({ ...prev, difficulty: value }))
                                                }
                                            >
                                                <SelectTrigger id="difficulty">
                                                    <SelectValue placeholder="Select difficulty" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="easy">Easy</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="hard">Hard</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <Button
                                            className="w-full"
                                            onClick={saveGameConfig}
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Game Configuration
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <ToastViewport />
        </ToastProvider>
    );
};

export default PatternMatchingBuilder;