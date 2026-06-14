"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Mascot, SpeechBubble } from '@/components/mascot';
import { RotateCcw, Target } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  logo: string;
  color: string;
  reputation: number;
  priceLevel: 'budget' | 'mid-range' | 'premium' | 'luxury';
  country: string;
  foundedYear: number;
  marketShare: number;
}

interface Product {
  id: number;
  category: string;
  name: string;
  brands: {
    brand: Brand;
    price: number;
    rating: number;
    features: string[];
    pros: string[];
    cons: string[];
    marketPosition: string;
    popularity: number;
    innovation: number;
    sustainability: number;
    customerService: number;
  }[];
  decisionFactors: string[];
}

interface BrandChoice {
  productId: number;
  chosenBrand: string;
  rejectedBrand: string;
  decisionTime: number;
  primaryReason: string;
  priceInfluence: number;
  brandInfluence: number;
  featureInfluence: number;
  category: string;
}

export default function BrandBattle() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [results, setResults] = useState<BrandChoice[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [decisionStartTime, setDecisionStartTime] = useState<number>(0);
  const [showComparison, setShowComparison] = useState(false);

  const brands: Brand[] = [
    { id: 'apple', name: 'Apple', logo: '🍎', color: 'text-gray-600', reputation: 95, priceLevel: 'premium', country: 'USA', foundedYear: 1976, marketShare: 25 },
    { id: 'samsung', name: 'Samsung', logo: '📱', color: 'text-blue-600', reputation: 88, priceLevel: 'mid-range', country: 'South Korea', foundedYear: 1938, marketShare: 22 },
    { id: 'nike', name: 'Nike', logo: '✔️', color: 'text-black', reputation: 92, priceLevel: 'premium', country: 'USA', foundedYear: 1964, marketShare: 18 },
    { id: 'adidas', name: 'Adidas', logo: '👟', color: 'text-blue-700', reputation: 87, priceLevel: 'premium', country: 'Germany', foundedYear: 1949, marketShare: 12 },
    { id: 'coca-cola', name: 'Coca-Cola', logo: '🥤', color: 'text-red-600', reputation: 89, priceLevel: 'mid-range', country: 'USA', foundedYear: 1886, marketShare: 42 },
    { id: 'pepsi', name: 'Pepsi', logo: '🔵', color: 'text-blue-500', reputation: 82, priceLevel: 'mid-range', country: 'USA', foundedYear: 1893, marketShare: 28 },
    { id: 'tesla', name: 'Tesla', logo: '⚡', color: 'text-red-500', reputation: 91, priceLevel: 'luxury', country: 'USA', foundedYear: 2003, marketShare: 8 },
    { id: 'bmw', name: 'BMW', logo: '🚗', color: 'text-blue-800', reputation: 90, priceLevel: 'luxury', country: 'Germany', foundedYear: 1916, marketShare: 6 }
  ];

  const products: Product[] = [
    {
      id: 1,
      category: 'Smartphones',
      name: 'Premium Smartphone',
      decisionFactors: ['Performance', 'Camera Quality', 'Brand Prestige', 'Price'],
      brands: [
        { brand: brands.find(b => b.id === 'apple')!, price: 1099, rating: 4.6, features: ['A17 Pro Chip', '48MP Camera', 'Face ID'], pros: ['Premium build', 'Ecosystem'], cons: ['High price'], marketPosition: 'Innovation leader', popularity: 95, innovation: 94, sustainability: 78, customerService: 92 },
        { brand: brands.find(b => b.id === 'samsung')!, price: 899, rating: 4.4, features: ['Snapdragon 8 Gen 3', '200MP Camera', 'S Pen'], pros: ['Versatile', 'Great display'], cons: ['Bloatware'], marketPosition: 'Feature-rich', popularity: 88, innovation: 87, sustainability: 72, customerService: 78 }
      ]
    },
    {
      id: 2,
      category: 'Athletic Shoes',
      name: 'Performance Running Shoes',
      decisionFactors: ['Comfort', 'Performance', 'Style', 'Brand Image'],
      brands: [
        { brand: brands.find(b => b.id === 'nike')!, price: 180, rating: 4.5, features: ['Air Max', 'Flyknit'], pros: ['Innovation', 'Brand appeal'], cons: ['Price'], marketPosition: 'Market leader', popularity: 92, innovation: 95, sustainability: 68, customerService: 84 },
        { brand: brands.find(b => b.id === 'adidas')!, price: 160, rating: 4.3, features: ['Boost Tech', 'Primeknit'], pros: ['Comfort', 'Sustainability'], cons: ['Less hype'], marketPosition: 'Heritage brand', popularity: 85, innovation: 88, sustainability: 85, customerService: 82 }
      ]
    },
    {
      id: 3,
      category: 'Electric Vehicles',
      name: 'Luxury Electric Sedan',
      decisionFactors: ['Technology', 'Performance', 'Status', 'Sustainability'],
      brands: [
        { brand: brands.find(b => b.id === 'tesla')!, price: 89990, rating: 4.4, features: ['Autopilot', '400mi Range'], pros: ['Tech leader', 'Charging network'], cons: ['Build issues'], marketPosition: 'EV pioneer', popularity: 89, innovation: 98, sustainability: 92, customerService: 72 },
        { brand: brands.find(b => b.id === 'bmw')!, price: 94900, rating: 4.2, features: ['iDrive System', 'Luxury Interior'], pros: ['Luxury feel', 'Engineering'], cons: ['High maintenance'], marketPosition: 'Traditional luxury', popularity: 78, innovation: 82, sustainability: 78, customerService: 88 }
      ]
    }
  ];

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setResults([]);
    setCurrentProductIndex(0);
    setShowComparison(false);
    setDecisionStartTime(performance.now());
  };

  const chooseBrand = useCallback((brandId: string, reason: string) => {
    const decisionTime = performance.now() - decisionStartTime;
    const currentProduct = products[currentProductIndex];
    const chosenBrand = currentProduct.brands.find(b => b.brand.id === brandId);
    const rejectedBrand = currentProduct.brands.find(b => b.brand.id !== brandId);
    
    if (!chosenBrand || !rejectedBrand) return;
    
    const priceDiff = Math.abs(chosenBrand.price - rejectedBrand.price);
    const priceInfluence = priceDiff / Math.max(chosenBrand.price, rejectedBrand.price) * 100;
    const brandInfluence = Math.abs(chosenBrand.brand.reputation - rejectedBrand.brand.reputation);
    const featureInfluence = Math.abs(chosenBrand.rating - rejectedBrand.rating) * 20;
    
    const choice: BrandChoice = {
      productId: currentProduct.id,
      chosenBrand: chosenBrand.brand.name,
      rejectedBrand: rejectedBrand.brand.name,
      decisionTime,
      primaryReason: reason,
      priceInfluence,
      brandInfluence,
      featureInfluence,
      category: currentProduct.category
    };
    
    setResults(prev => [...prev, choice]);
    
    const nextIndex = currentProductIndex + 1;
    if (nextIndex >= products.length) {
      setGameComplete(true);
      setGameStarted(false);
    } else {
      setCurrentProductIndex(nextIndex);
      setShowComparison(false);
      setDecisionStartTime(performance.now());
    }
  }, [currentProductIndex, decisionStartTime]);

  const startComparison = () => {
    setShowComparison(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setResults([]);
  };

  const currentProduct = products[currentProductIndex];

  return (
    <DashboardShell activeItem="games">
      <div className="mx-auto w-full max-w-4xl pb-12">
        <Card className="overflow-hidden rounded-3xl border-2 border-b-[8px] border-teal-200 bg-white">
          <CardHeader className="border-b-2 bg-teal-50 px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="mb-2 flex items-center gap-3 text-3xl font-black text-foreground">
                  🏷️ Brand Battle
                  <Badge variant="secondary" className="rounded-xl border-2 border-teal-200 bg-teal-100 px-3 py-1 text-sm font-extrabold uppercase text-teal-800">
                    Consumer Behavior
                  </Badge>
                </CardTitle>
                <p className="font-semibold text-muted-foreground">
                  Test your susceptibility to brand influence and marketing tactics.
                </p>
              </div>
              <Mascot size={80} animate={!gameStarted} />
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {!gameStarted && !gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  Let's see if you are a brand loyalist or a price conscious shopper!
                </SpeechBubble>

                <div className="flex w-full max-w-xl flex-col items-center rounded-2xl border-2 border-b-[4px] border-teal-100 bg-teal-50 p-6 text-center">
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-teal-800">How to Play</h4>
                  <p className="text-sm font-semibold text-teal-700 mb-2">1. We present you two similar products from competing brands.</p>
                  <p className="text-sm font-semibold text-teal-700 mb-2">2. Review the specs, price, and features.</p>
                  <p className="text-sm font-semibold text-teal-700">3. Choose which one you would buy and why!</p>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-teal-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-teal-400 active:translate-y-1 active:border-b-0">
                  Start Brand Battle
                </Button>
              </div>
            ) : gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  Fascinating choices! Let's analyze your consumer profile!
                </SpeechBubble>

                <div className="w-full max-w-2xl bg-white border-4 border-gray-100 rounded-3xl p-8 shadow-sm text-center">
                   <h3 className="text-2xl font-black text-teal-600 mb-4">Consumer Psychology Profile</h3>
                   <p className="text-gray-700 font-medium text-lg mb-6">
                     You show a strong preference for {results.filter(r => r.brandInfluence > 5).length > 1 ? "Brand Reputation" : "Value & Price"}. Your average decision time was {Math.round(results.reduce((a, b) => a + b.decisionTime, 0) / results.length / 1000)} seconds.
                   </p>
                   <div className="grid grid-cols-2 gap-4">
                      {results.map((r, i) => (
                        <div key={i} className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4">
                           <span className="text-teal-800 font-bold block mb-1">{r.category}</span>
                           <span className="text-gray-700 font-medium">Chose: {r.chosenBrand}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-teal-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-teal-400 active:translate-y-1 active:border-b-0">
                  Play Again
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 px-6 py-4">
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3"/> Round</span>
                      <span className="text-2xl font-black">{currentProductIndex + 1}/{products.length}</span>
                    </div>
                  </div>
                  <Button onClick={resetGame} variant="outline" className="rounded-xl border-2 font-bold shadow-sm">
                    <RotateCcw className="mr-2 h-4 w-4" /> Quit
                  </Button>
                </div>

                <div className="w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-3 rounded-full bg-teal-500 transition-all duration-300"
                    style={{ width: `${(currentProductIndex / products.length) * 100}%` }}
                  ></div>
                </div>

                {!showComparison ? (
                  <div className="space-y-6 flex flex-col items-center">
                    <div className="bg-gradient-to-br from-blue-50 to-teal-50 border-4 border-b-[8px] border-teal-200 rounded-3xl p-8 w-full text-center">
                      <h3 className="text-3xl font-black text-gray-900 mb-2">
                        {currentProduct.name}
                      </h3>
                      <p className="text-lg font-medium text-gray-600 mb-8">{currentProduct.category}</p>
                      
                      <div className="flex justify-center items-center gap-8 mb-8 text-6xl">
                         {currentProduct.brands[0].brand.logo} <span className="text-2xl font-black text-gray-400">VS</span> {currentProduct.brands[1].brand.logo}
                      </div>
                    </div>
                    <Button onClick={startComparison} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-teal-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-teal-400 active:translate-y-1 active:border-b-0">
                      Compare Specs ➜
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid md:grid-cols-2 gap-6">
                      {currentProduct.brands.map((brandData, index) => (
                        <div key={index} className="bg-white border-4 border-b-[8px] border-gray-200 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden transition-all hover:-translate-y-1 hover:border-teal-300">
                          <div className={`absolute top-0 left-0 right-0 h-2 ${index === 0 ? 'bg-indigo-500' : 'bg-rose-500'}`}></div>
                          <div className="text-6xl mb-4 mt-2">{brandData.brand.logo}</div>
                          <h4 className="text-2xl font-black text-gray-900 mb-1">{brandData.brand.name}</h4>
                          <span className="text-4xl font-black text-teal-600 mb-6">${brandData.price}</span>
                          
                          <div className="w-full space-y-4 mb-6">
                             <div className="bg-gray-50 rounded-xl p-3 border-2 border-gray-100">
                                <span className="font-bold text-gray-500 uppercase text-xs tracking-wider block mb-1">Top Features</span>
                                <span className="font-semibold text-gray-800">{brandData.features.join(", ")}</span>
                             </div>
                          </div>

                          <Button onClick={() => chooseBrand(brandData.brand.id, "Prefer the features")} className={`w-full h-14 rounded-xl border-b-4 text-lg font-black uppercase text-white transition-all active:translate-y-1 active:border-b-0 ${index === 0 ? 'bg-indigo-500 border-indigo-700 hover:bg-indigo-400' : 'bg-rose-500 border-rose-700 hover:bg-rose-400'}`}>
                            Choose {brandData.brand.name}
                          </Button>
                        </div>
                      ))}
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
