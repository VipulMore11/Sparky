"use client";

import React from "react";
import { GameAsset } from "./types";

interface ParameterTrackingPanelProps {
    asset: GameAsset | null;
    gameSessionData?: {
        startTime: number;
        currentTime: number;
        interactions: {
            assetId: string;
            interactionType: string;
            timestamp: number;
            responseTime?: number;
            isCorrect?: boolean;
        }[];
        metrics: {
            averageResponseTime: number;
            accuracy: number;
            completionPercentage: number;
        };
    };
}

export default function ParameterTrackingPanel({
    asset,
    gameSessionData
}: ParameterTrackingPanelProps) {
    // If no asset is selected or no tracking data is available
    if (!asset || !asset.cognitiveRole) {
        return (
            <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                    Select an asset to view tracking data or interact with the game to generate metrics.
                </p>
            </div>
        );
    }

    // Create dummy session data if none provided (for preview purposes)
    const sessionData = gameSessionData || {
        startTime: Date.now() - 15000, // Started 15 seconds ago
        currentTime: Date.now(),
        interactions: [
            {
                assetId: asset.id,
                interactionType: "click",
                timestamp: Date.now() - 10000,
                responseTime: 850,
                isCorrect: true
            },
            {
                assetId: asset.id,
                interactionType: "click",
                timestamp: Date.now() - 5000,
                responseTime: 920,
                isCorrect: false
            }
        ],
        metrics: {
            averageResponseTime: 885,
            accuracy: 50,
            completionPercentage: 33
        }
    };

    // Calculate elapsed time
    const elapsedTimeInSeconds = Math.floor((sessionData.currentTime - sessionData.startTime) / 1000);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h3 className="font-semibold text-base">Live Parameter Tracking</h3>
                <p className="text-xs text-muted-foreground">Session time: {elapsedTimeInSeconds} seconds</p>
            </div>

            <div className="flex-1 overflow-auto p-4">
                {/* Asset Information */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-primary mb-2">Asset Information</h4>
                    <div className="bg-accent/20 p-3 rounded-md">
                        <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-xs">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium">{asset.type === "emoji" ? "Emoji" : "Image"}</span>

                            <span className="text-muted-foreground">Role:</span>
                            <span className="font-medium">{asset.cognitiveRole.role}</span>

                            {asset.cognitiveRole.isTarget && (
                                <>
                                    <span className="text-muted-foreground">Target:</span>
                                    <span className="text-primary font-medium">Yes</span>
                                </>
                            )}

                            {asset.cognitiveRole.stimulusCategory && (
                                <>
                                    <span className="text-muted-foreground">Category:</span>
                                    <span className="font-medium">{asset.cognitiveRole.stimulusCategory}</span>
                                </>
                            )}

                            <span className="text-muted-foreground">Position:</span>
                            <span className="font-medium">({Math.round(asset.x)}, {Math.round(asset.y)})</span>
                        </div>
                    </div>
                </div>

                {/* Timing Information */}
                {(asset.cognitiveRole.stimulusDelay !== undefined ||
                    asset.cognitiveRole.stimulusDuration !== undefined ||
                    asset.cognitiveRole.requiredResponseTime !== undefined) && (
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-primary mb-2">Timing Parameters</h4>
                            <div className="bg-accent/20 p-3 rounded-md">
                                <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-xs">
                                    {asset.cognitiveRole.stimulusDelay !== undefined && (
                                        <>
                                            <span className="text-muted-foreground">Delay:</span>
                                            <span className="font-medium">{asset.cognitiveRole.stimulusDelay} ms</span>
                                        </>
                                    )}

                                    {asset.cognitiveRole.stimulusDuration !== undefined && (
                                        <>
                                            <span className="text-muted-foreground">Duration:</span>
                                            <span className="font-medium">{asset.cognitiveRole.stimulusDuration} ms</span>
                                        </>
                                    )}

                                    {asset.cognitiveRole.requiredResponseTime !== undefined && (
                                        <>
                                            <span className="text-muted-foreground">Required Response:</span>
                                            <span className="font-medium">{asset.cognitiveRole.requiredResponseTime} ms</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                {/* Tracking Data */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-primary mb-2">Tracked Metrics</h4>
                    <div className="bg-accent/20 p-3 rounded-md">
                        {asset.cognitiveRole.trackingData ? (
                            <div className="space-y-3">
                                {asset.cognitiveRole.trackingData.responseTime && (
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Response Time:</span>
                                            <span className="font-medium">{sessionData.metrics.averageResponseTime} ms</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-primary h-2"
                                                style={{ width: `${Math.min(100, (sessionData.metrics.averageResponseTime / 1000) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {asset.cognitiveRole.trackingData.accuracy && (
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Accuracy:</span>
                                            <span className="font-medium">{sessionData.metrics.accuracy}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-primary h-2"
                                                style={{ width: `${sessionData.metrics.accuracy}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {asset.cognitiveRole.trackingData.mouseTrajectory && (
                                    <div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Mouse Trajectory:</span>
                                            <span className="font-medium">Tracking</span>
                                        </div>
                                    </div>
                                )}

                                {asset.cognitiveRole.trackingData.hesitations && (
                                    <div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Hesitations:</span>
                                            <span className="font-medium">Detected</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">No tracking parameters defined for this asset.</p>
                        )}
                    </div>
                </div>

                {/* Interaction Log */}
                <div>
                    <h4 className="text-sm font-medium text-primary mb-2">Interaction Log</h4>
                    <div className="bg-accent/20 p-3 rounded-md max-h-48 overflow-auto">
                        {sessionData.interactions.length > 0 ? (
                            <div className="space-y-2">
                                {sessionData.interactions.map((interaction, index) => (
                                    <div key={index} className="text-xs p-2 bg-card rounded border">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {new Date(interaction.timestamp).toLocaleTimeString()}
                                            </span>
                                            <span className={`font-medium ${interaction.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                                {interaction.isCorrect ? 'Correct' : 'Incorrect'}
                                            </span>
                                        </div>
                                        <div className="mt-1">
                                            <span className="text-muted-foreground">Response time:</span> {interaction.responseTime} ms
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">No interactions recorded yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Footer */}
            <div className="p-4 border-t mt-auto">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Overall Completion:</span>
                    <span className="font-medium">{sessionData.metrics.completionPercentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-primary h-2"
                        style={{ width: `${sessionData.metrics.completionPercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}