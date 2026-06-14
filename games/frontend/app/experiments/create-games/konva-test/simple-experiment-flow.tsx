"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Simple game flow types
interface Game {
    id: string;
    name: string;
    gameType: string;
}

interface GameConnection {
    fromGameId: string;
    toGameId: string;
    condition: string | null;
}

interface GameCondition {
    fromGame: string;
    parameter: string;
    operator: string;
    value: any;
    toGame: string;
}

interface GameRandomization {
    fromGame: string;
    possibleGames: string[];
}

interface GameFlow {
    experimentName: string;
    createdAt: string;
    games: Game[];
    gameFlow: {
        startGameId: string | null;
        sequence: GameConnection[];
        conditions: Record<string, GameCondition[]>;
        randomizations: Record<string, GameRandomization>;
    };
}

// Sample data representing a simplified experiment flow
const sampleGameFlow: GameFlow = {
    experimentName: "Cognitive Assessment Demo",
    createdAt: "2025-10-12T12:00:00.000Z",
    games: [
        { id: "g1", name: "Stroop Task", gameType: "cognitive" },
        { id: "g2", name: "Memory Test", gameType: "cognitive" },
        { id: "g3", name: "Attention Test", gameType: "cognitive" },
        { id: "g4", name: "Decision Making", gameType: "decision-making" },
        { id: "g5", name: "Perception Task", gameType: "perception-reaction" }
    ],
    gameFlow: {
        startGameId: "g1",
        sequence: [
            { fromGameId: "g1", toGameId: "g2", condition: "score > 70" },
            { fromGameId: "g1", toGameId: "g3", condition: "score <= 70" },
            { fromGameId: "g2", toGameId: "g4", condition: null },
            { fromGameId: "g3", toGameId: "g4", condition: null },
            { fromGameId: "g4", toGameId: "g5", condition: null }
        ],
        conditions: {
            "g1": [
                { fromGame: "g1", parameter: "score", operator: ">", value: 70, toGame: "g2" },
                { fromGame: "g1", parameter: "score", operator: "<=", value: 70, toGame: "g3" }
            ]
        },
        randomizations: {
            "g4": {
                fromGame: "g4",
                possibleGames: ["g5"]
            }
        }
    }
};

