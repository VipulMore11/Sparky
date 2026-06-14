"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Mascot, SpeechBubble } from '@/components/mascot';
import { Zap, Timer, RotateCcw } from 'lucide-react';

interface ReactionData {
  reactionTime: number;
  timestamp: number;
  wasCorrect: boolean;
}

export default function FlashReflex() {
  const [gameStarted, setGameStarted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [showStimulus, setShowStimulus] = useState(false);
  const [stimulusStartTime, setStimulusStartTime] = useState<number>(0);
  const [reactionData, setReactionData] = useState<ReactionData[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds] = useState(5); // shorter for fun
  const [gameComplete, setGameComplete] = useState(false);
  const [tooEarly, setTooEarly] = useState(false);
  const [waitTimeout, setWaitTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const minWait = 1500;
  const maxWait = 4000;

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
    
    const delay = minWait + Math.random() * (maxWait - minWait);
    
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
      setTooEarly(true);
      setWaiting(false);
      if (waitTimeout) clearTimeout(waitTimeout);
      
      const incorrectData: ReactionData = {
        reactionTime: -1,
        timestamp: performance.now(),
        wasCorrect: false
      };
      
      setReactionData(prev => [...prev, incorrectData]);
      
      setTimeout(() => {
        nextRound();
      }, 1500);
      
    } else if (showStimulus) {
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

  const validReactions = reactionData.filter(d => d.wasCorrect && d.reactionTime > 0);
  const averageReactionTime = validReactions.length > 0 
    ? Math.round(validReactions.reduce((sum, d) => sum + d.reactionTime, 0) / validReactions.length)
    : 0;
  
  const fastestReaction = validReactions.length > 0 
    ? Math.round(Math.min(...validReactions.map(d => d.reactionTime)))
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
    if (waitTimeout) clearTimeout(waitTimeout);
  };

  return (
    <DashboardShell activeItem="games">
      <div className="mx-auto w-full max-w-4xl pb-12">
        <Card className="overflow-hidden rounded-3xl border-2 border-b-[8px] border-yellow-200 bg-white">
          <CardHeader className="border-b-2 bg-yellow-50 px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="mb-2 flex items-center gap-3 text-3xl font-black text-foreground">
                  💡 Flash Tap
                  <Badge variant="secondary" className="rounded-xl border-2 border-yellow-200 bg-yellow-100 px-3 py-1 text-sm font-extrabold uppercase text-yellow-800">
                    Lightning Reflexes
                  </Badge>
                </CardTitle>
                <p className="font-semibold text-muted-foreground">
                  Tap the screen the exact moment it turns green!
                </p>
              </div>
              <Mascot size={80} animate={!gameStarted} />
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {!gameStarted && !gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-8">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  Ready to test your ninja reflexes? Don't tap until it turns green!
                </SpeechBubble>

                <div className="flex flex-col gap-2 rounded-2xl bg-muted/50 p-6 text-center text-sm font-semibold text-muted-foreground">
                  <p>Wait for the screen to turn <span className="font-bold text-green-500">GREEN</span>.</p>
                  <p>Click or press SPACEBAR as fast as possible.</p>
                  <p>If you click too early, you get a penalty!</p>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-yellow-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-yellow-400 active:translate-y-1 active:border-b-0">
                  Start Game
                </Button>
              </div>
            ) : gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-8">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  {averageReactionTime < 250 ? "Whoa, lightning fast! ⚡" : "Great job! Let's try to get even faster!"}
                </SpeechBubble>

                <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
                  <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                    <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Average Time</span>
                    <span className="text-4xl font-black text-blue-600">{averageReactionTime}ms</span>
                  </div>
                  <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                    <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Fastest</span>
                    <span className="text-4xl font-black text-green-600">{fastestReaction}ms</span>
                  </div>
                  <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                    <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">False Starts</span>
                    <span className="text-4xl font-black text-red-500">{falseStarts}</span>
                  </div>
                </div>

                <div className="flex gap-4 w-full max-w-sm">
                  <Button onClick={startGame} className="h-16 flex-1 rounded-2xl border-b-4 bg-yellow-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-yellow-400 active:translate-y-1 active:border-b-0">
                    Play Again
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 px-6 py-4">
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Timer className="h-3 w-3"/> Round</span>
                      <span className="text-2xl font-black">{currentRound + 1}/{totalRounds}</span>
                    </div>
                  </div>
                  <Button onClick={resetGame} variant="outline" className="rounded-xl border-2 font-bold shadow-sm">
                    <RotateCcw className="mr-2 h-4 w-4" /> Quit
                  </Button>
                </div>

                <div 
                  className={`relative flex h-80 w-full cursor-pointer select-none items-center justify-center overflow-hidden rounded-3xl border-4 transition-colors duration-75 active:scale-[0.98] ${
                    waiting ? 'border-red-300 bg-red-100 text-red-600' :
                    showStimulus ? 'border-green-500 bg-green-500 text-white shadow-[0_0_50px_rgba(34,197,94,0.5)]' :
                    tooEarly ? 'border-orange-300 bg-orange-100 text-orange-600' :
                    'border-gray-200 bg-gray-50 text-gray-400'
                  }`}
                  onClick={handleClick}
                >
                  <div className="text-center font-black tracking-tighter">
                    {waiting && !tooEarly && <div className="text-6xl uppercase">Wait...</div>}
                    {showStimulus && <div className="text-8xl uppercase drop-shadow-md">TAP!</div>}
                    {tooEarly && <div className="text-5xl uppercase">Too Early!</div>}
                    {!waiting && !showStimulus && !tooEarly && <div className="text-4xl uppercase opacity-50">Get Ready</div>}
                  </div>
                </div>

                {reactionData.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center">
                      <div className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">Last Reaction</div>
                      <div className="text-2xl font-black text-gray-700">
                        {reactionData[reactionData.length - 1].wasCorrect 
                          ? `${Math.round(reactionData[reactionData.length - 1].reactionTime)}ms` 
                          : 'Missed'}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center">
                      <div className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">Average So Far</div>
                      <div className="text-2xl font-black text-blue-600">{averageReactionTime}ms</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
