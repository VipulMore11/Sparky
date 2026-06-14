"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface TrustRound {
  partnerType: 'cooperative' | 'competitive' | 'random' | 'adaptive';
  partnerName: string;
  yourInvestment: number;
  partnerReturn: number;
  round: number;
  reactionTime: number;
  expectedReturn?: number;
  partnerEmotion?: string;
}

interface Partner {
  name: string;
  type: 'cooperative' | 'competitive' | 'random' | 'adaptive';
  cooperationRate: number;
  avatar: string;
  description: string;
  color: string;
  personality: string;
  adaptiveHistory?: number[];
}

export default function TrustTrade() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);
  const [yourCoins, setYourCoins] = useState(100);
  const [partnerCoins, setPartnerCoins] = useState(100);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [gameHistory, setGameHistory] = useState<TrustRound[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds] = useState(10);
  const [gameComplete, setGameComplete] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<TrustRound | null>(null);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [thinking, setThinking] = useState(false);
  const [partnerEmotion, setPartnerEmotion] = useState<string>('😐');
  const [showStrategy, setShowStrategy] = useState(false);
  const [personalBest, setPersonalBest] = useState(100);

  const partners: Partner[] = [
    {
      name: "Alex",
      type: "cooperative",
      cooperationRate: 0.85,
      avatar: "🤝",
      description: "Trustworthy and fair",
      color: "bg-green-50 border-green-200",
      personality: "Alex believes in mutual benefit and tends to return fair amounts consistently."
    },
    {
      name: "Blake",
      type: "competitive", 
      cooperationRate: 0.25,
      avatar: "💼",
      description: "Business-minded and shrewd",
      color: "bg-red-50 border-red-200",
      personality: "Blake prioritizes personal gain and often keeps most of the investment."
    },
    {
      name: "Charlie",
      type: "random",
      cooperationRate: 0.5,
      avatar: "🎲",
      description: "Unpredictable and spontaneous",
      color: "bg-purple-50 border-purple-200",
      personality: "Charlie's behavior is completely unpredictable - you never know what to expect."
    },
    {
      name: "Dana",
      type: "adaptive",
      cooperationRate: 0.6,
      avatar: "🧠",
      description: "Learns from your behavior",
      color: "bg-blue-50 border-blue-200",
      personality: "Dana adapts their strategy based on how much you've trusted them in the past.",
      adaptiveHistory: []
    }
  ];

  const getPartnerEmotion = (partner: Partner, investment: number, returnAmount: number) => {
    const returnRatio = investment > 0 ? returnAmount / (investment * 3) : 0;
    
    switch (partner.type) {
      case 'cooperative':
        if (returnRatio > 0.6) return '😊';
        if (returnRatio > 0.4) return '🙂';
        return '😔';
      case 'competitive':
        if (returnRatio < 0.3) return '😏';
        if (returnRatio < 0.5) return '😐';
        return '😒';
      case 'random':
        return ['😵', '🤪', '😜', '🙃', '😎'][Math.floor(Math.random() * 5)];
      case 'adaptive':
        if (investment > 15) return '🤔';
        if (investment > 10) return '😊';
        if (investment > 5) return '🙂';
        return '😐';
      default:
        return '😐';
    }
  };

  const calculatePartnerReturn = useCallback((partner: Partner, investment: number, history: TrustRound[]): number => {
    if (investment === 0) return 0;
    
    const tripled = investment * 3;
    let returnAmount = 0;
    
    switch (partner.type) {
      case 'cooperative':
        // Usually returns fair amount (50-70% of tripled)
        if (Math.random() < partner.cooperationRate) {
          returnAmount = Math.floor(tripled * (0.5 + Math.random() * 0.2));
        } else {
          returnAmount = Math.floor(tripled * (0.3 + Math.random() * 0.2));
        }
        break;
        
      case 'competitive':
        // Usually keeps most (returns 10-30% of tripled)
        if (Math.random() < partner.cooperationRate) {
          returnAmount = Math.floor(tripled * (0.35 + Math.random() * 0.25));
        } else {
          returnAmount = Math.floor(tripled * (0.05 + Math.random() * 0.2));
        }
        break;
        
      case 'random':
        // Completely random (0-100% of tripled)
        returnAmount = Math.floor(tripled * Math.random());
        break;
        
      case 'adaptive':
        // Adapts based on player's past investments
        const partnerHistory = history.filter(r => r.partnerName === partner.name);
        if (partnerHistory.length === 0) {
          // First interaction - moderate return
          returnAmount = Math.floor(tripled * (0.4 + Math.random() * 0.2));
        } else {
          // Calculate average trust level from player
          const avgInvestment = partnerHistory.reduce((sum, r) => sum + r.yourInvestment, 0) / partnerHistory.length;
          const trustLevel = avgInvestment / 20; // Normalize to 0-1
          
          // Return more if player has been trusting
          if (trustLevel > 0.7) {
            returnAmount = Math.floor(tripled * (0.6 + Math.random() * 0.3));
          } else if (trustLevel > 0.4) {
            returnAmount = Math.floor(tripled * (0.4 + Math.random() * 0.3));
          } else {
            returnAmount = Math.floor(tripled * (0.2 + Math.random() * 0.3));
          }
        }
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
    setPartnerEmotion('😐');
    setShowStrategy(false);
    startRound();
  };

  const startRound = useCallback(() => {
    const partner = selectRandomPartner();
    setCurrentPartner(partner);
    setInvestmentAmount(0);
    setShowOutcome(false);
    setLastOutcome(null);
    setPartnerEmotion('😐');
    setRoundStartTime(performance.now());
  }, [selectRandomPartner]);

  const makeInvestment = (amount: number) => {
    if (!currentPartner || amount > yourCoins) return;

    const reactionTime = performance.now() - roundStartTime;
    setThinking(true);
    setPartnerEmotion('🤔');

    // Simulate partner thinking time
    const thinkingTime = 1000 + Math.random() * 2000;
    setTimeout(() => {
      const partnerReturn = calculatePartnerReturn(currentPartner, amount, gameHistory);
      const emotion = getPartnerEmotion(currentPartner, amount, partnerReturn);
      setPartnerEmotion(emotion);
      
      const round: TrustRound = {
        partnerType: currentPartner.type,
        partnerName: currentPartner.name,
        yourInvestment: amount,
        partnerReturn,
        round: currentRound,
        reactionTime,
        expectedReturn: amount * 3 * 0.5, // Expected 50% return
        partnerEmotion: emotion
      };

      // Update coins
      const newYourCoins = yourCoins - amount + partnerReturn;
      const newPartnerCoins = partnerCoins + (amount * 3) - partnerReturn;
      
      setYourCoins(newYourCoins);
      setPartnerCoins(newPartnerCoins);
      setPersonalBest(prev => Math.max(prev, newYourCoins));
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
      }, 3500);
    }, thinkingTime);
  };

  // Calculate statistics
  const totalInvested = gameHistory.reduce((sum, r) => sum + r.yourInvestment, 0);
  const totalReturned = gameHistory.reduce((sum, r) => sum + r.partnerReturn, 0);
  const trustLevel = totalInvested / (gameHistory.length > 0 ? gameHistory.length * 20 : 1);
  const returnRate = totalInvested > 0 ? (totalReturned / (totalInvested * 3)) : 0;

  const averageInvestment = gameHistory.length > 0 
    ? Math.round(totalInvested / gameHistory.length)
    : 0;

  const averageReactionTime = gameHistory.length > 0
    ? Math.round(gameHistory.reduce((sum, r) => sum + r.reactionTime, 0) / gameHistory.length)
    : 0;

  const partnerStats = partners.map(partner => {
    const rounds = gameHistory.filter(r => r.partnerName === partner.name);
    const invested = rounds.reduce((sum, r) => sum + r.yourInvestment, 0);
    const returned = rounds.reduce((sum, r) => sum + r.partnerReturn, 0);
    return {
      ...partner,
      roundsPlayed: rounds.length,
      avgInvestment: rounds.length > 0 ? Math.round(invested / rounds.length) : 0,
      returnRate: invested > 0 ? Math.round((returned / (invested * 3)) * 100) : 0,
      netGain: returned - invested
    };
  });

  const getTrustProfile = () => {
    const trustPercent = Math.round(trustLevel * 100);
    if (trustPercent < 30) return { type: 'Cautious', color: 'text-blue-600', desc: 'You prefer to test partners with small investments before committing' };
    if (trustPercent < 60) return { type: 'Balanced', color: 'text-green-600', desc: 'You show moderate trust and adapt based on partner behavior' };
    if (trustPercent < 80) return { type: 'Trusting', color: 'text-purple-600', desc: 'You tend to make substantial investments and give partners the benefit of doubt' };
    return { type: 'Highly Trusting', color: 'text-orange-600', desc: 'You consistently make large investments, showing high faith in others' };
  };

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
    setPartnerEmotion('😐');
    setShowStrategy(false);
  };

  const trustProfile = getTrustProfile();
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
              🤝 Trust Trade
              <Badge variant="secondary">Social Psychology</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Invest coins with AI partners who have different personalities. Test trust, reciprocity, and social decision-making.
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
                  {/* Instructions */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-blue-800 mb-3">How Trust Trade Works</h4>
                      <div className="text-sm text-blue-700 space-y-2">
                        <div>1. <strong>Start with 100 coins</strong> - Your goal is to maximize your wealth</div>
                        <div>2. <strong>Choose investment amounts</strong> - Decide how much to trust each partner</div>
                        <div>3. <strong>Money triples</strong> - Your investment gets tripled before reaching partners</div>
                        <div>4. <strong>Partners decide returns</strong> - Each AI has different personality and strategies</div>
                        <div>5. <strong>Learn and adapt</strong> - Discover which partners you can trust over 10 rounds</div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-100 rounded text-xs text-blue-600">
                        💡 <strong>Strategy Tip:</strong> Pay attention to partner personalities and adapt your trust accordingly!
                      </div>
                    </CardContent>
                  </Card>

                  {/* Meet the Partners */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-center">Meet Your Trading Partners</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {partners.map(partner => (
                        <Card key={partner.name} className={`${partner.color} transition-all hover:shadow-md`}>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-4xl mb-2">{partner.avatar}</div>
                              <div className="text-lg font-semibold mb-1">{partner.name}</div>
                              <div className="text-sm text-gray-600 mb-2">{partner.description}</div>
                              <div className="text-xs text-gray-500 italic">"{partner.personality}"</div>
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {partner.type.charAt(0).toUpperCase() + partner.type.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button onClick={startGame} size="lg" className="w-full md:w-auto">
                      Start Trust Game (10 rounds)
                    </Button>
                  </div>
                </div>
              ) : gameComplete ? (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                    <h3 className="text-2xl font-bold text-center mb-4">
                      🎉 Trust Game Complete! 🎉
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-sm font-semibold text-gray-600">Final Coins</div>
                        <div className="text-3xl font-bold text-green-600">{yourCoins}</div>
                        <div className="text-xs text-gray-500">
                          {yourCoins >= 100 ? `+${yourCoins - 100} profit` : `${yourCoins - 100} loss`}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-sm font-semibold text-gray-600">Trust Level</div>
                        <div className="text-3xl font-bold text-blue-600">{Math.round(trustLevel * 100)}%</div>
                        <div className="text-xs text-gray-500">avg investment rate</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-sm font-semibold text-gray-600">Return Rate</div>
                        <div className="text-3xl font-bold text-purple-600">{Math.round(returnRate * 100)}%</div>
                        <div className="text-xs text-gray-500">partners returned</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-sm font-semibold text-gray-600">Reaction Time</div>
                        <div className="text-3xl font-bold text-orange-600">{averageReactionTime}ms</div>
                        <div className="text-xs text-gray-500">decision speed</div>
                      </div>
                    </div>

                    {/* Trust Profile */}
                    <div className="text-center p-4 bg-white rounded-lg mb-4">
                      <div className="text-lg font-semibold mb-2">
                        Trust Profile: <span className={trustProfile.color}>{trustProfile.type}</span>
                      </div>
                      <div className="text-sm text-gray-600">{trustProfile.desc}</div>
                    </div>

                    {/* Partner Analysis */}
                    <div className="p-4 bg-white rounded-lg border mb-4">
                      <h4 className="font-semibold text-gray-700 mb-3 text-center">Partner Performance Analysis</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        {partnerStats.map(partner => (
                          <div key={partner.name} className={`p-3 ${partner.color} rounded-lg`}>
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{partner.avatar}</div>
                              <div className="flex-1">
                                <div className="font-semibold">{partner.name}</div>
                                <div className="text-xs text-gray-600 mb-1">{partner.roundsPlayed} rounds played</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>Avg Investment: <span className="font-bold">{partner.avgInvestment}</span></div>
                                  <div>Return Rate: <span className="font-bold">{partner.returnRate}%</span></div>
                                  <div>Net Result: <span className={`font-bold ${partner.netGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {partner.netGain >= 0 ? '+' : ''}{partner.netGain}
                                  </span></div>
                                  <div>Trustworthy: <span className="font-bold">
                                    {partner.returnRate >= 50 ? '✅ Yes' : '❌ No'}
                                  </span></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Strategy Insights */}
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-white rounded border">
                        <div className="font-semibold text-gray-700 mb-2">🎯 Performance Insights</div>
                        <div className="space-y-1 text-xs">
                          {yourCoins > personalBest * 0.9 && <div className="text-green-600">✓ Near personal best performance</div>}
                          {returnRate > 0.6 && <div className="text-green-600">✓ Partners were generally trustworthy</div>}
                          {Math.round(trustLevel * 100) > 70 && yourCoins > 100 && <div className="text-purple-600">✓ High trust strategy paid off</div>}
                          {Math.round(trustLevel * 100) < 30 && yourCoins > 100 && <div className="text-blue-600">✓ Cautious strategy was successful</div>}
                          {averageReactionTime < 2000 && <div className="text-orange-600">✓ Quick decision making</div>}
                          {yourCoins < 80 && <div className="text-red-600">⚠ Consider adjusting trust strategy</div>}
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded border">
                        <div className="font-semibold text-gray-700 mb-2">📊 Game Statistics</div>
                        <div className="space-y-1 text-xs">
                          <div>Total Invested: <span className="font-bold">{totalInvested}</span> coins</div>
                          <div>Total Returned: <span className="font-bold">{totalReturned}</span> coins</div>
                          <div>Best Partner: <span className="font-bold">
                            {partnerStats.reduce((best, partner) => 
                              partner.returnRate > best.returnRate ? partner : best
                            ).name}
                          </span></div>
                          <div>Decision Efficiency: <span className="font-bold">
                            {averageReactionTime < 2000 ? 'Fast' : averageReactionTime < 4000 ? 'Moderate' : 'Careful'}
                          </span></div>
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
                      <span>Round: <span className="font-bold">{currentRound + 1}/{totalRounds}</span></span>
                      <span>Coins: <span className="font-bold text-green-600">{yourCoins}</span></span>
                    </div>
                    <div className="flex gap-4">
                      <span>Trust Level: <span className="font-bold text-blue-600">{Math.round(trustLevel * 100)}%</span></span>
                      <Button onClick={resetGame} size="sm" variant="outline">Exit</Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentRound / totalRounds) * 100}%` }}
                    ></div>
                  </div>

                  {/* Outcome Display */}
                  {showOutcome && lastOutcome && (
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border">
                      <div className="text-center mb-4">
                        <div className="text-3xl mb-2">{lastOutcome.partnerEmotion}</div>
                        <div className="text-xl font-bold">Round {lastOutcome.round + 1} Result</div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
                        <div className="p-3 bg-white rounded border">
                          <div className="text-sm text-gray-600">You invested</div>
                          <div className="text-2xl font-bold text-blue-600">{lastOutcome.yourInvestment}</div>
                          <div className="text-xs text-gray-500">coins</div>
                        </div>
                        <div className="p-3 bg-white rounded border">
                          <div className="text-sm text-gray-600">{lastOutcome.partnerName} received</div>
                          <div className="text-2xl font-bold text-purple-600">{lastOutcome.yourInvestment * 3}</div>
                          <div className="text-xs text-gray-500">tripled amount</div>
                        </div>
                        <div className="p-3 bg-white rounded border">
                          <div className="text-sm text-gray-600">You got back</div>
                          <div className="text-2xl font-bold text-green-600">{lastOutcome.partnerReturn}</div>
                          <div className="text-xs text-gray-500">returned to you</div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">
                          {lastOutcome.partnerName} returned {Math.round((lastOutcome.partnerReturn / Math.max(lastOutcome.yourInvestment * 3, 1)) * 100)}% of what they received
                        </div>
                        <div className="text-xs text-gray-500">
                          Net result: {lastOutcome.partnerReturn - lastOutcome.yourInvestment >= 0 ? '+' : ''}{lastOutcome.partnerReturn - lastOutcome.yourInvestment} coins
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Partner Thinking */}
                  {thinking && currentPartner && (
                    <div className="text-center p-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                      <div className="text-4xl mb-4 animate-pulse">{partnerEmotion}</div>
                      <div className="text-xl font-semibold">{currentPartner.name} is thinking...</div>
                      <div className="text-sm text-gray-600 mt-2">Deciding how much to return</div>
                      <div className="mt-3">
                        <Progress value={50} className="h-2 w-48 mx-auto" />
                      </div>
                    </div>
                  )}

                  {/* Investment Interface */}
                  {currentPartner && !showOutcome && !thinking && (
                    <div className="space-y-6">
                      <div className={`text-center p-6 ${currentPartner.color} rounded-lg`}>
                        <div className="text-4xl mb-3">{currentPartner.avatar}</div>
                        <div className="text-2xl font-semibold mb-2">{currentPartner.name}</div>
                        <div className="text-sm text-gray-600 mb-1">{currentPartner.description}</div>
                        <Badge variant="outline" className="text-xs">
                          {currentPartner.type.charAt(0).toUpperCase() + currentPartner.type.slice(1)} Partner
                        </Badge>
                      </div>

                      <div className="text-center p-6 bg-blue-50 rounded-lg border">
                        <div className="text-lg font-semibold mb-2">How much do you want to invest?</div>
                        <div className="text-sm text-gray-600 mb-4">
                          Your investment will be <span className="font-bold text-blue-600">tripled</span> before {currentPartner.name} decides how much to return
                        </div>
                        
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-w-lg mx-auto mb-4">
                          {[0, 5, 10, 15, 20, 25].map(amount => (
                            <Button
                              key={amount}
                              onClick={() => makeInvestment(amount)}
                              disabled={amount > yourCoins}
                              variant={amount === 0 ? "outline" : "default"}
                              className="h-16 flex flex-col"
                            >
                              <div className="font-bold text-lg">{amount}</div>
                              <div className="text-xs opacity-75">→ {amount * 3}</div>
                            </Button>
                          ))}
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Bottom numbers show what {currentPartner.name} will receive
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live Game Stats */}
                  {gameHistory.length > 0 && !showOutcome && (
                    <div className="grid grid-cols-4 gap-3 text-xs">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-600">Invested</div>
                        <div className="text-lg font-bold text-blue-600">{totalInvested}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-600">Returned</div>
                        <div className="text-lg font-bold text-green-600">{totalReturned}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-600">Net Gain</div>
                        <div className={`text-lg font-bold ${yourCoins >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                          {yourCoins - 100}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-600">Return Rate</div>
                        <div className="text-lg font-bold text-purple-600">{Math.round(returnRate * 100)}%</div>
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
                <CardTitle className="text-base">Live Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Your Coins:</span>
                  <span className="font-bold text-green-600">{yourCoins}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Invested:</span>
                  <span className="font-bold text-blue-600">{totalInvested}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Returned:</span>
                  <span className="font-bold text-purple-600">{totalReturned}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trust Level:</span>
                  <span className="font-bold text-orange-600">{Math.round(trustLevel * 100)}%</span>
                </div>
                {personalBest > 100 && (
                  <div className="flex justify-between">
                    <span>Personal Best:</span>
                    <span className="font-bold text-purple-600">{personalBest}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Partner Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Partner Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-2 bg-green-50 rounded">
                <div className="font-semibold text-green-700">🤝 Cooperative</div>
                <div className="text-green-600">Usually fair and trustworthy</div>
              </div>
              <div className="p-2 bg-red-50 rounded">
                <div className="font-semibold text-red-700">💼 Competitive</div>
                <div className="text-red-600">Often keeps most of the money</div>
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <div className="font-semibold text-purple-700">🎲 Random</div>
                <div className="text-purple-600">Completely unpredictable</div>
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <div className="font-semibold text-blue-700">🧠 Adaptive</div>
                <div className="text-blue-600">Learns from your behavior</div>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Strategy Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-gray-600">
              <p>• Start with small investments to test partners</p>
              <p>• Remember past behavior with each partner</p>
              <p>• Cooperative partners reward trust</p>
              <p>• Competitive partners may exploit high trust</p>
              <p>• Adaptive partners respond to your strategy</p>
              <p>• Balance risk and potential reward</p>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What This Tests</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600">
              <p>Trust Trade measures social trust, reciprocity expectations, and learning from social interactions. Based on behavioral economics research into cooperation and trust games.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}