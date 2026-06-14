"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface ReactionData {
  reactionTime: number;
  timestamp: number;
  wasCorrect: boolean;
}

type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';
type GameMode = 'classic' | 'multi-stimulus' | 'sound-visual';

export default function FlashReflex() {
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
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [stimulusColor, setStimulusColor] = useState('#22c55e');
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [sessionCount, setSessionCount] = useState(0);

  const getDifficultySettings = (diff: DifficultyLevel) => {
    switch (diff) {
      case 'easy': return { minWait: 3000, maxWait: 6000, stimulusDuration: 2000 };
      case 'medium': return { minWait: 2000, maxWait: 5000, stimulusDuration: 1500 };
      case 'hard': return { minWait: 1000, maxWait: 4000, stimulusDuration: 1000 };
      case 'expert': return { minWait: 500, maxWait: 3000, stimulusDuration: 500 };
    }
  };

  const getRandomColor = () => {
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setReactionData([]);
    setCurrentRound(0);
    setTooEarly(false);
    setSessionCount(prev => prev + 1);
    startRound();
  };

  const startRound = useCallback(() => {
    setWaiting(true);
    setShowStimulus(false);
    setTooEarly(false);
    
    const settings = getDifficultySettings(difficulty);
    const delay = settings.minWait + Math.random() * (settings.maxWait - settings.minWait);
    
    // Set random color for multi-stimulus mode
    if (gameMode === 'multi-stimulus') {
      setStimulusColor(getRandomColor());
    }
    
    const timeout = setTimeout(() => {
      setWaiting(false);
      setShowStimulus(true);
      setStimulusStartTime(performance.now());
      
      // Auto-hide stimulus after duration (for harder difficulties)
      if (difficulty === 'expert') {
        setTimeout(() => {
          setShowStimulus(false);
        }, settings.stimulusDuration);
      }
    }, delay);
    
    setWaitTimeout(timeout);
  }, [difficulty, gameMode]);

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
      
      // Update personal best
      if (!personalBest || reactionTime < personalBest) {
        setPersonalBest(reactionTime);
      }
      
      setTimeout(() => {
        nextRound();
      }, 1000);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        handleClick();
      }
    };

    if (gameStarted) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameStarted, waiting, showStimulus]);

  const nextRound = () => {
    const nextRoundNum = currentRound + 1;
    setCurrentRound(nextRoundNum);
    
    if (nextRoundNum >= totalRounds) {
      setGameComplete(true);
      setGameStarted(false);
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

  const getPerformanceRating = () => {
    if (averageReactionTime === 0) return '';
    if (averageReactionTime < 200) return '🚀 Lightning Fast!';
    if (averageReactionTime < 250) return '⚡ Excellent!';
    if (averageReactionTime < 300) return '👍 Good!';
    if (averageReactionTime < 400) return '👌 Average';
    return '🐌 Keep practicing!';
  };

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
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <Link href="/games" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          ← Back to Games
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              💡 Flash Reflex
              <Badge variant="secondary">Reaction Test</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Click as fast as possible when the screen flashes. Tests pure reaction time with millisecond precision using high-performance timing.
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
                  {/* Game Settings */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Difficulty Selection */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Difficulty Level</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {(['easy', 'medium', 'hard', 'expert'] as const).map((diff) => (
                          <Button
                            key={diff}
                            onClick={() => setDifficulty(diff)}
                            variant={difficulty === diff ? "default" : "outline"}
                            size="sm"
                            className="capitalize"
                          >
                            {diff}
                          </Button>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {difficulty === 'easy' && 'Longer wait times, easier timing'}
                        {difficulty === 'medium' && 'Balanced challenge'}
                        {difficulty === 'hard' && 'Shorter wait times'}
                        {difficulty === 'expert' && 'Ultra-short stimulus duration'}
                      </div>
                    </div>

                    {/* Game Mode Selection */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Game Mode</h3>
                      <div className="space-y-2">
                        {([
                          { mode: 'classic', label: 'Classic', desc: 'Standard green flash' },
                          { mode: 'multi-stimulus', label: 'Multi-Color', desc: 'Random colors' },
                          { mode: 'sound-visual', label: 'Sound + Visual', desc: 'Coming soon' }
                        ] as const).map(({ mode, label, desc }) => (
                          <Button
                            key={mode}
                            onClick={() => setGameMode(mode)}
                            variant={gameMode === mode ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-start"
                            disabled={mode === 'sound-visual'}
                          >
                            <div className="text-left">
                              <div className="font-semibold">{label}</div>
                              <div className="text-xs opacity-70">{desc}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">How to Play</h3>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li>• Wait for the screen to change color (don't click the red "WAIT" screen)</li>
                      <li>• Click anywhere or press SPACEBAR when you see the stimulus</li>
                      <li>• Don't click too early or you'll get a false start penalty</li>
                      <li>• Complete {totalRounds} rounds for your statistics</li>
                      <li>• Your reaction time is measured with sub-millisecond precision</li>
                    </ul>
                  </div>
                  
                  <Button onClick={startGame} size="lg" className="w-full">
                    Start Reaction Test ({difficulty.toUpperCase()})
                  </Button>
                </div>
              ) : gameComplete ? (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <h3 className="text-xl font-bold text-green-800 mb-2">Test Complete! 🎉</h3>
                    <div className="text-lg text-green-700 mb-4">{getPerformanceRating()}</div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                      <div className="p-4 bg-white rounded-lg border shadow-sm">
                        <div className="font-semibold text-gray-600">Average RT</div>
                        <div className="text-2xl font-bold text-blue-600">{averageReactionTime}ms</div>
                        <div className="text-xs text-gray-500">Across {validReactions.length} trials</div>
                      </div>
                      <div className="p-4 bg-white rounded-lg border shadow-sm">
                        <div className="font-semibold text-gray-600">Fastest RT</div>
                        <div className="text-2xl font-bold text-green-600">{fastestReaction}ms</div>
                        {personalBest && fastestReaction === Math.round(personalBest) && (
                          <div className="text-xs text-green-500">New Record! 🏆</div>
                        )}
                      </div>
                      <div className="p-4 bg-white rounded-lg border shadow-sm">
                        <div className="font-semibold text-gray-600">Accuracy</div>
                        <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                        <div className="text-xs text-gray-500">{validReactions.length}/{totalRounds} correct</div>
                      </div>
                      <div className="p-4 bg-white rounded-lg border shadow-sm">
                        <div className="font-semibold text-gray-600">False Starts</div>
                        <div className="text-2xl font-bold text-red-600">{falseStarts}</div>
                        <div className="text-xs text-gray-500">Premature clicks</div>
                      </div>
                    </div>

                    {/* Reaction Time Distribution */}
                    <div className="mb-4">
                      <div className="font-semibold text-gray-700 mb-2">Reaction Time Distribution:</div>
                      <div className="grid grid-cols-5 md:grid-cols-10 gap-1">
                        {validReactions.map((d, i) => (
                          <div 
                            key={i} 
                            className={`p-2 rounded text-center text-xs font-mono ${
                              d.reactionTime < 250 ? 'bg-green-200 text-green-800' :
                              d.reactionTime < 350 ? 'bg-yellow-200 text-yellow-800' :
                              'bg-red-200 text-red-800'
                            }`}
                          >
                            {Math.round(d.reactionTime)}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Performance Analysis */}
                    <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                      <div className="font-semibold mb-1">Performance Analysis:</div>
                      <div>• Consistency: {validReactions.length > 3 ? 
                        `${Math.round(Math.sqrt(validReactions.reduce((sum, d) => sum + Math.pow(d.reactionTime - averageReactionTime, 2), 0) / validReactions.length))}ms standard deviation` : 
                        'Need more trials'}</div>
                      <div>• Difficulty: {difficulty.toUpperCase()} mode</div>
                      <div>• Mode: {gameMode.replace('-', ' ').toUpperCase()}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={startGame} size="lg" className="flex-1">
                      Play Again
                    </Button>
                    <Button onClick={resetGame} size="lg" variant="outline">
                      Change Settings
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Progress and Controls */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex gap-4">
                      <span>Round: <span className="font-bold">{currentRound + 1}/{totalRounds}</span></span>
                      <span>Mode: <span className="font-bold capitalize">{difficulty}</span></span>
                      {personalBest && (
                        <span>Best: <span className="font-bold text-green-600">{Math.round(personalBest)}ms</span></span>
                      )}
                    </div>
                    <Button onClick={resetGame} size="sm" variant="outline">
                      Reset
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentRound / totalRounds) * 100}%` }}
                    ></div>
                  </div>

                  {/* Game Area */}
                  <div 
                    className={`
                      h-96 rounded-lg border-4 cursor-pointer transition-all duration-100 flex items-center justify-center relative overflow-hidden
                      ${waiting ? 'bg-red-100 border-red-400' : 
                        showStimulus ? `border-4` : 
                        tooEarly ? 'bg-yellow-100 border-yellow-400' : 
                        'bg-gray-100 border-gray-300'}
                    `}
                    style={showStimulus ? { backgroundColor: stimulusColor, borderColor: stimulusColor } : {}}
                    onClick={handleClick}
                  >
                    <div className="text-center z-10">
                      {waiting && !tooEarly && (
                        <div>
                          <div className="text-5xl font-bold text-red-600 mb-3">WAIT...</div>
                          <div className="text-lg text-red-500">Don't click yet!</div>
                          <div className="text-sm text-red-400 mt-2">Get ready...</div>
                        </div>
                      )}
                      
                      {showStimulus && (
                        <div>
                          <div className="text-7xl font-bold text-white mb-3 drop-shadow-lg">CLICK!</div>
                          <div className="text-2xl text-white drop-shadow">React NOW!</div>
                        </div>
                      )}
                      
                      {tooEarly && (
                        <div>
                          <div className="text-5xl font-bold text-yellow-600 mb-3">TOO EARLY!</div>
                          <div className="text-lg text-yellow-600">Wait for the stimulus!</div>
                          <div className="text-sm text-yellow-500 mt-2">Patience is key...</div>
                        </div>
                      )}
                      
                      {!waiting && !showStimulus && !tooEarly && (
                        <div>
                          <div className="text-3xl font-bold text-gray-600 mb-3">Ready for Round {currentRound + 1}</div>
                          <div className="text-lg text-gray-500">Click anywhere to start</div>
                          <div className="text-sm text-gray-400 mt-2">Or press SPACEBAR</div>
                        </div>
                      )}
                    </div>

                    {/* Animated background for stimulus */}
                    {showStimulus && gameMode === 'multi-stimulus' && (
                      <div className="absolute inset-0 opacity-20">
                        <div className="w-full h-full bg-gradient-to-br from-white to-transparent animate-pulse"></div>
                      </div>
                    )}
                  </div>

                  {/* Live Stats */}
                  {reactionData.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 text-xs">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="font-semibold text-blue-700">Avg RT</div>
                        <div className="text-lg font-bold text-blue-600">{averageReactionTime}ms</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="font-semibold text-green-700">Best RT</div>
                        <div className="text-lg font-bold text-green-600">{fastestReaction}ms</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="font-semibold text-green-700">Accuracy</div>
                        <div className="text-lg font-bold text-green-600">{accuracy}%</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="font-semibold text-red-700">False Starts</div>
                        <div className="text-lg font-bold text-red-600">{falseStarts}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Info and Stats */}
        <div className="space-y-4">
          {/* Personal Records */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Best RT</span>
                <span className="text-sm font-mono font-bold">
                  {personalBest ? `${Math.round(personalBest)}ms` : '--'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sessions</span>
                <span className="text-sm font-mono">{sessionCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Research Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About This Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Measures:</strong> Simple reaction time, alertness, motor response speed</p>
              <p><strong>Technology:</strong> Uses performance.now() for sub-millisecond precision timing</p>
              <p><strong>Research:</strong> Critical for studying attention, reflexes, and cognitive processing speed</p>
              <p><strong>Applications:</strong> Sports performance, cognitive assessment, attention research</p>
            </CardContent>
          </Card>

          {/* Reaction Time Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>🚀 Lightning (&lt;200ms)</span>
                <span className="text-green-600">Elite</span>
              </div>
              <div className="flex justify-between">
                <span>⚡ Excellent (200-250ms)</span>
                <span className="text-blue-600">Great</span>
              </div>
              <div className="flex justify-between">
                <span>👍 Good (250-300ms)</span>
                <span className="text-yellow-600">Good</span>
              </div>
              <div className="flex justify-between">
                <span>👌 Average (300-400ms)</span>
                <span className="text-orange-600">Average</span>
              </div>
              <div className="flex justify-between">
                <span>🐌 Slow (&gt;400ms)</span>
                <span className="text-red-600">Practice!</span>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <p>• Focus on the center of the screen</p>
              <p>• Stay relaxed but alert</p>
              <p>• Use keyboard (spacebar) for faster response</p>
              <p>• Don't anticipate - react to the stimulus</p>
              <p>• Practice regularly to improve</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}