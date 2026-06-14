"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Mascot, SpeechBubble } from '@/components/mascot';
import { RotateCcw, Target } from 'lucide-react';

interface RiskChoice {
  safe: {
    amount: number;
    probability: number;
  };
  risky: {
    amount: number;
    probability: number;
    expectedValue: number;
    lossChance: number;
  };
}

interface RiskResult {
  choice: 'safe' | 'risky';
  outcome: number;
  reactionTime: number;
  expectedValue: number;
  actualValue: number;
  trial: number;
}

export default function RiskRun() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentChoice, setCurrentChoice] = useState<RiskChoice | null>(null);
  const [results, setResults] = useState<RiskResult[]>([]);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [totalTrials, setTotalTrials] = useState(10); // shortened to 10 for kids
  const [gameComplete, setGameComplete] = useState(false);
  const [choiceStartTime, setChoiceStartTime] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [showOutcome, setShowOutcome] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<RiskResult | null>(null);
  const [spinningWheel, setSpinningWheel] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);

  const generateRiskChoice = useCallback((): RiskChoice => {
    const safeAmount = 10 + Math.floor(Math.random() * 40);
    const riskyAmount = 20 + Math.floor(Math.random() * 100);
    const probability = 0.2 + Math.random() * 0.6;
    
    return {
      safe: { amount: safeAmount, probability: 1.0 },
      risky: { 
        amount: riskyAmount, 
        probability, 
        expectedValue: riskyAmount * probability, 
        lossChance: 1 - probability 
      }
    };
  }, []);

  const startGame = () => {
    setTotalTrials(10);
    setGameStarted(true);
    setGameComplete(false);
    setResults([]);
    setCurrentTrial(0);
    setTotalEarnings(0);
    startTrial();
  };

  const startTrial = useCallback(() => {
    setCurrentChoice(generateRiskChoice());
    setShowOutcome(false);
    setLastOutcome(null);
    setChoiceStartTime(performance.now());
  }, [generateRiskChoice]);

  const spinWheel = (targetProbability: number) => {
    setSpinningWheel(true);
    setWheelAngle(0);
    
    const spinDuration = 2000;
    const spins = 3 + Math.random() * 2; 
    const finalAngle = spins * 360;
    
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = finalAngle * easeOut;
      
      setWheelAngle(currentAngle % 360);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => setSpinningWheel(false), 500);
      }
    };
    
    requestAnimationFrame(animate);
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(Math.random() <= targetProbability);
      }, spinDuration + 500);
    });
  };

  const makeChoice = async (choice: 'safe' | 'risky') => {
    if (!currentChoice) return;

    const reactionTime = performance.now() - choiceStartTime;
    let outcome = 0;
    let actualValue = 0;

    if (choice === 'safe') {
      outcome = currentChoice.safe.amount;
      actualValue = currentChoice.safe.amount;
    } else {
      const won = await spinWheel(currentChoice.risky.probability);
      if (won) {
        outcome = currentChoice.risky.amount;
        actualValue = currentChoice.risky.amount;
      }
    }

    const result: RiskResult = {
      choice,
      outcome,
      reactionTime,
      expectedValue: currentChoice.risky.expectedValue,
      actualValue,
      trial: currentTrial
    };

    setResults(prev => [...prev, result]);
    setTotalEarnings(prev => prev + outcome);
    setLastOutcome(result);
    setShowOutcome(true);

    setTimeout(() => {
      const nextTrial = currentTrial + 1;
      setCurrentTrial(nextTrial);
      if (nextTrial >= totalTrials) {
        setGameComplete(true);
        setGameStarted(false);
      } else {
        startTrial();
      }
    }, choice === 'risky' ? 3000 : 2000);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setResults([]);
    setCurrentTrial(0);
    setTotalEarnings(0);
    setShowOutcome(false);
  };

  return (
    <DashboardShell activeItem="games">
      <div className="mx-auto w-full max-w-4xl pb-12">
        <Card className="overflow-hidden rounded-3xl border-2 border-b-[8px] border-green-200 bg-white">
          <CardHeader className="border-b-2 bg-green-50 px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="mb-2 flex items-center gap-3 text-3xl font-black text-foreground">
                  💰 Risk Run
                  <Badge variant="secondary" className="rounded-xl border-2 border-green-200 bg-green-100 px-3 py-1 text-sm font-extrabold uppercase text-green-800">
                    Decision Making
                  </Badge>
                </CardTitle>
                <p className="font-semibold text-muted-foreground">
                  Play it safe or take a gamble? You decide!
                </p>
              </div>
              <Mascot size={80} animate={!gameStarted} />
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {!gameStarted && !gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  Ready to test your luck and strategy? Try to get the highest score!
                </SpeechBubble>

                <div className="flex w-full max-w-xl flex-col items-center rounded-2xl border-2 border-b-[4px] border-green-100 bg-green-50 p-6 text-center">
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-green-800">How to Play</h4>
                  <p className="text-sm font-semibold text-green-700 mb-2">1. Choose: 🏦 Safe Bank OR 🎰 Risky Spin</p>
                  <p className="text-sm font-semibold text-green-700 mb-2">2. The Bank gives guaranteed points</p>
                  <p className="text-sm font-semibold text-green-700">3. The Spin gives huge points... but only if you win!</p>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-green-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-green-400 active:translate-y-1 active:border-b-0">
                  Start Risk Run!
                </Button>
              </div>
            ) : gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  {totalEarnings > 300 ? "Wow! You are a master of strategy!" : "Good effort! Want to try again for a higher score?"}
                </SpeechBubble>

                <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
                  <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                    <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Points</span>
                    <span className="text-4xl font-black text-green-600">{totalEarnings}</span>
                  </div>
                  <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                    <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Gambles Taken</span>
                    <span className="text-4xl font-black text-orange-600">
                      {results.filter(r => r.choice === 'risky').length} / {totalTrials}
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                    <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Win Rate</span>
                    <span className="text-4xl font-black text-blue-600">
                      {Math.round((results.filter(r => r.outcome > 0).length / totalTrials) * 100)}%
                    </span>
                  </div>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-green-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-green-400 active:translate-y-1 active:border-b-0">
                  Play Again
                </Button>
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
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">Score</span>
                      <span className="text-2xl font-black text-green-600">{totalEarnings}</span>
                    </div>
                  </div>
                  <Button onClick={resetGame} variant="outline" className="rounded-xl border-2 font-bold shadow-sm">
                    <RotateCcw className="mr-2 h-4 w-4" /> Quit
                  </Button>
                </div>

                <div className="w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-3 rounded-full bg-green-500 transition-all duration-300"
                    style={{ width: `${(currentTrial / totalTrials) * 100}%` }}
                  ></div>
                </div>

                {showOutcome && lastOutcome && (
                  <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border-4 ${
                    lastOutcome.outcome > 0 ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-700'
                  }`}>
                    <div className="text-6xl mb-4">{lastOutcome.outcome > 0 ? '🎉' : '💥'}</div>
                    <div className="text-4xl font-black tracking-tight mb-2">
                      {lastOutcome.outcome > 0 ? `+${lastOutcome.outcome} POINTS!` : 'Ouch! Zero points.'}
                    </div>
                  </div>
                )}

                {spinningWheel && currentChoice && (
                  <div className="flex flex-col items-center justify-center p-8 rounded-3xl border-4 border-orange-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                    <div className="relative inline-block mb-6">
                      <div 
                        className="w-32 h-32 border-[12px] border-orange-300 rounded-full transition-transform duration-100 shadow-xl"
                        style={{ 
                          transform: `rotate(${wheelAngle}deg)`,
                          background: `conic-gradient(#10b981 0deg, #10b981 ${currentChoice.risky.probability * 360}deg, #ef4444 ${currentChoice.risky.probability * 360}deg, #ef4444 360deg)`
                        }}
                      >
                        <div className="absolute -top-4 left-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-transparent border-b-gray-800 transform -translate-x-1/2 drop-shadow-md z-10"></div>
                      </div>
                    </div>
                    <div className="text-2xl font-black uppercase text-orange-600 animate-pulse">Spinning...</div>
                  </div>
                )}

                {!showOutcome && !spinningWheel && currentChoice && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                      onClick={() => makeChoice('safe')}
                      className="group flex flex-col items-center justify-center rounded-3xl border-4 border-b-[12px] border-blue-200 bg-blue-50 p-8 transition-all hover:-translate-y-2 hover:bg-blue-100 active:translate-y-2 active:border-b-4"
                    >
                      <div className="text-6xl mb-4 drop-shadow-sm">🏦</div>
                      <div className="text-xl font-bold uppercase tracking-widest text-blue-600 mb-2">The Bank</div>
                      <div className="text-5xl font-black text-blue-800 mb-2">+{currentChoice.safe.amount}</div>
                      <div className="text-sm font-bold text-blue-500 bg-white px-4 py-1 rounded-full border-2 border-blue-100">100% Guaranteed</div>
                    </button>

                    <button 
                      onClick={() => makeChoice('risky')}
                      className="group flex flex-col items-center justify-center rounded-3xl border-4 border-b-[12px] border-orange-200 bg-orange-50 p-8 transition-all hover:-translate-y-2 hover:bg-orange-100 active:translate-y-2 active:border-b-4"
                    >
                      <div className="text-6xl mb-4 drop-shadow-sm">🎰</div>
                      <div className="text-xl font-bold uppercase tracking-widest text-orange-600 mb-2">The Spin</div>
                      <div className="text-5xl font-black text-orange-800 mb-4">+{currentChoice.risky.amount}</div>
                      
                      <div className="w-full max-w-[200px] mb-2">
                        <div className="relative h-6 bg-red-500 rounded-full overflow-hidden border-2 border-orange-300">
                          <div 
                            className="absolute top-0 left-0 h-full bg-green-500"
                            style={{ width: `${currentChoice.risky.probability * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-sm font-bold text-orange-500 bg-white px-4 py-1 rounded-full border-2 border-orange-100">
                        {Math.round(currentChoice.risky.probability * 100)}% Win Chance
                      </div>
                    </button>
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
