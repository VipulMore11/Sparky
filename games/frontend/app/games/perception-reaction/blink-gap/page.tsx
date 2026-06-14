"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface BlinkResult {
  targetPosition: number;
  userResponse: number | null;
  reactionTime: number;
  correct: boolean;
  lagTime: number;
}

type GameMode = 'tutorial' | 'easy' | 'standard' | 'challenge';

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
  const [totalTrials, setTotalTrials] = useState(10);
  const [gameComplete, setGameComplete] = useState(false);
  const [stimulusStartTime, setStimulusStartTime] = useState<number>(0);
  const [gameMode, setGameMode] = useState<GameMode>('tutorial');

  const SIMPLE_SYMBOLS = ['●', '■', '▲', '♦', '★', '♠', '♥', '♣'];
  
  const getModeSettings = (mode: GameMode) => {
    switch (mode) {
      case 'tutorial': 
        return { 
          sequenceLength: 8, 
          presentationTime: 500, 
          trials: 5,
          target: '●',
          symbols: ['■', '▲', '♦', '★'],
          description: 'Slow & Simple - Perfect for learning'
        };
      case 'easy': 
        return { 
          sequenceLength: 10, 
          presentationTime: 300, 
          trials: 8,
          target: '●',
          symbols: ['■', '▲', '♦', '★', '♠', '♥'],
          description: 'Gentle pace with clear symbols'
        };
      case 'standard': 
        return { 
          sequenceLength: 12, 
          presentationTime: 200, 
          trials: 12,
          target: '●',
          symbols: SIMPLE_SYMBOLS,
          description: 'Standard cognitive test'
        };
      case 'challenge': 
        return { 
          sequenceLength: 15, 
          presentationTime: 150, 
          trials: 15,
          target: '●',
          symbols: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'],
          description: 'Advanced level with letters'
        };
    }
  };

  const generateSequence = useCallback(() => {
    const settings = getModeSettings(gameMode);
    const sequence: string[] = [];
    
    // Fill with random symbols (no repeats)
    const availableSymbols = [...settings.symbols];
    for (let i = 0; i < settings.sequenceLength; i++) {
      if (availableSymbols.length === 0) {
        availableSymbols.push(...settings.symbols);
      }
      const randomIndex = Math.floor(Math.random() * availableSymbols.length);
      sequence.push(availableSymbols.splice(randomIndex, 1)[0]);
    }
    
    // Insert target and blank
    const targetPos = gameMode === 'tutorial' ? 2 : 
                     Math.floor(settings.sequenceLength * 0.3) + Math.floor(Math.random() * 3);
    
    const lagTime = gameMode === 'tutorial' ? 2 : 
                   gameMode === 'easy' ? 2 + Math.floor(Math.random() * 2) :
                   2 + Math.floor(Math.random() * 4);
    
    const blankPos = targetPos + lagTime;
    
    if (blankPos < settings.sequenceLength) {
      sequence[targetPos] = settings.target;
      sequence[blankPos] = ''; // Blank position
    }
    
    return { sequence, targetPos, blankPos, lagTime };
  }, [gameMode]);

  const startTrial = useCallback(() => {
    const { sequence, targetPos, blankPos } = generateSequence();
    const settings = getModeSettings(gameMode);
    
    setCurrentSequence(sequence);
    setTargetPosition(targetPos);
    setBlankPosition(blankPos);
    setUserResponse(null);
    setShowingResponseOptions(false);
    setSequenceIndex(0);
    setShowingSequence(true);
    setStimulusStartTime(performance.now());

    // Present sequence
    let index = 0;
    const timer = setInterval(() => {
      setSequenceIndex(index);
      index++;
      
      if (index >= settings.sequenceLength) {
        clearInterval(timer);
        setShowingSequence(false);
        setTimeout(() => {
          setShowingResponseOptions(true);
        }, 300);
      }
    }, settings.presentationTime);
  }, [generateSequence, gameMode]);

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    const settings = getModeSettings(mode);
    setTotalTrials(settings.trials);
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
    
    setTimeout(() => {
      const nextTrial = currentTrial + 1;
      setCurrentTrial(nextTrial);
      
      if (nextTrial >= totalTrials) {
        setGameComplete(true);
        setGameStarted(false);
      } else {
        startTrial();
      }
    }, gameMode === 'tutorial' ? 2000 : 1500);
  };

  const calculateStats = () => {
    const correctResponses = results.filter(r => r.correct);
    const accuracy = results.length > 0 ? Math.round((correctResponses.length / results.length) * 100) : 0;
    const averageReactionTime = results.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + r.reactionTime, 0) / results.length)
      : 0;
    
    return { accuracy, averageReactionTime, correctResponses: correctResponses.length };
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setResults([]);
    setCurrentTrial(0);
    setShowingSequence(false);
    setShowingResponseOptions(false);
  };

  const { accuracy, averageReactionTime, correctResponses } = calculateStats();
  const settings = getModeSettings(gameMode);

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <Link href="/games" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          ← Back to Games
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              👁️ Blink Gap
              <Badge variant="secondary">Attention Test</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Find the missing symbol in rapid sequences. Multiple difficulty levels make it accessible for everyone!
            </p>
          </CardHeader>
        </Card>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              {!gameStarted && !gameComplete ? (
                <div className="space-y-6">
                  {/* Mode Selection */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-center">Choose Your Level</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(['tutorial', 'easy', 'standard', 'challenge'] as const).map((mode) => {
                        const modeSettings = getModeSettings(mode);
                        return (
                          <Card 
                            key={mode} 
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              mode === 'tutorial' ? 'border-green-300 bg-green-50' :
                              mode === 'easy' ? 'border-blue-300 bg-blue-50' :
                              mode === 'standard' ? 'border-purple-300 bg-purple-50' :
                              'border-red-300 bg-red-50'
                            }`}
                            onClick={() => startGame(mode)}
                          >
                            <CardContent className="p-4">
                              <div className="text-center">
                                <div className="text-lg font-semibold capitalize mb-2">
                                  {mode === 'tutorial' ? '🎓 Tutorial' :
                                   mode === 'easy' ? '😊 Easy' :
                                   mode === 'standard' ? '🎯 Standard' :
                                   '🔥 Challenge'}
                                </div>
                                <div className="text-sm text-gray-600 mb-3">
                                  {modeSettings.description}
                                </div>
                                <div className="text-xs space-y-1">
                                  <div>⏱️ {modeSettings.presentationTime}ms per symbol</div>
                                  <div>📏 {modeSettings.sequenceLength} symbols</div>
                                  <div>🎯 {modeSettings.trials} trials</div>
                                  <div>Target: <span className="text-lg font-bold">{modeSettings.target}</span></div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  {/* Instructions */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-blue-800 mb-3">How to Play</h4>
                      <div className="text-sm text-blue-700 space-y-2">
                        <div>1. <strong>Watch the sequence:</strong> Symbols will flash quickly</div>
                        <div>2. <strong>Find the target:</strong> Look for the <span className="text-xl">●</span> symbol</div>
                        <div>3. <strong>Spot the gap:</strong> One position will be empty/missing</div>
                        <div>4. <strong>Click the position:</strong> Select where the gap was</div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-100 rounded text-xs text-blue-600">
                        💡 <strong>Tip:</strong> Start with Tutorial mode if this is your first time!
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : gameComplete ? (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                    <h3 className="text-2xl font-bold text-center mb-4">
                      {gameMode === 'tutorial' ? 'Tutorial Complete! 🎓' : 
                       gameMode === 'easy' ? 'Well Done! 😊' :
                       gameMode === 'standard' ? 'Great Job! 🎯' :
                       'Challenge Conquered! 🔥'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-sm font-semibold text-gray-600">Accuracy</div>
                        <div className="text-3xl font-bold text-green-600">{accuracy}%</div>
                        <div className="text-xs text-gray-500">{correctResponses}/{results.length} correct</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-sm font-semibold text-gray-600">Response Time</div>
                        <div className="text-3xl font-bold text-blue-600">{averageReactionTime}ms</div>
                        <div className="text-xs text-gray-500">Average decision time</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-sm font-semibold text-gray-600">Level</div>
                        <div className="text-3xl font-bold text-purple-600 capitalize">{gameMode}</div>
                        <div className="text-xs text-gray-500">{settings.presentationTime}ms timing</div>
                      </div>
                    </div>

                    {/* Performance Feedback */}
                    <div className="text-center p-4 bg-white rounded-lg mb-4">
                      <div className="text-lg font-semibold mb-2">
                        {accuracy >= 80 ? '🌟 Excellent performance!' :
                         accuracy >= 60 ? '👍 Good job!' :
                         accuracy >= 40 ? '💪 Keep practicing!' :
                         '🎯 Try an easier level first!'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {gameMode === 'tutorial' && accuracy >= 60 && 'Ready for Easy mode!'}
                        {gameMode === 'easy' && accuracy >= 70 && 'Try Standard mode next!'}
                        {gameMode === 'standard' && accuracy >= 70 && 'Ready for the Challenge!'}
                        {accuracy < 50 && 'Consider trying an easier mode to build your skills.'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => startGame(gameMode)} size="lg">
                      Play Again
                    </Button>
                    {gameMode !== 'challenge' && accuracy >= 60 && (
                      <Button 
                        onClick={() => {
                          const nextMode = gameMode === 'tutorial' ? 'easy' : 
                                         gameMode === 'easy' ? 'standard' : 'challenge';
                          startGame(nextMode as GameMode);
                        }} 
                        size="lg" 
                        variant="outline"
                      >
                        Next Level
                      </Button>
                    )}
                    <Button onClick={resetGame} size="lg" variant="outline">
                      Choose Level
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Progress */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex gap-4">
                      <span>Trial: <span className="font-bold">{currentTrial + 1}/{totalTrials}</span></span>
                      <span>Level: <span className="font-bold capitalize">{gameMode}</span></span>
                      {results.length > 0 && (
                        <span>Accuracy: <span className="font-bold text-green-600">{accuracy}%</span></span>
                      )}
                    </div>
                    <Button onClick={resetGame} size="sm" variant="outline">
                      Exit
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentTrial / totalTrials) * 100}%` }}
                    ></div>
                  </div>

                  {/* Sequence Display */}
                  {showingSequence && (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg">
                      <div className="text-9xl mb-4 h-32 flex items-center justify-center">
                        {currentSequence[sequenceIndex] || '□'}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Position: {sequenceIndex + 1}/{settings.sequenceLength}
                      </div>
                      <div className="text-xs text-blue-600">
                        Look for: <span className="text-2xl font-bold">{settings.target}</span>
                      </div>
                    </div>
                  )}

                  {/* Response Options */}
                  {showingResponseOptions && (
                    <div className="text-center py-6">
                      <h3 className="text-xl font-semibold mb-4">
                        Which position was missing?
                      </h3>
                      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 max-w-2xl mx-auto mb-4">
                        {Array.from({ length: settings.sequenceLength }, (_, i) => (
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
                        <div className="mt-4 p-4 rounded-lg border bg-gray-50">
                          <div className={`font-semibold text-lg mb-2 ${
                            userResponse === blankPosition ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {userResponse === blankPosition ? '✓ Correct!' : '✗ Incorrect'}
                          </div>
                          <div className="text-sm text-gray-600">
                            Missing position: <span className="font-bold">{blankPosition + 1}</span> | 
                            Target ({settings.target}) was at: <span className="font-bold">{targetPosition + 1}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ready state */}
                  {!showingSequence && !showingResponseOptions && (
                    <div className="text-center py-12">
                      <div className="text-2xl font-bold mb-4">Get Ready</div>
                      <div className="text-lg text-gray-600 mb-2">
                        Watch for the target: <span className="text-3xl">{settings.target}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Notice which position appears empty
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Level Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Level Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-2 bg-green-50 rounded">
                <div className="font-semibold text-green-700">🎓 Tutorial</div>
                <div className="text-green-600">Perfect for beginners</div>
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <div className="font-semibold text-blue-700">😊 Easy</div>
                <div className="text-blue-600">Gentle introduction</div>
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <div className="font-semibold text-purple-700">🎯 Standard</div>
                <div className="text-purple-600">Research-level test</div>
              </div>
              <div className="p-2 bg-red-50 rounded">
                <div className="font-semibold text-red-700">🔥 Challenge</div>
                <div className="text-red-600">For experts only</div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Success Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-gray-600">
              <p>• Start with Tutorial mode</p>
              <p>• Focus on the center of screen</p>
              <p>• Look for the target first</p>
              <p>• Notice gaps in the flow</p>
              <p>• Practice makes perfect!</p>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What This Tests</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600">
              <p>This game measures your ability to track rapid visual information and detect missing elements - a key aspect of attention and visual processing.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}