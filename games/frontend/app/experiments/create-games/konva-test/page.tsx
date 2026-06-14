"use client";

import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Text, Group, Image } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from 'konva';
import NewFeaturesBanner from './banner';
import useImage from "use-image";
import myimg from "../../../assets/Photo-resized-for-gate.jpg"
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import ParameterTrackingPanel from "@/components/experiments/game-creator/parameter-tracking-panel";
import ExperimentFlowHandler from "./experiment-flow-handler";
import SimpleExperimentFlow from "./simple-experiment-flow";

// Define images to use as assets
const IMAGES = [
    "/placeholder-logo.png",
    "/placeholder-user.jpg",
    "/placeholder.jpg",
    "/placeholder-logo.svg",
    "/placeholder.svg",
    "https://www.shutterstock.com/shutterstock/photos/2286554497/display_1500/stock-photo-random-pictures-cute-and-funny-2286554497.jpg"
];

const BACKGROUND_IMAGES = [
    "/placeholder.jpg",
    "https://images.unsplash.com/photo-1506765515384-028b60a970df?q=80&w=1000",
    "https://img.freepik.com/free-vector/cartoon-game-background-outdoor-landscape-with-road_1268-16532.jpg",
    "https://static.vecteezy.com/system/resources/previews/009/948/963/non_2x/cartoon-game-background-sea-bottom-landscape-free-vector.jpg",
];

// Define types
interface GameAsset {
    id: string;
    type: "image";
    imageUrl?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    events?: {
        onClick?: {
            type: 'bounce' | 'fade' | 'rotate' | 'scale' | 'shake' | 'translateX' | 'translateY' | 'path';
            duration: number;
            intensity?: number; // For scale, shake, path intensity
            distance?: number;  // For translate distance
            path?: 'circle' | 'zigzag' | 'wave'; // For path movement type
        };
        onHover?: {
            type: 'glow' | 'scale' | 'color';
            duration: number;
            intensity?: number;
        };
        onDragStart?: {
            type: 'scale' | 'rotate';
            intensity?: number;
        };
        onDragEnd?: {
            type: 'snap' | 'bounce';
            intensity?: number;
        };
    };
    // Cognitive assessment parameters specific to this asset
    cognitiveRole?: {
        isTarget: boolean;                        // Whether this asset is a target or distractor
        role: 'stimulus' | 'response' | 'distractor' | 'feedback'; // Role in cognitive task
        stimulusCategory?: string;                // Category this stimulus belongs to (e.g., "animal", "letter")
        correctResponse?: boolean;                // Whether clicking this is a correct response
        stimulusDelay?: number;                   // Time before this stimulus appears (ms)
        stimulusDuration?: number;                // How long the stimulus remains visible (ms)
        requiredResponseTime?: number;            // Required time to respond (ms)
        value?: number;                           // Value/reward associated with this stimulus
        difficulty?: 'easy' | 'medium' | 'hard';  // Difficulty level of this stimulus
        sequence?: number;                        // Order in sequence (for memory/sequence tasks)
        trackingData?: {                          // Data tracked when user interacts with this asset
            responseTime?: boolean;               // Track response time
            accuracy?: boolean;                   // Track response accuracy
            mouseTrajectory?: boolean;            // Track mouse/touch movement path
            tapPressure?: boolean;                // Track tap/click pressure (if available)
            hesitations?: boolean;                // Track hesitation before interaction
        };
    };
}

// Types for cognitive assessment parameters
interface ReactionTimeParams {
    enabled: boolean;
    minResponseTime?: number;  // minimum time in ms to wait before recording response 
    maxResponseTime?: number;  // maximum time in ms to wait for response
    randomizedDelay?: boolean; // randomize delay before stimulus appears
    minDelay?: number;         // minimum delay in ms before stimulus appears
    maxDelay?: number;         // maximum delay in ms before stimulus appears
    trials?: number;           // number of trials for reaction time test
}

interface MemoryParams {
    enabled: boolean;
    memoryStimuliCount?: number;  // number of items to remember
    presentationTime?: number;    // time in ms each item is shown
    delayBeforeRecall?: number;   // delay in ms before asking for recall
    complexity?: 'simple' | 'medium' | 'complex'; // difficulty level
}

interface AttentionParams {
    enabled: boolean;
    sustainedAttentionDuration?: number; // duration in seconds for sustained attention task
    distractorFrequency?: number;       // frequency of distractors (0-100%)
    targetFrequency?: number;           // frequency of targets (0-100%)
    taskComplexity?: 'simple' | 'medium' | 'complex'; // complexity of attention task
    multipleTargets?: boolean;          // track multiple targets simultaneously
}

interface ExecutiveFunctionParams {
    enabled: boolean;
    taskSwitchingFrequency?: number;    // how often tasks change (seconds)
    inhibitionRequired?: boolean;       // requires inhibiting automatic responses
    planningComplexity?: 'simple' | 'medium' | 'complex'; // complexity of planning task
    ruleChangeFrequency?: number;       // how often rules change during task
}

interface PerceptualSkillParams {
    enabled: boolean;
    visualDiscriminationLevel?: 'easy' | 'medium' | 'difficult'; // difficulty of visual discrimination
    patternRecognitionComplexity?: 'simple' | 'medium' | 'complex'; // complexity of patterns
    spatialAwarenessRequired?: boolean; // whether spatial awareness is tested
}

interface MotorSkillParams {
    enabled: boolean;
    precisionRequired?: 'low' | 'medium' | 'high'; // precision required for motor tasks
    speedRequired?: 'slow' | 'medium' | 'fast';   // speed required for motor tasks
    sequenceComplexity?: 'simple' | 'medium' | 'complex'; // complexity of motor sequences
    steadinessRequired?: boolean;       // whether steadiness is required
}

interface DecisionMakingParams {
    enabled: boolean;
    timeLimit?: number;                // time limit for decisions in ms
    uncertaintyLevel?: 'low' | 'medium' | 'high'; // level of uncertainty in decisions
    riskRewardTradeoff?: boolean;      // whether risk-reward tradeoff is present
    feedbackType?: 'none' | 'immediate' | 'delayed'; // type of feedback provided
}

interface CognitiveAssessmentParameters {
    reactionTime: ReactionTimeParams;
    memory: MemoryParams;
    attention: AttentionParams;
    executiveFunction: ExecutiveFunctionParams;
    perceptualSkills: PerceptualSkillParams;
    motorSkills: MotorSkillParams;
    decisionMaking: DecisionMakingParams;
    dataCollection: {
        collectMouseMovement: boolean;  // track mouse/touch movement paths
        collectTimestamps: boolean;     // record timestamps for all interactions
        collectErrorRate: boolean;      // record errors made during task
        recordHesitations: boolean;     // record pauses/hesitations
        sessionDuration: number;        // maximum session duration in minutes
    };
    adaptiveDifficulty: {
        enabled: boolean;               // whether difficulty adapts based on performance
        adaptationRate: number;         // how quickly difficulty adapts (1-10)
        performanceThreshold: number;   // performance threshold for adaptation (0-100%)
    };
}

interface GameConfig {
    background: {
        color: string;
        image?: string;
    };
    assets: Array<GameAsset>;
    // Global cognitive parameters that apply to the whole game
    globalParameters: {
        gameType: 'reaction-time' | 'memory' | 'attention' | 'executive-function' | 'motor-skills' | 'decision-making' | 'custom';
        difficulty: 'easy' | 'medium' | 'hard';
        dataCollection: {
            collectMouseMovement: boolean;  // track mouse/touch movement paths
            collectTimestamps: boolean;     // record timestamps for all interactions
            collectErrorRate: boolean;      // record errors made during task
            recordHesitations: boolean;     // record pauses/hesitations
            sessionDuration: number;        // maximum session duration in minutes
        };
        adaptiveDifficulty: {
            enabled: boolean;               // whether difficulty adapts based on performance
            adaptationRate: number;         // how quickly difficulty adapts (1-10)
            performanceThreshold: number;   // performance threshold for adaptation (0-100%)
        };
        instructions?: string;
    };
}

// Image component for Konva
interface KonvaImageProps {
    imageUrl?: string;
    width: number;
    height: number;
    onAnimationTrigger: (e: KonvaEventObject<MouseEvent>) => void;
}

const KonvaImage: React.FC<KonvaImageProps> = ({ imageUrl, width, height, onAnimationTrigger }) => {
    const [image] = useImage(imageUrl || '');
    return (
        <Image
            image={image}
            width={width}
            height={height}
            onClick={onAnimationTrigger}
        />
    );
};

// Background image component for Konva
interface KonvaBackgroundProps {
    imageUrl?: string;
    width: number;
    height: number;
}

