"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Mascot, SpeechBubble } from '@/components/mascot';
import { Eye, RotateCcw, Target } from 'lucide-react';

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
          sequenceLength: 6, 
          presentationTime: 500, 
          trials: 3,
          target: '★',
          symbols: ['■', '▲', '♦'],
          description: 'Slow & Simple - Perfect for learning'
        };
      case 'easy': 
        return { 
          sequenceLength: 8, 
          presentationTime: 300, 
          trials: 5,
          target: '★',
          symbols: ['■', '▲', '♦', '●', '♠'],
          description: 'Gentle pace with clear symbols'
        };
      case 'standard': 
        return { 
          sequenceLength: 10, 
          presentationTime: 200, 
          trials: 10,
          target: '★',
          symbols: SIMPLE_SYMBOLS,
          description: 'Standard cognitive test'
        };
      case 'challenge': 
        return { 
          sequenceLength: 12, 
          presentationTime: 120, 
          trials: 12,
          target: '★',
          symbols: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'],
          description: 'Advanced level with letters'
        };
    }
  };

  const generateSequence = useCallback(() => {
    const settings = getModeSettings(gameMode);
    const sequence: string[] = [];
    
    const availableSymbols = [...settings.symbols];
    for (let i = 0; i < settings.sequenceLength; i++) {
      if (availableSymbols.length === 0) {
        availableSymbols.push(...settings.symbols);
      }
      const randomIndex = Math.floor(Math.random() * availableSymbols.length);
      sequence.push(availableSymbols.splice(randomIndex, 1)[0]);
    }
    
    const targetPos = gameMode === 'tutorial' ? 2 : 
                     Math.floor(settings.sequenceLength * 0.3) + Math.floor(Math.random() * 3);
    
    const lagTime = gameMode === 'tutorial' ? 2 : 
                   gameMode === 'easy' ? 2 + Math.floor(Math.random() * 2) :
                   2 + Math.floor(Math.random() * 3);
    
    const blankPos = targetPos + lagTime;
    
    if (blankPos < settings.sequenceLength) {
      sequence[targetPos] = settings.target;
      sequence[blankPos] = '';
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
    
    // Give user a moment before first trial
    setTimeout(() => {
      startTrial();
    }, 1000);
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
    <DashboardShell activeItem="games">
      <div className="mx-auto w-full max-w-4xl pb-12">
        <Card className="overflow-hidden rounded-3xl border-2 border-b-[8px] border-purple-200 bg-white">
          <CardHeader className="border-b-2 bg-purple-50 px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="mb-2 flex items-center gap-3 text-3xl font-black text-foreground">
                  👁️ Blink Gap
                  <Badge variant="secondary" className="rounded-xl border-2 border-purple-200 bg-purple-100 px-3 py-1 text-sm font-extrabold uppercase text-purple-800">
                    Attention Test
                  </Badge>
                </CardTitle>
                <p className="font-semibold text-muted-foreground">
                  Find the missing symbol in rapid sequences!
                </p>
              </div>
              <Mascot size={80} animate={!gameStarted} />
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {!gameStarted ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  {gameComplete ? "Wow! You really kept your eyes peeled!" : "Keep your eyes open and spot the missing gap!"}
                </SpeechBubble>

                {gameComplete && (
                  <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
                    <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                      <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Accuracy</span>
                      <span className="text-4xl font-black text-green-600">{accuracy}%</span>
                    </div>
                    <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                      <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Correct</span>
                      <span className="text-4xl font-black text-blue-600">{correctResponses}/{totalTrials}</span>
                    </div>
                    <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                      <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Level</span>
                      <span className="text-4xl font-black text-purple-600 capitalize">{gameMode}</span>
                    </div>
                  </div>
                )}

                <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl">
                  {(['tutorial', 'easy', 'standard', 'challenge'] as const).map((mode) => {
                    const modeSettings = getModeSettings(mode);
                    return (
                      <Button
                        key={mode}
                        onClick={() => startGame(mode)}
                        className={`h-auto flex-col rounded-2xl border-2 border-b-[6px] p-6 text-center transition-all hover:-translate-y-1 active:translate-y-1 active:border-b-2
                          ${mode === 'tutorial' ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' :
                            mode === 'easy' ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' :
                            mode === 'standard' ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100' :
                            'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'}`}
                      >
                        <span className="mb-2 text-2xl">
                          {mode === 'tutorial' ? '🎓' : mode === 'easy' ? '😊' : mode === 'standard' ? '🎯' : '🔥'}
                        </span>
                        <span className="mb-1 text-lg font-black uppercase">{mode}</span>
                        <span className="text-xs font-bold opacity-70">{modeSettings.presentationTime}ms / {modeSettings.sequenceLength} items</span>
                      </Button>
                    );
                  })}
                </div>

                <div className="flex w-full max-w-xl flex-col items-center rounded-2xl border-2 border-b-[4px] border-purple-100 bg-purple-50 p-6 text-center">
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-purple-800">How to Play</h4>
                  <p className="text-sm font-semibold text-purple-700 mb-2">1. Watch the rapid sequence.</p>
                  <p className="text-sm font-semibold text-purple-700 mb-2">2. Find the target <span className="text-xl">★</span></p>
                  <p className="text-sm font-semibold text-purple-700 mb-2">3. Notice which position appears <span className="underline">empty</span></p>
                  <p className="text-sm font-semibold text-purple-700">4. Click that position at the end!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 px-6 py-4">
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3"/> Round</span>
                      <span className="text-2xl font-black">{currentTrial + 1}/{totalTrials}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">Level</span>
                      <span className="text-2xl font-black text-purple-600 capitalize">{gameMode}</span>
                    </div>
                  </div>
                  <Button onClick={resetGame} variant="outline" className="rounded-xl border-2 font-bold shadow-sm">
                    <RotateCcw className="mr-2 h-4 w-4" /> Quit
                  </Button>
                </div>

                <div className="w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-3 rounded-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${(currentTrial / totalTrials) * 100}%` }}
                  ></div>
                </div>

                {/* Display Area */}
                <div className="relative flex h-80 w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-4 border-gray-100 bg-gradient-to-br from-purple-50 to-indigo-50">
                  
                  {!showingSequence && !showingResponseOptions && (
                    <div className="text-center">
                      <div className="mb-2 text-3xl font-black uppercase tracking-tight text-gray-700">Get Ready</div>
                      <div className="text-lg font-bold text-purple-600">
                        Watch for: <span className="text-4xl text-yellow-500 drop-shadow-sm">{settings.target}</span>
                      </div>
                    </div>
                  )}

                  {showingSequence && (
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 text-9xl text-gray-800 drop-shadow-md">
                        {currentSequence[sequenceIndex] || ' '}
                      </div>
                    </div>
                  )}

                  {showingResponseOptions && (
                    <div className="flex w-full flex-col items-center justify-center p-6 text-center">
                      <h3 className="mb-8 text-2xl font-black uppercase text-gray-800">
                        Which position was empty?
                      </h3>
                      <div className="flex flex-wrap justify-center gap-3">
                        {Array.from({ length: settings.sequenceLength }, (_, i) => (
                          <Button
                            key={i}
                            onClick={() => handleResponse(i)}
                            disabled={userResponse !== null}
                            className={`h-16 w-16 rounded-2xl border-2 border-b-[4px] text-2xl font-black transition-all ${
                              userResponse === null
                                ? 'border-purple-200 bg-white text-purple-600 hover:-translate-y-1 hover:bg-purple-50 active:translate-y-1 active:border-b-2'
                                : userResponse === i
                                ? userResponse === blankPosition
                                  ? 'border-green-600 bg-green-500 text-white'
                                  : 'border-red-600 bg-red-500 text-white'
                                : i === blankPosition && userResponse !== null
                                ? 'border-green-600 bg-green-500 text-white animate-pulse'
                                : 'border-gray-200 bg-gray-100 text-gray-400'
                            }`}
                          >
                            {i + 1}
                          </Button>
                        ))}
                      </div>

                      {userResponse !== null && (
                        <div className={`mt-8 rounded-2xl border-2 border-b-[4px] px-8 py-4 text-center ${
                          userResponse === blankPosition ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'
                        }`}>
                          <div className="text-2xl font-black uppercase tracking-wide">
                            {userResponse === blankPosition ? 'Correct!' : 'Oops!'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
