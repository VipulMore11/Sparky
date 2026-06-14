"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface GameRule {
  id: string;
  name: string;
  description: string;
  instruction: string;
  symbol: string;
  color: string;
  evaluate: (stimulus: Stimulus) => boolean;
}

interface Stimulus {
  id: number;
  symbol: string;
  color: string;
  size: 'small' | 'medium' | 'large';
  position: 'left' | 'center' | 'right';
  background: string;
  count: number;
}

interface TrialResult {
  trialNumber: number;
  stimulus: Stimulus;
  response: boolean;
  correct: boolean;
  responseTime: number;
  currentRule: string;
  ruleSwitchTrial: boolean;
  switchCost: number;
  adaptationTime: number;
}

interface CognitiveMetrics {
  overallAccuracy: number;
  averageResponseTime: number;
  switchCost: number;
  adaptationSpeed: number;
  ruleMaintenanceAbility: number;
  flexibilityIndex: number;
  cognitiveProfile: 'Highly Flexible' | 'Moderately Flexible' | 'Rigid' | 'Inconsistent';
}

export default function SymbolSwitch() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [currentRule, setCurrentRule] = useState<GameRule | null>(null);
  const [stimulus, setStimulus] = useState<Stimulus | null>(null);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [trialStartTime, setTrialStartTime] = useState<number>(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [showRuleChange, setShowRuleChange] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [lastRuleSwitch, setLastRuleSwitch] = useState(0);
  const [isRuleSwitchTrial, setIsRuleSwitchTrial] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const TOTAL_TRIALS = 80;
  const RULE_SWITCH_FREQUENCY = 8; // Switch rules every 8-12 trials

  const gameRules: GameRule[] = [
    {
      id: 'color_red',
      name: 'Red Rule',
      description: 'Respond YES to red symbols',
      instruction: 'Press YES if the symbol is RED',
      symbol: '🔴',
      color: 'text-red-600',
      evaluate: (stimulus) => stimulus.color === 'red'
    },
    {
      id: 'color_blue',
      name: 'Blue Rule',
      description: 'Respond YES to blue symbols',
      instruction: 'Press YES if the symbol is BLUE',
      symbol: '🔵',
      color: 'text-blue-600',
      evaluate: (stimulus) => stimulus.color === 'blue'
    },
    {
      id: 'shape_circle',
      name: 'Circle Rule',
      description: 'Respond YES to circle symbols',
      instruction: 'Press YES if the shape is a CIRCLE',
      symbol: '⭕',
      color: 'text-purple-600',
      evaluate: (stimulus) => stimulus.symbol.includes('●') || stimulus.symbol.includes('🔴') || stimulus.symbol.includes('🔵') || stimulus.symbol.includes('⭕')
    },
    {
      id: 'shape_square',
      name: 'Square Rule',
      description: 'Respond YES to square symbols',
      instruction: 'Press YES if the shape is a SQUARE',
      symbol: '⬜',
      color: 'text-green-600',
      evaluate: (stimulus) => stimulus.symbol.includes('■') || stimulus.symbol.includes('⬜') || stimulus.symbol.includes('🟥') || stimulus.symbol.includes('🟦')
    },
    {
      id: 'size_large',
      name: 'Large Rule',
      description: 'Respond YES to large symbols',
      instruction: 'Press YES if the symbol is LARGE',
      symbol: '🔍',
      color: 'text-orange-600',
      evaluate: (stimulus) => stimulus.size === 'large'
    },
    {
      id: 'count_multiple',
      name: 'Multiple Rule',
      description: 'Respond YES to multiple symbols',
      instruction: 'Press YES if there are MULTIPLE symbols',
      symbol: '🔢',
      color: 'text-indigo-600',
      evaluate: (stimulus) => stimulus.count > 1
    },
    {
      id: 'position_center',
      name: 'Center Rule',
      description: 'Respond YES to center-positioned symbols',
      instruction: 'Press YES if the symbol is in the CENTER',
      symbol: '🎯',
      color: 'text-pink-600',
      evaluate: (stimulus) => stimulus.position === 'center'
    },
    {
      id: 'background_dark',
      name: 'Dark Background Rule',
      description: 'Respond YES to symbols on dark backgrounds',
      instruction: 'Press YES if the background is DARK',
      symbol: '🌙',
      color: 'text-gray-600',
      evaluate: (stimulus) => stimulus.background === 'dark'
    }
  ];

  const symbols = ['●', '■', '▲', '♦', '★', '⭐', '🔴', '🔵', '🟥', '🟦', '⬜', '⬛', '🟨', '🟩'];
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  const sizes = ['small', 'medium', 'large'] as const;
  const positions = ['left', 'center', 'right'] as const;
  const backgrounds = ['light', 'dark'] as const;

  const generateStimulus = (): Stimulus => {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const count = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 2 : 1;

    return {
      id: Date.now(),
      symbol,
      color,
      size,
      position,
      background,
      count
    };
  };

  const selectNewRule = (): GameRule => {
    const availableRules = gameRules.filter(rule => rule.id !== currentRule?.id);
    return availableRules[Math.floor(Math.random() * availableRules.length)];
  };

  const shouldSwitchRule = (): boolean => {
    const trialsSinceSwitch = currentTrial - lastRuleSwitch;
    const minTrials = RULE_SWITCH_FREQUENCY;
    const maxTrials = RULE_SWITCH_FREQUENCY + 4;
    
    if (trialsSinceSwitch >= maxTrials) return true;
    if (trialsSinceSwitch >= minTrials && Math.random() > 0.6) return true;
    return false;
  };

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setCurrentTrial(0);
    setResults([]);
    setScore(0);
    setFeedback('');
    setConsecutiveCorrect(0);
    setLastRuleSwitch(0);
    setIsRuleSwitchTrial(false);
    
    const initialRule = gameRules[Math.floor(Math.random() * gameRules.length)];
    setCurrentRule(initialRule);
    setShowRuleChange(true);
    
    setTimeout(() => {
      setShowRuleChange(false);
      startTrial();
    }, 3000);
  };

  const startTrial = () => {
    // Check if we should switch rules
    const shouldSwitch = shouldSwitchRule();
    
    if (shouldSwitch && currentRule) {
      const newRule = selectNewRule();
      setCurrentRule(newRule);
      setLastRuleSwitch(currentTrial);
      setIsRuleSwitchTrial(true);
      setShowRuleChange(true);
      
      setTimeout(() => {
        setShowRuleChange(false);
        const newStimulus = generateStimulus();
        setStimulus(newStimulus);
        setTrialStartTime(performance.now());
      }, 2000);
    } else {
      setIsRuleSwitchTrial(false);
      const newStimulus = generateStimulus();
      setStimulus(newStimulus);
      setTrialStartTime(performance.now());
    }
  };

  const handleResponse = useCallback((response: boolean) => {
    if (!stimulus || !currentRule) return;
    
    const responseTime = performance.now() - trialStartTime;
    const correct = currentRule.evaluate(stimulus) === response;
    
    // Calculate switch cost and adaptation metrics
    const previousResults = results.slice(-5);
    const baselineRT = previousResults
      .filter(r => !r.ruleSwitchTrial)
      .reduce((sum, r) => sum + r.responseTime, 0) / Math.max(previousResults.filter(r => !r.ruleSwitchTrial).length, 1);
    
    const switchCost = isRuleSwitchTrial ? Math.max(0, responseTime - baselineRT) : 0;
    const adaptationTime = isRuleSwitchTrial ? responseTime : 0;
    
    const result: TrialResult = {
      trialNumber: currentTrial + 1,
      stimulus,
      response,
      correct,
      responseTime,
      currentRule: currentRule.id,
      ruleSwitchTrial: isRuleSwitchTrial,
      switchCost,
      adaptationTime
    };
    
    setResults(prev => [...prev, result]);
    
    if (correct) {
      setScore(prev => prev + (isRuleSwitchTrial ? 15 : 10));
      setConsecutiveCorrect(prev => prev + 1);
      setFeedback('✓ Correct!');
    } else {
      setConsecutiveCorrect(0);
      setFeedback('✗ Incorrect');
    }
    
    // Show feedback briefly
    setTimeout(() => {
      setFeedback('');
      const nextTrial = currentTrial + 1;
      
      if (nextTrial >= TOTAL_TRIALS) {
        setGameComplete(true);
        setGameStarted(false);
      } else {
        setCurrentTrial(nextTrial);
        startTrial();
      }
    }, 1000);
  }, [stimulus, currentRule, trialStartTime, currentTrial, results, isRuleSwitchTrial]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameStarted || showRuleChange || !stimulus) return;
      
      if (event.key === 'ArrowLeft' || event.key === 'z' || event.key === 'Z') {
        handleResponse(false);
      } else if (event.key === 'ArrowRight' || event.key === 'x' || event.key === 'X') {
        handleResponse(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, showRuleChange, stimulus, handleResponse]);

  // Calculate cognitive metrics
  const calculateMetrics = (): CognitiveMetrics => {
    if (results.length === 0) {
      return {
        overallAccuracy: 0,
        averageResponseTime: 0,
        switchCost: 0,
        adaptationSpeed: 0,
        ruleMaintenanceAbility: 0,
        flexibilityIndex: 0,
        cognitiveProfile: 'Inconsistent'
      };
    }
    
    const accuracy = (results.filter(r => r.correct).length / results.length) * 100;
    const avgRT = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    
    const switchTrials = results.filter(r => r.ruleSwitchTrial);
    const nonSwitchTrials = results.filter(r => !r.ruleSwitchTrial);
    
    const switchRT = switchTrials.length > 0 ? 
      switchTrials.reduce((sum, r) => sum + r.responseTime, 0) / switchTrials.length : 0;
    const nonSwitchRT = nonSwitchTrials.length > 0 ? 
      nonSwitchTrials.reduce((sum, r) => sum + r.responseTime, 0) / nonSwitchTrials.length : 0;
    
    const switchCost = switchRT - nonSwitchRT;
    
    const switchAccuracy = switchTrials.length > 0 ?
      (switchTrials.filter(r => r.correct).length / switchTrials.length) * 100 : 0;
    const nonSwitchAccuracy = nonSwitchTrials.length > 0 ?
      (nonSwitchTrials.filter(r => r.correct).length / nonSwitchTrials.length) * 100 : 0;
    
    const adaptationSpeed = switchTrials.length > 0 ?
      100 - (switchCost / avgRT * 100) : 100;
    
    const ruleMaintenanceAbility = nonSwitchAccuracy;
    const flexibilityIndex = (switchAccuracy + adaptationSpeed) / 2;
    
    let cognitiveProfile: 'Highly Flexible' | 'Moderately Flexible' | 'Rigid' | 'Inconsistent';
    if (flexibilityIndex >= 80 && switchCost < avgRT * 0.3) {
      cognitiveProfile = 'Highly Flexible';
    } else if (flexibilityIndex >= 60 && switchCost < avgRT * 0.5) {
      cognitiveProfile = 'Moderately Flexible';
    } else if (ruleMaintenanceAbility >= 70 && switchCost > avgRT * 0.5) {
      cognitiveProfile = 'Rigid';
    } else {
      cognitiveProfile = 'Inconsistent';
    }
    
    return {
      overallAccuracy: accuracy,
      averageResponseTime: avgRT,
      switchCost,
      adaptationSpeed,
      ruleMaintenanceAbility,
      flexibilityIndex,
      cognitiveProfile
    };
  };

  const metrics = calculateMetrics();

  const getStimulusDisplay = () => {
    if (!stimulus) return null;
    
    const sizeClass = stimulus.size === 'small' ? 'text-2xl' : 
                     stimulus.size === 'medium' ? 'text-4xl' : 'text-6xl';
    const colorClass = `text-${stimulus.color}-600`;
    const positionClass = stimulus.position === 'left' ? 'justify-start' : 
                         stimulus.position === 'center' ? 'justify-center' : 'justify-end';
    const backgroundClass = stimulus.background === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
    
    const symbols = Array(stimulus.count).fill(stimulus.symbol);
    
    return (
      <div className={`${backgroundClass} rounded-lg p-8 min-h-[200px] flex items-center ${positionClass}`}>
        <div className={`${sizeClass} ${colorClass} flex gap-2`}>
          {symbols.map((sym, index) => (
            <span key={index}>{sym}</span>
          ))}
        </div>
      </div>
    );
  };
  if (!gameStarted && !gameComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔄 Symbol Switch
              <Badge variant="secondary">Cognitive Flexibility</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Rules change mid-game; adapt quickly to new task demands. Advanced cognitive flexibility assessment.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">🎯 What You'll Discover</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Cognitive flexibility and adaptability</li>
                  <li>• Rule switching efficiency (switch cost)</li>
                  <li>• Mental set maintenance ability</li>
                  <li>• Adaptation speed to new rules</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">🧠 How It Works</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Follow the current rule to respond YES/NO</li>
                  <li>• Rules change unexpectedly during the game</li>
                  <li>• Adapt quickly to new task demands</li>
                  <li>• Use keyboard: ← (NO) or → (YES)</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">🎮 Controls</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">← or Z</Badge>
                  <span>NO Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">→ or X</Badge>
                  <span>YES Response</span>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <Button onClick={startGame} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Start Cognitive Flexibility Test 🔄
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
              🏆 Cognitive Flexibility Results
              <Badge variant="secondary">Assessment Complete</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your cognitive flexibility and rule-switching performance analysis
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{Math.round(metrics.overallAccuracy)}%</div>
                    <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{Math.round(metrics.flexibilityIndex)}</div>
                    <p className="text-sm text-muted-foreground">Flexibility Index</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{Math.round(metrics.switchCost)}ms</div>
                    <p className="text-sm text-muted-foreground">Switch Cost</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{metrics.cognitiveProfile}</div>
                    <p className="text-sm text-muted-foreground">Cognitive Profile</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Rule Maintenance</span>
                        <span>{Math.round(metrics.ruleMaintenanceAbility)}%</span>
                      </div>
                      <Progress value={metrics.ruleMaintenanceAbility} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Adaptation Speed</span>
                        <span>{Math.round(metrics.adaptationSpeed)}%</span>
                      </div>
                      <Progress value={metrics.adaptationSpeed} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Cognitive Flexibility</span>
                        <span>{Math.round(metrics.flexibilityIndex)}%</span>
                      </div>
                      <Progress value={metrics.flexibilityIndex} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">⚡ Response Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Response Time:</span>
                      <span className="font-medium">{Math.round(metrics.averageResponseTime)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Switch Cost:</span>
                      <span className="font-medium">{Math.round(metrics.switchCost)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Trials:</span>
                      <span className="font-medium">{results.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rule Switches:</span>
                      <span className="font-medium">{results.filter(r => r.ruleSwitchTrial).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Final Score:</span>
                      <span className="font-medium text-blue-600">{score} points</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">🧠 Cognitive Profile: {metrics.cognitiveProfile}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Characteristics:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {metrics.cognitiveProfile === 'Highly Flexible' ? (
                        <>
                          <li>• Excellent adaptation to rule changes</li>
                          <li>• Minimal switch costs</li>
                          <li>• Quick recovery from errors</li>
                          <li>• Strong cognitive control</li>
                        </>
                      ) : metrics.cognitiveProfile === 'Moderately Flexible' ? (
                        <>
                          <li>• Good adaptation with some adjustment time</li>
                          <li>• Moderate switch costs</li>
                          <li>• Steady performance improvement</li>
                          <li>• Balanced cognitive approach</li>
                        </>
                      ) : metrics.cognitiveProfile === 'Rigid' ? (
                        <>
                          <li>• Strong rule maintenance</li>
                          <li>• Higher switch costs</li>
                          <li>• Preference for consistent rules</li>
                          <li>• Detailed-oriented approach</li>
                        </>
                      ) : (
                        <>
                          <li>• Variable performance patterns</li>
                          <li>• Inconsistent adaptation</li>
                          <li>• Mixed rule maintenance</li>
                          <li>• Developing cognitive control</li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {metrics.cognitiveProfile === 'Highly Flexible' ? (
                        <>
                          <li>• Challenge yourself with complex tasks</li>
                          <li>• Mentor others in adaptability</li>
                          <li>• Maintain flexibility through practice</li>
                          <li>• Explore creative problem-solving</li>
                        </>
                      ) : metrics.cognitiveProfile === 'Moderately Flexible' ? (
                        <>
                          <li>• Practice rapid task-switching</li>
                          <li>• Work on reducing switch costs</li>
                          <li>• Develop metacognitive awareness</li>
                          <li>• Try mindfulness training</li>
                        </>
                      ) : metrics.cognitiveProfile === 'Rigid' ? (
                        <>
                          <li>• Practice cognitive flexibility exercises</li>
                          <li>• Work on letting go of previous rules</li>
                          <li>• Develop tolerance for uncertainty</li>
                          <li>• Try improvisation activities</li>
                        </>
                      ) : (
                        <>
                          <li>• Focus on consistent practice</li>
                          <li>• Develop stable strategies</li>
                          <li>• Work on attention control</li>
                          <li>• Consider working memory training</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">📈 Performance Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.filter((_, index) => index % 10 === 0 || results[index].ruleSwitchTrial).slice(-10).map((result, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Badge variant={result.correct ? "default" : "destructive"}>
                          Trial {result.trialNumber}
                        </Badge>
                        {result.ruleSwitchTrial && (
                          <Badge variant="outline" className="text-orange-600">
                            Rule Switch
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {Math.round(result.responseTime)}ms
                        </span>
                        <span className={result.correct ? 'text-green-600' : 'text-red-600'}>
                          {result.correct ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎓 Educational Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Cognitive Flexibility in Life:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Adapting to workplace changes</li>
                      <li>• Learning new technologies</li>
                      <li>• Problem-solving in complex situations</li>
                      <li>• Managing unexpected challenges</li>
                      <li>• Creative thinking and innovation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Benefits of Training:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Improved executive function</li>
                      <li>• Better stress management</li>
                      <li>• Enhanced learning ability</li>
                      <li>• Stronger mental resilience</li>
                      <li>• Increased cognitive control</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-6 space-x-4">
              <Button onClick={startGame} variant="default">
                Test Again 🔄
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

  if (showRuleChange) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              🔄 Rule Change!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <div className={`text-6xl mb-4 ${currentRule?.color}`}>
              {currentRule?.symbol}
            </div>
            <h3 className="text-xl font-bold mb-2">{currentRule?.name}</h3>
            <p className="text-lg text-muted-foreground mb-4">{currentRule?.instruction}</p>
            <div className="text-sm text-muted-foreground">
              Get ready... New rule starting soon!
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              🔄 Symbol Switch
              <Badge variant="secondary">Trial {currentTrial + 1}/{TOTAL_TRIALS}</Badge>
              {isRuleSwitchTrial && (
                <Badge variant="outline" className="text-orange-600">
                  Switch Trial
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Streak: <span className="font-bold text-green-600">{consecutiveCorrect}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Score: <span className="font-bold text-blue-600">{score}</span>
              </div>
              <Progress value={((currentTrial + 1) / TOTAL_TRIALS) * 100} className="w-32" />
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Current Rule Display */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-2">
              <span className={`text-2xl ${currentRule?.color}`}>{currentRule?.symbol}</span>
              <h3 className="text-lg font-bold">{currentRule?.name}</h3>
            </div>
            <p className="text-muted-foreground">{currentRule?.instruction}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stimulus Display */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {getStimulusDisplay()}
        </CardContent>
      </Card>

      {/* Response Buttons */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <Button
              onClick={() => handleResponse(false)}
              size="lg"
              variant="outline"
              className="h-20 text-lg hover:bg-red-50 hover:border-red-300"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">✗</div>
                <div>NO</div>
                <div className="text-xs text-muted-foreground">← or Z</div>
              </div>
            </Button>
            <Button
              onClick={() => handleResponse(true)}
              size="lg"
              variant="outline"
              className="h-20 text-lg hover:bg-green-50 hover:border-green-300"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">✓</div>
                <div>YES</div>
                <div className="text-xs text-muted-foreground">→ or X</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      {feedback && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-xl font-bold ${feedback.includes('Correct') ? 'text-green-600' : 'text-red-600'}`}>
                {feedback}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Performance */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="font-bold text-lg">{Math.round(metrics.overallAccuracy)}%</div>
              <div className="text-muted-foreground">Accuracy</div>
            </div>
            <div>
              <div className="font-bold text-lg">{Math.round(metrics.averageResponseTime)}ms</div>
              <div className="text-muted-foreground">Avg Speed</div>
            </div>
            <div>
              <div className="font-bold text-lg">{Math.round(metrics.switchCost)}ms</div>
              <div className="text-muted-foreground">Switch Cost</div>
            </div>
            <div>
              <div className="font-bold text-lg">{Math.round(metrics.flexibilityIndex)}</div>
              <div className="text-muted-foreground">Flexibility</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}