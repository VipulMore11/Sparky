"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stage, Layer, Rect, Text as KonvaText, Circle, RegularPolygon } from 'react-konva';

interface PatternItem {
    id: string;
    type: 'letter' | 'number' | 'shape' | 'color';
    value: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    fontSize?: number;
    fontFamily?: string;
    fontStyle?: string;
    textFill?: string;
    isSelected?: boolean;
}

interface PatternOption {
    id: string;
    value: string;
    isCorrect: boolean;
}

interface PatternConfig {
    title: string;
    description: string;
    gridSize: {
        rows: number;
        cols: number;
    };
    cellSize: number;
    patternItems: PatternItem[];
    options: PatternOption[];
    gameMode: 'multiple_choice' | 'drag_drop' | 'click_pattern';
    difficulty: 'easy' | 'medium' | 'hard';
}

interface PatternMatchingGameProps {
    config?: PatternConfig;
    onGameComplete?: (metrics: any) => void;
}

export default function PatternMatchingGame({ config, onGameComplete }: PatternMatchingGameProps) {
    const [gameStarted, setGameStarted] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [startTime, setStartTime] = useState<number>(0);
    const [responseTime, setResponseTime] = useState<number>(0);
    const [allResponseTimes, setAllResponseTimes] = useState<number[]>([]);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [patternAnalysisTime, setPatternAnalysisTime] = useState<number>(0);

    // Default configuration if none provided
    const defaultConfig: PatternConfig = {
        title: "Pattern Matching Game",
        description: "Find the correct pattern or next item in the sequence",
        gridSize: { rows: 2, cols: 4 },
        cellSize: 80,
        patternItems: [],
        options: [
            { id: "1", value: "A", isCorrect: true },
            { id: "2", value: "B", isCorrect: false },
            { id: "3", value: "C", isCorrect: false }
        ],
        gameMode: 'multiple_choice',
        difficulty: 'medium'
    };

    const gameConfig = config || defaultConfig;
    const stageWidth = gameConfig.gridSize.cols * gameConfig.cellSize + 40;
    const stageHeight = gameConfig.gridSize.rows * gameConfig.cellSize + 40;

    const startGame = () => {
        setGameStarted(true);
        setScore(0);
        setAttempts(0);
        setCorrectAnswers(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setStartTime(performance.now());
        setAllResponseTimes([]);
        setGameCompleted(false);
        setPatternAnalysisTime(0);
    };

    const handleAnswerSelect = (optionId: string) => {
        if (isCorrect !== null || gameCompleted) return; // Already answered or game completed

        const timeTaken = performance.now() - startTime;
        setResponseTime(timeTaken);
        setAllResponseTimes(prev => [...prev, timeTaken]);
        setPatternAnalysisTime(timeTaken);

        setSelectedAnswer(optionId);
        setAttempts(prev => prev + 1);

        const selectedOption = gameConfig.options.find(opt => opt.id === optionId);
        const correct = selectedOption?.isCorrect || false;

        setIsCorrect(correct);

        if (correct) {
            setCorrectAnswers(prev => prev + 1);
            // Score based on difficulty and response time
            let baseScore = 100;
            if (gameConfig.difficulty === 'hard') baseScore = 150;
            if (gameConfig.difficulty === 'easy') baseScore = 50;

            // Time bonus (faster responses get more points)
            const timeBonus = Math.max(0, 50 - Math.floor(timeTaken / 1000));
            setScore(prev => prev + baseScore + timeBonus);
        }
    };

    const completeGame = () => {
        setGameCompleted(true);

        const accuracy = attempts > 0 ? Math.round((correctAnswers / attempts) * 100) : 0;
        const avgResponseTime = allResponseTimes.length > 0
            ? Math.round(allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length)
            : 0;

        // Pattern Recognition metrics
        const patternComplexityScore = calculatePatternComplexity();
        const visualProcessingScore = calculateVisualProcessingScore(avgResponseTime);
        const cognitiveLoadScore = calculateCognitiveLoad();

        if (onGameComplete) {
            onGameComplete({
                'score': score,
                'accuracy': accuracy,
                'total-attempts': attempts,
                'correct-answers': correctAnswers,
                'avg-response-time': avgResponseTime,
                'pattern-analysis-time': Math.round(patternAnalysisTime),
                'pattern-complexity-score': patternComplexityScore,
                'visual-processing-score': visualProcessingScore,
                'cognitive-load-score': cognitiveLoadScore,
                'difficulty': gameConfig.difficulty,
                'game-mode': gameConfig.gameMode,
                'completion-time': Math.round((performance.now() - startTime) / 1000)
            });
        }
    };

    // Calculate pattern complexity based on number of items and types
    const calculatePatternComplexity = (): number => {
        const itemCount = gameConfig.patternItems.length;
        const uniqueTypes = new Set(gameConfig.patternItems.map(item => item.type)).size;
        const uniqueValues = new Set(gameConfig.patternItems.map(item => item.value)).size;

        // Complexity score: 0-100
        const complexityScore = Math.min(100,
            (itemCount * 5) +
            (uniqueTypes * 15) +
            (uniqueValues * 10)
        );

        return Math.round(complexityScore);
    };

    // Calculate visual processing score based on response time and accuracy
    const calculateVisualProcessingScore = (avgResponseTime: number): number => {
        // Faster response with high accuracy = higher score
        const timeScore = Math.max(0, 100 - (avgResponseTime / 100));
        const accuracy = attempts > 0 ? (correctAnswers / attempts) * 100 : 0;

        return Math.round((timeScore * 0.4) + (accuracy * 0.6));
    };

    // Calculate cognitive load score
    const calculateCognitiveLoad = (): number => {
        const difficultyMultiplier = {
            'easy': 1,
            'medium': 1.5,
            'hard': 2
        }[gameConfig.difficulty];

        const itemComplexity = gameConfig.patternItems.length * difficultyMultiplier;
        const accuracy = attempts > 0 ? (correctAnswers / attempts) * 100 : 0;

        // Higher cognitive load with more complex patterns and lower accuracy
        const loadScore = Math.min(100,
            (itemComplexity * 3) +
            ((100 - accuracy) * 0.5)
        );

        return Math.round(loadScore);
    };

    // Render pattern items on canvas
    const renderPatternItem = (item: PatternItem) => {
        switch (item.type) {
            case 'letter':
            case 'number':
                return (
                    <React.Fragment key={item.id}>
                        <Rect
                            x={item.x}
                            y={item.y}
                            width={item.width}
                            height={item.height}
                            fill={item.fill}
                            stroke={item.stroke}
                            strokeWidth={item.strokeWidth}
                        />
                        <KonvaText
                            x={item.x}
                            y={item.y + (item.height / 2) - ((item.fontSize || 40) / 2)}
                            width={item.width}
                            text={item.value}
                            fontSize={item.fontSize || 40}
                            fontFamily={item.fontFamily || 'Arial'}
                            fontStyle={item.fontStyle || 'bold'}
                            fill={item.textFill || '#FFFFFF'}
                            align="center"
                        />
                    </React.Fragment>
                );
            case 'shape':
                if (item.value === 'circle') {
                    return (
                        <Circle
                            key={item.id}
                            x={item.x + item.width / 2}
                            y={item.y + item.height / 2}
                            radius={item.width / 2}
                            fill={item.fill}
                            stroke={item.stroke}
                            strokeWidth={item.strokeWidth}
                        />
                    );
                } else if (item.value === 'triangle') {
                    return (
                        <RegularPolygon
                            key={item.id}
                            x={item.x + item.width / 2}
                            y={item.y + item.height / 2}
                            sides={3}
                            radius={item.width / 2}
                            fill={item.fill}
                            stroke={item.stroke}
                            strokeWidth={item.strokeWidth}
                        />
                    );
                } else {
                    return (
                        <Rect
                            key={item.id}
                            x={item.x}
                            y={item.y}
                            width={item.width}
                            height={item.height}
                            fill={item.fill}
                            stroke={item.stroke}
                            strokeWidth={item.strokeWidth}
                        />
                    );
                }
            case 'color':
                return (
                    <Rect
                        key={item.id}
                        x={item.x}
                        y={item.y}
                        width={item.width}
                        height={item.height}
                        fill={item.fill}
                        stroke={item.stroke}
                        strokeWidth={item.strokeWidth}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        🧩 {gameConfig.title}
                        <Badge variant="secondary">Pattern Recognition</Badge>
                        <Badge variant="outline" className="capitalize">{gameConfig.difficulty}</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {gameConfig.description}
                    </p>
                </CardHeader>
                <CardContent>
                    {!gameStarted ? (
                        <div className="text-center space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="font-semibold text-gray-600">Score</div>
                                    <div className="text-3xl font-bold text-blue-600">{score}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="font-semibold text-gray-600">Accuracy</div>
                                    <div className="text-3xl font-bold text-green-600">
                                        {attempts > 0 ? Math.round((correctAnswers / attempts) * 100) : 0}%
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="font-semibold text-gray-600">Attempts</div>
                                    <div className="text-3xl font-bold text-purple-600">{attempts}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="font-semibold text-gray-600">Correct</div>
                                    <div className="text-3xl font-bold text-orange-600">{correctAnswers}</div>
                                </div>
                            </div>

                            <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                                <h3 className="font-semibold text-lg mb-2">How to Play:</h3>
                                <ul className="text-sm text-left space-y-2">
                                    <li>• Study the pattern carefully</li>
                                    <li>• Identify the sequence or relationship</li>
                                    <li>• Select the correct answer from the options</li>
                                    <li>• Faster correct answers earn bonus points</li>
                                </ul>
                            </div>

                            <Button onClick={startGame} size="lg" className="w-full md:w-auto px-8">
                                Start Pattern Challenge
                            </Button>

                            {gameCompleted && (
                                <div className="mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                                    <p className="font-semibold text-green-700">Game Completed! 🎉</p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Your metrics have been recorded.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Game Stats */}
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <div className="flex gap-6 text-sm">
                                    <span>Score: <span className="font-bold text-blue-600">{score}</span></span>
                                    <span>Attempts: <span className="font-bold text-purple-600">{attempts}</span></span>
                                    <span>Correct: <span className="font-bold text-green-600">{correctAnswers}</span></span>
                                </div>
                                <Badge variant="default" className="capitalize">
                                    {gameConfig.gameMode.replace('_', ' ')}
                                </Badge>
                            </div>

                            {/* Pattern Display */}
                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200">
                                <h3 className="text-lg font-semibold mb-4 text-center">Pattern Sequence</h3>
                                <div className="flex justify-center">
                                    {gameConfig.patternItems.length > 0 ? (
                                        <Stage width={stageWidth} height={stageHeight}>
                                            <Layer>
                                                {gameConfig.patternItems.map(item => renderPatternItem(item))}
                                            </Layer>
                                        </Stage>
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            <p>No pattern configured</p>
                                            <p className="text-sm">Please provide pattern items in the game configuration</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Question */}
                            <div className="text-center">
                                <p className="text-lg font-semibold mb-2">What comes next in the pattern?</p>
                                <p className="text-sm text-muted-foreground">
                                    {isCorrect === null ? 'Select your answer below' : ''}
                                </p>
                            </div>

                            {/* Answer Options */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {gameConfig.options.map((option) => (
                                    <Button
                                        key={option.id}
                                        onClick={() => handleAnswerSelect(option.id)}
                                        disabled={isCorrect !== null}
                                        variant={
                                            selectedAnswer === option.id
                                                ? isCorrect
                                                    ? "default"
                                                    : "destructive"
                                                : "outline"
                                        }
                                        className={`h-24 text-3xl font-bold transition-all ${selectedAnswer === option.id && isCorrect
                                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                                : selectedAnswer === option.id && !isCorrect
                                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                                    : ''
                                            }`}
                                    >
                                        {option.value}
                                    </Button>
                                ))}
                            </div>

                            {/* Feedback */}
                            {isCorrect !== null && (
                                <div className={`p-4 rounded-lg border-2 ${isCorrect
                                        ? 'bg-green-50 border-green-300'
                                        : 'bg-red-50 border-red-300'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`font-bold text-lg ${isCorrect ? 'text-green-700' : 'text-red-700'
                                                }`}>
                                                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Response time: {Math.round(responseTime)}ms
                                            </p>
                                        </div>
                                        <Button onClick={completeGame} variant="default">
                                            Complete & Continue
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Real-time Performance Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
                                <div className="text-center">
                                    <div className="text-xs font-semibold text-gray-600">Accuracy</div>
                                    <div className="text-xl font-bold text-green-600">
                                        {attempts > 0 ? Math.round((correctAnswers / attempts) * 100) : 0}%
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs font-semibold text-gray-600">Avg Response</div>
                                    <div className="text-xl font-bold text-purple-600">
                                        {allResponseTimes.length > 0
                                            ? Math.round(allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length)
                                            : 0}ms
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs font-semibold text-gray-600">Complexity</div>
                                    <div className="text-xl font-bold text-blue-600">
                                        {calculatePatternComplexity()}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs font-semibold text-gray-600">Visual Score</div>
                                    <div className="text-xl font-bold text-orange-600">
                                        {calculateVisualProcessingScore(
                                            allResponseTimes.length > 0
                                                ? allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length
                                                : 0
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
