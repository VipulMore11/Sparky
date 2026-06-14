"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

import { Mascot, SpeechBubble } from '@/components/mascot';
import { Brain, Zap, Target, RotateCcw } from 'lucide-react';

interface StroopData {
  word: string;
  color: string;
  isCongruent: boolean;
}

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const COLOR_WORDS = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];

export default function StroopSprint() {
  const [currentStimulus, setCurrentStimulus] = useState<StroopData | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
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
    setTimeLeft(60);
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
      setScore(prev => prev + (currentStimulus.isCongruent ? 10 : 15)); 
      setStreak(prev => prev + 1);
      setTotalCorrect(prev => prev + 1);
    } else {
      setStreak(0);
    }

    const nextStimulus = generateStimulus();
    setCurrentStimulus(nextStimulus);
    setStimulusStartTime(performance.now());
  };

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameStarted(false);
    }
  }, [gameStarted, timeLeft]);

  const averageReactionTime = reactionTimes.length > 0 
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <DashboardShell activeItem="games">
      <div className="mx-auto w-full max-w-4xl pb-12">
        <Card className="overflow-hidden rounded-3xl border-2 border-b-[8px] border-blue-200 bg-white">
          <CardHeader className="border-b-2 bg-blue-50 px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="mb-2 flex items-center gap-3 text-3xl font-black text-foreground">
                  🌀 Color Crash
                  <Badge variant="secondary" className="rounded-xl border-2 border-blue-200 bg-blue-100 px-3 py-1 text-sm font-extrabold uppercase text-blue-800">
                    Brain Teaser
                  </Badge>
                </CardTitle>
                <p className="font-semibold text-muted-foreground">
                  Tap the COLOR of the word, not what the word says!
                </p>
              </div>
              <Mascot size={80} animate={!gameStarted} />
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {!gameStarted ? (
              <div className="flex flex-col items-center space-y-8 py-8">
                {totalAttempts > 0 && (
                  <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                    <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                      <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Score</span>
                      <span className="text-4xl font-black text-blue-600">{score}</span>
                    </div>
                    <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                      <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Accuracy</span>
                      <span className="text-4xl font-black text-green-600">{accuracy}%</span>
                    </div>
                    <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                      <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Avg Speed</span>
                      <span className="text-4xl font-black text-purple-600">{averageReactionTime}<span className="text-lg">ms</span></span>
                    </div>
                    <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                      <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Total</span>
                      <span className="text-4xl font-black text-orange-600">{totalAttempts}</span>
                    </div>
                  </div>
                )}
                
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  {totalAttempts === 0 ? "Let's see how fast your brain can switch gears!" : "Great job! Let's beat that score!"}
                </SpeechBubble>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-primary text-xl font-black uppercase tracking-wide text-primary-foreground transition-all hover:bg-primary/90 active:translate-y-1 active:border-b-0">
                  {totalAttempts === 0 ? "Play Now (60s)" : "Play Again"}
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Game Stats */}
                <div className="flex items-center justify-between rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 px-6 py-4">
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><RotateCcw className="h-3 w-3"/> Time</span>
                      <span className="text-2xl font-black">{timeLeft}s</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3"/> Score</span>
                      <span className="text-2xl font-black text-blue-600">{score}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3 text-orange-500"/> Streak</span>
                      <span className="text-2xl font-black text-green-600">{streak}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`hidden sm:flex rounded-xl border-2 px-3 py-1 text-xs font-bold uppercase ${currentStimulus?.isCongruent ? "border-green-200 bg-green-100 text-green-800" : "border-red-200 bg-red-100 text-red-800"}`}>
                    {currentStimulus?.isCongruent ? "Match" : "Trick"}
                  </Badge>
                </div>

                {/* Stimulus Display */}
                {currentStimulus && (
                  <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-gray-100 bg-white py-20 shadow-sm">
                    <div 
                      className="mb-4 text-[5rem] font-black tracking-tighter transition-colors duration-75 sm:text-[8rem]"
                      style={{ color: currentStimulus.color }}
                    >
                      {currentStimulus.word}
                    </div>
                    <p className="rounded-xl bg-muted px-4 py-2 text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
                      Tap the COLOR of this word
                    </p>
                  </div>
                )}

                {/* Color Selection Buttons */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                  {COLORS.map((color) => (
                    <Button
                      key={color}
                      onClick={() => handleColorChoice(color)}
                      className="h-24 rounded-2xl border-2 border-b-[6px] text-xl font-black uppercase text-white shadow-sm transition-all active:translate-y-1 active:border-b-2"
                      style={{ 
                        backgroundColor: color,
                        borderColor: `color-mix(in srgb, ${color} 70%, black)`
                      }}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
