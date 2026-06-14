"use client";

import { useState } from "react";
import { GameAsset, EventAction } from "./types";
// Generate a random ID instead of using UUID library
function generateId() {
    return Math.random().toString(36).substring(2, 15);
}
//import { ChromePicker } from "react-color";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Default emoji assets
const DEFAULT_EMOJIS = ["😀", "🧠", "⚡", "🕹️", "⏱️"];

type AssetPanelProps = {
    onAddAsset: (asset: GameAsset) => void;
    selectedAsset: GameAsset | undefined;
    onUpdateAsset: (asset: GameAsset) => void;
    onAddEvent: (assetId: string, eventType: string, action: EventAction) => void;
    onUpdateBackground: (background: { color: string; image?: string }) => void;
    background: { color: string; image?: string };
};

export default function AssetPanel({
    onAddAsset,
    selectedAsset,
    onUpdateAsset,
    onAddEvent,
    onUpdateBackground,
    background
}: AssetPanelProps) {
    const [showColorPicker, setShowColorPicker] = useState(false);

    // Handle emoji drag start
    const handleDragStart = (emoji: string, e: React.DragEvent) => {
        e.dataTransfer.setData("text/plain", emoji);
    };

    // Handle drop on canvas (handled in parent component)
    const handleAddEmoji = (emoji: string) => {
        const newAsset: GameAsset = {
            id: generateId(),
            type: "emoji",
            emoji,
            x: Math.random() * 500 + 100, // Random position
            y: Math.random() * 300 + 100,
            width: 50,
            height: 50,
            rotation: 0,
            events: {},
        };

        onAddAsset(newAsset);
    };

    // Handle background color change
    const handleColorChange = (color: any) => {
        onUpdateBackground({
            ...background,
            color: color.hex,
        });
    };

    // Handle background image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdateBackground({
                    ...background,
                    image: reader.result as string,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle adding event to selected asset
    const handleAddEventToAsset = (eventType: string, actionType: string, duration: number) => {
        if (selectedAsset) {
            const action: EventAction = {
                type: actionType as any,
                duration,
            };
            onAddEvent(selectedAsset.id, eventType, action);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">Cognitive Game Creator</h2>
            </div>

            <Tabs defaultValue="assets" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="assets">Assets</TabsTrigger>
                    <TabsTrigger value="background">Background</TabsTrigger>
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                </TabsList>

                {/* Assets Tab */}
                <TabsContent value="assets" className="p-4">
                    <h3 className="font-medium mb-2">Emoji Assets</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {DEFAULT_EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => handleAddEmoji(emoji)}
                                draggable
                                onDragStart={(e) => handleDragStart(emoji, e)}
                                className="text-3xl h-16 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex items-center justify-center cursor-grab"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        Click on an emoji to add it to the canvas
                    </div>
                </TabsContent>

                {/* Background Tab */}
                <TabsContent value="background" className="p-4">
                    <h3 className="font-medium mb-2">Background Color</h3>
                    <div className="flex items-center space-x-2 mb-4">
                        <div
                            className="w-10 h-10 border rounded cursor-pointer"
                            style={{ backgroundColor: background.color }}
                            onClick={() => setShowColorPicker(!showColorPicker)}
                        ></div>
                        <span>{background.color}</span>
                    </div>

                    {showColorPicker && (
                        <div className="mb-4">
                            <input
                                type="color"
                                value={background.color}
                                onChange={(e) => handleColorChange({ hex: e.target.value })}
                                className="w-full h-10"
                            />
                        </div>
                    )}

                    <h3 className="font-medium mb-2 mt-6">Background Image (Optional)</h3>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />

                    {background.image && (
                        <div className="mt-2">
                            <button
                                onClick={() => onUpdateBackground({ ...background, image: undefined })}
                                className="text-red-500 text-sm"
                            >
                                Remove Image
                            </button>
                        </div>
                    )}
                </TabsContent>

                {/* Properties Tab */}
                <TabsContent value="properties" className="p-4">
                    {selectedAsset ? (
                        <div>
                            <h3 className="font-medium mb-4">Asset Properties</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Position</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-gray-500">X</label>
                                            <input
                                                type="number"
                                                value={Math.round(selectedAsset.x)}
                                                onChange={(e) => onUpdateAsset({
                                                    ...selectedAsset,
                                                    x: Number(e.target.value)
                                                })}
                                                className="w-full border rounded p-1 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">Y</label>
                                            <input
                                                type="number"
                                                value={Math.round(selectedAsset.y)}
                                                onChange={(e) => onUpdateAsset({
                                                    ...selectedAsset,
                                                    y: Number(e.target.value)
                                                })}
                                                className="w-full border rounded p-1 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Size</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-gray-500">Width</label>
                                            <input
                                                type="number"
                                                value={Math.round(selectedAsset.width)}
                                                onChange={(e) => onUpdateAsset({
                                                    ...selectedAsset,
                                                    width: Number(e.target.value)
                                                })}
                                                className="w-full border rounded p-1 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">Height</label>
                                            <input
                                                type="number"
                                                value={Math.round(selectedAsset.height)}
                                                onChange={(e) => onUpdateAsset({
                                                    ...selectedAsset,
                                                    height: Number(e.target.value)
                                                })}
                                                className="w-full border rounded p-1 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Rotation</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="360"
                                        value={selectedAsset.rotation}
                                        onChange={(e) => onUpdateAsset({
                                            ...selectedAsset,
                                            rotation: Number(e.target.value)
                                        })}
                                        className="w-full"
                                    />
                                    <div className="text-right text-xs">{selectedAsset.rotation}°</div>
                                </div>

                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="events">
                                        <AccordionTrigger>Event Handlers</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 mt-2">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">On Click</label>
                                                    <select
                                                        className="w-full border rounded p-1 text-sm"
                                                        value={selectedAsset.events?.onClick?.type || ""}
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                handleAddEventToAsset("onClick", e.target.value, 1);
                                                            }
                                                        }}
                                                    >
                                                        <option value="">No Action</option>
                                                        <option value="bounce">Bounce</option>
                                                        <option value="fade">Fade</option>
                                                        <option value="rotate">Rotate</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">On Hover</label>
                                                    <select
                                                        className="w-full border rounded p-1 text-sm"
                                                        value={selectedAsset.events?.onHover?.type || ""}
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                handleAddEventToAsset("onHover", e.target.value, 1);
                                                            }
                                                        }}
                                                    >
                                                        <option value="">No Action</option>
                                                        <option value="bounce">Bounce</option>
                                                        <option value="fade">Fade</option>
                                                        <option value="rotate">Rotate</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">On Key Press</label>
                                                    <select
                                                        className="w-full border rounded p-1 text-sm"
                                                        value={selectedAsset.events?.onKeyPress?.type || ""}
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                handleAddEventToAsset("onKeyPress", e.target.value, 1);
                                                            }
                                                        }}
                                                    >
                                                        <option value="">No Action</option>
                                                        <option value="bounce">Bounce</option>
                                                        <option value="fade">Fade</option>
                                                        <option value="rotate">Rotate</option>
                                                    </select>
                                                </div>

                                                {Object.keys(selectedAsset.events || {}).length > 0 && (
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Animation Duration</label>
                                                        <input
                                                            type="range"
                                                            min="0.1"
                                                            max="3"
                                                            step="0.1"
                                                            value={selectedAsset.events?.onClick?.duration || 1}
                                                            onChange={(e) => {
                                                                const eventType = Object.keys(selectedAsset.events || {})[0];
                                                                const eventAction = selectedAsset.events?.[eventType];
                                                                if (eventAction) {
                                                                    handleAddEventToAsset(
                                                                        eventType,
                                                                        eventAction.type,
                                                                        parseFloat(e.target.value)
                                                                    );
                                                                }
                                                            }}
                                                            className="w-full"
                                                        />
                                                        <div className="text-right text-xs">
                                                            {selectedAsset.events?.onClick?.duration || 1}s
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Select an asset to view and edit properties
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}