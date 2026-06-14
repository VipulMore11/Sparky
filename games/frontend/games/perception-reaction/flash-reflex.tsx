"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ReactionData {
  reactionTime: number;
  timestamp: number;
  wasCorrect: boolean;
}

interface FlashReflexProps {
  onGameComplete?: (metrics: any) => void;
}

export default function FlashReflex({ onGameComplete }: FlashReflexProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [showStimulus, setShowStimulus] = useState(false);
  const [stimulusStartTime, setStimulusStartTime] = useState<number>(0);
  const [reactionData, setReactionData] = useState<ReactionData[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds] = useState(10);
  const [gameComplete, setGameComplete] = useState(false);
  const [tooEarly, setTooEarly] = useState(false);
  const [waitTimeout, setWaitTimeout] = useState<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setReactionData([]);
    setCurrentRound(0);
    setTooEarly(false);
    startRound();
  };

  const startRound = useCallback(() => {
    setWaiting(true);
    setShowStimulus(false);
    setTooEarly(false);

    // Random delay between 2-6 seconds
    const delay = 2000 + Math.random() * 4000;

    const timeout = setTimeout(() => {
      setWaiting(false);
      setShowStimulus(true);
      setStimulusStartTime(performance.now());
    }, delay);

    setWaitTimeout(timeout);
  }, []);

  const handleClick = () => {
    if (!gameStarted) return;

    if (waiting) {
      // Clicked too early
      setTooEarly(true);
      setWaiting(false);
      if (waitTimeout) {
        clearTimeout(waitTimeout);
      }

      const incorrectData: ReactionData = {
        reactionTime: -1, // Mark as too early
        timestamp: performance.now(),
        wasCorrect: false
      };

      setReactionData(prev => [...prev, incorrectData]);

      setTimeout(() => {
        nextRound();
      }, 1500);

    } else if (showStimulus) {
      // Correct response
      const reactionTime = performance.now() - stimulusStartTime;

      const correctData: ReactionData = {
        reactionTime,
        timestamp: performance.now(),
        wasCorrect: true
      };

      setReactionData(prev => [...prev, correctData]);
      setShowStimulus(false);

      setTimeout(() => {
        nextRound();
      }, 1000);
    }
  };

  const nextRound = () => {
    const nextRoundNum = currentRound + 1;
    setCurrentRound(nextRoundNum);

    if (nextRoundNum >= totalRounds) {
      setGameComplete(true);
      setGameStarted(false);

      // Automatically complete the game when all rounds are done
      if (onGameComplete) {
        onGameComplete({
          'reaction-time': averageReactionTime,
          'fastest-reaction': fastestReaction,
          'accuracy': accuracy,
          'false-starts': falseStarts,
          'total-rounds': reactionData.length
        });
      }
    } else {
      startRound();
    }
  };

  // Calculate statistics
  const validReactions = reactionData.filter(d => d.wasCorrect && d.reactionTime > 0);
  const averageReactionTime = validReactions.length > 0
    ? Math.round(validReactions.reduce((sum, d) => sum + d.reactionTime, 0) / validReactions.length)
    : 0;

  const fastestReaction = validReactions.length > 0
    ? Math.round(Math.min(...validReactions.map(d => d.reactionTime)))
    : 0;

  const accuracy = reactionData.length > 0
    ? Math.round((validReactions.length / reactionData.length) * 100)
    : 0;

  const falseStarts = reactionData.filter(d => !d.wasCorrect).length;

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setWaiting(false);
    setShowStimulus(false);
    setReactionData([]);
    setCurrentRound(0);
    setTooEarly(false);
    if (waitTimeout) {
      clearTimeout(waitTimeout);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💡 Flash Reflex
            <Badge variant="secondary">Reaction Test</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click as fast as possible when the screen flashes. Tests pure reaction time with millisecond precision.
          </p>
        </CardHeader>
        <CardContent>
          {!gameStarted && !gameComplete ? (
            <div className="text-center space-y-6">
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Play</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Wait for the screen to turn green</li>
                  <li>• Click as fast as possible when it appears</li>
                  <li>• Don't click too early or you'll get a false start</li>
                  <li>• Complete {totalRounds} rounds for your average</li>
                </ul>
              </div>

              <Button onClick={startGame} size="lg" className="w-full md:w-auto">
                Start Reaction Test
              </Button>
            </div>
          ) : gameComplete ? (
            <div className="text-center space-y-6">
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-4">Test Complete! 🎉</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Average RT</div>
                    <div className="text-2xl font-bold text-green-800">{averageReactionTime}ms</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Fastest RT</div>
                    <div className="text-2xl font-bold text-green-800">{fastestReaction}ms</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Accuracy</div>
                    <div className="text-2xl font-bold text-green-800">{accuracy}%</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">False Starts</div>
                    <div className="text-2xl font-bold text-green-800">{falseStarts}</div>
                  </div>
                </div>

                {/* Reaction Time Distribution */}
                <div className="text-xs text-green-600 mb-4">
                  <div className="font-semibold mb-2">Reaction Time Distribution:</div>
                  <div className="grid grid-cols-5 gap-1">
                    {validReactions.map((d, i) => (
                      <div key={i} className="bg-green-200 p-1 rounded text-center">
                        {Math.round(d.reactionTime)}ms
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-x-4">
                <Button onClick={resetGame} size="lg">
                  Play Again
                </Button>

                {onGameComplete && (
                  <Button
                    onClick={() => onGameComplete({
                      'reaction-time': averageReactionTime,
                      'fastest-reaction': fastestReaction,
                      'accuracy': accuracy,
                      'false-starts': falseStarts,
                      'total-rounds': reactionData.length
                    })}
                    variant="outline"
                  >
                    Complete & Continue
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress */}
              <div className="flex justify-between items-center text-sm">
                <span>Round: <span className="font-bold">{currentRound + 1}/{totalRounds}</span></span>
                <Button onClick={resetGame} size="sm" variant="outline">
                  Reset
                </Button>
              </div>

              {/* Game Area */}
              <div
                className={`
                  h-96 rounded-lg border-4 cursor-pointer transition-all duration-200 flex items-center justify-center
                  ${waiting ? 'bg-red-100 border-red-300' :
                    showStimulus ? 'bg-green-400 border-green-600' :
                      tooEarly ? 'bg-yellow-100 border-yellow-300' :
                        'bg-gray-100 border-gray-300'}
                `}
                onClick={handleClick}
              >
                <div className="text-center">
                  {waiting && !tooEarly && (
                    <div>
                      <div className="text-4xl font-bold text-red-600 mb-2">WAIT...</div>
                      <div className="text-lg text-red-500">Don't click yet!</div>
                    </div>
                  )}

                  {showStimulus && (
                    <div>
                      <div className="text-6xl font-bold text-white mb-2">CLICK!</div>
                      <div className="text-xl text-green-100">React now!</div>
                    </div>
                  )}

                  {tooEarly && (
                    <div>
                      <div className="text-4xl font-bold text-yellow-600 mb-2">TOO EARLY!</div>
                      <div className="text-lg text-yellow-500">Wait for green!</div>
                    </div>
                  )}

                  {!waiting && !showStimulus && !tooEarly && (
                    <div>
                      <div className="text-2xl font-bold text-gray-600 mb-2">Get Ready</div>
                      <div className="text-lg text-gray-500">Click anywhere to start round {currentRound + 1}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Stats */}
              {reactionData.length > 0 && (
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">Avg RT</div>
                    <div className="text-lg font-bold text-blue-600">{averageReactionTime}ms</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">Accuracy</div>
                    <div className="text-lg font-bold text-green-600">{accuracy}%</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">False Starts</div>
                    <div className="text-lg font-bold text-red-600">{falseStarts}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}