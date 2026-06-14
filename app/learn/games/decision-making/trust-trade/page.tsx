"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Mascot, SpeechBubble } from '@/components/mascot';
import { RotateCcw, Target } from 'lucide-react';

interface TrustRound {
  partnerName: string;
  yourInvestment: number;
  partnerReturn: number;
  round: number;
  reactionTime: number;
}

interface Partner {
  name: string;
  type: string;
  cooperationRate: number;
  avatar: string;
  color: string;
}

export default function TrustTrade() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);
  const [yourCoins, setYourCoins] = useState(100);
  const [partnerCoins, setPartnerCoins] = useState(100);
  const [gameHistory, setGameHistory] = useState<TrustRound[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds] = useState(8);
  const [gameComplete, setGameComplete] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<TrustRound | null>(null);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [thinking, setThinking] = useState(false);

  const partners: Partner[] = [
    { name: "Alex", type: "Friendly", cooperationRate: 0.85, avatar: "🐶", color: "bg-green-100 border-green-300 text-green-700" },
    { name: "Blake", type: "Sneaky", cooperationRate: 0.25, avatar: "🦊", color: "bg-orange-100 border-orange-300 text-orange-700" },
    { name: "Charlie", type: "Random", cooperationRate: 0.5, avatar: "🐵", color: "bg-purple-100 border-purple-300 text-purple-700" }
  ];

  const selectRandomPartner = useCallback((): Partner => {
    return partners[Math.floor(Math.random() * partners.length)];
  }, []);

  const calculatePartnerReturn = useCallback((partner: Partner, investment: number): number => {
    if (investment === 0) return 0;
    const tripled = investment * 3;
    let returnAmount = 0;
    
    if (partner.name === "Alex") {
      returnAmount = Math.random() < partner.cooperationRate 
        ? Math.floor(tripled * (0.5 + Math.random() * 0.2))
        : Math.floor(tripled * (0.3 + Math.random() * 0.2));
    } else if (partner.name === "Blake") {
      returnAmount = Math.random() < partner.cooperationRate 
        ? Math.floor(tripled * (0.35 + Math.random() * 0.25))
        : Math.floor(tripled * (0.05 + Math.random() * 0.2));
    } else {
      returnAmount = Math.floor(tripled * Math.random());
    }
    
    return Math.min(returnAmount, tripled);
  }, []);

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
    setCurrentPartner(selectRandomPartner());
    setShowOutcome(false);
    setLastOutcome(null);
    setRoundStartTime(performance.now());
  }, [selectRandomPartner]);

  const makeInvestment = (amount: number) => {
    if (!currentPartner || amount > yourCoins) return;

    const reactionTime = performance.now() - roundStartTime;
    setThinking(true);

    setTimeout(() => {
      const partnerReturn = calculatePartnerReturn(currentPartner, amount);
      
      const round: TrustRound = {
        partnerName: currentPartner.name,
        yourInvestment: amount,
        partnerReturn,
        round: currentRound,
        reactionTime
      };

      setYourCoins(prev => prev - amount + partnerReturn);
      setPartnerCoins(prev => prev + (amount * 3) - partnerReturn);
      setGameHistory(prev => [...prev, round]);
      setLastOutcome(round);
      setShowOutcome(true);
      setThinking(false);

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
    }, 1500);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setGameHistory([]);
    setCurrentRound(0);
    setYourCoins(100);
    setCurrentPartner(null);
    setShowOutcome(false);
  };

  return (
    <DashboardShell activeItem="games">
      <div className="mx-auto w-full max-w-4xl pb-12">
        <Card className="overflow-hidden rounded-3xl border-2 border-b-[8px] border-emerald-200 bg-white">
          <CardHeader className="border-b-2 bg-emerald-50 px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="mb-2 flex items-center gap-3 text-3xl font-black text-foreground">
                  🤝 Trust Trade
                  <Badge variant="secondary" className="rounded-xl border-2 border-emerald-200 bg-emerald-100 px-3 py-1 text-sm font-extrabold uppercase text-emerald-800">
                    Social Psychology
                  </Badge>
                </CardTitle>
                <p className="font-semibold text-muted-foreground">
                  Who will you trust to multiply your coins?
                </p>
              </div>
              <Mascot size={80} animate={!gameStarted} />
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {!gameStarted && !gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  Ready to wheel and deal? Start with 100 coins and see if you can grow your wealth!
                </SpeechBubble>

                <div className="flex w-full max-w-xl flex-col items-center rounded-2xl border-2 border-b-[4px] border-emerald-100 bg-emerald-50 p-6 text-center">
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-emerald-800">How to Play</h4>
                  <p className="text-sm font-semibold text-emerald-700 mb-2">1. Choose how many coins to give your partner.</p>
                  <p className="text-sm font-semibold text-emerald-700 mb-2">2. Your gift automatically <span className="font-black text-xl">TRIPLES!</span></p>
                  <p className="text-sm font-semibold text-emerald-700 mb-2">3. Your partner decides how much to give back to you.</p>
                  <p className="text-sm font-semibold text-emerald-700">4. Learn who is nice and who is sneaky!</p>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-emerald-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-emerald-400 active:translate-y-1 active:border-b-0">
                  Start Trading
                </Button>
              </div>
            ) : gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  {yourCoins > 120 ? "You're a trading genius! Awesome profit!" : "Trading is tricky! Did you figure out who to trust?"}
                </SpeechBubble>

                <div className="grid w-full grid-cols-2 gap-4 max-w-lg">
                  <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                    <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Final Coins</span>
                    <span className="text-4xl font-black text-emerald-600">{yourCoins}</span>
                  </div>
                  <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                    <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Profit / Loss</span>
                    <span className={`text-4xl font-black ${yourCoins >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {yourCoins >= 100 ? `+${yourCoins - 100}` : yourCoins - 100}
                    </span>
                  </div>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-emerald-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-emerald-400 active:translate-y-1 active:border-b-0">
                  Play Again
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 px-6 py-4">
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3"/> Round</span>
                      <span className="text-2xl font-black">{currentRound + 1}/{totalRounds}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Your Bank</span>
                      <span className="text-2xl font-black text-emerald-600">🪙 {yourCoins}</span>
                    </div>
                  </div>
                  <Button onClick={resetGame} variant="outline" className="rounded-xl border-2 font-bold shadow-sm">
                    <RotateCcw className="mr-2 h-4 w-4" /> Quit
                  </Button>
                </div>

                <div className="w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-3 rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${(currentRound / totalRounds) * 100}%` }}
                  ></div>
                </div>

                {showOutcome && lastOutcome && (
                  <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border-4 border-b-[8px] bg-white transition-all`}>
                    <div className="text-6xl mb-4">🤝</div>
                    <div className="text-2xl font-black tracking-tight mb-6 uppercase text-gray-800 text-center">
                      The deal is done!
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border-2">
                        <span className="text-xs font-bold uppercase text-gray-500 mb-2">You gave</span>
                        <span className="text-3xl font-black text-blue-500">{lastOutcome.yourInvestment}</span>
                      </div>
                      <div className="flex flex-col items-center p-4 bg-green-50 rounded-2xl border-2 border-green-200">
                        <span className="text-xs font-bold uppercase text-green-700 mb-2">Tripled</span>
                        <span className="text-3xl font-black text-green-600">{lastOutcome.yourInvestment * 3}</span>
                      </div>
                      <div className="flex flex-col items-center p-4 bg-purple-50 rounded-2xl border-2 border-purple-200">
                        <span className="text-xs font-bold uppercase text-purple-700 mb-2">Returned</span>
                        <span className="text-3xl font-black text-purple-600">{lastOutcome.partnerReturn}</span>
                      </div>
                    </div>
                  </div>
                )}

                {thinking && currentPartner && (
                  <div className="flex flex-col items-center justify-center p-12 rounded-3xl border-4 border-gray-100 bg-gray-50">
                    <div className="text-6xl mb-6 animate-bounce">{currentPartner.avatar}</div>
                    <div className="text-2xl font-black uppercase text-gray-600">
                      {currentPartner.name} is deciding...
                    </div>
                  </div>
                )}

                {currentPartner && !showOutcome && !thinking && (
                  <div className="space-y-6">
                    <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border-4 border-b-[8px] ${currentPartner.color}`}>
                      <div className="text-7xl mb-4">{currentPartner.avatar}</div>
                      <div className="text-3xl font-black uppercase tracking-tight mb-2">Partner: {currentPartner.name}</div>
                      <Badge className="bg-white text-current font-bold border-2 border-current hover:bg-white/90">
                        {currentPartner.type} Type
                      </Badge>
                    </div>

                    <div className="text-center p-8 bg-blue-50 rounded-3xl border-4 border-b-[8px] border-blue-200">
                      <div className="text-xl font-black uppercase text-blue-800 mb-6">
                        Give coins to {currentPartner.name}?
                      </div>
                      
                      <div className="flex flex-wrap justify-center gap-4">
                        {[0, 5, 10, 20, 50].map(amount => (
                          <button
                            key={amount}
                            onClick={() => makeInvestment(amount)}
                            disabled={amount > yourCoins}
                            className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-4 border-b-[8px] transition-all hover:-translate-y-1 active:translate-y-1 active:border-b-4 disabled:opacity-50 disabled:pointer-events-none
                              ${amount === 0 
                                ? 'bg-white border-gray-300 text-gray-600' 
                                : 'bg-blue-500 border-blue-700 text-white'}`}
                          >
                            <span className="text-2xl font-black">{amount}</span>
                            <span className="text-xs font-bold opacity-80 uppercase mt-1">Coins</span>
                          </button>
                        ))}
                      </div>
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
