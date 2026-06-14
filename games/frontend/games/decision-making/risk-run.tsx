"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RiskChoice {
  safe: {
    amount: number;
    probability: number;
  };
  risky: {
    amount: number;
    probability: number;
    expectedValue: number;
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
  const [totalTrials] = useState(20);
  const [gameComplete, setGameComplete] = useState(false);
  const [choiceStartTime, setChoiceStartTime] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [showOutcome, setShowOutcome] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<RiskResult | null>(null);
  const [spinningWheel, setSpinningWheel] = useState(false);

  const generateRiskChoice = useCallback((): RiskChoice => {
    // Safe option: guaranteed small to medium reward
    const safeAmount = 10 + Math.floor(Math.random() * 40); // 10-50 points
    
    // Risky option: varying probability and reward
    const riskyAmount = 20 + Math.floor(Math.random() * 100); // 20-120 points
    const probability = 0.2 + Math.random() * 0.6; // 20-80% chance
    const expectedValue = riskyAmount * probability;
    
    return {
      safe: {
        amount: safeAmount,
        probability: 1.0
      },
      risky: {
        amount: riskyAmount,
        probability,
        expectedValue
      }
    };
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setResults([]);
    setCurrentTrial(0);
    setTotalEarnings(0);
    startTrial();
  };

  const startTrial = useCallback(() => {
    const choice = generateRiskChoice();
    setCurrentChoice(choice);
    setShowOutcome(false);
    setLastOutcome(null);
    setChoiceStartTime(performance.now());
  }, [generateRiskChoice]);

  const makeChoice = (choice: 'safe' | 'risky') => {
    if (!currentChoice) return;

    const reactionTime = performance.now() - choiceStartTime;
    let outcome = 0;
    let actualValue = 0;

    if (choice === 'safe') {
      outcome = currentChoice.safe.amount;
      actualValue = currentChoice.safe.amount;
    } else {
      // Spin the wheel!
      setSpinningWheel(true);
      
      setTimeout(() => {
        const roll = Math.random();
        if (roll <= currentChoice.risky.probability) {
          outcome = currentChoice.risky.amount;
          actualValue = currentChoice.risky.amount;
        } else {
          outcome = 0;
          actualValue = 0;
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
        setSpinningWheel(false);

        // Auto-advance after showing outcome
        setTimeout(() => {
          const nextTrial = currentTrial + 1;
          setCurrentTrial(nextTrial);
          
          if (nextTrial >= totalTrials) {
            setGameComplete(true);
            setGameStarted(false);
          } else {
            startTrial();
          }
        }, 2500);
      }, 1500); // Wheel spinning time

      return; // Don't process result immediately for risky choice
    }

    // Process safe choice immediately
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

    // Auto-advance after showing outcome
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
  const riskyChoices = results.filter(r => r.choice === 'risky').length;
  const riskTakingRate = results.length > 0 ? Math.round((riskyChoices / results.length) * 100) : 0;
  
  const averageReactionTime = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.reactionTime, 0) / results.length)
    : 0;

  const expectedTotal = results.reduce((sum, r) => {
    return sum + (r.choice === 'safe' ? r.actualValue : r.expectedValue);
  }, 0);

  const efficiency = expectedTotal > 0 ? Math.round((totalEarnings / expectedTotal) * 100) : 0;

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setResults([]);
    setCurrentTrial(0);
    setTotalEarnings(0);
    setShowOutcome(false);
    setLastOutcome(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💰 Risk Run
            <Badge variant="secondary">Decision Making</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose between safe and risky rewards. Tests risk-taking behavior and decision-making under uncertainty.
          </p>
        </CardHeader>
        <CardContent>
          {!gameStarted && !gameComplete ? (
            <div className="text-center space-y-6">
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Play</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Choose between a guaranteed reward or a risky gamble</li>
                  <li>• Risky choices have higher potential but uncertain outcomes</li>
                  <li>• Maximize your total earnings over {totalTrials} trials</li>
                  <li>• Watch the probability wheel for risky outcomes</li>
                </ul>
              </div>
              
              <Button onClick={startGame} size="lg" className="w-full md:w-auto">
                Start Risk Game ({totalTrials} trials)
              </Button>
            </div>
          ) : gameComplete ? (
            <div className="text-center space-y-6">
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-4">Game Complete! 🎉</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Total Earnings</div>
                    <div className="text-2xl font-bold text-green-800">{totalEarnings} pts</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Risk Taking</div>
                    <div className="text-2xl font-bold text-green-800">{riskTakingRate}%</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Efficiency</div>
                    <div className="text-2xl font-bold text-green-800">{efficiency}%</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Avg RT</div>
                    <div className="text-2xl font-bold text-green-800">{averageReactionTime}ms</div>
                  </div>
                </div>

                {/* Risk Profile */}
                <div className="p-4 bg-white rounded border">
                  <h4 className="font-semibold text-green-700 mb-3">Risk Profile</h4>
                  <div className="text-sm">
                    {riskTakingRate < 30 && <span className="text-blue-600">Risk Averse - You prefer safe, guaranteed rewards</span>}
                    {riskTakingRate >= 30 && riskTakingRate <= 70 && <span className="text-purple-600">Balanced - You weigh risks and rewards carefully</span>}
                    {riskTakingRate > 70 && <span className="text-red-600">Risk Seeking - You're willing to gamble for higher rewards</span>}
                  </div>
                </div>
              </div>
              
              <Button onClick={resetGame} size="lg">
                Play Again
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress and Stats */}
              <div className="flex justify-between items-center text-sm">
                <span>Trial: <span className="font-bold">{currentTrial + 1}/{totalTrials}</span></span>
                <div className="flex gap-4">
                  <span>Earnings: <span className="font-bold text-green-600">{totalEarnings} pts</span></span>
                  <span>Risk Rate: <span className="font-bold text-purple-600">{riskTakingRate}%</span></span>
                </div>
              </div>

              {/* Outcome Display */}
              {showOutcome && lastOutcome && (
                <div className={`text-center p-6 rounded-lg border-2 ${
                  lastOutcome.outcome > 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                }`}>
                  <div className="text-2xl font-bold mb-2">
                    {lastOutcome.outcome > 0 ? '🎉 You Won!' : '😔 No Reward'}
                  </div>
                  <div className="text-xl font-semibold">
                    +{lastOutcome.outcome} points
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    You chose: {lastOutcome.choice === 'safe' ? 'Safe option' : 'Risky gamble'}
                  </div>
                </div>
              )}

              {/* Spinning Wheel */}
              {spinningWheel && (
                <div className="text-center p-8">
                  <div className="text-4xl mb-4 animate-spin">🎰</div>
                  <div className="text-xl font-semibold">Spinning the wheel...</div>
                </div>
              )}

              {/* Choice Options */}
              {currentChoice && !showOutcome && !spinningWheel && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Safe Option */}
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow border-green-200">
                    <CardContent className="p-6" onClick={() => makeChoice('safe')}>
                      <div className="text-center">
                        <div className="text-3xl mb-3">🏦</div>
                        <div className="text-xl font-bold text-green-600 mb-2">Safe Choice</div>
                        <div className="text-3xl font-bold mb-3">{currentChoice.safe.amount} points</div>
                        <div className="text-lg text-green-700 mb-2">100% guaranteed</div>
                        <div className="text-sm text-muted-foreground">
                          Click to choose the safe option
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risky Option */}
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow border-orange-200">
                    <CardContent className="p-6" onClick={() => makeChoice('risky')}>
                      <div className="text-center">
                        <div className="text-3xl mb-3">🎰</div>
                        <div className="text-xl font-bold text-orange-600 mb-2">Risky Gamble</div>
                        <div className="text-3xl font-bold mb-3">{currentChoice.risky.amount} points</div>
                        <div className="mb-3">
                          <Progress 
                            value={currentChoice.risky.probability * 100} 
                            className="h-3"
                          />
                          <div className="text-sm mt-1">
                            {Math.round(currentChoice.risky.probability * 100)}% chance to win
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Expected value: {Math.round(currentChoice.risky.expectedValue)} pts
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Click to spin the wheel
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Quick Stats */}
              {results.length > 0 && (
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">Total Earned</div>
                    <div className="text-lg font-bold text-green-600">{totalEarnings}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">Risky Choices</div>
                    <div className="text-lg font-bold text-orange-600">{riskyChoices}/{results.length}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">Efficiency</div>
                    <div className="text-lg font-bold text-purple-600">{efficiency}%</div>
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