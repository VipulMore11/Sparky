"use client";

import { useState, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Text, Image, Group, Transformer } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { GameAsset } from "./types";

// Canvas dimensions
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

type CanvasWorkspaceProps = {
    assets: GameAsset[];
    background: { color: string; image?: string };
    selectedAssetId: string | null;
    onSelectAsset: (id: string | null) => void;
    onUpdateAsset: (asset: GameAsset) => void;
    onDeleteAsset: (id: string) => void;
};

export default function CanvasWorkspace({
    assets,
    background,
    selectedAssetId,
    onSelectAsset,
    onUpdateAsset,
    onDeleteAsset
}: CanvasWorkspaceProps) {
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const stageRef = useRef<any>(null);
    const transformerRef = useRef<any>(null);

    // Handle background image loading
    useEffect(() => {
        if (typeof window === "undefined") return;

        if (background.image) {
            const img = new window.Image();
            img.src = background.image;
            img.onload = () => {
                setBackgroundImage(img);
            };
        } else {
            setBackgroundImage(null);
        }
    }, [background.image]);

    // Update transformer on selection change
    useEffect(() => {
        if (transformerRef.current) {
            const nodes = selectedAssetId
                ? transformerRef.current.getStage().findOne(`#${selectedAssetId}`)
                : null;
            transformerRef.current.nodes(nodes ? [nodes] : []);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [selectedAssetId]);

    // Handle stage click (deselect if clicking on empty area)
    const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
        if (e.target === e.target.getStage()) {
            onSelectAsset(null);
        }
    };

    // Handle asset selection
    const handleAssetSelect = (id: string) => {
        onSelectAsset(id);
    };

    // Handle key press for deletion
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAssetId) {
                onDeleteAsset(selectedAssetId);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedAssetId, onDeleteAsset]);

    // Handle transform end
    const handleTransformEnd = (id: string) => {
        const node = stageRef.current?.findOne(`#${id}`);
        if (!node) return;

        const asset = assets.find(a => a.id === id);
        if (!asset) return;

        // Update the asset with new position and size
        onUpdateAsset({
            ...asset,
            x: node.x(),
            y: node.y(),
            width: Math.max(node.width() * node.scaleX(), 10),
            height: Math.max(node.height() * node.scaleY(), 10),
            rotation: node.rotation(),
        });

        // Reset scale since we're manually updating width and height
        node.scaleX(1);
        node.scaleY(1);
    };

    return (
        <div className="border border-gray-300 dark:border-gray-600 rounded shadow-md bg-white dark:bg-gray-800">
            <Stage
                ref={stageRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onClick={handleStageClick}
            >
                {/* Background Layer */}
                <Layer>
                    <Rect
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        fill={background.color}
                    />
                    {backgroundImage && (
                        <Image
                            image={backgroundImage}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                        />
                    )}
                </Layer>

                {/* Assets Layer */}
                <Layer>
                    {assets.map((asset) => (
                        <Group
                            key={asset.id}
                            id={asset.id}
                            x={asset.x}
                            y={asset.y}
                            width={asset.width}
                            height={asset.height}
                            rotation={asset.rotation}
                            draggable
                            onClick={(e) => {
                                e.cancelBubble = true;
                                handleAssetSelect(asset.id);
                            }}
                            onDragEnd={(e) => {
                                onUpdateAsset({
                                    ...asset,
                                    x: e.target.x(),
                                    y: e.target.y(),
                                });
                            }}
                            onTransformEnd={() => handleTransformEnd(asset.id)}
                        >
                            {asset.type === 'emoji' && (
                                <Text
                                    text={asset.emoji}
                                    fontSize={asset.width}
                                    width={asset.width}
                                    height={asset.height}
                                    align="center"
                                    verticalAlign="middle"
                                />
                            )}
                        </Group>
                    ))}
                    <Transformer
                        ref={transformerRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            // Limit minimum size
                            if (newBox.width < 10 || newBox.height < 10) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                </Layer>
            </Stage>

            {/* Canvas dimensions display */}
            <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                Canvas Size: {CANVAS_WIDTH}x{CANVAS_HEIGHT}
            </div>
        </div>
    );
}