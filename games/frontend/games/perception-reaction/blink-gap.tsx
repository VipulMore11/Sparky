"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BlinkResult {
  targetPosition: number;
  userResponse: number | null;
  reactionTime: number;
  correct: boolean;
  lagTime: number; // Time between T1 and T2
}

export default function BlinkGap() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [targetPosition, setTargetPosition] = useState<number>(0);
  const [blankPosition, setBlankPosition] = useState<number>(0);
  const [userResponse, setUserResponse] = useState<number | null>(null);
  const [showingResponseOptions, setShowingResponseOptions] = useState(false);
  const [results, setResults] = useState<BlinkResult[]>([]);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [totalTrials] = useState(15);
  const [gameComplete, setGameComplete] = useState(false);
  const [stimulusStartTime, setStimulusStartTime] = useState<number>(0);

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const SEQUENCE_LENGTH = 20;
  const PRESENTATION_TIME = 100; // ms per item

  const generateSequence = useCallback(() => {
    const sequence: string[] = [];
    const usedLetters = new Set<string>();
    
    // Generate random letters
    while (sequence.length < SEQUENCE_LENGTH) {
      const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      if (!usedLetters.has(letter)) {
        sequence.push(letter);
        usedLetters.add(letter);
      }
    }
    
    // Insert target (X) and blank position
    const targetPos = 7 + Math.floor(Math.random() * 6); // Position 7-12
    const lagTime = 2 + Math.floor(Math.random() * 6); // 2-7 items after target
    const blankPos = targetPos + lagTime;
    
    if (blankPos < SEQUENCE_LENGTH) {
      sequence[targetPos] = 'X'; // Target
      sequence[blankPos] = ''; // Blank (missing item)
    }
    
    return {
      sequence,
      targetPos,
      blankPos,
      lagTime
    };
  }, []);

  const startTrial = useCallback(() => {
    const { sequence, targetPos, blankPos, lagTime } = generateSequence();
    
    setCurrentSequence(sequence);
    setTargetPosition(targetPos);
    setBlankPosition(blankPos);
    setUserResponse(null);
    setShowingResponseOptions(false);
    setSequenceIndex(0);
    setShowingSequence(true);
    setStimulusStartTime(performance.now());

    // Start presenting sequence
    let index = 0;
    const timer = setInterval(() => {
      setSequenceIndex(index);
      index++;
      
      if (index >= SEQUENCE_LENGTH) {
        clearInterval(timer);
        setShowingSequence(false);
        // Small delay before showing response options
        setTimeout(() => {
          setShowingResponseOptions(true);
        }, 500);
      }
    }, PRESENTATION_TIME);
  }, [generateSequence]);

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setResults([]);
    setCurrentTrial(0);
    startTrial();
  };

  const handleResponse = (response: number) => {
    const reactionTime = performance.now() - stimulusStartTime;
    const correct = response === blankPosition;
    const lagTime = blankPosition - targetPosition;
    
    const result: BlinkResult = {
      targetPosition,
      userResponse: response,
      reactionTime,
      correct,
      lagTime
    };
    
    setResults(prev => [...prev, result]);
    setUserResponse(response);
    
    // Show feedback briefly
    setTimeout(() => {
      const nextTrial = currentTrial + 1;
      setCurrentTrial(nextTrial);
      
      if (nextTrial >= totalTrials) {
        setGameComplete(true);
        setGameStarted(false);
      } else {
        startTrial();
      }
    }, 1500);
  };

  // Calculate statistics
  const correctResponses = results.filter(r => r.correct);
  const accuracy = results.length > 0 ? Math.round((correctResponses.length / results.length) * 100) : 0;
  const averageReactionTime = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.reactionTime, 0) / results.length)
    : 0;

  // Analyze attentional blink pattern
  const blinkAnalysis = () => {
    const lagGroups: { [key: number]: BlinkResult[] } = {};
    results.forEach(result => {
      if (!lagGroups[result.lagTime]) {
        lagGroups[result.lagTime] = [];
      }
      lagGroups[result.lagTime].push(result);
    });

    return Object.entries(lagGroups).map(([lag, results]) => ({
      lag: parseInt(lag),
      accuracy: Math.round((results.filter(r => r.correct).length / results.length) * 100),
      count: results.length
    })).sort((a, b) => a.lag - b.lag);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setResults([]);
    setCurrentTrial(0);
    setShowingSequence(false);
    setShowingResponseOptions(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👁️ Blink Gap
            <Badge variant="secondary">Attention Test</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Watch the rapid sequence and identify which position was missing. Tests temporal attention and attentional blink.
          </p>
        </CardHeader>
        <CardContent>
          {!gameStarted && !gameComplete ? (
            <div className="text-center space-y-6">
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Play</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Watch a rapid sequence of letters (10 items/second)</li>
                  <li>• Look for the letter 'X' (target)</li>
                  <li>• One position will be blank/missing</li>
                  <li>• Identify which position was missing</li>
                  <li>• Tests if you experienced an "attentional blink"</li>
                </ul>
              </div>
              
              <Button onClick={startGame} size="lg" className="w-full md:w-auto">
                Start Attention Test ({totalTrials} trials)
              </Button>
            </div>
          ) : gameComplete ? (
            <div className="text-center space-y-6">
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-4">Test Complete! 🎉</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Overall Accuracy</div>
                    <div className="text-2xl font-bold text-green-800">{accuracy}%</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Avg Reaction Time</div>
                    <div className="text-2xl font-bold text-green-800">{averageReactionTime}ms</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Trials Completed</div>
                    <div className="text-2xl font-bold text-green-800">{results.length}</div>
                  </div>
                </div>

                {/* Attentional Blink Analysis */}
                <div className="p-4 bg-white rounded border">
                  <h4 className="font-semibold text-green-700 mb-3">Attentional Blink Pattern</h4>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                    {blinkAnalysis().map(({ lag, accuracy: lagAccuracy, count }) => (
                      <div key={lag} className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold">Lag {lag}</div>
                        <div className={`text-lg font-bold ${lagAccuracy < 70 ? 'text-red-600' : 'text-green-600'}`}>
                          {lagAccuracy}%
                        </div>
                        <div className="text-gray-500">({count})</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Lower accuracy at lag 2-5 indicates attentional blink effect
                  </p>
                </div>
              </div>
              
              <Button onClick={resetGame} size="lg">
                Play Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress */}
              <div className="flex justify-between items-center text-sm">
                <span>Trial: <span className="font-bold">{currentTrial + 1}/{totalTrials}</span></span>
                <div className="flex gap-2">
                  {results.length > 0 && (
                    <span>Accuracy: <span className="font-bold text-green-600">{accuracy}%</span></span>
                  )}
                  <Button onClick={resetGame} size="sm" variant="outline">
                    Reset
                  </Button>
                </div>
              </div>

              {/* Sequence Display */}
              {showingSequence && (
                <div className="text-center py-16">
                  <div className="text-8xl font-bold mb-4 h-24 flex items-center justify-center">
                    {currentSequence[sequenceIndex] || ''}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Position: {sequenceIndex + 1}/{SEQUENCE_LENGTH}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Watch for 'X' and remember which position was blank
                  </div>
                </div>
              )}

              {/* Response Options */}
              {showingResponseOptions && (
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold mb-6">
                    Which position was blank/missing?
                  </h3>
                  <div className="grid grid-cols-4 md:grid-cols-10 gap-2 max-w-2xl mx-auto">
                    {Array.from({ length: SEQUENCE_LENGTH }, (_, i) => (
                      <Button
                        key={i}
                        onClick={() => handleResponse(i)}
                        variant={userResponse === i ? 
                          (userResponse === blankPosition ? "default" : "destructive") : 
                          "outline"
                        }
                        size="sm"
                        className="aspect-square"
                        disabled={userResponse !== null}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  
                  {userResponse !== null && (
                    <div className="mt-4 p-3 rounded border">
                      <div className={`font-semibold ${userResponse === blankPosition ? 'text-green-600' : 'text-red-600'}`}>
                        {userResponse === blankPosition ? '✓ Correct!' : '✗ Incorrect'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Blank was at position {blankPosition + 1}, X was at position {targetPosition + 1}
                        (Lag: {blankPosition - targetPosition})
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions during sequence */}
              {!showingSequence && !showingResponseOptions && (
                <div className="text-center py-16">
                  <div className="text-2xl font-bold mb-4">Get Ready</div>
                  <div className="text-lg text-muted-foreground">
                    Watch carefully for the letter 'X' and notice which position is missing
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