'use client'

import pb from '@/lib/pb';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import game components
// Cognitive games
import StroopSprint from '@/games/cognitive/stroop-sprint';
import TrailTracker from '@/games/cognitive/trail-tracker';

// Decision-making games
import RiskRun from '@/games/decision-making/risk-run';
import TrustTrade from '@/games/decision-making/trust-trade';

// Perception-reaction games
import FlashReflex from '@/games/perception-reaction/flash-reflex';
import BlinkGap from '@/games/perception-reaction/blink-gap';

// Social-emotional games
import MoodMirror from '@/games/social-emotional/mood-mirror';

// Custom games
import PatternMatchingGame from '@/app/games/custom/pattern-matching/page';

// Type definitions
interface GameData {
    id: string;
    name: string;
    [key: string]: any;
}

interface ProjectData {
    id: string;
    name: string;
    description?: string;
    games: GameData[];
    [key: string]: any;
}

interface ParticipantRecord {
    id: string;
    data: {
        games: GameData[];
        [key: string]: any;
    };
    [key: string]: any;
}

interface GameResults {
    [gameId: string]: any;
}

interface Condition {
    metric: string;
    operator: string;
    value: number;
}

const ParticipantPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [currentGameIndex, setCurrentGameIndex] = useState(0);
    const [gameResults, setGameResults] = useState<GameResults>({});
    const [loading, setLoading] = useState(true);
    const [allGamesCompleted, setAllGamesCompleted] = useState(false);
    const [availableGames, setAvailableGames] = useState<GameData[]>([]);
    const [orgId, setOrgId] = useState('');
    const [dataSubmitted, setDataSubmitted] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [currentGameResults, setCurrentGameResults] = useState<{ gameId: string, data: any } | null>(null);

    // Fetch the organization ID
    useEffect(() => {
        async function getOrgData() {
            try {
                const records = await pb.collection('organizations').getFullList();
                setOrgId(records[0]?.id || '');
                console.log('Organization ID fetched:', records[0]?.id);
            } catch (error) {
                console.error('Error fetching organization data:', error);
            }
        }
        getOrgData()
    }, [])

    useEffect(() => {
        async function getData() {
            try {
                const record = await pb.collection('get_projects').getFirstListItem(`project_id="${id}"`);
                console.log("Fetched data:", record.data);
                setProjectData(record.data);

                // Initialize available games based on requirements/metrics
                if (record.data && record.data.games) {
                    const initialAvailableGames = record.data.games.filter((game: GameData) => {
                        // Check if the game has any entry requirements (metrics)
                        if (game.requirements && Object.keys(game.requirements).length > 0) {
                            // For the first game or if there are no previous results, show only if no dependent metrics
                            if (Object.keys(gameResults).length === 0) {
                                return !game.requiresPreviousGame;
                            }

                            // Otherwise check all requirements against existing game results
                            return checkGameRequirements(game.requirements, gameResults);
                        }
                        // If no requirements specified, always show the game
                        return true;
                    });
                    setAvailableGames(initialAvailableGames);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching organization data:', error)
                setLoading(false);
            }
        }
        getData()
    }, [id, gameResults])

    // Function to handle when a game is completed (show completion screen)
    const handleGameComplete = (currentGameId: string, gameData: any) => {
        setCurrentGameResults({ gameId: currentGameId, data: gameData });
        setGameCompleted(true);
    };

    // Function to move to the next game (called when Next button is clicked)
    const moveToNextGame = () => {
        if (!currentGameResults) return;

        const { gameId: currentGameId, data: gameData } = currentGameResults;

        // Store results for current game
        const updatedResults = {
            ...gameResults,
            [currentGameId]: gameData
        };

        setGameResults(updatedResults);

        if (!projectData) return;

        // Check for conditions if needed
        let nextGameIndex = currentGameIndex + 1;

        // Check if we need to apply any conditions
        const gameFlow = (projectData as any).gameFlow;
        if (gameFlow?.conditions && gameFlow.conditions[currentGameId]) {
            // We have conditions for this game
            const conditions = gameFlow.conditions[currentGameId];

            for (const condition of conditions) {
                const { parameter, operator, value, toGame } = condition;
                const gameResult = gameData[parameter];

                if (evaluateCondition(gameResult, operator, value)) {
                    // Find the index of the target game
                    const targetGameIndex = (projectData as any).games.findIndex((g: any) => g.id === toGame);
                    if (targetGameIndex !== -1) {
                        nextGameIndex = targetGameIndex;
                        break;
                    }
                }
            }
        }

        // Update available games based on new game results
        const updatedAvailableGames = (projectData as any).games.filter((game: any) => {
            // Check if the game has any entry requirements (metrics)
            if (game.requirements && Object.keys(game.requirements).length > 0) {
                return checkGameRequirements(game.requirements, updatedResults);
            }
            // If no requirements specified, always show the game
            return true;
        });

        setAvailableGames(updatedAvailableGames);

        // Check if we've completed all games or have no more available games
        if (nextGameIndex >= (projectData as any).games.length || updatedAvailableGames.length === 0) {
            console.log("All games completed! Results:", updatedResults);

            // Store the project ID in the results for reference
            const finalResults = {
                ...updatedResults,
                _metadata: {
                    projectId: id,
                    completedAt: new Date().toISOString()
                }
            };

            setGameResults(finalResults);
            setAllGamesCompleted(true);
        } else {
            // Find the next available game starting from nextGameIndex
            const availableGameIds = updatedAvailableGames.map((g: any) => g.id);

            // Find the next available game starting from the current index
            while (nextGameIndex < (projectData as any).games.length) {
                const nextGameId = (projectData as any).games[nextGameIndex].id;
                if (availableGameIds.includes(nextGameId)) {
                    break; // Found an available game
                }
                nextGameIndex++; // Try the next game
            }

            // If we've gone through all games and none are available, mark as completed
            if (nextGameIndex >= (projectData as any).games.length) {
                setAllGamesCompleted(true);
            } else {
                setCurrentGameIndex(nextGameIndex);
                setGameCompleted(false);
                setCurrentGameResults(null);
            }
        }
    };

    // Simple function to evaluate conditions
    const evaluateCondition = (value: any, operator: string, threshold: number) => {
        switch (operator) {
            case '>': return value > threshold;
            case '<': return value < threshold;
            case '>=': return value >= threshold;
            case '<=': return value <= threshold;
            case '==': return value == threshold;
            case '!=': return value != threshold;
            default: return false;
        }
    };

    // Check if a game meets all its requirements based on previous game results
    const checkGameRequirements = (requirements: any, results: any) => {
        // If no requirements, the game is always available
        if (!requirements || Object.keys(requirements).length === 0) return true;

        // Check each requirement
        for (const [gameId, conditions] of Object.entries(requirements)) {
            // If the referenced game doesn't have results yet, requirement fails
            if (!results[gameId]) return false;

            const gameResult = results[gameId];

            // Check each metric condition
            for (const condition of (conditions as Condition[])) {
                const { metric, operator, value } = condition;

                // If this metric doesn't exist in results, requirement fails
                if (!gameResult[metric]) return false;

                // Evaluate the condition
                if (!evaluateCondition(gameResult[metric], operator, value)) {
                    return false;
                }
            }
        }

        // All requirements passed
        return true;
    };

    const getCurrentGame = () => {
        if (!projectData || !projectData.games || projectData.games.length === 0) {
            return <div>No games found</div>;
        }

        if (currentGameIndex >= projectData.games.length) {
            return <div>No more games</div>;
        }

        const game = projectData.games[currentGameIndex];

        // Check if this game is available based on metrics
        const isGameAvailable = availableGames.some(g => g.id === game.id);

        if (!isGameAvailable) {
            // Skip to the next available game
            const nextAvailableIndex = projectData.games.findIndex((g: GameData, index: number) =>
                index > currentGameIndex && availableGames.some((ag: GameData) => ag.id === g.id)
            );

            if (nextAvailableIndex !== -1) {
                // Use setTimeout to avoid state updates during render
                setTimeout(() => {
                    setCurrentGameIndex(nextAvailableIndex);
                }, 0);
                return <div>Loading next available game...</div>;
            } else {
                // No more available games
                setTimeout(() => {
                    setAllGamesCompleted(true);
                }, 0);
                return <div>Preparing final results...</div>;
            }
        }

        switch (game.id) {
            // Cognitive games
            case 'Stroop Sprint':
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-4">{(game as any).name}</h2>
                        <StroopSprint
                            onGameComplete={(metrics) => {
                                handleGameComplete((game as any).id, metrics);
                            }}
                        />
                    </>
                );
            case 'Trail Tracker':
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-4">{(game as any).name}</h2>
                        <TrailTracker />
                        <div className="mt-4">
                            <Button
                                onClick={() => {
                                    handleGameComplete((game as any).id, {
                                        'completion-time': 32,
                                        'errors': 3
                                    });
                                }}
                                className="w-full"
                            >
                                Complete Game
                            </Button>
                        </div>
                    </>
                );

            case 'Risk Run':
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-4">{(game as any).name}</h2>
                        <RiskRun />
                        <div className="mt-4">
                            <Button
                                onClick={() => {
                                    handleGameComplete((game as any).id, {
                                        'risk-taking-score': 68,
                                        'decisions-made': 12,
                                        'reward-collection': 520
                                    });
                                }}
                                className="w-full"
                            >
                                Complete Game
                            </Button>
                        </div>
                    </>
                );
            case 'Trust Trade':
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-4">{(game as any).name}</h2>
                        <TrustTrade />
                        <div className="mt-4">
                            <Button
                                onClick={() => {
                                    handleGameComplete((game as any).id, {
                                        'trust-level': 72,
                                        'cooperation-rate': 65,
                                        'mutual-benefit': 450
                                    });
                                }}
                                className="w-full"
                            >
                                Complete Game
                            </Button>
                        </div>
                    </>
                );            // Perception-reaction games
            case 'Flash Reflex':
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-4">{(game as any).name}</h2>
                        <FlashReflex />
                        <div className="mt-4">
                            <Button
                                onClick={() => {
                                    handleGameComplete((game as any).id, {
                                        'reaction-time': 245,
                                        'accuracy': 92,
                                        'consistency': 88
                                    });
                                }}
                                className="w-full"
                            >
                                Complete Game
                            </Button>
                        </div>
                    </>
                );
            case 'Blink Gap':
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-4">{(game as any).name}</h2>
                        <BlinkGap />
                        <div className="mt-4">
                            <Button
                                onClick={() => {
                                    handleGameComplete((game as any).id, {
                                        'attention-span': 42,
                                        'missed-signals': 3,
                                        'response-variance': 0.15
                                    });
                                }}
                                className="w-full"
                            >
                                Complete Game
                            </Button>
                        </div>
                    </>
                );

            // Social-emotional games
            // case 'Mood Mirror':
            //     return (
            //         <>
            //             <h2 className="text-2xl font-bold mb-4">{game.name}</h2>
            //             <MoodMirror
            //                 onGameComplete={(metrics) => {
            //                     moveToNextGame(game.id, metrics || {
            //                         'emotion-recognition': 82,
            //                         'empathy-score': 76,
            //                         'response-time': 2.3
            //                     });
            //                 }}
            //             />
            //         </>
            //     );

            // Custom games
            case 'Pattern Matching Game':
                return (
                    <>
                        <PatternMatchingGame
                            config={(game as any).config}
                            onGameComplete={(metrics) => {
                                handleGameComplete((game as any).id, metrics);
                            }}
                        />
                    </>
                );

            default:
                return <div>Unknown game type: {game.id}</div>;
        }
    };

    // Submit all data when games are completed
    useEffect(() => {
        async function submitData() {
            // Only submit if all games are completed and data hasn't been submitted yet
            if (allGamesCompleted && !dataSubmitted && Object.keys(gameResults).length > 0 && orgId && id) {
                try {
                    // Format the data for submission
                    const data = {
                        "data": JSON.stringify(gameResults),
                        "project": id, // Project ID from the URL parameter
                        "organization": orgId // Organization ID we fetched
                    };

                    console.log("Submitting survey data:", data);

                    // Submit to PocketBase
                    const record = await pb.collection('survey_data').create(data);
                    console.log("Survey data submitted successfully:", record);

                    setDataSubmitted(true);
                } catch (error) {
                    console.error('Error submitting survey data:', error);
                }
            }
        }

        submitData();
    }, [allGamesCompleted, dataSubmitted, gameResults, orgId, id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-lg">Loading experiment...</p>
                </div>
            </div>
        );
    }

    if (allGamesCompleted) {
        return (
            <div className="container mx-auto p-6">
                <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Test Complete</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-center text-lg">
                            Thank you for participating in this experiment!
                        </p>
                        <div className="bg-green-50 p-4 rounded-md border border-green-200">
                            <p className="text-green-800 text-center">
                                {dataSubmitted
                                    ? "Your responses have been recorded successfully."
                                    : "Submitting your responses..."}
                            </p>
                        </div>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-60">
                            {JSON.stringify(gameResults, null, 2)}
                        </pre>
                        <div className="text-center">
                            <Button
                                onClick={() => router.push("/")}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2"
                            >
                                Return to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show game completion screen when a game is finished
    if (gameCompleted && currentGameResults) {
        const currentGame = (projectData as any)?.games?.[currentGameIndex];
        const isLastGame = currentGameIndex >= ((projectData as any)?.games?.length - 1);

        return (
            <div className="container mx-auto p-6">
                <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Game Complete!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-4">{currentGame?.name || 'Game'} Results</h3>
                            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                                <p className="text-blue-800">
                                    Great job! Your performance data has been recorded.
                                </p>
                            </div>
                        </div>

                        {/* Show some basic metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(currentGameResults.data).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 p-3 rounded-md text-center">
                                    <div className="text-sm text-gray-600 capitalize">
                                        {key.replace(/-/g, ' ')}
                                    </div>
                                    <div className="text-lg font-bold">
                                        {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center">
                            <Button
                                onClick={moveToNextGame}
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                {isLastGame ? 'Complete Study' : 'Next Game'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Display game metrics and availability for debugging
    const renderGameMetricsDebug = () => {
        if (!projectData || !projectData.games) return null;

        return (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Game Metrics & Availability</h3>
                <div className="space-y-2 text-xs">
                    {projectData.games.map((game: GameData, index: number) => {
                        const isAvailable = availableGames.some((g: GameData) => g.id === game.id);
                        const hasResults = gameResults[game.id];

                        return (
                            <div key={game.id} className="flex justify-between p-2 border-b border-gray-100">
                                <div>
                                    <span className="font-medium">{game.name}</span>
                                    <span className={`ml-2 ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                        ({isAvailable ? 'Available' : 'Not Available'})
                                    </span>
                                </div>
                                {hasResults && (
                                    <div className="text-blue-600">
                                        Results: {Object.keys(gameResults[game.id]).length} metrics
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
                {getCurrentGame()}
            </div>

            {/* Uncomment for debugging */}
            {/* {renderGameMetricsDebug()} */}
        </div>
    )
}

export default ParticipantPage
