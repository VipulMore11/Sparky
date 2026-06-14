"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  originalPrice: number;
  currentPrice: number;
  category: 'electronics' | 'clothing' | 'home' | 'beauty' | 'food' | 'books';
  imageEmoji: string;
  description: string;
  urgencyTrigger?: string;
  socialProof?: string;
  scarcityMessage?: string;
  emotionalTrigger?: 'fear' | 'joy' | 'envy' | 'comfort' | 'status' | 'nostalgia';
  addedToCart?: boolean;
  viewTime?: number;
  isFlashSale?: boolean;
  flashSaleTimeLeft?: number;
}

interface ShoppingSession {
  sessionId: number;
  scenario: string;
  emotionalState: 'stressed' | 'happy' | 'bored' | 'sad' | 'excited' | 'anxious';
  budget: number;
  timeLimit: number;
  products: Product[];
  triggerTypes: string[];
}

interface PurchaseDecision {
  productId: number;
  purchased: boolean;
  viewTime: number;
  decisionTime: number;
  emotionalInfluence: string;
  priceInfluence: number;
  urgencyInfluence: boolean;
  sessionBudgetRemaining: number;
}

export default function ImpulseCart() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSession, setCurrentSession] = useState<ShoppingSession | null>(null);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [cart, setCart] = useState<Product[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [results, setResults] = useState<PurchaseDecision[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(0);
  const [productViewStartTime, setProductViewStartTime] = useState<number>(0);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  const shoppingSessions: ShoppingSession[] = [
    {
      sessionId: 1,
      scenario: "Late Night Stress Shopping",
      emotionalState: 'stressed',
      budget: 150,
      timeLimit: 90,
      triggerTypes: ['Urgency', 'Comfort', 'Scarcity'],
      products: [
        {
          id: 1,
          name: "Wireless Noise-Cancelling Headphones",
          originalPrice: 299,
          currentPrice: 199,
          category: 'electronics',
          imageEmoji: '🎧',
          description: "Block out the world's chaos with premium noise cancellation",
          urgencyTrigger: "Flash Sale ends in 2 hours!",
          emotionalTrigger: 'comfort',
          scarcityMessage: "Only 3 left in stock",
          isFlashSale: true,
          flashSaleTimeLeft: 120
        },
        {
          id: 2,
          name: "Luxury Stress-Relief Candle Set",
          originalPrice: 89,
          currentPrice: 59,
          category: 'home',
          imageEmoji: '🕯️',
          description: "Aromatherapy to melt your stress away",
          socialProof: "4.9★ - 'Life-changing for my anxiety' - Sarah M.",
          emotionalTrigger: 'comfort',
          urgencyTrigger: "Limited time: 33% off"
        },
        {
          id: 3,
          name: "Gourmet Comfort Food Bundle",
          originalPrice: 45,
          currentPrice: 32,
          category: 'food',
          imageEmoji: '🍫',
          description: "Premium chocolates and teas for instant comfort",
          emotionalTrigger: 'comfort',
          socialProof: "Bestseller - Over 10,000 sold this month"
        },
        {
          id: 4,
          name: "Weighted Anxiety Blanket",
          originalPrice: 129,
          currentPrice: 89,
          category: 'home',
          imageEmoji: '🛏️',
          description: "Scientific stress relief for better sleep",
          emotionalTrigger: 'comfort',
          urgencyTrigger: "Price increases tomorrow!",
          scarcityMessage: "Low stock - High demand"
        }
      ]
    },
    {
      sessionId: 2,
      scenario: "Happy Friday Celebration Shopping",
      emotionalState: 'happy',
      budget: 200,
      timeLimit: 120,
      triggerTypes: ['Social Proof', 'Status', 'Joy'],
      products: [
        {
          id: 5,
          name: "Designer Smartwatch",
          originalPrice: 399,
          currentPrice: 299,
          category: 'electronics',
          imageEmoji: '⌚',
          description: "Make a statement with luxury tech",
          socialProof: "Trending: #1 choice among young professionals",
          emotionalTrigger: 'status',
          urgencyTrigger: "Weekend special - Ends Sunday"
        },
        {
          id: 6,
          name: "Premium Skincare Celebration Kit",
          originalPrice: 156,
          currentPrice: 99,
          category: 'beauty',
          imageEmoji: '✨',
          description: "Glow up for your weekend celebrations",
          emotionalTrigger: 'joy',
          socialProof: "5,000+ glowing reviews",
          urgencyTrigger: "Flash Friday: 36% off"
        },
        {
          id: 7,
          name: "Trendy Weekend Outfit Bundle",
          originalPrice: 189,
          currentPrice: 139,
          category: 'clothing',
          imageEmoji: '👗',
          description: "Look amazing for weekend plans",
          emotionalTrigger: 'status',
          socialProof: "Instagram influencers' top pick",
          scarcityMessage: "Selling fast - Size M almost gone"
        },
        {
          id: 8,
          name: "Artisan Coffee Experience Set",
          originalPrice: 79,
          currentPrice: 59,
          category: 'food',
          imageEmoji: '☕',
          description: "Elevate your morning routine",
          emotionalTrigger: 'joy',
          socialProof: "Coffee lovers' favorite - 4.8★"
        }
      ]
    },
    {
      sessionId: 3,
      scenario: "Bored Sunday Browsing",
      emotionalState: 'bored',
      budget: 100,
      timeLimit: 180,
      triggerTypes: ['Entertainment', 'Novelty', 'Impulse'],
      products: [
        {
          id: 9,
          name: "Retro Gaming Console",
          originalPrice: 129,
          currentPrice: 89,
          category: 'electronics',
          imageEmoji: '🎮',
          description: "Nostalgia gaming with 500+ classic games",
          emotionalTrigger: 'nostalgia',
          socialProof: "Bringing back childhood memories for thousands"
        },
        {
          id: 10,
          name: "Mystery Book Box Collection",
          originalPrice: 67,
          currentPrice: 45,
          category: 'books',
          imageEmoji: '📚',
          description: "Curated thriller novels to end your boredom",
          emotionalTrigger: 'joy',
          urgencyTrigger: "Surprise selection changes weekly"
        },
        {
          id: 11,
          name: "Indoor Plant Starter Kit",
          originalPrice: 55,
          currentPrice: 39,
          category: 'home',
          imageEmoji: '🪴',
          description: "Transform your space, boost your mood",
          emotionalTrigger: 'comfort',
          socialProof: "Perfect for beginners - 4.7★"
        }
      ]
    },
    {
      sessionId: 4,
      scenario: "Payday Splurge Shopping",
      emotionalState: 'excited',
      budget: 300,
      timeLimit: 150,
      triggerTypes: ['Luxury', 'Status', 'Reward'],
      products: [
        {
          id: 12,
          name: "Professional Camera Upgrade",
          originalPrice: 899,
          currentPrice: 649,
          category: 'electronics',
          imageEmoji: '📸',
          description: "Capture life's moments like a pro",
          emotionalTrigger: 'status',
          urgencyTrigger: "Payday special - This week only",
          socialProof: "Photographer's choice - Award winning"
        },
        {
          id: 13,
          name: "Luxury Fitness Gear Set",
          originalPrice: 199,
          currentPrice: 149,
          category: 'clothing',
          imageEmoji: '💪',
          description: "Premium gear for your fitness journey",
          emotionalTrigger: 'status',
          socialProof: "Celebrities' secret workout gear"
        },
        {
          id: 14,
          name: "Smart Home Assistant Bundle",
          originalPrice: 279,
          currentPrice: 199,
          category: 'electronics',
          imageEmoji: '🏠',
          description: "Future-proof your home with AI",
          emotionalTrigger: 'status',
          urgencyTrigger: "Early adopter pricing"
        }
      ]
    }
  ];

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setResults([]);
    setSessionIndex(0);
    setCart([]);
    startSession(0);
  };

  const startSession = (index: number) => {
    const session = shoppingSessions[index];
    setCurrentSession(session);
    setCurrentBudget(session.budget);
    setTimeRemaining(session.timeLimit);
    setCurrentProductIndex(0);
    setShowProductDetails(false);
    setSessionStartTime(performance.now());
    
    // Start countdown
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const viewProduct = (productIndex: number) => {
    setCurrentProductIndex(productIndex);
    setShowProductDetails(true);
    setProductViewStartTime(performance.now());
  };

  const addToCart = useCallback((product: Product) => {
    const viewTime = performance.now() - productViewStartTime;
    const decisionTime = performance.now() - sessionStartTime;
    
    if (currentBudget >= product.currentPrice) {
      setCart(prev => [...prev, product]);
      setCurrentBudget(prev => prev - product.currentPrice);
      
      const decision: PurchaseDecision = {
        productId: product.id,
        purchased: true,
        viewTime,
        decisionTime,
        emotionalInfluence: product.emotionalTrigger || 'none',
        priceInfluence: Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100),
        urgencyInfluence: !!product.urgencyTrigger,
        sessionBudgetRemaining: currentBudget - product.currentPrice
      };
      
      setResults(prev => [...prev, decision]);
    }
    
    setShowProductDetails(false);
  }, [currentBudget, productViewStartTime, sessionStartTime]);

  const skipProduct = useCallback(() => {
    const viewTime = performance.now() - productViewStartTime;
    const decisionTime = performance.now() - sessionStartTime;
    const product = currentSession?.products[currentProductIndex];
    
    if (product) {
      const decision: PurchaseDecision = {
        productId: product.id,
        purchased: false,
        viewTime,
        decisionTime,
        emotionalInfluence: product.emotionalTrigger || 'none',
        priceInfluence: Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100),
        urgencyInfluence: !!product.urgencyTrigger,
        sessionBudgetRemaining: currentBudget
      };
      
      setResults(prev => [...prev, decision]);
    }
    
    setShowProductDetails(false);
  }, [currentSession, currentProductIndex, productViewStartTime, sessionStartTime, currentBudget]);

  const endSession = () => {
    const nextSessionIndex = sessionIndex + 1;
    if (nextSessionIndex >= shoppingSessions.length) {
      setGameComplete(true);
      setGameStarted(false);
    } else {
      setSessionIndex(nextSessionIndex);
      setTimeout(() => startSession(nextSessionIndex), 2000);
    }
  };

  // Calculate statistics
  const totalSpent = cart.reduce((sum, item) => sum + item.currentPrice, 0);
  const totalPurchases = results.filter(r => r.purchased).length;
  const averageDecisionTime = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.decisionTime, 0) / results.length / 1000)
    : 0;
  
  const emotionalInfluences = results.reduce((acc, r) => {
    if (r.purchased) {
      acc[r.emotionalInfluence] = (acc[r.emotionalInfluence] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const impulsePurchases = results.filter(r => r.purchased && r.viewTime < 10000).length;
  const urgencyInfluenced = results.filter(r => r.purchased && r.urgencyInfluence).length;

  const getShopperProfile = () => {
    const purchaseRate = results.length > 0 ? (totalPurchases / results.length) * 100 : 0;
    const avgDecisionSpeed = averageDecisionTime;
    
    if (purchaseRate >= 80 && avgDecisionSpeed < 15) {
      return { type: 'Impulse Shopper', color: 'text-red-600', desc: 'Quick decisions, high purchase rate, susceptible to triggers' };
    } else if (purchaseRate >= 60 && avgDecisionSpeed < 25) {
      return { type: 'Emotional Buyer', color: 'text-orange-600', desc: 'Purchases driven by feelings and social proof' };
    } else if (purchaseRate <= 40 && avgDecisionSpeed > 30) {
      return { type: 'Rational Consumer', color: 'text-green-600', desc: 'Thoughtful decisions, resistant to pressure tactics' };
    } else if (purchaseRate >= 50 && avgDecisionSpeed > 25) {
      return { type: 'Considered Purchaser', color: 'text-blue-600', desc: 'Balanced approach, weighs options carefully' };
    } else {
      return { type: 'Browsing Explorer', color: 'text-purple-600', desc: 'Enjoys looking but selective about purchases' };
    }
  };

  const shopperProfile = getShopperProfile();
  const currentProduct = currentSession?.products[currentProductIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="text-blue-600 hover:text-blue-800">
              ← Back to Games
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛍️</span>
              <Badge variant="secondary">Consumer Psychology</Badge>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Impulse Cart Challenge
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Experience how emotions, time pressure, and marketing psychology influence your spending decisions
          </p>
        </CardHeader>

        <CardContent>
          {!gameStarted && !gameComplete && (
            <div className="text-center space-y-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-green-900">Shopping Psychology Experiment</h3>
                <div className="text-left space-y-3 text-green-800">
                  <p>• Navigate 4 different shopping scenarios with varying emotional states</p>
                  <p>• Experience realistic marketing triggers: scarcity, urgency, social proof</p>
                  <p>• Make quick decisions under time pressure and budget constraints</p>
                  <p>• Discover your consumer behavior patterns and spending triggers</p>
                  <p>• Learn how emotions and psychology influence purchasing decisions</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl mb-2">�</div>
                  <div className="text-sm font-medium">Stress Shopping</div>
                  <div className="text-xs text-gray-500">Comfort purchases</div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl mb-2">🎉</div>
                  <div className="text-sm font-medium">Celebration Mode</div>
                  <div className="text-xs text-gray-500">Status & luxury</div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl mb-2">😴</div>
                  <div className="text-sm font-medium">Boredom Browsing</div>
                  <div className="text-xs text-gray-500">Entertainment shopping</div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-sm font-medium">Payday Splurge</div>
                  <div className="text-xs text-gray-500">Reward spending</div>
                </div>
              </div>
              
              <Button 
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3"
              >
                Start Shopping Challenge
              </Button>
              
              <div className="text-sm text-gray-500">
                <p>
                  <strong>Duration:</strong> 15-20 minutes • <strong>Scenarios:</strong> 4 shopping sessions
                </p>
              </div>
            </div>
          )}

          {gameStarted && currentSession && !showProductDetails && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {currentSession.scenario}
                  </h3>
                  <Badge className="bg-purple-600">
                    Session {sessionIndex + 1}/4
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-600">${currentBudget}</div>
                    <div className="text-xs text-gray-500">Budget Remaining</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-lg font-bold text-red-600">{timeRemaining}s</div>
                    <div className="text-xs text-gray-500">Time Left</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-lg font-bold text-green-600">{cart.length}</div>
                    <div className="text-xs text-gray-500">Items in Cart</div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    Emotional State: <span className="font-semibold capitalize">{currentSession.emotionalState}</span>
                  </div>
                  <Progress value={(1 - timeRemaining / currentSession.timeLimit) * 100} className="w-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentSession.products.map((product, index) => (
                  <Card 
                    key={product.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300"
                    onClick={() => viewProduct(index)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-4xl mb-2">{product.imageEmoji}</div>
                        <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                        
                        <div className="flex justify-center items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-green-600">
                            ${product.currentPrice}
                          </span>
                          {product.originalPrice !== product.currentPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>

                        {product.originalPrice !== product.currentPrice && (
                          <Badge variant="destructive" className="mb-2">
                            {Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100)}% OFF
                          </Badge>
                        )}

                        {product.urgencyTrigger && (
                          <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                            <div className="text-xs font-semibold text-red-700">
                              ⏰ {product.urgencyTrigger}
                            </div>
                          </div>
                        )}

                        {product.scarcityMessage && (
                          <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-2">
                            <div className="text-xs font-semibold text-orange-700">
                              🔥 {product.scarcityMessage}
                            </div>
                          </div>
                        )}

                        {product.socialProof && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2">
                            <div className="text-xs text-blue-700">
                              👥 {product.socialProof}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {cart.length > 0 && (
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Shopping Cart ({cart.length} items)</h4>
                    <div className="flex flex-wrap gap-2">
                      {cart.map((item, index) => (
                        <Badge key={index} variant="secondary">
                          {item.imageEmoji} ${item.currentPrice}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-right mt-2 font-bold">
                      Total: ${totalSpent}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {showProductDetails && currentProduct && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">{currentProduct.imageEmoji}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentProduct.name}
                    </h3>
                    <p className="text-gray-700 mb-4">{currentProduct.description}</p>
                    
                    <div className="flex justify-center items-center gap-4 mb-4">
                      <div className="text-3xl font-bold text-green-600">
                        ${currentProduct.currentPrice}
                      </div>
                      {currentProduct.originalPrice !== currentProduct.currentPrice && (
                        <div className="text-lg text-gray-500 line-through">
                          ${currentProduct.originalPrice}
                        </div>
                      )}
                    </div>

                    {currentProduct.originalPrice !== currentProduct.currentPrice && (
                      <Badge variant="destructive" className="text-lg p-2">
                        SAVE ${currentProduct.originalPrice - currentProduct.currentPrice}!
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    {currentProduct.urgencyTrigger && (
                      <div className="bg-red-100 border-2 border-red-300 rounded-lg p-3 animate-pulse">
                        <div className="text-red-800 font-bold text-center">
                          ⚡ {currentProduct.urgencyTrigger}
                        </div>
                      </div>
                    )}

                    {currentProduct.scarcityMessage && (
                      <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-3">
                        <div className="text-orange-800 font-semibold text-center">
                          🔥 {currentProduct.scarcityMessage}
                        </div>
                      </div>
                    )}

                    {currentProduct.socialProof && (
                      <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3">
                        <div className="text-blue-800 font-medium text-center">
                          👥 {currentProduct.socialProof}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 justify-center mt-6">
                    <Button 
                      onClick={() => addToCart(currentProduct)}
                      disabled={currentBudget < currentProduct.currentPrice}
                      className="bg-green-600 hover:bg-green-700 text-white px-8"
                      size="lg"
                    >
                      {currentBudget < currentProduct.currentPrice 
                        ? 'Insufficient Budget' 
                        : `Add to Cart - $${currentProduct.currentPrice}`
                      }
                    </Button>
                    <Button 
                      onClick={skipProduct}
                      variant="outline"
                      size="lg"
                    >
                      Skip This Item
                    </Button>
                  </div>

                  <div className="text-center mt-4 text-sm text-gray-600">
                    Budget Remaining: ${currentBudget} | Time: {timeRemaining}s
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {gameComplete && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-4">�</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Shopping Psychology Analysis Complete!
                </h3>
                <div className={`text-xl font-semibold ${shopperProfile.color} mb-2`}>
                  {shopperProfile.type}
                </div>
                <p className="text-gray-700">{shopperProfile.desc}</p>
              </div>

              <Card className="bg-gradient-to-br from-green-50 to-blue-50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">💰 Spending Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-2xl font-bold text-green-600">${totalSpent}</div>
                      <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-2xl font-bold text-blue-600">{totalPurchases}</div>
                      <div className="text-sm text-gray-600">Items Purchased</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-2xl font-bold text-purple-600">{averageDecisionTime}s</div>
                      <div className="text-sm text-gray-600">Avg Decision Time</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-2xl font-bold text-orange-600">{impulsePurchases}</div>
                      <div className="text-sm text-gray-600">Impulse Buys</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-purple-900 mb-4">🧠 Psychology Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-800 mb-3">Emotional Triggers</h5>
                      <div className="space-y-2">
                        {Object.entries(emotionalInfluences).map(([emotion, count]) => (
                          <div key={emotion} className="flex justify-between">
                            <span className="capitalize">{emotion}:</span>
                            <span className="font-semibold">{count} purchases</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 mb-3">Marketing Influence</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Urgency influenced:</span>
                          <span className="font-semibold">{urgencyInfluenced} purchases</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quick decisions (&lt;10s):</span>
                          <span className="font-semibold">{impulsePurchases} purchases</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">🎓 Consumer Behavior Lessons</h4>
                  <div className="space-y-2 text-blue-800">
                    {shopperProfile.type === 'Impulse Shopper' && (
                      <>
                        <p>• You're highly responsive to marketing triggers and time pressure</p>
                        <p>• Consider implementing a 24-hour wait rule for non-essential purchases</p>
                        <p>• Be aware of emotional states that trigger spending</p>
                      </>
                    )}
                    {shopperProfile.type === 'Emotional Buyer' && (
                      <>
                        <p>• Your purchases are strongly influenced by emotions and social proof</p>
                        <p>• Practice recognizing emotional triggers before shopping</p>
                        <p>• Question whether purchases address real needs or emotional states</p>
                      </>
                    )}
                    {shopperProfile.type === 'Rational Consumer' && (
                      <>
                        <p>• You demonstrate excellent resistance to marketing pressure</p>
                        <p>• Your thoughtful approach helps avoid unnecessary spending</p>
                        <p>• Continue using this analytical mindset for financial wellness</p>
                      </>
                    )}
                    {urgencyInfluenced > 0 && (
                      <p>• You responded to {urgencyInfluenced} urgency tactics - be aware of artificial scarcity</p>
                    )}
                    {impulsePurchases > 2 && (
                      <p>• Consider creating shopping lists and budgets to reduce impulse buying</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                >
                  Shop Again
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/games">Back to Games</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}