export default function SimpleExperimentFlowHandler() {
    const [currentGameId, setCurrentGameId] = useState<string | null>(null);
    const [completedGames, setCompletedGames] = useState<string[]>([]);
    const [gameResults, setGameResults] = useState<Record<string, any>>({});
    const [experimentStarted, setExperimentStarted] = useState(false);
    const [experimentEnded, setExperimentEnded] = useState(false);
    const [gameSequence, setGameSequence] = useState<string[]>([]);

    // Start the experiment
    const startExperiment = () => {
        if (sampleGameFlow.gameFlow.startGameId) {
            setCurrentGameId(sampleGameFlow.gameFlow.startGameId);
            setExperimentStarted(true);
            setGameSequence([sampleGameFlow.gameFlow.startGameId]);
        }
    };

    // Get the current game
    const getCurrentGame = (): Game | null => {
        if (!currentGameId) return null;
        return sampleGameFlow.games.find(game => game.id === currentGameId) || null;
    };

    // Complete the current game
    const completeGame = (score: number) => {
        if (!currentGameId) return;

        // Record the game result
        setGameResults(prev => ({
            ...prev,
            [currentGameId as string]: { score }
        }));

        // Mark as completed
        setCompletedGames(prev => [...prev, currentGameId as string]);

        // Find next game
        const nextGameId = findNextGame(currentGameId, score);
        if (nextGameId) {
            setCurrentGameId(nextGameId);
            setGameSequence(prev => [...prev, nextGameId]);
        } else {
            setCurrentGameId(null);
            setExperimentEnded(true);
        }
    };

    // Find the next game based on conditions
    const findNextGame = (gameId: string, score: number): string | null => {
        // Check if there are conditions for this game
        const conditions = sampleGameFlow.gameFlow.conditions[gameId];
        if (conditions) {
            // Evaluate each condition
            for (const condition of conditions) {
                if (evaluateCondition(condition, score)) {
                    return condition.toGame;
                }
            }
        }

        // If no conditions matched or no conditions exist, look for a direct connection
        const connection = sampleGameFlow.gameFlow.sequence.find(
            seq => seq.fromGameId === gameId && !seq.condition
        );

        // Check if there's a randomization for this game
        const randomization = sampleGameFlow.gameFlow.randomizations[gameId];
        if (randomization && randomization.possibleGames.length > 0) {
            // Simple random selection from possible games
            const randomIndex = Math.floor(Math.random() * randomization.possibleGames.length);
            return randomization.possibleGames[randomIndex];
        }

        return connection ? connection.toGameId : null;
    };

    // Helper to evaluate a simple condition
    const evaluateCondition = (condition: GameCondition, value: number): boolean => {
        switch (condition.operator) {
            case '>': return value > condition.value;
            case '>=': return value >= condition.value;
            case '<': return value < condition.value;
            case '<=': return value <= condition.value;
            case '==': return value === condition.value;
            case '!=': return value !== condition.value;
            default: return false;
        }
    };

    // Reset the experiment
    const resetExperiment = () => {
        setCurrentGameId(null);
        setCompletedGames([]);
        setGameResults({});
        setExperimentStarted(false);
        setExperimentEnded(false);
        setGameSequence([]);
    };

    // Render the game component
    const renderGame = () => {
        const game = getCurrentGame();
        if (!game) return null;

        return (
            <div className="p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">{game.name}</h2>
                <p className="mb-8">Game Type: {game.gameType}</p>

                {/* Simulate game completion with random scores */}
                <div className="flex justify-center space-x-4">
                    <Button
                        variant="outline"
                        onClick={() => completeGame(Math.floor(Math.random() * 50) + 20)} // 20-69 score
                    >
                        Complete with Low Score
                    </Button>

                    <Button
                        variant="default"
                        onClick={() => completeGame(Math.floor(Math.random() * 30) + 70)} // 70-99 score
                    >
                        Complete with High Score
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">{sampleGameFlow.experimentName}</CardTitle>
                </CardHeader>
                <CardContent>
                    {!experimentStarted && !experimentEnded ? (
                        <div className="text-center p-6">
                            <p className="mb-4">This demo shows how games flow based on a simple JSON structure.</p>
                            <Button onClick={startExperiment}>Start Experiment</Button>
                        </div>
                    ) : experimentEnded ? (
                        <div className="text-center p-6">
                            <h2 className="text-xl font-bold mb-4">Experiment Completed!</h2>
                            <p className="mb-4">You've completed all games in this flow.</p>

                            <div className="mb-6 text-left p-4 bg-muted rounded-md">
                                <h3 className="font-semibold mb-2">Games played in sequence:</h3>
                                <ol className="list-decimal list-inside">
                                    {gameSequence.map((gameId, index) => {
                                        const game = sampleGameFlow.games.find(g => g.id === gameId);
                                        const result = gameResults[gameId];
                                        return (
                                            <li key={index} className="mb-1">
                                                {game?.name} {result && `- Score: ${result.score}`}
                                            </li>
                                        );
                                    })}
                                </ol>
                            </div>

                            <Button onClick={resetExperiment}>Restart</Button>
                        </div>
                    ) : (
                        renderGame()
                    )}
                </CardContent>
            </Card>

            {experimentStarted && !experimentEnded && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-sm">Experiment Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm">
                            <p><strong>Current Game:</strong> {getCurrentGame()?.name}</p>
                            <p><strong>Completed:</strong> {completedGames.length} of {sampleGameFlow.games.length}</p>

                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">Flow Path:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {gameSequence.map((gameId, index) => {
                                        const game = sampleGameFlow.games.find(g => g.id === gameId);
                                        const isLast = index === gameSequence.length - 1;

                                        return (
                                            <div key={index} className="flex items-center">
                                                <span className={`px-2 py-1 rounded-md text-xs ${isLast ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                    {game?.name}
                                                </span>
                                                {!isLast && <span className="mx-1">→</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}