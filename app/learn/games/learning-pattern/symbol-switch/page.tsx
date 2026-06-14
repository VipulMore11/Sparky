"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Mascot, SpeechBubble } from '@/components/mascot';
import { RotateCcw, Target } from 'lucide-react';

interface GameRule {
  id: string;
  name: string;
  instruction: string;
  symbol: string;
  color: string;
  evaluate: (stimulus: Stimulus) => boolean;
}

interface Stimulus {
  id: number;
  symbol: string;
  color: string;
  text: string;
}

export default function SymbolSwitch() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [currentRule, setCurrentRule] = useState<GameRule | null>(null);
  const [stimulus, setStimulus] = useState<Stimulus | null>(null);
  const [score, setScore] = useState(0);
  const [showRuleChange, setShowRuleChange] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const TOTAL_TRIALS = 15;

  const gameRules: GameRule[] = [
    {
      id: 'color_blue',
      name: 'Blue Rule',
      instruction: 'Press YES only if the shape is BLUE',
      symbol: '🔵',
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      evaluate: (stimulus) => stimulus.color === 'blue'
    },
    {
      id: 'shape_star',
      name: 'Star Rule',
      instruction: 'Press YES only if the shape is a STAR',
      symbol: '⭐',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      evaluate: (stimulus) => stimulus.symbol === '★'
    },
    {
      id: 'color_green',
      name: 'Green Rule',
      instruction: 'Press YES only if the shape is GREEN',
      symbol: '🟢',
      color: 'bg-green-100 text-green-700 border-green-300',
      evaluate: (stimulus) => stimulus.color === 'green'
    }
  ];

  const symbols = ['●', '■', '▲', '★'];
  const colors = ['red', 'blue', 'green', 'yellow'];

  const generateStimulus = (): Stimulus => {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return {
      id: Date.now(),
      symbol,
      color,
      text: `text-${color}-500`
    };
  };

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setCurrentTrial(0);
    setScore(0);
    
    const initialRule = gameRules[0];
    setCurrentRule(initialRule);
    setShowRuleChange(true);
    
    setTimeout(() => {
      setShowRuleChange(false);
      startTrial(initialRule);
    }, 3000);
  };

  const startTrial = (rule: GameRule = currentRule!) => {
    setFeedback(null);
    
    // Switch rule every 5 trials
    if (currentTrial > 0 && currentTrial % 5 === 0) {
      const nextRuleIndex = (gameRules.findIndex(r => r.id === rule.id) + 1) % gameRules.length;
      const newRule = gameRules[nextRuleIndex];
      setCurrentRule(newRule);
      setShowRuleChange(true);
      
      setTimeout(() => {
        setShowRuleChange(false);
        setStimulus(generateStimulus());
      }, 3000);
    } else {
      setStimulus(generateStimulus());
    }
  };

  const handleResponse = (response: boolean) => {
    if (!stimulus || !currentRule || showRuleChange || feedback) return;
    
    const correct = currentRule.evaluate(stimulus) === response;
    
    if (correct) {
      setScore(prev => prev + 10);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
    
    setTimeout(() => {
      const nextTrial = currentTrial + 1;
      if (nextTrial >= TOTAL_TRIALS) {
        setGameComplete(true);
        setGameStarted(false);
      } else {
        setCurrentTrial(nextTrial);
        startTrial(currentRule);
      }
    }, 800);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setCurrentTrial(0);
    setScore(0);
    setShowRuleChange(false);
    setFeedback(null);
  };

  return (
    <DashboardShell activeItem="games">
      <div className="mx-auto w-full max-w-4xl pb-12">
        <Card className="overflow-hidden rounded-3xl border-2 border-b-[8px] border-indigo-200 bg-white">
          <CardHeader className="border-b-2 bg-indigo-50 px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="mb-2 flex items-center gap-3 text-3xl font-black text-foreground">
                  🔄 Symbol Switch
                  <Badge variant="secondary" className="rounded-xl border-2 border-indigo-200 bg-indigo-100 px-3 py-1 text-sm font-extrabold uppercase text-indigo-800">
                    Brain Flex
                  </Badge>
                </CardTitle>
                <p className="font-semibold text-muted-foreground">
                  Follow the rules, but watch out when they change!
                </p>
              </div>
              <Mascot size={80} animate={!gameStarted} />
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {!gameStarted && !gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  Can you keep up when the rules suddenly change? Let's test your brain flexibility!
                </SpeechBubble>

                <div className="flex w-full max-w-xl flex-col items-center rounded-2xl border-2 border-b-[4px] border-indigo-100 bg-indigo-50 p-6 text-center">
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-indigo-800">How to Play</h4>
                  <p className="text-sm font-semibold text-indigo-700 mb-2">1. Read the secret rule at the top.</p>
                  <p className="text-sm font-semibold text-indigo-700 mb-2">2. Look at the big shape on the screen.</p>
                  <p className="text-sm font-semibold text-indigo-700 mb-4">3. Does it match the rule? Press YES or NO!</p>
                  <Badge variant="destructive" className="uppercase font-bold animate-pulse">Warning: The rule changes mid-game!</Badge>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-indigo-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-indigo-400 active:translate-y-1 active:border-b-0">
                  Start Brain Flex
                </Button>
              </div>
            ) : gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  {score >= 120 ? "Wow! Your brain is super flexible!" : "Great workout! Adapting to change takes practice."}
                </SpeechBubble>

                <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-8 text-center max-w-md w-full">
                  <span className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">Final Score</span>
                  <span className="text-6xl font-black text-indigo-600 mb-4">{score}</span>
                  <p className="text-sm font-medium text-gray-500">Out of 150 points</p>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-indigo-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-indigo-400 active:translate-y-1 active:border-b-0">
                  Play Again
                </Button>
              </div>
            ) : showRuleChange ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="text-5xl font-black uppercase text-orange-500 mb-8 animate-bounce">
                  🚨 Rule Change! 🚨
                </div>
                
                <div className={`p-8 rounded-3xl border-4 border-b-[8px] ${currentRule?.color} max-w-md w-full transform transition-transform scale-110`}>
                  <div className="text-7xl mb-4">{currentRule?.symbol}</div>
                  <h3 className="text-2xl font-black uppercase mb-2">{currentRule?.name}</h3>
                  <p className="font-bold text-lg">{currentRule?.instruction}</p>
                </div>
                
                <div className="mt-12 text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
                  Get ready...
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 px-6 py-4">
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3"/> Shape</span>
                      <span className="text-2xl font-black">{currentTrial + 1}/{TOTAL_TRIALS}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Score</span>
                      <span className="text-2xl font-black text-indigo-600">⭐ {score}</span>
                    </div>
                  </div>
                  <Button onClick={resetGame} variant="outline" className="rounded-xl border-2 font-bold shadow-sm">
                    <RotateCcw className="mr-2 h-4 w-4" /> Quit
                  </Button>
                </div>

                <div className="w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-3 rounded-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${(currentTrial / TOTAL_TRIALS) * 100}%` }}
                  ></div>
                </div>

                <div className="flex flex-col items-center gap-6">
                  {/* Current Rule Reminder */}
                  <div className={`w-full max-w-sm rounded-2xl border-4 px-6 py-4 text-center ${currentRule?.color}`}>
                    <span className="text-sm font-bold uppercase tracking-widest opacity-80 block mb-1">Current Rule</span>
                    <span className="text-xl font-black">{currentRule?.instruction}</span>
                  </div>

                  {/* Stimulus */}
                  <div className={`relative flex items-center justify-center w-64 h-64 rounded-3xl border-4 border-b-[12px] border-gray-200 bg-gray-50 transition-all
                    ${feedback === 'correct' ? 'border-green-300 bg-green-50 ring-4 ring-green-400 ring-offset-4' : ''}
                    ${feedback === 'incorrect' ? 'border-red-300 bg-red-50 ring-4 ring-red-400 ring-offset-4' : ''}
                  `}>
                    {feedback === 'correct' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl z-10">
                        <span className="text-6xl">✅</span>
                      </div>
                    )}
                    {feedback === 'incorrect' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl z-10">
                        <span className="text-6xl">❌</span>
                      </div>
                    )}
                    
                    {stimulus && (
                      <div className={`text-9xl ${stimulus.text} drop-shadow-lg`}>
                        {stimulus.symbol}
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex gap-6 w-full max-w-md mt-4">
                    <button
                      onClick={() => handleResponse(false)}
                      disabled={!!feedback}
                      className="flex-1 flex flex-col items-center justify-center h-24 rounded-2xl border-4 border-b-[8px] border-red-200 bg-red-50 text-red-700 transition-all hover:-translate-y-1 hover:bg-red-100 active:translate-y-1 active:border-b-4 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <span className="text-3xl mb-1">👎</span>
                      <span className="text-xl font-black uppercase">No</span>
                    </button>
                    <button
                      onClick={() => handleResponse(true)}
                      disabled={!!feedback}
                      className="flex-1 flex flex-col items-center justify-center h-24 rounded-2xl border-4 border-b-[8px] border-green-200 bg-green-50 text-green-700 transition-all hover:-translate-y-1 hover:bg-green-100 active:translate-y-1 active:border-b-4 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <span className="text-3xl mb-1">👍</span>
                      <span className="text-xl font-black uppercase">Yes</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
