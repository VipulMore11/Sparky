"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Mascot, SpeechBubble } from '@/components/mascot';
import { RotateCcw, ShoppingCart, Timer } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  originalPrice: number;
  currentPrice: number;
  category: string;
  imageEmoji: string;
  description: string;
  urgencyTrigger?: string;
  scarcityMessage?: string;
}

interface ShoppingSession {
  sessionId: number;
  scenario: string;
  budget: number;
  timeLimit: number;
  products: Product[];
}

export default function ImpulseCart() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSession, setCurrentSession] = useState<ShoppingSession | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(0);

  const session: ShoppingSession = {
    sessionId: 1,
    scenario: "Flash Sale Frenzy!",
    budget: 300,
    timeLimit: 30,
    products: [
      { id: 1, name: "Noise-Cancelling Headphones", originalPrice: 299, currentPrice: 199, category: 'electronics', imageEmoji: '🎧', description: "Block out chaos.", urgencyTrigger: "Flash Sale ends in 2 hours!", scarcityMessage: "Only 3 left in stock" },
      { id: 2, name: "Luxury Stress-Relief Candle", originalPrice: 89, currentPrice: 59, category: 'home', imageEmoji: '🕯️', description: "Aromatherapy to melt stress away.", urgencyTrigger: "Limited time: 33% off" },
      { id: 3, name: "Gourmet Comfort Food", originalPrice: 45, currentPrice: 32, category: 'food', imageEmoji: '🍫', description: "Premium chocolates.", scarcityMessage: "High demand" },
      { id: 4, name: "Weighted Anxiety Blanket", originalPrice: 129, currentPrice: 89, category: 'home', imageEmoji: '🛏️', description: "Better sleep.", urgencyTrigger: "Price increases tomorrow!" },
      { id: 5, name: "Designer Smartwatch", originalPrice: 399, currentPrice: 299, category: 'electronics', imageEmoji: '⌚', description: "Make a statement.", scarcityMessage: "Almost gone!" },
      { id: 6, name: "Retro Gaming Console", originalPrice: 129, currentPrice: 89, category: 'electronics', imageEmoji: '🎮', description: "Nostalgia gaming.", urgencyTrigger: "Sale ends soon" }
    ]
  };

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setCart([]);
    setCurrentSession(session);
    setCurrentBudget(session.budget);
    setTimeRemaining(session.timeLimit);
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const addToCart = (product: Product) => {
    if (currentBudget >= product.currentPrice && !cart.find(p => p.id === product.id)) {
      setCart(prev => [...prev, product]);
      setCurrentBudget(prev => prev - product.currentPrice);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setCart([]);
  };

  const totalSpent = cart.reduce((sum, item) => sum + item.currentPrice, 0);

  return (
    <DashboardShell activeItem="games">
      <div className="mx-auto w-full max-w-4xl pb-12">
        <Card className="overflow-hidden rounded-3xl border-2 border-b-[8px] border-emerald-200 bg-white">
          <CardHeader className="border-b-2 bg-emerald-50 px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="mb-2 flex items-center gap-3 text-3xl font-black text-foreground">
                  💳 Impulse Cart
                  <Badge variant="secondary" className="rounded-xl border-2 border-emerald-200 bg-emerald-100 px-3 py-1 text-sm font-extrabold uppercase text-emerald-800">
                    Consumer Behavior
                  </Badge>
                </CardTitle>
                <p className="font-semibold text-muted-foreground">
                  Can you stick to your budget under pressure?
                </p>
              </div>
              <Mascot size={80} animate={!gameStarted} />
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {!gameStarted && !gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  Flash sale! You have 30 seconds and $300. Don't fall for the tricks!
                </SpeechBubble>

                <div className="flex w-full max-w-xl flex-col items-center rounded-2xl border-2 border-b-[4px] border-emerald-100 bg-emerald-50 p-6 text-center">
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-emerald-800">How to Play</h4>
                  <p className="text-sm font-semibold text-emerald-700 mb-2">1. The clock is ticking!</p>
                  <p className="text-sm font-semibold text-emerald-700 mb-2">2. Beware of scarcity and urgency tricks.</p>
                  <p className="text-sm font-semibold text-emerald-700">3. Only buy what you really need without going broke.</p>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-emerald-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-emerald-400 active:translate-y-1 active:border-b-0">
                  Start Shopping Frenzy
                </Button>
              </div>
            ) : gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  Time's up! Let's see what you bought!
                </SpeechBubble>

                <div className="w-full max-w-2xl bg-white border-4 border-gray-100 rounded-3xl p-8 shadow-sm text-center">
                   <h3 className="text-2xl font-black text-emerald-600 mb-4">Cart Analysis</h3>
                   <div className="flex justify-center gap-8 mb-6">
                      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                         <span className="text-emerald-800 font-bold block mb-1">Total Spent</span>
                         <span className="text-3xl font-black text-emerald-600">${totalSpent}</span>
                      </div>
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                         <span className="text-blue-800 font-bold block mb-1">Items Bought</span>
                         <span className="text-3xl font-black text-blue-600">{cart.length}</span>
                      </div>
                   </div>
                   <div className="text-left bg-gray-50 p-4 rounded-xl border-2 border-gray-100">
                     <p className="font-semibold text-gray-700 mb-2">Your purchases:</p>
                     {cart.length > 0 ? cart.map((c, i) => (
                       <div key={i} className="flex justify-between items-center mb-1">
                         <span>{c.imageEmoji} {c.name}</span>
                         <span className="font-bold">${c.currentPrice}</span>
                       </div>
                     )) : <p className="text-gray-500 italic">Wow! You resisted all temptation!</p>}
                   </div>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-emerald-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-emerald-400 active:translate-y-1 active:border-b-0">
                  Shop Again
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 px-6 py-4">
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1"><ShoppingCart className="h-3 w-3"/> Budget</span>
                      <span className="text-2xl font-black text-emerald-600">${currentBudget}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-red-500 flex items-center gap-1"><Timer className="h-3 w-3"/> Time Left</span>
                      <span className="text-2xl font-black text-red-500">{timeRemaining}s</span>
                    </div>
                  </div>
                  <Button onClick={resetGame} variant="outline" className="rounded-xl border-2 font-bold shadow-sm">
                    <RotateCcw className="mr-2 h-4 w-4" /> Quit
                  </Button>
                </div>

                <div className="w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-3 rounded-full bg-red-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeRemaining / session.timeLimit) * 100}%` }}
                  ></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {currentSession?.products.map((product, index) => {
                    const isAdded = cart.find(p => p.id === product.id);
                    return (
                    <div key={index} className="bg-white border-4 border-b-[6px] border-gray-200 rounded-3xl p-5 flex flex-col items-center text-center relative hover:border-emerald-300 transition-all">
                      <div className="text-6xl mb-4 mt-2">{product.imageEmoji}</div>
                      <h4 className="font-black text-gray-900 mb-2 leading-tight">{product.name}</h4>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl font-black text-emerald-600">${product.currentPrice}</span>
                        <span className="text-sm font-bold text-gray-400 line-through">${product.originalPrice}</span>
                      </div>
                      
                      <div className="w-full space-y-2 mb-4">
                         {product.urgencyTrigger && (
                           <div className="bg-red-50 text-red-700 text-xs font-bold py-1 px-2 rounded-lg border-2 border-red-200">
                             ⚡ {product.urgencyTrigger}
                           </div>
                         )}
                         {product.scarcityMessage && (
                           <div className="bg-orange-50 text-orange-700 text-xs font-bold py-1 px-2 rounded-lg border-2 border-orange-200">
                             🔥 {product.scarcityMessage}
                           </div>
                         )}
                      </div>

                      <Button 
                        onClick={() => addToCart(product)} 
                        disabled={isAdded || currentBudget < product.currentPrice}
                        className={`w-full mt-auto h-12 rounded-xl border-b-4 font-black uppercase text-white transition-all active:translate-y-1 active:border-b-0 ${isAdded ? 'bg-gray-400 border-gray-500' : 'bg-emerald-500 border-emerald-700 hover:bg-emerald-400'}`}
                      >
                        {isAdded ? "Added" : "Add to Cart"}
                      </Button>
                    </div>
                  )})}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