const KonvaBackground: React.FC<KonvaBackgroundProps> = ({ imageUrl, width, height }) => {
    const [image] = useImage(imageUrl || '');
    return (
        <Image
            image={image}
            width={width}
            height={height}
            opacity={0.9}
        />
    );
};

function SimpleKonvaTest() {
    // Initialize with only the last starter asset to keep the canvas minimal
    const [assets, setAssets] = useState<GameAsset[]>([
        {
            id: "demo-2",
            type: "image",
            imageUrl: "/assets/star.png",
            x: 400,
            y: 300,
            width: 60,
            height: 60,
            rotation: 0,
            events: {
                onClick: {
                    type: "bounce",
                    duration: 0.5
                }
            }
        }
    ]);
    const [bgColor, setBgColor] = useState<string>("#f0f0f0");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
    const [gameSessionData, setGameSessionData] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedAssets, setUploadedAssets] = useState<string[]>([]);
    const assetFileInputRef = useRef<HTMLInputElement>(null);
    const stageContainerRef = useRef<HTMLDivElement>(null);

    // Simple object to track active hover effects
    const assetHoverRefs = useRef<Record<string, any>>({});

    // Add keyboard event listener for delete key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                deleteSelected();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId]);

    // Emoji functionality removed

    // Add image to canvas
    const addImage = (imageUrl: string, x?: number, y?: number, force?: boolean) => {
        // Only allow adding assets in edit mode unless force is true (used for drop)
        if (!isEditing && !force) {
            // Show edit mode button flash effect to indicate user needs to enter edit mode
            const editButton = document.getElementById('edit-mode-button');
            if (editButton) {
                editButton.classList.add('animate-pulse');
                setTimeout(() => editButton.classList.remove('animate-pulse'), 1000);
            }
            return;
        }

        const id = Math.random().toString(36).substring(2);
        const newAsset: GameAsset = {
            id,
            type: "image",
            imageUrl,
            x: typeof x === 'number' ? x : Math.random() * 300 + 50,
            y: typeof y === 'number' ? y : Math.random() * 150 + 50,
            width: 80,
            height: 60,
            rotation: 0,
        };
        setAssets([...assets, newAsset]);
    };

    // Handle drop from native HTML drag into the Konva stage wrapper
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const url = e.dataTransfer.getData('text/plain');
        if (!url) return;

        if (!stageContainerRef.current) return;

        const rect = stageContainerRef.current.getBoundingClientRect();
        // Stage uses 800x600 in this component
        const stageWidth = 800;
        const stageHeight = 600;

        // compute drop coordinates relative to stage, accounting for scaling
        const clientX = e.clientX;
        const clientY = e.clientY;
        const relX = (clientX - rect.left) * (stageWidth / rect.width);
        const relY = (clientY - rect.top) * (stageHeight / rect.height);

        // Center the asset at the drop point (asset width 80, height 60)
        const assetX = relX - 40;
        const assetY = relY - 30;

        // Force add on drop so users can drop even if not already in edit mode
        addImage(url, assetX, assetY, true);
    };

    // Delete selected asset
    const deleteSelected = () => {
        // Only allow deletion in edit mode
        if (!isEditing) return;

        if (selectedId) {
            setAssets(assets.filter(a => a.id !== selectedId));
            setSelectedId(null);
        }
    };

    // Handle drag end
    const handleDragEnd = (e: KonvaEventObject<DragEvent>, id: string) => {
        const updatedAssets = assets.map(asset => {
            if (asset.id === id) {
                return {
                    ...asset,
                    x: e.target.x(),
                    y: e.target.y(),
                };
            }
            return asset;
        });
        setAssets(updatedAssets);
    };

    // Handle background image upload
    const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow background changes in edit mode
        if (!isEditing) {
            // Show edit mode button flash effect to indicate user needs to enter edit mode
            const editButton = document.getElementById('edit-mode-button');
            if (editButton) {
                editButton.classList.add('animate-pulse');
                setTimeout(() => editButton.classList.remove('animate-pulse'), 1000);
            }
            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setBackgroundImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle asset image upload (adds uploaded file to the sidebar list)
    const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isEditing) {
            const editButton = document.getElementById('edit-mode-button');
            if (editButton) {
                editButton.classList.add('animate-pulse');
                setTimeout(() => editButton.classList.remove('animate-pulse'), 1000);
            }
            if (assetFileInputRef.current) assetFileInputRef.current.value = '';
            return;
        }

        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const url = event.target.result as string;
                    setUploadedAssets(prev => [...prev, url]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Clear background image
    const clearBackgroundImage = () => {
        // Only allow background changes in edit mode
        if (!isEditing) return;

        setBackgroundImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // State for global cognitive game parameters
    const [globalParameters, setGlobalParameters] = useState({
        gameType: 'custom' as 'reaction-time' | 'memory' | 'attention' | 'executive-function' | 'motor-skills' | 'decision-making' | 'custom',
        difficulty: 'medium' as 'easy' | 'medium' | 'hard',
        dataCollection: {
            collectMouseMovement: true,
            collectTimestamps: true,
            collectErrorRate: true,
            recordHesitations: false,
            sessionDuration: 10
        },
        adaptiveDifficulty: {
            enabled: false,
            adaptationRate: 5,
            performanceThreshold: 75
        },
        instructions: "Click on the target objects as they appear."
    });

    // Helper function to update global parameters
    const updateGlobalParameter = (
        category: string,
        parameter: string,
        value: any
    ) => {
        setGlobalParameters(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof typeof prev],
                [parameter]: value
            }
        }));
    };

    // Helper function to update a specific cognitive parameter for the selected asset
    const updateAssetCognitiveParameter = (
        paramPath: string,
        value: any
    ) => {
        if (!selectedId) return;

        setAssets(assets.map(asset => {
            if (asset.id === selectedId) {
                // Initialize cognitiveRole if it doesn't exist
                const cognitiveRole = asset.cognitiveRole || {
                    isTarget: false,
                    role: 'stimulus' as 'stimulus' | 'response' | 'distractor' | 'feedback',
                    trackingData: {
                        responseTime: true,
                        accuracy: true,
                        mouseTrajectory: false,
                        tapPressure: false,
                        hesitations: false
                    }
                };

                // Update the nested parameter
                const pathParts = paramPath.split('.');
                if (pathParts.length === 1) {
                    return {
                        ...asset,
                        cognitiveRole: {
                            ...cognitiveRole,
                            [paramPath]: value
                        }
                    };
                } else if (pathParts.length === 2) {
                    const [parent, child] = pathParts;
                    return {
                        ...asset,
                        cognitiveRole: {
                            ...cognitiveRole,
                            [parent]: {
                                ...(cognitiveRole[parent as keyof typeof cognitiveRole] as object || {}),
                                [child]: value
                            }
                        }
                    };
                }
            }
            return asset;
        }));
    };

    // Log the game configuration
    const createGame = () => {
        const config: GameConfig = {
            background: {
                color: bgColor,
                ...(backgroundImage && { image: backgroundImage })
            },
            assets: assets,
            globalParameters
        };
        console.log(JSON.stringify(config, null, 2));
    };

    return (
        <div className="h-full flex flex-col">
            {/* Feature Banner */}
            <NewFeaturesBanner />

            <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)]">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">Cognitive Assessment Game Creator</h1>
                            <p className="text-sm text-muted-foreground">Design interactive games for measuring cognitive skills and abilities</p>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                id="preview-mode-button"
                                variant={isPreviewMode ? "outline" : "secondary"}
                                onClick={() => {
                                    if (isEditing) {
                                        setIsEditing(false);
                                    }
                                    setIsPreviewMode(!isPreviewMode);
                                    // Generate dummy session data for preview
                                    if (!isPreviewMode) {
                                        setGameSessionData({
                                            startTime: Date.now() - 30000, // Started 30 seconds ago
                                            currentTime: Date.now(),
                                            interactions: assets
                                                .filter(asset => asset.cognitiveRole?.isTarget)
                                                .slice(0, 3)
                                                .map((asset, i) => ({
                                                    assetId: asset.id,
                                                    interactionType: "click",
                                                    timestamp: Date.now() - (20000 - i * 5000),
                                                    responseTime: 750 + Math.floor(Math.random() * 500),
                                                    isCorrect: Math.random() > 0.3
                                                })),
                                            metrics: {
                                                averageResponseTime: 920,
                                                accuracy: 67,
                                                completionPercentage: 40
                                            }
                                        });
                                    }
                                }}
                                className="transition-all"
                            >
                                {isPreviewMode ? "Exit Preview Mode" : "Enter Preview Mode"}
                            </Button>
                            <Button
                                id="edit-mode-button"
                                variant={isEditing ? "destructive" : "default"}
                                onClick={() => {
                                    setIsEditing(!isEditing);
                                    if (isPreviewMode && !isEditing) {
                                        setIsPreviewMode(false);
                                    }
                                }}
                                className="transition-all"
                                disabled={isPreviewMode}
                            >
                                {isEditing ? "Exit Edit Mode" : "Enter Edit Mode"}
                            </Button>
                        </div>
                    </div>

                    {/* Canvas Container */}
                    <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center bg-muted/20">
                        <div
                            ref={stageContainerRef}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="relative rounded-lg overflow-hidden border bg-card shadow-sm"
                        >
                            <Stage
                                width={800}
                                height={600}
                                onClick={(e) => {
                                    // Deselect when clicking on empty canvas
                                    if (e.target === e.target.getStage()) {
                                        setSelectedId(null);
                                        // Only exit edit mode when already in edit mode and not in preview mode
                                        if (isEditing && !isPreviewMode) {
                                            setIsEditing(false);
                                        }
                                    }
                                }}
                            >
                                <Layer>
                                    <Rect
                                        width={800}
                                        height={600}
                                        fill={bgColor}
                                    />

                                    {/* Background Image */}
                                    {backgroundImage && (
                                        <KonvaBackground
                                            imageUrl={backgroundImage}
                                            width={800}
                                            height={600}
                                        />
                                    )}

                                    {/* Render all assets */}
                                    {assets.map((asset) => (
                                        <Group
                                            key={asset.id}
                                            x={asset.x}
                                            y={asset.y}
                                            width={asset.width}
                                            height={asset.height}
                                            rotation={asset.rotation}
                                            draggable={isEditing}
                                            onClick={(e) => {
                                                if (isEditing) {
                                                    // In edit mode, select the asset
                                                    setSelectedId(asset.id);
                                                } else if (isPreviewMode) {
                                                    // In preview mode, select the asset to show parameter tracking
                                                    setSelectedId(asset.id);

                                                    // If the asset has tracking data defined, update the session data with a new interaction
                                                    if (asset.cognitiveRole?.trackingData) {
                                                        const responseTime = 500 + Math.floor(Math.random() * 1000);
                                                        const isCorrect = Math.random() > 0.3;

                                                        setGameSessionData(prev => {
                                                            if (!prev) {
                                                                return {
                                                                    startTime: Date.now() - 30000,
                                                                    currentTime: Date.now(),
                                                                    interactions: [{
                                                                        assetId: asset.id,
                                                                        interactionType: "click",
                                                                        timestamp: Date.now(),
                                                                        responseTime,
                                                                        isCorrect
                                                                    }],
                                                                    metrics: {
                                                                        averageResponseTime: responseTime,
                                                                        accuracy: isCorrect ? 100 : 0,
                                                                        completionPercentage: 25
                                                                    }
                                                                };
                                                            }

                                                            // Add new interaction
                                                            const newInteractions = [...prev.interactions, {
                                                                assetId: asset.id,
                                                                interactionType: "click",
                                                                timestamp: Date.now(),
                                                                responseTime,
                                                                isCorrect
                                                            }];

                                                            // Calculate new metrics
                                                            const totalResponseTime = newInteractions.reduce((sum, i) => sum + (i.responseTime || 0), 0);
                                                            const avgResponseTime = Math.floor(totalResponseTime / newInteractions.length);

                                                            const correctInteractions = newInteractions.filter(i => i.isCorrect).length;
                                                            const accuracy = Math.floor((correctInteractions / newInteractions.length) * 100);

                                                            // Update completion based on total interactions
                                                            let completionPercentage = Math.min(100, Math.floor((newInteractions.length / 10) * 100));

                                                            return {
                                                                ...prev,
                                                                currentTime: Date.now(),
                                                                interactions: newInteractions,
                                                                metrics: {
                                                                    averageResponseTime: avgResponseTime,
                                                                    accuracy,
                                                                    completionPercentage
                                                                }
                                                            };
                                                        });
                                                    }
                                                } else {
                                                    // In play mode, don't select - let actions perform
                                                    setSelectedId(null);
                                                }
                                            }}
                                            onMouseDown={(e) => {
                                                // Clear any existing timer
                                                if (longPressTimer) {
                                                    clearTimeout(longPressTimer);
                                                }

                                                // If in preview mode, provide visual feedback immediately
                                                if (isPreviewMode) {
                                                    const group = e.target;
                                                    group.to({
                                                        scaleX: 1.05,
                                                        scaleY: 1.05,
                                                        duration: 0.1,
                                                        onFinish: () => {
                                                            group.to({
                                                                scaleX: 1,
                                                                scaleY: 1,
                                                                duration: 0.1
                                                            });
                                                        }
                                                    });
                                                    return;
                                                }

                                                // Set up a new timer for long press
                                                const timer = setTimeout(() => {
                                                    // Long press toggles edit mode and selects asset
                                                    setIsEditing(true);
                                                    setSelectedId(asset.id);

                                                    // Provide visual feedback for long press
                                                    const group = e.target;
                                                    group.to({
                                                        scaleX: 1.1,
                                                        scaleY: 1.1,
                                                        duration: 0.1,
                                                        onFinish: () => {
                                                            group.to({
                                                                scaleX: 1,
                                                                scaleY: 1,
                                                                duration: 0.1
                                                            });
                                                        }
                                                    });

                                                    // Scroll the properties panel into view if needed
                                                    document.getElementById('asset-properties-panel')?.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'start'
                                                    });
                                                }, 500); // 500ms for long press

                                                setLongPressTimer(timer);
                                            }}
                                            onMouseUp={() => {
                                                // Clear the timer if mouse is released before long press
                                                if (longPressTimer) {
                                                    clearTimeout(longPressTimer);
                                                    setLongPressTimer(null);
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                // Clear the timer if mouse leaves the element
                                                if (longPressTimer) {
                                                    clearTimeout(longPressTimer);
                                                    setLongPressTimer(null);
                                                }

                                                // If we have a hover animation and not in edit mode, restore to normal
                                                if (!isEditing && asset.events?.onHover) {
                                                    // Reset any hover effects by just resetting properties
                                                    const group = e.target;
                                                    group.to({
                                                        scaleX: 1,
                                                        scaleY: 1,
                                                        shadowBlur: 0,
                                                        shadowOpacity: 0,
                                                        opacity: 1,
                                                        duration: 0.2
                                                    });
                                                }
                                            }}
                                            onMouseEnter={(e) => {
                                                // If we have a hover animation and not in edit mode, apply it
                                                if (!isEditing && asset.events?.onHover) {
                                                    const group = e.target;
                                                    const hoverAction = asset.events.onHover;
                                                    const intensity = hoverAction.intensity || 1.1;
                                                    const duration = hoverAction.duration || 0.3;

                                                    switch (hoverAction.type) {
                                                        case 'scale':
                                                            group.to({
                                                                scaleX: intensity,
                                                                scaleY: intensity,
                                                                duration
                                                            });
                                                            break;

                                                        case 'glow':
                                                            group.to({
                                                                shadowColor: '#FFFF00',
                                                                shadowBlur: 10,
                                                                shadowOpacity: 0.7,
                                                                duration
                                                            });
                                                            break;

                                                        case 'color':
                                                            group.to({
                                                                opacity: 0.8,
                                                                duration
                                                            });
                                                            break;
                                                    }
                                                }
                                            }}
                                            onTouchStart={(e) => {
                                                // Clear any existing timer
                                                if (longPressTimer) {
                                                    clearTimeout(longPressTimer);
                                                }

                                                // Set up a new timer for long press on touch devices
                                                const timer = setTimeout(() => {
                                                    // Long press detected
                                                    setSelectedId(asset.id);
                                                    setIsEditing(true);

                                                    // Visual feedback
                                                    const group = e.target;
                                                    group.to({
                                                        scaleX: 1.1,
                                                        scaleY: 1.1,
                                                        duration: 0.1,
                                                        onFinish: () => {
                                                            group.to({
                                                                scaleX: 1,
                                                                scaleY: 1,
                                                                duration: 0.1
                                                            });
                                                        }
                                                    });

                                                    document.getElementById('asset-properties-panel')?.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'start'
                                                    });
                                                }, 500); // 500ms for long press

                                                setLongPressTimer(timer);
                                            }}
                                            onTouchEnd={() => {
                                                // Clear the timer on touch end
                                                if (longPressTimer) {
                                                    clearTimeout(longPressTimer);
                                                    setLongPressTimer(null);
                                                }
                                            }}
                                            onDragEnd={(e) => handleDragEnd(e, asset.id)}
                                            opacity={selectedId === asset.id ? 0.8 : 1}
                                        >
                                            {/* Emoji rendering removed */}
                                            {asset.type === "image" && (
                                                <KonvaImage
                                                    imageUrl={asset.imageUrl}
                                                    width={asset.width}
                                                    height={asset.height}
                                                    onAnimationTrigger={(e) => {
                                                        if (!isEditing) {
                                                            // In play mode, always trigger animations if defined
                                                            if (asset.events?.onClick) {
                                                                e.cancelBubble = true;

                                                                const node = e.target;
                                                                const action = asset.events.onClick;
                                                                const duration = action.duration || 0.5;
                                                                const intensity = action.intensity || 1;
                                                                const distance = action.distance || 20;

                                                                // Enhanced animation types
                                                                switch (action.type) {
                                                                    case 'bounce':
                                                                        node.to({
                                                                            y: node.y() - distance,
                                                                            duration: duration / 2,
                                                                            onFinish: () => {
                                                                                node.to({
                                                                                    y: node.y() + distance,
                                                                                    duration: duration / 2
                                                                                });
                                                                            }
                                                                        });
                                                                        break;

                                                                    case 'fade':
                                                                        node.to({
                                                                            opacity: 0.2,
                                                                            duration: duration / 2,
                                                                            onFinish: () => {
                                                                                node.to({
                                                                                    opacity: 1,
                                                                                    duration: duration / 2
                                                                                });
                                                                            }
                                                                        });
                                                                        break;

                                                                    case 'rotate':
                                                                        node.to({
                                                                            rotation: node.rotation() + 360,
                                                                            duration: duration
                                                                        });
                                                                        break;

                                                                    case 'scale':
                                                                        node.to({
                                                                            scaleX: intensity,
                                                                            scaleY: intensity,
                                                                            duration: duration / 2,
                                                                            onFinish: () => {
                                                                                node.to({
                                                                                    scaleX: 1,
                                                                                    scaleY: 1,
                                                                                    duration: duration / 2
                                                                                });
                                                                            }
                                                                        });
                                                                        break;

                                                                    case 'shake':
                                                                        // Multi-step shake animation
                                                                        const originalX = node.x();
                                                                        const shakeDistance = 5 * intensity;
                                                                        const shakeDuration = duration / 8; // 8 steps in shake

                                                                        // Sequence of 4 back-and-forth movements
                                                                        node.to({
                                                                            x: originalX + shakeDistance,
                                                                            duration: shakeDuration,
                                                                            onFinish: () => {
                                                                                node.to({
                                                                                    x: originalX - shakeDistance,
                                                                                    duration: shakeDuration,
                                                                                    onFinish: () => {
                                                                                        node.to({
                                                                                            x: originalX + (shakeDistance / 2),
                                                                                            duration: shakeDuration,
                                                                                            onFinish: () => {
                                                                                                node.to({
                                                                                                    x: originalX - (shakeDistance / 2),
                                                                                                    duration: shakeDuration,
                                                                                                    onFinish: () => {
                                                                                                        node.to({
                                                                                                            x: originalX,
                                                                                                            duration: shakeDuration
                                                                                                        });
                                                                                                    }
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                        break;

                                                                    case 'translateX':
                                                                        node.to({
                                                                            x: node.x() + distance,
                                                                            duration: duration / 2,
                                                                            onFinish: () => {
                                                                                node.to({
                                                                                    x: node.x() - distance,
                                                                                    duration: duration / 2
                                                                                });
                                                                            }
                                                                        });
                                                                        break;

                                                                    case 'translateY':
                                                                        node.to({
                                                                            y: node.y() + distance,
                                                                            duration: duration / 2,
                                                                            onFinish: () => {
                                                                                node.to({
                                                                                    y: node.y() - distance,
                                                                                    duration: duration / 2
                                                                                });
                                                                            }
                                                                        });
                                                                        break;

                                                                    case 'path':
                                                                        // Different path patterns based on path property
                                                                        const pathType = action.path || 'circle';
                                                                        const startX = node.x();
                                                                        const startY = node.y();
                                                                        const pathSize = 20 * intensity;

                                                                        if (pathType === 'circle') {
                                                                            // Circular motion - 4 points in a circle
                                                                            const pathDuration = duration / 4;
                                                                            node.to({
                                                                                x: startX + pathSize,
                                                                                y: startY,
                                                                                duration: pathDuration,
                                                                                onFinish: () => {
                                                                                    node.to({
                                                                                        x: startX,
                                                                                        y: startY + pathSize,
                                                                                        duration: pathDuration,
                                                                                        onFinish: () => {
                                                                                            node.to({
                                                                                                x: startX - pathSize,
                                                                                                y: startY,
                                                                                                duration: pathDuration,
                                                                                                onFinish: () => {
                                                                                                    node.to({
                                                                                                        x: startX,
                                                                                                        y: startY,
                                                                                                        duration: pathDuration
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        } else if (pathType === 'zigzag') {
                                                                            // Zigzag pattern
                                                                            const pathDuration = duration / 4;
                                                                            node.to({
                                                                                x: startX + pathSize,
                                                                                y: startY - pathSize,
                                                                                duration: pathDuration,
                                                                                onFinish: () => {
                                                                                    node.to({
                                                                                        x: startX + pathSize * 2,
                                                                                        y: startY + pathSize,
                                                                                        duration: pathDuration,
                                                                                        onFinish: () => {
                                                                                            node.to({
                                                                                                x: startX + pathSize,
                                                                                                y: startY - pathSize,
                                                                                                duration: pathDuration,
                                                                                                onFinish: () => {
                                                                                                    node.to({
                                                                                                        x: startX,
                                                                                                        y: startY,
                                                                                                        duration: pathDuration
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        } else if (pathType === 'wave') {
                                                                            // Wave pattern
                                                                            const pathDuration = duration / 5;
                                                                            node.to({
                                                                                x: startX + pathSize,
                                                                                y: startY - pathSize,
                                                                                duration: pathDuration,
                                                                                onFinish: () => {
                                                                                    node.to({
                                                                                        x: startX + pathSize * 2,
                                                                                        y: startY,
                                                                                        duration: pathDuration,
                                                                                        onFinish: () => {
                                                                                            node.to({
                                                                                                x: startX + pathSize * 3,
                                                                                                y: startY - pathSize,
                                                                                                duration: pathDuration,
                                                                                                onFinish: () => {
                                                                                                    node.to({
                                                                                                        x: startX + pathSize * 4,
                                                                                                        y: startY,
                                                                                                        duration: pathDuration,
                                                                                                        onFinish: () => {
                                                                                                            node.to({
                                                                                                                x: startX,
                                                                                                                y: startY,
                                                                                                                duration: pathDuration
                                                                                                            });
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                        break;
                                                                }
                                                            }
                                                        } else {
                                                            // If in editing mode, stop bubbling to prevent conflicts
                                                            e.cancelBubble = true;
                                                        }
                                                    }}
                                                />
                                            )}
                                            {/* Highlight selected asset */}
                                            {selectedId === asset.id && (
                                                <>
                                                    <Rect
                                                        width={asset.width + 10}
                                                        height={asset.height + 10}
                                                        x={-5}
                                                        y={-5}
                                                        stroke={isEditing ? "hsl(var(--destructive))" : isPreviewMode ? "hsl(144.9 80.4% 10%)" : "hsl(var(--primary))"}
                                                        strokeWidth={isEditing ? 3 : 2}
                                                        cornerRadius={5}
                                                        dash={isEditing ? undefined : [5, 5]}
                                                    />
                                                    {/* Mode indicator icon */}
                                                    <Group x={asset.width - 5} y={-15}>
                                                        <Rect
                                                            width={20}
                                                            height={20}
                                                            cornerRadius={10}
                                                            fill={isEditing ? "hsl(var(--destructive))" : isPreviewMode ? "hsl(144.9 80.4% 40%)" : "hsl(var(--primary))"}
                                                        />
                                                        <Text
                                                            text={isEditing ? "✏️" : isPreviewMode ? "�" : "�👆"}
                                                            fontSize={12}
                                                            width={20}
                                                            height={20}
                                                            align="center"
                                                            verticalAlign="middle"
                                                        />
                                                    </Group>
                                                </>
                                            )}

                                            {/* Preview mode indicator for assets with tracking data */}
                                            {isPreviewMode && selectedId !== asset.id && asset.cognitiveRole?.trackingData &&
                                                (asset.cognitiveRole.trackingData.responseTime || asset.cognitiveRole.trackingData.accuracy) && (
                                                    <Group x={asset.width - 10} y={-10}>
                                                        <Rect
                                                            width={16}
                                                            height={16}
                                                            cornerRadius={8}
                                                            fill="hsl(144.9 80.4% 40%)"
                                                            opacity={0.6}
                                                        />
                                                        <Text
                                                            text="📊"
                                                            fontSize={10}
                                                            width={16}
                                                            height={16}
                                                            align="center"
                                                            verticalAlign="middle"
                                                        />
                                                    </Group>
                                                )}
                                        </Group>
                                    ))}
                                </Layer>
                            </Stage>

                            <div className={`${isPreviewMode ? 'bg-green-100 dark:bg-green-900/30' : 'bg-accent/40'} p-2 text-sm text-center border-t flex justify-between items-center`}>
                                <div className="flex-1 text-muted-foreground">
                                    <span className="font-medium">Canvas Size:</span> 800×600 | {assets.length} asset{assets.length !== 1 ? 's' : ''}
                                </div>
                                {isPreviewMode && (
                                    <div className="flex-1 text-green-600 dark:text-green-400 font-medium flex items-center justify-center space-x-1">
                                        <span className="inline-block">📊</span>
                                        <span>Preview Mode Active</span>
                                    </div>
                                )}
                                <div className="flex-1"></div>
                            </div>
                        </div>
                    </div>

                    {/* Instructions Footer */}

                </div>

                {/* Controls Panel */}
                <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l h-96 lg:h-auto bg-card overflow-y-auto flex flex-col">
                    {isPreviewMode ? (
                        /* Preview Mode - Parameter Tracking Panel */
                        <ParameterTrackingPanel
                            asset={selectedId ? assets.find(a => a.id === selectedId) || null : null}
                            gameSessionData={gameSessionData}
                        />
                    ) : (
                        /* Edit Mode / Normal Mode - Asset Library and Properties */
                        <>
                            <div className="p-4 border-b">
                                <h2 className="font-semibold text-lg">Asset Library</h2>
                            </div>

                            <div className="flex-1 overflow-auto">
                                <Accordion type="single" collapsible className="w-full">
                                    {/* Image Assets */}
                                    <AccordionItem value="item-1" className="border-b px-4">
                                        <AccordionTrigger className="py-3">
                                            <span className="text-sm font-medium">Image Assets</span>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-3 py-2">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-foreground">Upload Asset</label>
                                                    <input
                                                        ref={assetFileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleAssetUpload}
                                                        className="w-full text-xs border border-input rounded-md p-2"
                                                        disabled={!isEditing}
                                                    />
                                                </div>

                                                {uploadedAssets.length > 0 && (
                                                    <div>
                                                        <label className="block text-xs text-muted-foreground mb-1">Uploaded Assets</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {uploadedAssets.map((url, idx) => (
                                                                <div
                                                                    key={url + idx}
                                                                    onClick={() => addImage(url)}
                                                                    className={`h-16 bg-accent/30 ${isEditing ? 'hover:bg-accent/50 cursor-pointer' : 'opacity-60 cursor-not-allowed'} transition-colors rounded-md flex items-center justify-center overflow-hidden border border-border`}
                                                                >
                                                                    <img src={url} alt={`Uploaded ${idx}`} className="max-h-full max-w-full object-contain p-1" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-xs text-muted-foreground mb-1">Preset (last only)</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {IMAGES.length > 0 && (() => {
                                                            const last = IMAGES[IMAGES.length - 1];
                                                            return (
                                                                <div
                                                                    key={last}
                                                                    onClick={() => addImage(last)}
                                                                    draggable={isEditing}
                                                                    onDragStart={(ev) => {
                                                                        try { ev.dataTransfer.setData('text/plain', last); ev.dataTransfer.effectAllowed = 'copy'; } catch (err) { }
                                                                    }}
                                                                    className={`h-16 bg-accent/30 ${isEditing ? 'hover:bg-accent/50 cursor-pointer' : 'opacity-60 cursor-not-allowed'} transition-colors rounded-md flex items-center justify-center overflow-hidden border border-border`}
                                                                >
                                                                    <img src={last} alt="Asset" className="max-h-full max-w-full object-contain p-1" />
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-foreground">Upload Background (also)</label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleBackgroundImageUpload}
                                                        className="w-full text-xs border border-input rounded-md p-2"
                                                        disabled={!isEditing}
                                                    />
                                                    {backgroundImage && (
                                                        <div className="mt-2 h-24 border rounded overflow-hidden">
                                                            <img src={backgroundImage} alt="Background preview" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Emoji Assets section removed */}

                                    {/* Background Settings */}
                                    <AccordionItem value="item-3" className="border-b px-4">
                                        <AccordionTrigger className="py-3">
                                            <span className="text-sm font-medium">Background</span>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 py-2">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-foreground">Background Color</label>
                                                    <input
                                                        type="color"
                                                        value={bgColor}
                                                        onChange={(e) => {
                                                            // Only allow changes in edit mode
                                                            if (!isEditing) return;
                                                            setBgColor(e.target.value);
                                                        }}
                                                        className="w-full h-10 cursor-pointer rounded-md border border-input"
                                                        disabled={!isEditing}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-foreground">Custom Background Image</label>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleBackgroundImageUpload}
                                                        className="w-full text-xs border border-input rounded-md p-2"
                                                        disabled={!isEditing}
                                                    />
                                                    {backgroundImage && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="mt-2 w-full"
                                                            onClick={clearBackgroundImage}
                                                        >
                                                            Clear Background Image
                                                        </Button>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-foreground">Preset Backgrounds</label>
                                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                                        {BACKGROUND_IMAGES.map(imageUrl => (
                                                            <div
                                                                key={imageUrl}
                                                                onClick={() => {
                                                                    // Only allow background changes in edit mode
                                                                    if (!isEditing) {
                                                                        // Show edit mode button flash effect
                                                                        const editButton = document.getElementById('edit-mode-button');
                                                                        if (editButton) {
                                                                            editButton.classList.add('animate-pulse');
                                                                            setTimeout(() => editButton.classList.remove('animate-pulse'), 1000);
                                                                        }
                                                                        return;
                                                                    }
                                                                    setBackgroundImage(imageUrl);
                                                                }}
                                                                className={`h-14 bg-accent/30 ${isEditing ? 'hover:bg-accent/50 cursor-pointer' : 'opacity-60 cursor-not-allowed'} transition-colors rounded-md flex items-center justify-center overflow-hidden border border-border`}
                                                            >
                                                                <img
                                                                    src={imageUrl}
                                                                    alt="Background"
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Asset Properties - Only shown when an asset is selected */}
                                    {selectedId && (
                                        <AccordionItem value="item-4" className="border-b px-4">
                                            <AccordionTrigger className="py-3">
                                                <span className="text-sm font-medium text-primary">Selected Asset Properties</span>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-4 py-2" id="asset-properties-panel">
                                                    {/* Position control */}
                                                    <div className="mb-3">
                                                        <label className="block text-sm font-medium mb-1 text-foreground">Position</label>
                                                        <div className="grid grid-cols-2 gap-2 mb-1">
                                                            <div>
                                                                <label className="block text-xs text-muted-foreground">X Position</label>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="range"
                                                                        min="0"
                                                                        max="760"
                                                                        className="w-full accent-primary"
                                                                        value={Math.round(assets.find(a => a.id === selectedId)?.x || 0)}
                                                                        onChange={(e) => {
                                                                            // Only allow changes in edit mode
                                                                            if (!isEditing) return;

                                                                            const x = parseInt(e.target.value);
                                                                            setAssets(assets.map(asset =>
                                                                                asset.id === selectedId
                                                                                    ? { ...asset, x }
                                                                                    : asset
                                                                            ));
                                                                        }}
                                                                        disabled={!isEditing}
                                                                    />
                                                                    <span className="text-xs w-8 text-center">
                                                                        {Math.round(assets.find(a => a.id === selectedId)?.x || 0)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-muted-foreground">Y Position</label>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="range"
                                                                        min="0"
                                                                        max="560"
                                                                        className="w-full accent-primary"
                                                                        value={Math.round(assets.find(a => a.id === selectedId)?.y || 0)}
                                                                        onChange={(e) => {
                                                                            // Only allow changes in edit mode
                                                                            if (!isEditing) return;

                                                                            const y = parseInt(e.target.value);
                                                                            setAssets(assets.map(asset =>
                                                                                asset.id === selectedId
                                                                                    ? { ...asset, y }
                                                                                    : asset
                                                                            ));
                                                                        }}
                                                                        disabled={!isEditing}
                                                                    />
                                                                    <span className="text-xs w-8 text-center">
                                                                        {Math.round(assets.find(a => a.id === selectedId)?.y || 0)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between mt-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    if (!isEditing || !selectedId) return;
                                                                    // Center the asset horizontally
                                                                    setAssets(assets.map(asset =>
                                                                        asset.id === selectedId
                                                                            ? { ...asset, x: 400 - asset.width / 2 }
                                                                            : asset
                                                                    ));
                                                                }}
                                                                disabled={!isEditing}
                                                                className="text-xs flex-1 mr-1"
                                                            >
                                                                Center X
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    if (!isEditing || !selectedId) return;
                                                                    // Center the asset vertically
                                                                    setAssets(assets.map(asset =>
                                                                        asset.id === selectedId
                                                                            ? { ...asset, y: 300 - asset.height / 2 }
                                                                            : asset
                                                                    ));
                                                                }}
                                                                disabled={!isEditing}
                                                                className="text-xs flex-1 ml-1"
                                                            >
                                                                Center Y
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Size control */}
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-foreground">Size</label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="range"
                                                                min="20"
                                                                max="100"
                                                                className="w-full accent-primary"
                                                                value={assets.find(a => a.id === selectedId)?.width || 40}
                                                                onChange={(e) => {
                                                                    // Only allow changes in edit mode
                                                                    if (!isEditing) return;

                                                                    const size = parseInt(e.target.value);
                                                                    setAssets(assets.map(asset =>
                                                                        asset.id === selectedId
                                                                            ? { ...asset, width: size, height: size }
                                                                            : asset
                                                                    ));
                                                                }}
                                                                disabled={!isEditing}
                                                            />
                                                            <span className="text-sm w-8 text-center">
                                                                {assets.find(a => a.id === selectedId)?.width || 40}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Rotation control */}
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-foreground">Rotation</label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="360"
                                                                className="w-full accent-primary"
                                                                value={assets.find(a => a.id === selectedId)?.rotation || 0}
                                                                onChange={(e) => {
                                                                    // Only allow changes in edit mode
                                                                    if (!isEditing) return;

                                                                    const rotation = parseInt(e.target.value);
                                                                    setAssets(assets.map(asset =>
                                                                        asset.id === selectedId
                                                                            ? { ...asset, rotation }
                                                                            : asset
                                                                    ));
                                                                }}
                                                                disabled={!isEditing}
                                                            />
                                                            <span className="text-sm w-8 text-center">
                                                                {assets.find(a => a.id === selectedId)?.rotation || 0}°
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Event handling */}
                                                    <div className="border-t pt-4 mt-4">
                                                        <label className="block text-sm font-medium mb-3 text-primary">Animation Controls</label>

                                                        {/* Click Animation */}
                                                        <div className="mb-3">
                                                            <label className="block text-xs font-medium mb-1 text-foreground">Click Animation</label>
                                                            <select
                                                                className="w-full border rounded-md p-2 text-sm bg-background border-input"
                                                                value={assets.find(a => a.id === selectedId)?.events?.onClick?.type || ""}
                                                                onChange={(e) => {
                                                                    // Only allow changes in edit mode
                                                                    if (!isEditing) return;

                                                                    const actionType = e.target.value as 'bounce' | 'fade' | 'rotate' | 'scale' | 'shake' | 'translateX' | 'translateY' | 'path' | '';

                                                                    setAssets(assets.map(asset => {
                                                                        if (asset.id === selectedId) {
                                                                            if (!actionType) {
                                                                                // Remove event if empty selection
                                                                                const newAsset = { ...asset };
                                                                                if (newAsset.events?.onClick) {
                                                                                    if (newAsset.events.onClick) {
                                                                                        delete newAsset.events.onClick;
                                                                                    }
                                                                                    // If events object is now empty, remove it
                                                                                    if (Object.keys(newAsset.events).length === 0) {
                                                                                        delete newAsset.events;
                                                                                    }
                                                                                }
                                                                                return newAsset;
                                                                            } else {
                                                                                // Add/update event
                                                                                return {
                                                                                    ...asset,
                                                                                    events: {
                                                                                        ...asset.events,
                                                                                        onClick: {
                                                                                            type: actionType,
                                                                                            duration: 0.5,
                                                                                            intensity: 1,
                                                                                            distance: 20,
                                                                                            path: 'circle'
                                                                                        }
                                                                                    }
                                                                                };
                                                                            }
                                                                        }
                                                                        return asset;
                                                                    }));
                                                                }}
                                                                disabled={!isEditing}
                                                            >
                                                                <option value="">No Animation</option>
                                                                <option value="bounce">Bounce</option>
                                                                <option value="fade">Fade</option>
                                                                <option value="rotate">Rotate</option>
                                                                <option value="scale">Scale</option>
                                                                <option value="shake">Shake</option>
                                                                <option value="translateX">Move Horizontal</option>
                                                                <option value="translateY">Move Vertical</option>
                                                                <option value="path">Path Movement</option>
                                                            </select>

                                                            {/* Animation parameters based on selected type */}
                                                            {assets.find(a => a.id === selectedId)?.events?.onClick && (
                                                                <div className="mt-2 space-y-2">
                                                                    {/* Duration control */}
                                                                    <div>
                                                                        <label className="block text-xs text-muted-foreground">Duration (sec)</label>
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="range"
                                                                                min="0.1"
                                                                                max="2"
                                                                                step="0.1"
                                                                                className="w-full accent-primary"
                                                                                value={assets.find(a => a.id === selectedId)?.events?.onClick?.duration || 0.5}
                                                                                onChange={(e) => {
                                                                                    if (!isEditing || !selectedId) return;
                                                                                    const duration = parseFloat(e.target.value);
                                                                                    setAssets(assets.map(asset =>
                                                                                        asset.id === selectedId && asset.events?.onClick
                                                                                            ? { ...asset, events: { ...asset.events, onClick: { ...asset.events.onClick, duration } } }
                                                                                            : asset
                                                                                    ));
                                                                                }}
                                                                                disabled={!isEditing}
                                                                            />
                                                                            <span className="text-xs w-8 text-center">
                                                                                {assets.find(a => a.id === selectedId)?.events?.onClick?.duration || 0.5}s
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Intensity control for applicable animations */}
                                                                    {['scale', 'shake', 'path'].includes(assets.find(a => a.id === selectedId)?.events?.onClick?.type || '') && (
                                                                        <div>
                                                                            <label className="block text-xs text-muted-foreground">Intensity</label>
                                                                            <div className="flex items-center gap-2">
                                                                                <input
                                                                                    type="range"
                                                                                    min="0.1"
                                                                                    max="2"
                                                                                    step="0.1"
                                                                                    className="w-full accent-primary"
                                                                                    value={assets.find(a => a.id === selectedId)?.events?.onClick?.intensity || 1}
                                                                                    onChange={(e) => {
                                                                                        if (!isEditing || !selectedId) return;
                                                                                        const intensity = parseFloat(e.target.value);
                                                                                        setAssets(assets.map(asset =>
                                                                                            asset.id === selectedId && asset.events?.onClick
                                                                                                ? { ...asset, events: { ...asset.events, onClick: { ...asset.events.onClick, intensity } } }
                                                                                                : asset
                                                                                        ));
                                                                                    }}
                                                                                    disabled={!isEditing}
                                                                                />
                                                                                <span className="text-xs w-8 text-center">
                                                                                    {assets.find(a => a.id === selectedId)?.events?.onClick?.intensity || 1}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Distance control for translate animations */}
                                                                    {['translateX', 'translateY'].includes(assets.find(a => a.id === selectedId)?.events?.onClick?.type || '') && (
                                                                        <div>
                                                                            <label className="block text-xs text-muted-foreground">Distance (px)</label>
                                                                            <div className="flex items-center gap-2">
                                                                                <input
                                                                                    type="range"
                                                                                    min="5"
                                                                                    max="100"
                                                                                    className="w-full accent-primary"
                                                                                    value={assets.find(a => a.id === selectedId)?.events?.onClick?.distance || 20}
                                                                                    onChange={(e) => {
                                                                                        if (!isEditing || !selectedId) return;
                                                                                        const distance = parseInt(e.target.value);
                                                                                        setAssets(assets.map(asset =>
                                                                                            asset.id === selectedId && asset.events?.onClick
                                                                                                ? { ...asset, events: { ...asset.events, onClick: { ...asset.events.onClick, distance } } }
                                                                                                : asset
                                                                                        ));
                                                                                    }}
                                                                                    disabled={!isEditing}
                                                                                />
                                                                                <span className="text-xs w-8 text-center">
                                                                                    {assets.find(a => a.id === selectedId)?.events?.onClick?.distance || 20}px
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Path type for path animation */}
                                                                    {assets.find(a => a.id === selectedId)?.events?.onClick?.type === 'path' && (
                                                                        <div>
                                                                            <label className="block text-xs text-muted-foreground">Path Pattern</label>
                                                                            <select
                                                                                className="w-full border rounded-md p-1.5 text-xs bg-background border-input mt-1"
                                                                                value={assets.find(a => a.id === selectedId)?.events?.onClick?.path || "circle"}
                                                                                onChange={(e) => {
                                                                                    if (!isEditing || !selectedId) return;
                                                                                    const path = e.target.value as 'circle' | 'zigzag' | 'wave';
                                                                                    setAssets(assets.map(asset =>
                                                                                        asset.id === selectedId && asset.events?.onClick
                                                                                            ? { ...asset, events: { ...asset.events, onClick: { ...asset.events.onClick, path } } }
                                                                                            : asset
                                                                                    ));
                                                                                }}
                                                                                disabled={!isEditing}
                                                                            >
                                                                                <option value="circle">Circular</option>
                                                                                <option value="zigzag">Zigzag</option>
                                                                                <option value="wave">Wave</option>
                                                                            </select>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Hover Animation */}
                                                        <div>
                                                            <label className="block text-xs font-medium mb-1 text-foreground">Hover Animation</label>
                                                            <select
                                                                className="w-full border rounded-md p-2 text-sm bg-background border-input"
                                                                value={assets.find(a => a.id === selectedId)?.events?.onHover?.type || ""}
                                                                onChange={(e) => {
                                                                    // Only allow changes in edit mode
                                                                    if (!isEditing) return;

                                                                    const actionType = e.target.value as 'glow' | 'scale' | 'color' | '';

                                                                    setAssets(assets.map(asset => {
                                                                        if (asset.id === selectedId) {
                                                                            if (!actionType) {
                                                                                // Remove event if empty selection
                                                                                const newAsset = { ...asset };
                                                                                if (newAsset.events?.onHover) {
                                                                                    if (newAsset.events.onHover) {
                                                                                        delete newAsset.events.onHover;
                                                                                    }
                                                                                    // If events object is now empty, remove it
                                                                                    if (newAsset.events && Object.keys(newAsset.events).length === 0) {
                                                                                        delete newAsset.events;
                                                                                    }
                                                                                }
                                                                                return newAsset;
                                                                            } else {
                                                                                // Add/update event
                                                                                return {
                                                                                    ...asset,
                                                                                    events: {
                                                                                        ...asset.events,
                                                                                        onHover: {
                                                                                            type: actionType,
                                                                                            duration: 0.3,
                                                                                            intensity: 1.1
                                                                                        }
                                                                                    }
                                                                                };
                                                                            }
                                                                        }
                                                                        return asset;
                                                                    }));
                                                                }}
                                                                disabled={!isEditing}
                                                            >
                                                                <option value="">No Animation</option>
                                                                <option value="glow">Glow Effect</option>
                                                                <option value="scale">Scale Up</option>
                                                                <option value="color">Color Shift</option>
                                                            </select>

                                                            {/* Hover animation parameters */}
                                                            {assets.find(a => a.id === selectedId)?.events?.onHover && (
                                                                <div className="mt-2">
                                                                    <label className="block text-xs text-muted-foreground">Intensity</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="range"
                                                                            min="1"
                                                                            max="1.5"
                                                                            step="0.05"
                                                                            className="w-full accent-primary"
                                                                            value={assets.find(a => a.id === selectedId)?.events?.onHover?.intensity || 1.1}
                                                                            onChange={(e) => {
                                                                                if (!isEditing || !selectedId) return;
                                                                                const intensity = parseFloat(e.target.value);
                                                                                setAssets(assets.map(asset =>
                                                                                    asset.id === selectedId && asset.events?.onHover
                                                                                        ? { ...asset, events: { ...asset.events, onHover: { ...asset.events.onHover, intensity } } }
                                                                                        : asset
                                                                                ));
                                                                            }}
                                                                            disabled={!isEditing}
                                                                        />
                                                                        <span className="text-xs w-10 text-center">
                                                                            {assets.find(a => a.id === selectedId)?.events?.onHover?.intensity || 1.1}x
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Cognitive Role for Asset */}
                                                    <div className="border-t pt-2 mt-4">
                                                        <label className="block text-sm font-medium mb-1 text-primary">Cognitive Role</label>

                                                        {/* Role Selection */}
                                                        <div className="mb-2">
                                                            <label className="block text-xs text-muted-foreground">Asset Role</label>
                                                            <select
                                                                className="w-full border rounded-md p-1.5 text-sm bg-background border-input"
                                                                value={assets.find(a => a.id === selectedId)?.cognitiveRole?.role || "stimulus"}
                                                                onChange={(e) => updateAssetCognitiveParameter('role', e.target.value)}
                                                                disabled={!isEditing}
                                                            >
                                                                <option value="stimulus">Stimulus (to be shown)</option>
                                                                <option value="response">Response (to be clicked)</option>
                                                                <option value="distractor">Distractor (incorrect choice)</option>
                                                                <option value="feedback">Feedback (shows result)</option>
                                                            </select>
                                                        </div>

                                                        {/* Target Flag */}
                                                        <div className="flex items-center mb-2">
                                                            <input
                                                                type="checkbox"
                                                                id="isTarget"
                                                                checked={assets.find(a => a.id === selectedId)?.cognitiveRole?.isTarget || false}
                                                                onChange={(e) => updateAssetCognitiveParameter('isTarget', e.target.checked)}
                                                                className="mr-2"
                                                                disabled={!isEditing}
                                                            />
                                                            <label htmlFor="isTarget" className="text-xs">Mark as Target Object</label>
                                                        </div>

                                                        {/* Stimulus Category */}
                                                        <div className="mb-2">
                                                            <label className="block text-xs text-muted-foreground">Category</label>
                                                            <input
                                                                type="text"
                                                                value={assets.find(a => a.id === selectedId)?.cognitiveRole?.stimulusCategory || ""}
                                                                onChange={(e) => updateAssetCognitiveParameter('stimulusCategory', e.target.value)}
                                                                placeholder="e.g., animal, shape, letter"
                                                                className="w-full text-xs p-1 border rounded"
                                                                disabled={!isEditing}
                                                            />
                                                        </div>

                                                        {/* Stimulus Timing */}
                                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                                            <div>
                                                                <label className="block text-xs text-muted-foreground">Appear Delay (ms)</label>
                                                                <input
                                                                    type="number"
                                                                    value={assets.find(a => a.id === selectedId)?.cognitiveRole?.stimulusDelay || 0}
                                                                    onChange={(e) => updateAssetCognitiveParameter('stimulusDelay', Number(e.target.value))}
                                                                    className="w-full text-xs p-1 border rounded"
                                                                    min="0"
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-muted-foreground">Duration (ms)</label>
                                                                <input
                                                                    type="number"
                                                                    value={assets.find(a => a.id === selectedId)?.cognitiveRole?.stimulusDuration || 0}
                                                                    onChange={(e) => updateAssetCognitiveParameter('stimulusDuration', Number(e.target.value))}
                                                                    className="w-full text-xs p-1 border rounded"
                                                                    min="0"
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Response Properties */}
                                                        <div className="mb-2">
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    id="correctResponse"
                                                                    checked={assets.find(a => a.id === selectedId)?.cognitiveRole?.correctResponse || false}
                                                                    onChange={(e) => updateAssetCognitiveParameter('correctResponse', e.target.checked)}
                                                                    className="mr-2"
                                                                    disabled={!isEditing}
                                                                />
                                                                <label htmlFor="correctResponse" className="text-xs">Correct Response</label>
                                                            </div>
                                                        </div>

                                                        <div className="mb-2">
                                                            <label className="block text-xs text-muted-foreground">Required Response Time (ms)</label>
                                                            <input
                                                                type="number"
                                                                value={assets.find(a => a.id === selectedId)?.cognitiveRole?.requiredResponseTime || 0}
                                                                onChange={(e) => updateAssetCognitiveParameter('requiredResponseTime', Number(e.target.value))}
                                                                className="w-full text-xs p-1 border rounded"
                                                                min="0"
                                                                disabled={!isEditing}
                                                            />
                                                        </div>

                                                        <div className="mb-2">
                                                            <label className="block text-xs text-muted-foreground">Sequence Order Number</label>
                                                            <input
                                                                type="number"
                                                                value={assets.find(a => a.id === selectedId)?.cognitiveRole?.sequence || 0}
                                                                onChange={(e) => updateAssetCognitiveParameter('sequence', Number(e.target.value))}
                                                                className="w-full text-xs p-1 border rounded"
                                                                min="0"
                                                                disabled={!isEditing}
                                                            />
                                                        </div>

                                                        {/* Difficulty Level */}
                                                        <div className="mb-2">
                                                            <label className="block text-xs text-muted-foreground">Difficulty Level</label>
                                                            <select
                                                                value={assets.find(a => a.id === selectedId)?.cognitiveRole?.difficulty || "medium"}
                                                                onChange={(e) => updateAssetCognitiveParameter('difficulty', e.target.value)}
                                                                className="w-full text-xs p-1 border rounded"
                                                                disabled={!isEditing}
                                                            >
                                                                <option value="easy">Easy</option>
                                                                <option value="medium">Medium</option>
                                                                <option value="hard">Hard</option>
                                                            </select>
                                                        </div>

                                                        {/* Tracking Data */}
                                                        <div className="mb-2">
                                                            <label className="block text-xs font-medium text-muted-foreground">Tracking Data</label>
                                                            <div className="pl-2 mt-1 space-y-1">
                                                                <div className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="trackResponseTime"
                                                                        checked={assets.find(a => a.id === selectedId)?.cognitiveRole?.trackingData?.responseTime || false}
                                                                        onChange={(e) => updateAssetCognitiveParameter('trackingData.responseTime', e.target.checked)}
                                                                        className="mr-2"
                                                                        disabled={!isEditing}
                                                                    />
                                                                    <label htmlFor="trackResponseTime" className="text-xs">Response Time</label>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="trackAccuracy"
                                                                        checked={assets.find(a => a.id === selectedId)?.cognitiveRole?.trackingData?.accuracy || false}
                                                                        onChange={(e) => updateAssetCognitiveParameter('trackingData.accuracy', e.target.checked)}
                                                                        className="mr-2"
                                                                        disabled={!isEditing}
                                                                    />
                                                                    <label htmlFor="trackAccuracy" className="text-xs">Accuracy</label>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="trackMouseTrajectory"
                                                                        checked={assets.find(a => a.id === selectedId)?.cognitiveRole?.trackingData?.mouseTrajectory || false}
                                                                        onChange={(e) => updateAssetCognitiveParameter('trackingData.mouseTrajectory', e.target.checked)}
                                                                        className="mr-2"
                                                                        disabled={!isEditing}
                                                                    />
                                                                    <label htmlFor="trackMouseTrajectory" className="text-xs">Mouse/Touch Trajectory</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant="destructive"
                                                        onClick={deleteSelected}
                                                        className="w-full"
                                                        disabled={!isEditing}
                                                    >
                                                        Delete Asset
                                                    </Button>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )}
                                    {/* Game-wide Cognitive Assessment Parameters */}
                                    <AccordionItem value="game-settings" className="border-b px-4">
                                        <AccordionTrigger className="py-3">
                                            <span className="text-sm font-medium text-primary">Game Settings</span>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 py-2">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-foreground">Game Type</label>
                                                    <select
                                                        className="w-full border rounded-md p-2 text-sm bg-background border-input"
                                                        value={globalParameters.gameType}
                                                        onChange={(e) => setGlobalParameters(prev => ({
                                                            ...prev,
                                                            gameType: e.target.value as any
                                                        }))}
                                                    >
                                                        <option value="reaction-time">Reaction Time Test</option>
                                                        <option value="memory">Memory Assessment</option>
                                                        <option value="attention">Attention Test</option>
                                                        <option value="executive-function">Executive Function</option>
                                                        <option value="motor-skills">Motor Skills</option>
                                                        <option value="decision-making">Decision Making</option>
                                                        <option value="custom">Custom Assessment</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-foreground">Overall Difficulty</label>
                                                    <select
                                                        className="w-full border rounded-md p-2 text-sm bg-background border-input"
                                                        value={globalParameters.difficulty}
                                                        onChange={(e) => setGlobalParameters(prev => ({
                                                            ...prev,
                                                            difficulty: e.target.value as any
                                                        }))}
                                                    >
                                                        <option value="easy">Easy</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="hard">Hard</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-foreground">Instructions for Participants</label>
                                                    <textarea
                                                        value={globalParameters.instructions}
                                                        onChange={(e) => setGlobalParameters(prev => ({
                                                            ...prev,
                                                            instructions: e.target.value
                                                        }))}
                                                        className="w-full text-sm p-2 border rounded min-h-[80px]"
                                                        placeholder="Instructions shown to participants before the game starts"
                                                    />
                                                </div>

                                                {/* Data Collection Parameters */}
                                                <div className="pt-2 border-t border-muted">
                                                    <h4 className="text-sm font-medium text-foreground mb-2">Data Collection</h4>
                                                    <div className="space-y-1 pl-3">
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                id="collectMouseMovement"
                                                                checked={globalParameters.dataCollection.collectMouseMovement}
                                                                onChange={(e) => updateGlobalParameter('dataCollection', 'collectMouseMovement', e.target.checked)}
                                                                className="mr-2"
                                                            />
                                                            <label htmlFor="collectMouseMovement" className="text-xs">Track Mouse/Touch Movement</label>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                id="collectTimestamps"
                                                                checked={globalParameters.dataCollection.collectTimestamps}
                                                                onChange={(e) => updateGlobalParameter('dataCollection', 'collectTimestamps', e.target.checked)}
                                                                className="mr-2"
                                                            />
                                                            <label htmlFor="collectTimestamps" className="text-xs">Record Timestamps</label>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                id="collectErrorRate"
                                                                checked={globalParameters.dataCollection.collectErrorRate}
                                                                onChange={(e) => updateGlobalParameter('dataCollection', 'collectErrorRate', e.target.checked)}
                                                                className="mr-2"
                                                            />
                                                            <label htmlFor="collectErrorRate" className="text-xs">Record Error Rate</label>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-muted-foreground">Session Duration (min)</label>
                                                            <input
                                                                type="number"
                                                                value={globalParameters.dataCollection.sessionDuration}
                                                                onChange={(e) => updateGlobalParameter('dataCollection', 'sessionDuration', Number(e.target.value))}
                                                                className="w-full text-xs p-1 border rounded"
                                                                min="1"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Adaptive Difficulty */}
                                                <div className="pt-2 border-t border-muted">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-medium text-foreground">Adaptive Difficulty</h4>
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                id="adaptiveDifficultyEnabled"
                                                                checked={globalParameters.adaptiveDifficulty.enabled}
                                                                onChange={(e) => updateGlobalParameter('adaptiveDifficulty', 'enabled', e.target.checked)}
                                                                className="mr-2"
                                                            />
                                                            <label htmlFor="adaptiveDifficultyEnabled" className="text-xs">Enable</label>
                                                        </div>
                                                    </div>

                                                    {globalParameters.adaptiveDifficulty.enabled && (
                                                        <div className="space-y-2 pl-3">
                                                            <div>
                                                                <label className="block text-xs text-muted-foreground">Adaptation Rate (1-10)</label>
                                                                <input
                                                                    type="range"
                                                                    min="1"
                                                                    max="10"
                                                                    value={globalParameters.adaptiveDifficulty.adaptationRate}
                                                                    onChange={(e) => updateGlobalParameter('adaptiveDifficulty', 'adaptationRate', Number(e.target.value))}
                                                                    className="w-full"
                                                                />
                                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                                    <span>Slow</span>
                                                                    <span>{globalParameters.adaptiveDifficulty.adaptationRate}</span>
                                                                    <span>Fast</span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-muted-foreground">Performance Threshold (%)</label>
                                                                <input
                                                                    type="number"
                                                                    value={globalParameters.adaptiveDifficulty.performanceThreshold}
                                                                    onChange={(e) => updateGlobalParameter('adaptiveDifficulty', 'performanceThreshold', Number(e.target.value))}
                                                                    className="w-full text-xs p-1 border rounded"
                                                                    min="0"
                                                                    max="100"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t mt-auto">
                                <Button
                                    onClick={createGame}
                                    className="w-full"
                                >
                                    Create Cognitive Assessment Game
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    Creates a game configuration with all cognitive parameters for client assessment
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function KonvaTestPage() {
    const [demoMode, setDemoMode] = useState<'konva' | 'flow' | 'simple'>('konva');

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Experiment Flow Demo</h1>

            <div className="flex justify-center mb-8 gap-4">
                <Button
                    variant={demoMode === 'konva' ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setDemoMode('konva')}
                >
                    Konva Demo
                </Button>
            </div>

            {demoMode === 'konva' && <SimpleKonvaTest />}
            {demoMode === 'flow' && <ExperimentFlowHandler />}
            {demoMode === 'simple' && <SimpleExperimentFlow />}
        </div>
    );
}