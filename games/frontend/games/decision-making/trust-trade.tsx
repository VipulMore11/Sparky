"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TrustRound {
  partnerType: 'cooperative' | 'competitive' | 'random';
  partnerName: string;
  yourInvestment: number;
  partnerReturn: number;
  round: number;
  reactionTime: number;
}

interface Partner {
  name: string;
  type: 'cooperative' | 'competitive' | 'random';
  cooperationRate: number;
  avatar: string;
  description: string;
}

export default function TrustTrade() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);
  const [yourCoins, setYourCoins] = useState(100);
  const [partnerCoins, setPartnerCoins] = useState(100);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [gameHistory, setGameHistory] = useState<TrustRound[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds] = useState(15);
  const [gameComplete, setGameComplete] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<TrustRound | null>(null);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [thinking, setThinking] = useState(false);

  const partners: Partner[] = [
    {
      name: "Alex",
      type: "cooperative",
      cooperationRate: 0.85,
      avatar: "🤝",
      description: "Usually returns fair amounts"
    },
    {
      name: "Blake",
      type: "competitive", 
      cooperationRate: 0.25,
      avatar: "💼",
      description: "Often keeps most of the money"
    },
    {
      name: "Charlie",
      type: "random",
      cooperationRate: 0.5,
      avatar: "🎲",
      description: "Unpredictable behavior"
    }
  ];

  const calculatePartnerReturn = useCallback((partner: Partner, investment: number): number => {
    if (investment === 0) return 0;
    
    const tripled = investment * 3;
    let returnAmount = 0;
    
    switch (partner.type) {
      case 'cooperative':
        // Usually returns fair amount (50-70% of tripled)
        if (Math.random() < partner.cooperationRate) {
          returnAmount = Math.floor(tripled * (0.5 + Math.random() * 0.2));
        } else {
          returnAmount = Math.floor(tripled * (0.1 + Math.random() * 0.3));
        }
        break;
        
      case 'competitive':
        // Usually keeps most (returns 10-30% of tripled)
        if (Math.random() < partner.cooperationRate) {
          returnAmount = Math.floor(tripled * (0.4 + Math.random() * 0.3));
        } else {
          returnAmount = Math.floor(tripled * (0.1 + Math.random() * 0.2));
        }
        break;
        
      case 'random':
        // Completely random (0-100% of tripled)
        returnAmount = Math.floor(tripled * Math.random());
        break;
    }
    
    return Math.min(returnAmount, tripled);
  }, []);

  const selectRandomPartner = useCallback((): Partner => {
    return partners[Math.floor(Math.random() * partners.length)];
  }, [partners]);

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setGameHistory([]);
    setCurrentRound(0);
    setYourCoins(100);
    setPartnerCoins(100);
    startRound();
  };

  const startRound = useCallback(() => {
    const partner = selectRandomPartner();
    setCurrentPartner(partner);
    setInvestmentAmount(0);
    setShowOutcome(false);
    setLastOutcome(null);
    setRoundStartTime(performance.now());
  }, [selectRandomPartner]);

  const makeInvestment = (amount: number) => {
    if (!currentPartner || amount > yourCoins) return;

    const reactionTime = performance.now() - roundStartTime;
    setThinking(true);

    // Simulate partner thinking time
    setTimeout(() => {
      const partnerReturn = calculatePartnerReturn(currentPartner, amount);
      
      const round: TrustRound = {
        partnerType: currentPartner.type,
        partnerName: currentPartner.name,
        yourInvestment: amount,
        partnerReturn,
        round: currentRound,
        reactionTime
      };

      // Update coins
      const newYourCoins = yourCoins - amount + partnerReturn;
      const newPartnerCoins = partnerCoins + (amount * 3) - partnerReturn;
      
      setYourCoins(newYourCoins);
      setPartnerCoins(newPartnerCoins);
      setGameHistory(prev => [...prev, round]);
      setLastOutcome(round);
      setShowOutcome(true);
      setThinking(false);

      // Auto-advance after showing outcome
      setTimeout(() => {
        const nextRound = currentRound + 1;
        setCurrentRound(nextRound);
        
        if (nextRound >= totalRounds) {
          setGameComplete(true);
          setGameStarted(false);
        } else {
          startRound();
        }
      }, 3000);
    }, 1000 + Math.random() * 2000); // Random partner thinking time
  };

  // Calculate statistics
  const totalInvested = gameHistory.reduce((sum, r) => sum + r.yourInvestment, 0);
  const totalReturned = gameHistory.reduce((sum, r) => sum + r.partnerReturn, 0);
  const trustLevel = totalInvested / (gameHistory.length > 0 ? gameHistory.length * 20 : 1); // Assuming max 20 coins per round
  const returnRate = totalInvested > 0 ? (totalReturned / (totalInvested * 3)) : 0;

  const averageInvestment = gameHistory.length > 0 
    ? Math.round(totalInvested / gameHistory.length)
    : 0;

  const partnerStats = partners.map(partner => {
    const rounds = gameHistory.filter(r => r.partnerName === partner.name);
    const invested = rounds.reduce((sum, r) => sum + r.yourInvestment, 0);
    const returned = rounds.reduce((sum, r) => sum + r.partnerReturn, 0);
    return {
      ...partner,
      roundsPlayed: rounds.length,
      avgInvestment: rounds.length > 0 ? Math.round(invested / rounds.length) : 0,
      returnRate: invested > 0 ? Math.round((returned / (invested * 3)) * 100) : 0
    };
  });

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setGameHistory([]);
    setCurrentRound(0);
    setYourCoins(100);
    setPartnerCoins(100);
    setCurrentPartner(null);
    setShowOutcome(false);
    setLastOutcome(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🕹️ Trust Trade
            <Badge variant="secondary">Social Psychology</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Invest coins with different partners. Tests trust, reciprocity, and social decision-making.
          </p>
        </CardHeader>
        <CardContent>
          {!gameStarted && !gameComplete ? (
            <div className="text-center space-y-6">
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Play</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Start with 100 coins, trade with different partners</li>
                  <li>• Your investment gets tripled before reaching your partner</li>
                  <li>• Partners decide how much to return to you</li>
                  <li>• Learn which partners you can trust</li>
                  <li>• Maximize your total coins over {totalRounds} rounds</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {partners.map(partner => (
                  <div key={partner.name} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{partner.avatar}</div>
                      <div className="font-semibold">{partner.name}</div>
                      <div className="text-xs text-muted-foreground">{partner.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button onClick={startGame} size="lg" className="w-full md:w-auto">
                Start Trust Game ({totalRounds} rounds)
              </Button>
            </div>
          ) : gameComplete ? (
            <div className="text-center space-y-6">
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-4">Game Complete! 🎉</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Final Coins</div>
                    <div className="text-2xl font-bold text-green-800">{yourCoins}</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Trust Level</div>
                    <div className="text-2xl font-bold text-green-800">{Math.round(trustLevel * 100)}%</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Return Rate</div>
                    <div className="text-2xl font-bold text-green-800">{Math.round(returnRate * 100)}%</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Avg Investment</div>
                    <div className="text-2xl font-bold text-green-800">{averageInvestment}</div>
                  </div>
                </div>

                {/* Partner Analysis */}
                <div className="p-4 bg-white rounded border">
                  <h4 className="font-semibold text-green-700 mb-3">Partner Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {partnerStats.map(partner => (
                      <div key={partner.name} className="p-3 bg-gray-50 rounded">
                        <div className="text-center">
                          <div className="text-2xl mb-1">{partner.avatar}</div>
                          <div className="font-semibold">{partner.name}</div>
                          <div className="text-xs text-gray-600 mb-2">{partner.roundsPlayed} rounds</div>
                          <div className="text-xs">
                            <div>Avg Investment: <span className="font-semibold">{partner.avgInvestment}</span></div>
                            <div>Return Rate: <span className="font-semibold">{partner.returnRate}%</span></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust Profile */}
                <div className="p-4 bg-white rounded border">
                  <h4 className="font-semibold text-green-700 mb-3">Your Trust Profile</h4>
                  <div className="text-sm">
                    {trustLevel < 0.3 && <span className="text-blue-600">Cautious - You tend to invest small amounts and test partners carefully</span>}
                    {trustLevel >= 0.3 && trustLevel <= 0.7 && <span className="text-purple-600">Balanced - You show moderate trust and adapt based on experience</span>}
                    {trustLevel > 0.7 && <span className="text-green-600">Trusting - You're willing to make large investments and trust partners</span>}
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
                <span>Round: <span className="font-bold">{currentRound + 1}/{totalRounds}</span></span>
                <div className="flex gap-4">
                  <span>Your Coins: <span className="font-bold text-green-600">{yourCoins}</span></span>
                  <span>Trust Level: <span className="font-bold text-blue-600">{Math.round(trustLevel * 100)}%</span></span>
                </div>
              </div>

              {/* Outcome Display */}
              {showOutcome && lastOutcome && (
                <div className="text-center p-6 bg-gray-50 rounded-lg border">
                  <div className="text-xl font-bold mb-2">Round Result</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">You invested</div>
                      <div className="text-2xl font-bold text-blue-600">{lastOutcome.yourInvestment}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Partner received</div>
                      <div className="text-2xl font-bold text-purple-600">{lastOutcome.yourInvestment * 3}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">You got back</div>
                      <div className="text-2xl font-bold text-green-600">{lastOutcome.partnerReturn}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {lastOutcome.partnerName} returned {Math.round((lastOutcome.partnerReturn / (lastOutcome.yourInvestment * 3)) * 100)}% of what they received
                  </div>
                </div>
              )}

              {/* Partner Thinking */}
              {thinking && (
                <div className="text-center p-8">
                  <div className="text-4xl mb-4">{currentPartner?.avatar}</div>
                  <div className="text-xl font-semibold">{currentPartner?.name} is thinking...</div>
                  <div className="text-sm text-muted-foreground mt-2">Deciding how much to return</div>
                </div>
              )}

              {/* Investment Interface */}
              {currentPartner && !showOutcome && !thinking && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{currentPartner.avatar}</div>
                    <div className="text-xl font-semibold mb-1">{currentPartner.name}</div>
                    <div className="text-sm text-muted-foreground">{currentPartner.description}</div>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold mb-2">How much do you want to invest?</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Your investment will be tripled before {currentPartner.name} decides how much to return
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-md mx-auto">
                      {[0, 5, 10, 15, 20].map(amount => (
                        <Button
                          key={amount}
                          onClick={() => makeInvestment(amount)}
                          disabled={amount > yourCoins}
                          variant={amount === 0 ? "outline" : "default"}
                          className="h-16"
                        >
                          <div className="text-center">
                            <div className="font-bold">{amount}</div>
                            <div className="text-xs">→ {amount * 3}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-3">
                      Bottom numbers show what {currentPartner.name} will receive
                    </div>
                  </div>
                </div>
              )}

              {/* Game History Summary */}
              {gameHistory.length > 0 && (
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">Total Invested</div>
                    <div className="text-lg font-bold text-blue-600">{totalInvested}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">Total Returned</div>
                    <div className="text-lg font-bold text-green-600">{totalReturned}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">Net Gain</div>
                    <div className={`text-lg font-bold ${yourCoins >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {yourCoins - 100}
                    </div>
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