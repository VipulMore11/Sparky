"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

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
  wheelResult?: number;
}

export default function RiskRun() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentChoice, setCurrentChoice] = useState<RiskChoice | null>(null);
  const [results, setResults] = useState<RiskResult[]>([]);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [totalTrials, setTotalTrials] = useState(20);
  const [gameComplete, setGameComplete] = useState(false);
  const [choiceStartTime, setChoiceStartTime] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [showOutcome, setShowOutcome] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<RiskResult | null>(null);
  const [spinningWheel, setSpinningWheel] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [personalBest, setPersonalBest] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const generateRiskChoice = useCallback((): RiskChoice => {
    // Safe option: guaranteed reward (10-50 points)
    const safeAmount = 10 + Math.floor(Math.random() * 40);
    
    // Risky option: varying probability and reward (20-120 points, 20-80% chance)
    const riskyAmount = 20 + Math.floor(Math.random() * 100);
    const probability = 0.2 + Math.random() * 0.6;
    
    const expectedValue = riskyAmount * probability;
    const lossChance = 1 - probability;
    
    return {
      safe: {
        amount: safeAmount,
        probability: 1.0
      },
      risky: {
        amount: riskyAmount,
        probability,
        expectedValue,
        lossChance
      }
    };
  }, [results]);

  const startGame = () => {
    setTotalTrials(20);
    setGameStarted(true);
    setGameComplete(false);
    setResults([]);
    setCurrentTrial(0);
    setTotalEarnings(0);
    setStreak(0);
    setMaxStreak(0);
    startTrial();
  };

  const startTrial = useCallback(() => {
    const choice = generateRiskChoice();
    setCurrentChoice(choice);
    setShowOutcome(false);
    setLastOutcome(null);
    setChoiceStartTime(performance.now());
  }, [generateRiskChoice]);

  const spinWheel = (targetProbability: number) => {
    setSpinningWheel(true);
    setWheelAngle(0);
    
    // Animate the wheel spinning
    const spinDuration = 2000;
    const spins = 3 + Math.random() * 2; // 3-5 full rotations
    const finalAngle = spins * 360;
    
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Easing function for realistic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = finalAngle * easeOut;
      
      setWheelAngle(currentAngle % 360);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Determine result based on final wheel position
        const normalizedAngle = (currentAngle % 360);
        const winThreshold = targetProbability * 360;
        const won = normalizedAngle <= winThreshold;
        
        setTimeout(() => {
          setSpinningWheel(false);
          return won;
        }, 500);
      }
    };
    
    requestAnimationFrame(animate);
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const roll = Math.random();
        resolve(roll <= targetProbability);
      }, spinDuration + 500);
    });
  };

  const makeChoice = async (choice: 'safe' | 'risky') => {
    if (!currentChoice) return;

    const reactionTime = performance.now() - choiceStartTime;
    let outcome = 0;
    let actualValue = 0;
    let wheelResult: number | undefined;

    if (choice === 'safe') {
      outcome = currentChoice.safe.amount;
      actualValue = currentChoice.safe.amount;
      
      // Update streak
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(max => Math.max(max, newStreak));
        return newStreak;
      });
    } else {
      // Spin the wheel for risky choice
      const won = await spinWheel(currentChoice.risky.probability);
      wheelResult = Math.random();
      
      if (won) {
        outcome = currentChoice.risky.amount;
        actualValue = currentChoice.risky.amount;
        setStreak(prev => {
          const newStreak = prev + 1;
          setMaxStreak(max => Math.max(max, newStreak));
          return newStreak;
        });
      } else {
        outcome = 0;
        actualValue = 0;
        setStreak(0); // Reset streak on loss
      }
    }

    const result: RiskResult = {
      choice,
      outcome,
      reactionTime,
      expectedValue: currentChoice.risky.expectedValue,
      actualValue,
      trial: currentTrial,
      wheelResult
    };

    setResults(prev => [...prev, result]);
    setTotalEarnings(prev => {
      const newTotal = prev + outcome;
      setPersonalBest(best => Math.max(best, newTotal));
      return newTotal;
    });
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
    }, choice === 'risky' ? 3000 : 2000);
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

  const winRate = results.length > 0 
    ? Math.round((results.filter(r => r.outcome > 0).length / results.length) * 100) 
    : 0;

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setResults([]);
    setCurrentTrial(0);
    setTotalEarnings(0);
    setShowOutcome(false);
    setLastOutcome(null);
    setStreak(0);
    setWheelAngle(0);
  };

  const getRiskProfile = () => {
    if (riskTakingRate < 25) return { type: 'Conservative', color: 'text-blue-600', desc: 'You prefer guaranteed rewards and avoid uncertainty' };
    if (riskTakingRate < 50) return { type: 'Cautious', color: 'text-green-600', desc: 'You balance safety with occasional calculated risks' };
    if (riskTakingRate < 75) return { type: 'Adventurous', color: 'text-orange-600', desc: 'You\'re comfortable with moderate risks for higher rewards' };
    return { type: 'Thrill Seeker', color: 'text-red-600', desc: 'You embrace high risks for maximum potential rewards' };
  };

  const profile = getRiskProfile();
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
              💰 Risk Run
              <Badge variant="secondary">Decision Making</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose between safe and risky rewards. Test your risk-taking behavior with animated probability wheels and advanced analytics.
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
                <div className="space-y-6 text-center">
                  {/* Instructions */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-blue-800 mb-3">How to Play</h4>
                      <div className="text-sm text-blue-700 space-y-2">
                        <div>1. <strong>Choose your strategy:</strong> Safe guaranteed rewards or risky gambles</div>
                        <div>2. <strong>Watch the wheel:</strong> Risky choices spin a probability wheel</div>
                        <div>3. <strong>Build streaks:</strong> Consecutive wins increase your momentum</div>
                        <div>4. <strong>Maximize earnings:</strong> Balance risk and reward over 20 trials</div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-100 rounded text-xs text-blue-600">
                        💡 <strong>Tip:</strong> Consider the expected value versus guaranteed rewards!
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                    <h3 className="text-xl font-semibold mb-4">Game Settings</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="font-semibold text-gray-700">Trials</div>
                        <div className="text-2xl font-bold text-blue-600">20</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="font-semibold text-gray-700">Safe Range</div>
                        <div className="text-2xl font-bold text-green-600">10-50</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="font-semibold text-gray-700">Risky Range</div>
                        <div className="text-2xl font-bold text-orange-600">20-120</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="font-semibold text-gray-700">Win Chance</div>
                        <div className="text-2xl font-bold text-purple-600">20-80%</div>
                      </div>
                    </div>
                    <Button onClick={startGame} size="lg" className="w-full md:w-auto">
                      Start Risk Game
                    </Button>
                  </div>
                </div>
              ) : gameComplete ? (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                    <h3 className="text-2xl font-bold text-center mb-4">
                      🎉 Game Complete! 🎉
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-sm font-semibold text-gray-600">Total Earnings</div>
                        <div className="text-3xl font-bold text-green-600">{totalEarnings}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-sm font-semibold text-gray-600">Risk Taking</div>
                        <div className="text-3xl font-bold text-orange-600">{riskTakingRate}%</div>
                        <div className="text-xs text-gray-500">{riskyChoices}/{results.length} risky</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-sm font-semibold text-gray-600">Win Rate</div>
                        <div className="text-3xl font-bold text-blue-600">{winRate}%</div>
                        <div className="text-xs text-gray-500">successful choices</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-sm font-semibold text-gray-600">Max Streak</div>
                        <div className="text-3xl font-bold text-purple-600">{maxStreak}</div>
                        <div className="text-xs text-gray-500">consecutive wins</div>
                      </div>
                    </div>

                    {/* Risk Profile */}
                    <div className="text-center p-4 bg-white rounded-lg mb-4">
                      <div className="text-lg font-semibold mb-2">
                        Risk Profile: <span className={profile.color}>{profile.type}</span>
                      </div>
                      <div className="text-sm text-gray-600">{profile.desc}</div>
                      <div className="mt-3 text-xs">
                        <span className="text-gray-500">Efficiency: </span>
                        <span className="font-bold">{efficiency}%</span>
                        <span className="text-gray-500"> | Avg Reaction: </span>
                        <span className="font-bold">{averageReactionTime}ms</span>
                      </div>
                    </div>

                    {/* Performance Insights */}
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-white rounded border">
                        <div className="font-semibold text-gray-700 mb-2">🎯 Strategy Insights</div>
                        <div className="space-y-1 text-xs">
                          {efficiency >= 100 && <div className="text-green-600">✓ Excellent decision-making efficiency</div>}
                          {winRate >= 80 && <div className="text-green-600">✓ High success rate with chosen strategy</div>}
                          {maxStreak >= 10 && <div className="text-purple-600">✓ Impressive winning streak achieved</div>}
                          {averageReactionTime < 2000 && <div className="text-blue-600">✓ Quick and decisive choices</div>}
                          {riskTakingRate > 70 && efficiency < 80 && <div className="text-orange-600">⚠ High risk tolerance but lower efficiency</div>}
                          {riskTakingRate < 30 && efficiency > 90 && <div className="text-blue-600">✓ Conservative but highly efficient</div>}
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded border">
                        <div className="font-semibold text-gray-700 mb-2">� Performance Metrics</div>
                        <div className="space-y-1 text-xs">
                          <div>Expected Value: <span className="font-bold">{Math.round(expectedTotal)}</span></div>
                          <div>Actual Earnings: <span className="font-bold">{totalEarnings}</span></div>
                          <div>Risk Preference: <span className={`font-bold ${profile.color}`}>{profile.type}</span></div>
                          <div>Decision Speed: <span className="font-bold">{averageReactionTime}ms avg</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <Button onClick={startGame} size="lg">
                      Play Again
                    </Button>
                    <Button onClick={resetGame} size="lg" variant="outline">
                      New Game
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Progress and Stats */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex gap-4">
                      <span>Trial: <span className="font-bold">{currentTrial + 1}/{totalTrials}</span></span>
                    </div>
                    <div className="flex gap-4">
                      <span>Earnings: <span className="font-bold text-green-600">{totalEarnings} pts</span></span>
                      <span>Streak: <span className="font-bold text-purple-600">{streak}</span></span>
                      <Button onClick={resetGame} size="sm" variant="outline">Exit</Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentTrial / totalTrials) * 100}%` }}
                    ></div>
                  </div>

                  {/* Outcome Display */}
                  {showOutcome && lastOutcome && (
                    <div className={`text-center p-6 rounded-lg border-2 transition-all ${
                      lastOutcome.outcome > 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                    }`}>
                      <div className="text-3xl mb-2">
                        {lastOutcome.outcome > 0 ? '🎉' : '😔'}
                      </div>
                      <div className="text-2xl font-bold mb-2">
                        {lastOutcome.outcome > 0 ? `+${lastOutcome.outcome} points!` : 'No reward'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        You chose: <span className="font-semibold">
                          {lastOutcome.choice === 'safe' ? 'Safe option' : 'Risky gamble'}
                        </span>
                      </div>
                      {lastOutcome.choice === 'risky' && (
                        <div className="text-xs text-gray-500 mt-1">
                          {lastOutcome.outcome > 0 ? 'Wheel landed in win zone!' : 'Wheel missed the target'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Spinning Wheel Animation */}
                  {spinningWheel && currentChoice && (
                    <div className="text-center p-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                      <div className="relative inline-block">
                        <div 
                          className="w-24 h-24 border-8 border-orange-200 rounded-full transition-transform duration-100"
                          style={{ 
                            transform: `rotate(${wheelAngle}deg)`,
                            background: `conic-gradient(#10b981 0deg, #10b981 ${currentChoice.risky.probability * 360}deg, #ef4444 ${currentChoice.risky.probability * 360}deg, #ef4444 360deg)`
                          }}
                        >
                          <div className="absolute top-0 left-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-gray-800 transform -translate-x-1/2 -translate-y-2"></div>
                        </div>
                      </div>
                      <div className="text-xl font-semibold mt-4">Spinning the wheel...</div>
                      <div className="text-sm text-gray-600">
                        Win zone: {Math.round(currentChoice.risky.probability * 100)}%
                      </div>
                    </div>
                  )}

                  {/* Choice Options */}
                  {currentChoice && !showOutcome && !spinningWheel && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Safe Option */}
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-green-200 hover:border-green-400"
                        onClick={() => makeChoice('safe')}
                      >
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-4xl mb-3">🏦</div>
                            <div className="text-xl font-bold text-green-600 mb-2">Safe Choice</div>
                            <div className="text-4xl font-bold mb-3 text-green-700">
                              {currentChoice.safe.amount}
                            </div>
                            <div className="text-lg text-green-700 mb-2">
                              100% guaranteed
                            </div>
                            <div className="text-sm text-gray-600 bg-green-50 p-2 rounded">
                              Click for guaranteed reward
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Risky Option */}
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-orange-200 hover:border-orange-400"
                        onClick={() => makeChoice('risky')}
                      >
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-4xl mb-3">🎰</div>
                            <div className="text-xl font-bold text-orange-600 mb-2">Risky Gamble</div>
                            <div className="text-4xl font-bold mb-3 text-orange-700">
                              {currentChoice.risky.amount}
                            </div>
                            <div className="mb-3">
                              <div className="relative">
                                <Progress 
                                  value={currentChoice.risky.probability * 100} 
                                  className="h-4"
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                  {Math.round(currentChoice.risky.probability * 100)}%
                                </div>
                              </div>
                              <div className="text-sm mt-2 text-orange-700">
                                {Math.round(currentChoice.risky.probability * 100)}% chance to win
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 bg-orange-50 p-2 rounded">
                              Expected: {Math.round(currentChoice.risky.expectedValue)} pts
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Live Stats */}
                  {results.length > 0 && !showOutcome && (
                    <div className="grid grid-cols-4 gap-3 text-xs">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-600">Total</div>
                        <div className="text-lg font-bold text-green-600">{totalEarnings}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-600">Risk Rate</div>
                        <div className="text-lg font-bold text-orange-600">{riskTakingRate}%</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-600">Win Rate</div>
                        <div className="text-lg font-bold text-blue-600">{winRate}%</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-600">Efficiency</div>
                        <div className="text-lg font-bold text-purple-600">{efficiency}%</div>
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
          {/* Current Performance */}
          {gameStarted && !gameComplete && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Live Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Earnings:</span>
                  <span className="font-bold text-green-600">{totalEarnings} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Streak:</span>
                  <span className="font-bold text-purple-600">{streak}</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Streak:</span>
                  <span className="font-bold text-purple-600">{maxStreak}</span>
                </div>
                <div className="flex justify-between">
                  <span>Risk Rate:</span>
                  <span className="font-bold text-orange-600">{riskTakingRate}%</span>
                </div>
                {personalBest > 0 && (
                  <div className="flex justify-between">
                    <span>Personal Best:</span>
                    <span className="font-bold text-blue-600">{personalBest}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Game Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Game Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-2 bg-blue-50 rounded">
                <div className="font-semibold text-blue-700">� Trials</div>
                <div className="text-blue-600">20 decision rounds</div>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <div className="font-semibold text-green-700">� Safe Rewards</div>
                <div className="text-green-600">10-50 points guaranteed</div>
              </div>
              <div className="p-2 bg-orange-50 rounded">
                <div className="font-semibold text-orange-700">🎰 Risky Rewards</div>
                <div className="text-orange-600">20-120 points (20-80% chance)</div>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Strategy Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-gray-600">
              <p>• Consider expected value vs guaranteed rewards</p>
              <p>• Build streaks for psychological momentum</p>
              <p>• Adapt strategy based on recent outcomes</p>
              <p>• Balance risk tolerance with efficiency</p>
              <p>• Notice patterns in probability distributions</p>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What This Tests</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600">
              <p>Risk Run measures your decision-making under uncertainty, risk tolerance, and ability to optimize choices over time. It's based on behavioral economics research into how people make financial decisions.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}