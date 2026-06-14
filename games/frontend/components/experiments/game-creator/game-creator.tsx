"use client";

import { useState, useRef } from "react";
import AssetPanel from "./asset-panel";
import CanvasWorkspace from "./canvas-workspace";
import { GameAsset, GameConfig, EventAction } from "./types";

export default function GameCreator() {
    const [assets, setAssets] = useState<GameAsset[]>([]);
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [background, setBackground] = useState<{ color: string; image?: string }>({
        color: "#ffffff"
    });

    // Find the selected asset
    const selectedAsset = assets.find(asset => asset.id === selectedAssetId);

    // Handle asset selection
    const handleSelectAsset = (id: string | null) => {
        setSelectedAssetId(id);
    };

    // Add new asset to canvas
    const handleAddAsset = (asset: GameAsset) => {
        setAssets([...assets, asset]);
    };

    // Update asset properties
    const handleUpdateAsset = (updatedAsset: GameAsset) => {
        setAssets(
            assets.map(asset => (asset.id === updatedAsset.id ? updatedAsset : asset))
        );
    };

    // Delete an asset
    const handleDeleteAsset = (id: string) => {
        setAssets(assets.filter(asset => asset.id !== id));
        if (selectedAssetId === id) {
            setSelectedAssetId(null);
        }
    };

    // Update background
    const handleUpdateBackground = (newBackground: { color: string; image?: string }) => {
        setBackground(newBackground);
    };

    // Add event to an asset
    const handleAddEvent = (assetId: string, eventType: string, action: EventAction) => {
        setAssets(
            assets.map(asset => {
                if (asset.id === assetId) {
                    const events = { ...(asset.events || {}) };
                    events[eventType] = action;
                    return { ...asset, events };
                }
                return asset;
            })
        );
    };

    // Create game config and log to console
    const handleCreateGame = () => {
        const gameConfig: GameConfig = {
            background,
            assets: assets.map(({ id, type, emoji, x, y, width, height, rotation, events }) => ({
                id,
                type,
                emoji,
                x,
                y,
                width,
                height,
                rotation,
                events
            }))
        };
        console.log(JSON.stringify(gameConfig, null, 2));
        alert("Game configuration has been logged to console!");
    };

    return (
        <div className="flex h-screen">
            {/* Canvas Area */}
            <div className="flex-1 p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-800 overflow-auto">
                <CanvasWorkspace
                    assets={assets}
                    background={background}
                    selectedAssetId={selectedAssetId}
                    onSelectAsset={handleSelectAsset}
                    onUpdateAsset={handleUpdateAsset}
                    onDeleteAsset={handleDeleteAsset}
                />
            </div>

            {/* Right Panel */}
            <div className="w-[300px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                <AssetPanel
                    onAddAsset={handleAddAsset}
                    selectedAsset={selectedAsset}
                    onUpdateAsset={handleUpdateAsset}
                    onAddEvent={handleAddEvent}
                    onUpdateBackground={handleUpdateBackground}
                    background={background}
                />
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleCreateGame}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                    >
                        Create Game
                    </button>
                </div>
            </div>
        </div>
    );
}