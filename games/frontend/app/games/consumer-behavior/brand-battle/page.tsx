"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

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
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'specs'>('overview');

  const brands: Brand[] = [
    {
      id: 'apple',
      name: 'Apple',
      logo: '🍎',
      color: 'text-gray-600',
      reputation: 95,
      priceLevel: 'premium',
      country: 'USA',
      foundedYear: 1976,
      marketShare: 25
    },
    {
      id: 'samsung',
      name: 'Samsung',
      logo: '📱',
      color: 'text-blue-600',
      reputation: 88,
      priceLevel: 'mid-range',
      country: 'South Korea',
      foundedYear: 1938,
      marketShare: 22
    },
    {
      id: 'nike',
      name: 'Nike',
      logo: '✔️',
      color: 'text-black',
      reputation: 92,
      priceLevel: 'premium',
      country: 'USA',
      foundedYear: 1964,
      marketShare: 18
    },
    {
      id: 'adidas',
      name: 'Adidas',
      logo: '👟',
      color: 'text-blue-700',
      reputation: 87,
      priceLevel: 'premium',
      country: 'Germany',
      foundedYear: 1949,
      marketShare: 12
    },
    {
      id: 'coca-cola',
      name: 'Coca-Cola',
      logo: '🥤',
      color: 'text-red-600',
      reputation: 89,
      priceLevel: 'mid-range',
      country: 'USA',
      foundedYear: 1886,
      marketShare: 42
    },
    {
      id: 'pepsi',
      name: 'Pepsi',
      logo: '🔵',
      color: 'text-blue-500',
      reputation: 82,
      priceLevel: 'mid-range',
      country: 'USA',
      foundedYear: 1893,
      marketShare: 28
    },
    {
      id: 'tesla',
      name: 'Tesla',
      logo: '⚡',
      color: 'text-red-500',
      reputation: 91,
      priceLevel: 'luxury',
      country: 'USA',
      foundedYear: 2003,
      marketShare: 8
    },
    {
      id: 'bmw',
      name: 'BMW',
      logo: '🚗',
      color: 'text-blue-800',
      reputation: 90,
      priceLevel: 'luxury',
      country: 'Germany',
      foundedYear: 1916,
      marketShare: 6
    },
    {
      id: 'netflix',
      name: 'Netflix',
      logo: '📺',
      color: 'text-red-700',
      reputation: 86,
      priceLevel: 'mid-range',
      country: 'USA',
      foundedYear: 1997,
      marketShare: 35
    },
    {
      id: 'disney',
      name: 'Disney+',
      logo: '🏰',
      color: 'text-blue-600',
      reputation: 88,
      priceLevel: 'mid-range',
      country: 'USA',
      foundedYear: 1923,
      marketShare: 18
    }
  ];

  const products: Product[] = [
    {
      id: 1,
      category: 'Smartphones',
      name: 'Premium Smartphone',
      decisionFactors: ['Performance', 'Camera Quality', 'Brand Prestige', 'Price'],
      brands: [
        {
          brand: brands.find(b => b.id === 'apple')!,
          price: 1099,
          rating: 4.6,
          features: ['A17 Pro Chip', '48MP Camera System', 'Face ID', 'MagSafe'],
          pros: ['Premium build quality', 'Excellent ecosystem integration', 'Long software support'],
          cons: ['High price', 'Limited customization', 'Proprietary charging'],
          marketPosition: 'Innovation leader with premium positioning',
          popularity: 95,
          innovation: 94,
          sustainability: 78,
          customerService: 92
        },
        {
          brand: brands.find(b => b.id === 'samsung')!,
          price: 899,
          rating: 4.4,
          features: ['Snapdragon 8 Gen 3', '200MP Camera', 'S Pen Support', 'Wireless Charging'],
          pros: ['Versatile features', 'Great display', 'Competitive pricing'],
          cons: ['Software bloatware', 'Shorter support cycle', 'Build quality varies'],
          marketPosition: 'Feature-rich alternative with broad appeal',
          popularity: 88,
          innovation: 87,
          sustainability: 72,
          customerService: 78
        }
      ]
    },
    {
      id: 2,
      category: 'Athletic Shoes',
      name: 'Performance Running Shoes',
      decisionFactors: ['Comfort', 'Performance', 'Style', 'Brand Image'],
      brands: [
        {
          brand: brands.find(b => b.id === 'nike')!,
          price: 180,
          rating: 4.5,
          features: ['Air Max Technology', 'Flyknit Upper', 'React Foam', 'Dri-FIT'],
          pros: ['Innovative technology', 'Strong brand appeal', 'Athlete endorsements'],
          cons: ['Premium pricing', 'Sizing inconsistency', 'Durability concerns'],
          marketPosition: 'Market leader in athletic innovation',
          popularity: 92,
          innovation: 95,
          sustainability: 68,
          customerService: 84
        },
        {
          brand: brands.find(b => b.id === 'adidas')!,
          price: 160,
          rating: 4.3,
          features: ['Boost Technology', 'Primeknit Upper', 'Continental Rubber', 'Climate'],
          pros: ['Excellent comfort', 'Sustainable materials', 'Classic design'],
          cons: ['Less marketing buzz', 'Limited color options', 'Heavier weight'],
          marketPosition: 'Heritage brand with sustainability focus',
          popularity: 85,
          innovation: 88,
          sustainability: 85,
          customerService: 82
        }
      ]
    },
    {
      id: 3,
      category: 'Soft Drinks',
      name: 'Cola Beverage',
      decisionFactors: ['Taste', 'Brand Loyalty', 'Price', 'Availability'],
      brands: [
        {
          brand: brands.find(b => b.id === 'coca-cola')!,
          price: 2.99,
          rating: 4.2,
          features: ['Original Recipe', 'Global Availability', 'Classic Taste', 'Brand Heritage'],
          pros: ['Iconic taste', 'Universal availability', 'Strong brand recognition'],
          cons: ['High sugar content', 'Environmental concerns', 'Health implications'],
          marketPosition: 'Global beverage leader with classic appeal',
          popularity: 94,
          innovation: 65,
          sustainability: 70,
          customerService: 85
        },
        {
          brand: brands.find(b => b.id === 'pepsi')!,
          price: 2.79,
          rating: 4.0,
          features: ['Sweeter Formula', 'Youth Marketing', 'Celebrity Endorsements', 'Bold Flavors'],
          pros: ['Competitive pricing', 'Younger brand image', 'Bold marketing'],
          cons: ['Second-place perception', 'Less global presence', 'Inconsistent quality'],
          marketPosition: 'Challenger brand with youthful energy',
          popularity: 82,
          innovation: 72,
          sustainability: 68,
          customerService: 79
        }
      ]
    },
    {
      id: 4,
      category: 'Electric Vehicles',
      name: 'Luxury Electric Sedan',
      decisionFactors: ['Technology', 'Performance', 'Status', 'Sustainability'],
      brands: [
        {
          brand: brands.find(b => b.id === 'tesla')!,
          price: 89990,
          rating: 4.4,
          features: ['Autopilot', '400mi Range', 'Supercharger Network', 'Over-the-air Updates'],
          pros: ['Cutting-edge technology', 'Extensive charging network', 'Continuous improvements'],
          cons: ['Build quality issues', 'Service availability', 'High price'],
          marketPosition: 'Electric vehicle pioneer and technology leader',
          popularity: 89,
          innovation: 98,
          sustainability: 92,
          customerService: 72
        },
        {
          brand: brands.find(b => b.id === 'bmw')!,
          price: 94900,
          rating: 4.2,
          features: ['iDrive System', 'Luxury Interior', 'German Engineering', 'Dynamic Handling'],
          pros: ['Premium luxury feel', 'Excellent build quality', 'Established service network'],
          cons: ['Conservative technology', 'Complex interface', 'High maintenance costs'],
          marketPosition: 'Traditional luxury with electric transition',
          popularity: 78,
          innovation: 82,
          sustainability: 78,
          customerService: 88
        }
      ]
    },
    {
      id: 5,
      category: 'Streaming Services',
      name: 'Video Streaming Platform',
      decisionFactors: ['Content Library', 'Price', 'Original Content', 'User Experience'],
      brands: [
        {
          brand: brands.find(b => b.id === 'netflix')!,
          price: 15.49,
          rating: 4.1,
          features: ['Original Series', 'Global Content', 'Download Feature', 'Multiple Profiles'],
          pros: ['Extensive content library', 'High-quality originals', 'Global availability'],
          cons: ['Increasing prices', 'Content removal', 'Algorithm limitations'],
          marketPosition: 'Streaming pioneer with global reach',
          popularity: 91,
          innovation: 88,
          sustainability: 75,
          customerService: 82
        },
        {
          brand: brands.find(b => b.id === 'disney')!,
          price: 10.99,
          rating: 4.3,
          features: ['Disney Classics', 'Marvel Content', 'Star Wars', 'Family-Friendly'],
          pros: ['Premium content brands', 'Family appeal', 'Lower price'],
          cons: ['Limited adult content', 'Smaller library', 'Recent platform'],
          marketPosition: 'Content powerhouse with family focus',
          popularity: 85,
          innovation: 78,
          sustainability: 82,
          customerService: 86
        }
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
    
    // Calculate influence factors
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
    
    // Move to next product or complete game
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

  // Calculate statistics
  const averageDecisionTime = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.decisionTime, 0) / results.length / 1000)
    : 0;
  
  const brandPreferences = results.reduce((acc, r) => {
    acc[r.chosenBrand] = (acc[r.chosenBrand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const decisionFactors = results.reduce((acc, r) => {
    acc[r.primaryReason] = (acc[r.primaryReason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averagePriceInfluence = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.priceInfluence, 0) / results.length)
    : 0;

  const getConsumerProfile = () => {
    const avgPrice = averagePriceInfluence;
    const brandInfluence = results.reduce((sum, r) => sum + r.brandInfluence, 0) / results.length;
    const quickDecisions = results.filter(r => r.decisionTime < 15000).length;
    
    if (brandInfluence > 15 && avgPrice < 20) {
      return { type: 'Brand Loyalist', color: 'text-purple-600', desc: 'Values brand reputation over price considerations' };
    } else if (avgPrice > 30 && brandInfluence < 10) {
      return { type: 'Price Conscious', color: 'text-green-600', desc: 'Primarily driven by value and cost considerations' };
    } else if (quickDecisions >= 3) {
      return { type: 'Intuitive Buyer', color: 'text-blue-600', desc: 'Makes quick decisions based on gut feeling' };
    } else if (averageDecisionTime > 45) {
      return { type: 'Analytical Consumer', color: 'text-orange-600', desc: 'Takes time to carefully evaluate all options' };
    } else {
      return { type: 'Balanced Shopper', color: 'text-gray-600', desc: 'Considers multiple factors in purchasing decisions' };
    }
  };

  const consumerProfile = getConsumerProfile();
  const currentProduct = products[currentProductIndex];
  if (!gameStarted && !gameComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚔️ Brand Battle
              <Badge variant="secondary">Consumer Behavior</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Compare competing brands and analyze your brand loyalty patterns through decision-making behavior.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">🎯 What You'll Discover</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Your brand loyalty vs. price sensitivity</li>
                  <li>• Decision-making speed and patterns</li>
                  <li>• Influence of brand reputation on choices</li>
                  <li>• Consumer behavior profile</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">📋 How It Works</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Compare 5 brand pairs across categories</li>
                  <li>• Make purchasing decisions with reasons</li>
                  <li>• Get real-time brand battle analytics</li>
                  <li>• Discover your consumer psychology profile</li>
                </ul>
              </div>
            </div>
            <div className="text-center mt-6">
              <Button onClick={startGame} size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Start Brand Battle ⚔️
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏆 Brand Battle Results
              <Badge variant="secondary">Analysis Complete</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your brand loyalty and consumer behavior analysis
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{averageDecisionTime}s</div>
                    <p className="text-sm text-muted-foreground">Average Decision Time</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${consumerProfile.color}`}>{consumerProfile.type}</div>
                    <p className="text-sm text-muted-foreground">Consumer Profile</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{averagePriceInfluence}%</div>
                    <p className="text-sm text-muted-foreground">Price Influence</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🏷️ Brand Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(brandPreferences)
                      .sort(([,a], [,b]) => b - a)
                      .map(([brand, count]) => (
                        <div key={brand} className="flex justify-between items-center">
                          <span className="font-medium">{brand}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(count / results.length) * 100} className="w-20" />
                            <span className="text-sm text-muted-foreground">{count}</span>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🎯 Decision Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(decisionFactors)
                      .sort(([,a], [,b]) => b - a)
                      .map(([factor, count]) => (
                        <div key={factor} className="flex justify-between items-center">
                          <span className="font-medium">{factor}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(count / results.length) * 100} className="w-20" />
                            <span className="text-sm text-muted-foreground">{count}</span>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">🧠 Consumer Psychology Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${consumerProfile.color} mb-2`}>
                  {consumerProfile.type}
                </div>
                <p className="text-muted-foreground mb-4">{consumerProfile.desc}</p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Key Characteristics:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      {consumerProfile.type === 'Brand Loyalist' ? (
                        <>
                          <li>• Values brand reputation and heritage</li>
                          <li>• Willing to pay premium for trusted brands</li>
                          <li>• Influenced by brand storytelling and values</li>
                        </>
                      ) : consumerProfile.type === 'Price Conscious' ? (
                        <>
                          <li>• Seeks best value for money</li>
                          <li>• Compares prices across alternatives</li>
                          <li>• Rational, feature-focused decisions</li>
                        </>
                      ) : consumerProfile.type === 'Intuitive Buyer' ? (
                        <>
                          <li>• Makes quick, gut-feeling decisions</li>
                          <li>• Trusts first impressions</li>
                          <li>• Values simplicity in choice</li>
                        </>
                      ) : consumerProfile.type === 'Analytical Consumer' ? (
                        <>
                          <li>• Thoroughly researches before buying</li>
                          <li>• Weighs multiple factors carefully</li>
                          <li>• Seeks detailed product information</li>
                        </>
                      ) : (
                        <>
                          <li>• Balances multiple decision factors</li>
                          <li>• Adapts approach to product category</li>
                          <li>• Neither purely emotional nor rational</li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Marketing Implications:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      {consumerProfile.type === 'Brand Loyalist' ? (
                        <>
                          <li>• Respond to brand heritage messaging</li>
                          <li>• Value exclusive experiences</li>
                          <li>• Influenced by brand community</li>
                        </>
                      ) : consumerProfile.type === 'Price Conscious' ? (
                        <>
                          <li>• Respond to value propositions</li>
                          <li>• Appreciate comparison charts</li>
                          <li>• Motivated by discounts and deals</li>
                        </>
                      ) : consumerProfile.type === 'Intuitive Buyer' ? (
                        <>
                          <li>• Respond to visual appeals</li>
                          <li>• Prefer simple messaging</li>
                          <li>• Influenced by first impressions</li>
                        </>
                      ) : consumerProfile.type === 'Analytical Consumer' ? (
                        <>
                          <li>• Need detailed product specs</li>
                          <li>• Value expert reviews and ratings</li>
                          <li>• Appreciate comparison tools</li>
                        </>
                      ) : (
                        <>
                          <li>• Respond to multi-faceted campaigns</li>
                          <li>• Value comprehensive information</li>
                          <li>• Influenced by context and timing</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Detailed Battle Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{result.category}</h4>
                          <p className="text-sm text-muted-foreground">
                            Chose {result.chosenBrand} over {result.rejectedBrand}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {Math.round(result.decisionTime / 1000)}s
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Reason:</span>
                          <div className="font-medium">{result.primaryReason}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Price Influence:</span>
                          <div className="font-medium">{Math.round(result.priceInfluence)}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Brand Influence:</span>
                          <div className="font-medium">{Math.round(result.brandInfluence)}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Feature Influence:</span>
                          <div className="font-medium">{Math.round(result.featureInfluence)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-6 space-x-4">
              <Button onClick={startGame} variant="default">
                Battle Again ⚔️
              </Button>
              <Link href="/games">
                <Button variant="outline">
                  Back to Games
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              ⚔️ Brand Battle
              <Badge variant="secondary">Round {currentProductIndex + 1}/5</Badge>
            </div>
            <Progress value={((currentProductIndex + 1) / products.length) * 100} className="w-32" />
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Compare the brands below and choose which you would purchase. Consider your decision carefully.
          </p>
        </CardHeader>
      </Card>

      {!showComparison ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">
              {currentProduct.category}: {currentProduct.name}
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Two competing brands are entering the arena. Ready to see how they stack up?
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl mb-4">⚔️</div>
            <p className="text-lg mb-6">
              <span className="font-bold">{currentProduct.brands[0].brand.name}</span>
              {' vs '}
              <span className="font-bold">{currentProduct.brands[1].brand.name}</span>
            </p>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Key Decision Factors:</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {currentProduct.decisionFactors.map((factor, index) => (
                  <Badge key={index} variant="outline">{factor}</Badge>
                ))}
              </div>
            </div>
            <Button onClick={startComparison} size="lg" className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700">
              Start Comparison ⚔️
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-3 mb-4">
            <Button 
              variant={selectedView === 'overview' ? 'default' : 'outline'}
              onClick={() => setSelectedView('overview')}
              size="sm"
            >
              Overview
            </Button>
            <Button 
              variant={selectedView === 'detailed' ? 'default' : 'outline'}
              onClick={() => setSelectedView('detailed')}
              size="sm"
            >
              Detailed
            </Button>
            <Button 
              variant={selectedView === 'specs' ? 'default' : 'outline'}
              onClick={() => setSelectedView('specs')}
              size="sm"
            >
              Specifications
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {currentProduct.brands.map((brandData, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${index === 0 ? 'bg-red-500' : 'bg-blue-500'}`} />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`text-3xl ${brandData.brand.color}`}>
                        {brandData.brand.logo}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{brandData.brand.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {brandData.brand.country} • Est. {brandData.brand.foundedYear}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${brandData.price.toLocaleString()}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm">{brandData.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedView === 'overview' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Market Position</h4>
                        <p className="text-sm text-muted-foreground">{brandData.marketPosition}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Market Share</p>
                          <p className="text-lg font-bold">{brandData.brand.marketShare}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Reputation</p>
                          <p className="text-lg font-bold">{brandData.brand.reputation}/100</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedView === 'detailed' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-green-600">Pros</h4>
                        <ul className="text-sm space-y-1">
                          {brandData.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">✓</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-red-600">Cons</h4>
                        <ul className="text-sm space-y-1">
                          {brandData.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-600 mt-0.5">✗</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {selectedView === 'specs' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Key Features</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {brandData.features.map((feature, i) => (
                            <Badge key={i} variant="outline" className="justify-start">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Popularity</p>
                          <Progress value={brandData.popularity} className="mt-1" />
                          <p className="text-xs mt-1">{brandData.popularity}/100</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Innovation</p>
                          <Progress value={brandData.innovation} className="mt-1" />
                          <p className="text-xs mt-1">{brandData.innovation}/100</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Sustainability</p>
                          <Progress value={brandData.sustainability} className="mt-1" />
                          <p className="text-xs mt-1">{brandData.sustainability}/100</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Customer Service</p>
                          <Progress value={brandData.customerService} className="mt-1" />
                          <p className="text-xs mt-1">{brandData.customerService}/100</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 space-y-2">
                    <h4 className="font-semibold">Why choose {brandData.brand.name}?</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => chooseBrand(brandData.brand.id, 'Better Price')}
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                      >
                        💰 Better Price
                      </Button>
                      <Button 
                        onClick={() => chooseBrand(brandData.brand.id, 'Brand Trust')}
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                      >
                        🏆 Brand Trust
                      </Button>
                      <Button 
                        onClick={() => chooseBrand(brandData.brand.id, 'Better Features')}
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                      >
                        ⚡ Better Features
                      </Button>
                      <Button 
                        onClick={() => chooseBrand(brandData.brand.id, 'Style Preference')}
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                      >
                        🎨 Style Preference
                      </Button>
                    </div>
                    <Button 
                      onClick={() => chooseBrand(brandData.brand.id, 'Overall Appeal')}
                      className={`w-full mt-3 ${index === 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      Choose {brandData.brand.name} ⚔️
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}