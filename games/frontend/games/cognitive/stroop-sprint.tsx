"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StroopData {
  word: string;
  color: string;
  isCongruent: boolean;
}

interface StroopSprintProps {
  onGameComplete?: (metrics: any) => void;
}

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const COLOR_WORDS = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];

export default function StroopSprint({ onGameComplete }: StroopSprintProps) {
  const [currentStimulus, setCurrentStimulus] = useState<StroopData | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [stimulusStartTime, setStimulusStartTime] = useState<number>(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const generateStimulus = useCallback((): StroopData => {
    const word = COLOR_WORDS[Math.floor(Math.random() * COLOR_WORDS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const isCongruent = word.toLowerCase() === color;

    return { word, color, isCongruent };
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setStreak(0);
    setTimeLeft(10);
    setReactionTimes([]);
    setTotalCorrect(0);
    setTotalAttempts(0);
    const stimulus = generateStimulus();
    setCurrentStimulus(stimulus);
    setStimulusStartTime(performance.now());
  };

  const handleColorChoice = (selectedColor: string) => {
    if (!currentStimulus || !gameStarted) return;

    const reactionTime = performance.now() - stimulusStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    setTotalAttempts(prev => prev + 1);

    const isCorrect = selectedColor === currentStimulus.color;

    if (isCorrect) {
      setScore(prev => prev + (currentStimulus.isCongruent ? 10 : 15)); // Harder incongruent trials worth more
      setStreak(prev => prev + 1);
      setTotalCorrect(prev => prev + 1);
    } else {
      setStreak(0);
    }

    // Generate next stimulus
    const nextStimulus = generateStimulus();
    setCurrentStimulus(nextStimulus);
    setStimulusStartTime(performance.now());
  };

  // Calculate metrics - IMPORTANT: These need to be before the useEffect that references them
  const averageReactionTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameStarted(false);

      // Automatically complete the game when time runs out
      if (onGameComplete) {
        // Calculate final metrics inside the effect to ensure we have current values
        const finalAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
        const finalAvgReactionTime = reactionTimes.length > 0
          ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
          : 0;

        onGameComplete({
          'completion-time':10,
          'score': score,
          'accuracy': finalAccuracy,
          'reaction-time': finalAvgReactionTime,
          'total-attempts': totalAttempts
        });
      }
    }
  }, [gameStarted, timeLeft, onGameComplete, score, totalCorrect, totalAttempts, reactionTimes]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌀 Stroop Sprint
            <Badge variant="secondary">Cognitive Test</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tap the COLOR of the word, not what the word says. Demonstrates the Stroop Effect.
          </p>
        </CardHeader>
        <CardContent>
          {!gameStarted ? (
            <div className="text-center space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">Score</div>
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">Accuracy</div>
                  <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">Avg Reaction</div>
                  <div className="text-2xl font-bold text-purple-600">{averageReactionTime}ms</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">Trials</div>
                  <div className="text-2xl font-bold text-orange-600">{totalAttempts}</div>
                </div>
              </div>
              <div className="space-y-4">
                <Button onClick={startGame} size="lg" className="w-full md:w-auto">
                  Start Game (10s)
                </Button>

                {totalAttempts > 0 && onGameComplete && (
                  <Button
                    onClick={() => onGameComplete({
                      'completion-time': timeLeft > 0 ? 10 - timeLeft : 10,
                      'score': score,
                      'accuracy': accuracy,
                      'reaction-time': averageReactionTime,
                      'total-attempts': totalAttempts
                    })}
                    variant="outline"
                    className="w-full md:w-auto"
                  >
                    Complete & Continue
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Game Stats */}
              <div className="flex justify-between items-center">
                <div className="flex gap-4 text-sm">
                  <span>Time: <span className="font-bold">{timeLeft}s</span></span>
                  <span>Score: <span className="font-bold text-blue-600">{score}</span></span>
                  <span>Streak: <span className="font-bold text-green-600">{streak}</span></span>
                </div>
                <Badge variant={currentStimulus?.isCongruent ? "default" : "destructive"}>
                  {currentStimulus?.isCongruent ? "Congruent" : "Incongruent"}
                </Badge>
              </div>

              {/* Stimulus Display */}
              {currentStimulus && (
                <div className="text-center py-12">
                  <div
                    className="text-8xl font-bold mb-8 transition-colors duration-200"
                    style={{ color: currentStimulus.color }}
                  >
                    {currentStimulus.word}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Click the COLOR of this word (not what it says)
                  </p>
                </div>
              )}

              {/* Color Selection Buttons */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {COLORS.map((color) => (
                  <Button
                    key={color}
                    onClick={() => handleColorChoice(color)}
                    className="h-16 text-white font-semibold capitalize transition-transform hover:scale-105"
                    style={{ backgroundColor: color }}
                  >
                    {color}
                  </Button>
                ))}
              </div>

              {/* Real-time Stats */}
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="text-center">
                  <div className="font-semibold">Accuracy</div>
                  <div className="text-lg font-bold text-green-600">{accuracy}%</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">Avg RT</div>
                  <div className="text-lg font-bold text-purple-600">{averageReactionTime}ms</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">Trials</div>
                  <div className="text-lg font-bold">{totalAttempts}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}