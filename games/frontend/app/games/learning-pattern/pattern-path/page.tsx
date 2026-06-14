"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface Pattern {
  id: number;
  type: 'numeric' | 'geometric' | 'color' | 'spatial' | 'logical' | 'algebraic';
  sequence: any[];
  options: any[];
  correctAnswer: any;
  rule: string;
  difficulty: number;
  explanation: string;
  category: string;
}

interface PatternResult {
  patternId: number;
  correct: boolean;
  responseTime: number;
  attempts: number;
  difficulty: number;
  patternType: string;
  category: string;
}

interface LearningMetrics {
  patternRecognitionSpeed: number;
  accuracyTrend: number[];
  difficultyProgression: number;
  strongPatternTypes: string[];
  weakPatternTypes: string[];
  learningStyle: 'Visual' | 'Logical' | 'Sequential' | 'Intuitive' | 'Analytical';
}

export default function PatternPath() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [results, setResults] = useState<PatternResult[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [responseStartTime, setResponseStartTime] = useState<number>(0);
  const [attempts, setAttempts] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState(1);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const generatePatterns = (): Pattern[] => {
    const patterns: Pattern[] = [];
    
    // Numeric Sequences
    patterns.push({
      id: 1,
      type: 'numeric',
      category: 'Arithmetic Progression',
      sequence: [2, 5, 8, 11, 14, '?'],
      options: [16, 17, 18, 19],
      correctAnswer: 17,
      rule: 'Add 3 to each number',
      difficulty: 1,
      explanation: 'This is an arithmetic sequence where each number increases by 3: 2+3=5, 5+3=8, 8+3=11, 11+3=14, 14+3=17'
    });

    patterns.push({
      id: 2,
      type: 'numeric',
      category: 'Geometric Progression',
      sequence: [2, 6, 18, 54, '?'],
      options: [108, 162, 216, 270],
      correctAnswer: 162,
      rule: 'Multiply by 3',
      difficulty: 2,
      explanation: 'Each number is multiplied by 3: 2×3=6, 6×3=18, 18×3=54, 54×3=162'
    });

    patterns.push({
      id: 3,
      type: 'numeric',
      category: 'Fibonacci-like',
      sequence: [1, 1, 2, 3, 5, 8, '?'],
      options: [11, 13, 15, 16],
      correctAnswer: 13,
      rule: 'Sum of previous two numbers',
      difficulty: 3,
      explanation: 'Each number is the sum of the two preceding numbers: 1+1=2, 1+2=3, 2+3=5, 3+5=8, 5+8=13'
    });

    // Geometric Patterns
    patterns.push({
      id: 4,
      type: 'geometric',
      category: 'Shape Rotation',
      sequence: ['▲', '▶', '▼', '◀', '?'],
      options: ['▲', '▶', '▼', '◀'],
      correctAnswer: '▲',
      rule: 'Rotate 90° clockwise',
      difficulty: 2,
      explanation: 'Each shape rotates 90 degrees clockwise. After ◀ (left), comes ▲ (up) to complete the cycle.'
    });

    patterns.push({
      id: 5,
      type: 'color',
      category: 'Color Sequence',
      sequence: ['🔴', '🟡', '🔵', '🔴', '🟡', '?'],
      options: ['🔴', '🟡', '🔵', '🟢'],
      correctAnswer: '🔵',
      rule: 'Red, Yellow, Blue cycle',
      difficulty: 1,
      explanation: 'The pattern repeats every 3 colors: Red, Yellow, Blue. After Yellow comes Blue.'
    });

    // Spatial Patterns
    patterns.push({
      id: 6,
      type: 'spatial',
      category: 'Grid Pattern',
      sequence: ['◯', '◯◯', '◯◯◯', '◯◯◯◯', '?'],
      options: ['◯◯◯◯◯', '◯◯◯', '◯', '◯◯'],
      correctAnswer: '◯◯◯◯◯',
      rule: 'Add one circle each time',
      difficulty: 1,
      explanation: 'Each step adds one more circle: 1, 2, 3, 4, then 5 circles.'
    });

    // Logical Patterns
    patterns.push({
      id: 7,
      type: 'logical',
      category: 'Letter Pattern',
      sequence: ['A', 'C', 'E', 'G', 'I', '?'],
      options: ['J', 'K', 'L', 'M'],
      correctAnswer: 'K',
      rule: 'Skip one letter each time',
      difficulty: 2,
      explanation: 'Skip one letter in the alphabet each time: A(skip B)C(skip D)E(skip F)G(skip H)I(skip J)K'
    });

    patterns.push({
      id: 8,
      type: 'algebraic',
      category: 'Square Numbers',
      sequence: [1, 4, 9, 16, 25, '?'],
      options: [30, 32, 36, 49],
      correctAnswer: 36,
      rule: 'Perfect squares: n²',
      difficulty: 3,
      explanation: 'These are perfect squares: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36'
    });

    patterns.push({
      id: 9,
      type: 'numeric',
      category: 'Prime Numbers',
      sequence: [2, 3, 5, 7, 11, '?'],
      options: [12, 13, 14, 15],
      correctAnswer: 13,
      rule: 'Prime number sequence',
      difficulty: 4,
      explanation: 'These are consecutive prime numbers. After 11, the next prime number is 13.'
    });

    patterns.push({
      id: 10,
      type: 'geometric',
      category: 'Symbol Transformation',
      sequence: ['☆', '★', '☆☆', '★★', '☆☆☆', '?'],
      options: ['★★★', '☆★', '★☆', '☆☆☆☆'],
      correctAnswer: '★★★',
      rule: 'Alternate empty/filled, increase count',
      difficulty: 3,
      explanation: 'Pattern alternates between empty (☆) and filled (★) stars, with the count increasing: 1 empty, 1 filled, 2 empty, 2 filled, 3 empty, then 3 filled.'
    });

    patterns.push({
      id: 11,
      type: 'logical',
      category: 'Word Pattern',
      sequence: ['CAT', 'DOG', 'ELF', 'FOX', '?'],
      options: ['GOT', 'HOG', 'ICE', 'JAM'],
      correctAnswer: 'GOT',
      rule: 'Next letter in alphabet + same pattern',
      difficulty: 4,
      explanation: 'Each word starts with consecutive letters (C,D,E,F,G) and follows a specific length pattern.'
    });

    patterns.push({
      id: 12,
      type: 'numeric',
      category: 'Complex Arithmetic',
      sequence: [1, 3, 7, 15, 31, '?'],
      options: [47, 63, 79, 95],
      correctAnswer: 63,
      rule: 'Double previous and add 1',
      difficulty: 4,
      explanation: 'Each number is double the previous plus 1: 1×2+1=3, 3×2+1=7, 7×2+1=15, 15×2+1=31, 31×2+1=63'
    });

    patterns.push({
      id: 13,
      type: 'spatial',
      category: 'Matrix Pattern',
      sequence: ['█▓▒░', '▓▒░█', '▒░█▓', '?'],
      options: ['░█▓▒', '█▓▒░', '▓▒░█', '▒░█▓'],
      correctAnswer: '░█▓▒',
      rule: 'Rotate symbols left by one position',
      difficulty: 3,
      explanation: 'Each pattern shifts all symbols one position to the left, with the first symbol moving to the end.'
    });

    patterns.push({
      id: 14,
      type: 'algebraic',
      category: 'Exponential Growth',
      sequence: [1, 2, 4, 8, 16, '?'],
      options: [24, 32, 48, 64],
      correctAnswer: 32,
      rule: 'Powers of 2',
      difficulty: 2,
      explanation: 'Each number is a power of 2: 2⁰=1, 2¹=2, 2²=4, 2³=8, 2⁴=16, 2⁵=32'
    });

    patterns.push({
      id: 15,
      type: 'color',
      category: 'Complex Color Pattern',
      sequence: ['🔴🔵', '🔵🟡', '🟡🟢', '🟢🔴', '?'],
      options: ['🔴🔵', '🔵🟡', '🟡🔵', '🔴🟡'],
      correctAnswer: '🔴🔵',
      rule: 'Color pairs cycle with offset',
      difficulty: 4,
      explanation: 'The pattern shows color pairs where the second color becomes the first color of the next pair, cycling through Red, Blue, Yellow, Green.'
    });

    return patterns.sort((a, b) => a.difficulty - b.difficulty);
  };

  const [patterns] = useState<Pattern[]>(generatePatterns());

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setResults([]);
    setCurrentPatternIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAttempts(0);
    setCurrentDifficulty(1);
    setStreak(0);
    setShowHint(false);
    setResponseStartTime(performance.now());
  };

  const submitAnswer = useCallback((answer: any) => {
    const responseTime = performance.now() - responseStartTime;
    const currentPattern = patterns[currentPatternIndex];
    const isCorrect = answer === currentPattern.correctAnswer;
    
    const result: PatternResult = {
      patternId: currentPattern.id,
      correct: isCorrect,
      responseTime,
      attempts: attempts + 1,
      difficulty: currentPattern.difficulty,
      patternType: currentPattern.type,
      category: currentPattern.category
    };
    
    setResults(prev => [...prev, result]);
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    if (isCorrect) {
      setStreak(prev => prev + 1);
      // Adaptive difficulty
      if (streak >= 2 && currentDifficulty < 4) {
        setCurrentDifficulty(prev => prev + 1);
      }
    } else {
      setStreak(0);
      if (currentDifficulty > 1) {
        setCurrentDifficulty(prev => prev - 1);
      }
    }
  }, [currentPatternIndex, responseStartTime, attempts, patterns, streak, currentDifficulty]);

  const nextPattern = () => {
    const nextIndex = currentPatternIndex + 1;
    if (nextIndex >= patterns.length) {
      setGameComplete(true);
      setGameStarted(false);
    } else {
      setCurrentPatternIndex(nextIndex);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAttempts(0);
      setShowHint(false);
      setResponseStartTime(performance.now());
    }
  };

  const showHintHandler = () => {
    setShowHint(true);
    setAttempts(prev => prev + 1);
  };

  // Calculate learning metrics
  const calculateLearningMetrics = (): LearningMetrics => {
    if (results.length === 0) {
      return {
        patternRecognitionSpeed: 0,
        accuracyTrend: [],
        difficultyProgression: 0,
        strongPatternTypes: [],
        weakPatternTypes: [],
        learningStyle: 'Analytical'
      };
    }

    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length / 1000;
    const patternRecognitionSpeed = Math.max(0, 100 - avgResponseTime * 2);
    
    const accuracyTrend = results.map(r => r.correct ? 1 : 0);
    
    const typeAccuracy = results.reduce((acc, r) => {
      if (!acc[r.patternType]) acc[r.patternType] = { correct: 0, total: 0 };
      acc[r.patternType].total++;
      if (r.correct) acc[r.patternType].correct++;
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);
    
    const typeScores = Object.entries(typeAccuracy).map(([type, data]) => ({
      type,
      accuracy: data.correct / data.total
    }));
    
    const strongPatternTypes = typeScores.filter(t => t.accuracy >= 0.8).map(t => t.type);
    const weakPatternTypes = typeScores.filter(t => t.accuracy < 0.6).map(t => t.type);
    
    // Determine learning style
    let learningStyle: 'Visual' | 'Logical' | 'Sequential' | 'Intuitive' | 'Analytical' = 'Analytical';
    const fastResponses = results.filter(r => r.responseTime < 10000).length;
    const geometricAccuracy = typeAccuracy['geometric']?.correct / (typeAccuracy['geometric']?.total || 1) || 0;
    const logicalAccuracy = typeAccuracy['logical']?.correct / (typeAccuracy['logical']?.total || 1) || 0;
    
    if (geometricAccuracy > 0.8) learningStyle = 'Visual';
    else if (logicalAccuracy > 0.8) learningStyle = 'Logical';
    else if (fastResponses >= results.length * 0.7) learningStyle = 'Intuitive';
    else if (avgResponseTime > 30) learningStyle = 'Analytical';
    else learningStyle = 'Sequential';
    
    return {
      patternRecognitionSpeed,
      accuracyTrend,
      difficultyProgression: currentDifficulty,
      strongPatternTypes,
      weakPatternTypes,
      learningStyle
    };
  };

  const metrics = calculateLearningMetrics();
  const currentPattern = patterns[currentPatternIndex];
  const accuracy = results.length > 0 ? (results.filter(r => r.correct).length / results.length) * 100 : 0;
  if (!gameStarted && !gameComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧩 Pattern Path
              <Badge variant="secondary">Pattern Recognition</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Predict the next element in sequences following hidden logic. Advanced pattern recognition assessment.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">🎯 What You'll Discover</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Pattern recognition speed and accuracy</li>
                  <li>• Implicit learning capabilities</li>
                  <li>• Logical reasoning strengths</li>
                  <li>• Learning style identification</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">🧠 Pattern Types</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Numeric sequences & arithmetic progressions</li>
                  <li>• Geometric & spatial transformations</li>
                  <li>• Color & symbol patterns</li>
                  <li>• Logical & algebraic relationships</li>
                </ul>
              </div>
            </div>
            <div className="text-center mt-6">
              <Button onClick={startGame} size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                Start Pattern Recognition 🧩
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
              🏆 Pattern Recognition Results
              <Badge variant="secondary">Analysis Complete</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your pattern recognition and implicit learning assessment
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{Math.round(accuracy)}%</div>
                    <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{Math.round(metrics.patternRecognitionSpeed)}/100</div>
                    <p className="text-sm text-muted-foreground">Recognition Speed</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{metrics.learningStyle}</div>
                    <p className="text-sm text-muted-foreground">Learning Style</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">Level {metrics.difficultyProgression}</div>
                    <p className="text-sm text-muted-foreground">Final Difficulty</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💪 Strong Pattern Types</CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.strongPatternTypes.length > 0 ? (
                    <div className="space-y-2">
                      {metrics.strongPatternTypes.map((type, index) => (
                        <Badge key={index} variant="default" className="mr-2 mb-2">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Continue practicing to identify your strongest pattern types.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">� Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.weakPatternTypes.length > 0 ? (
                    <div className="space-y-2">
                      {metrics.weakPatternTypes.map((type, index) => (
                        <Badge key={index} variant="outline" className="mr-2 mb-2">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Great job! No significant weak areas identified.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">🧠 Learning Style Analysis: {metrics.learningStyle}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Characteristics:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {metrics.learningStyle === 'Visual' ? (
                        <>
                          <li>• Excels at geometric and spatial patterns</li>
                          <li>• Processes visual information quickly</li>
                          <li>• Strong at symbol and color recognition</li>
                          <li>• Benefits from visual representations</li>
                        </>
                      ) : metrics.learningStyle === 'Logical' ? (
                        <>
                          <li>• Strong at logical and algebraic patterns</li>
                          <li>• Methodical problem-solving approach</li>
                          <li>• Excels at rule-based sequences</li>
                          <li>• Benefits from structured explanations</li>
                        </>
                      ) : metrics.learningStyle === 'Intuitive' ? (
                        <>
                          <li>• Quick pattern recognition</li>
                          <li>• Relies on gut feelings and insights</li>
                          <li>• Fast decision-making process</li>
                          <li>• Benefits from immediate feedback</li>
                        </>
                      ) : metrics.learningStyle === 'Analytical' ? (
                        <>
                          <li>• Thorough analysis before answering</li>
                          <li>• Considers multiple possibilities</li>
                          <li>• Strong at complex patterns</li>
                          <li>• Benefits from detailed explanations</li>
                        </>
                      ) : (
                        <>
                          <li>• Balanced approach to pattern recognition</li>
                          <li>• Adapts strategy to pattern type</li>
                          <li>• Consistent performance across categories</li>
                          <li>• Benefits from varied practice</li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Optimization Strategies:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {metrics.learningStyle === 'Visual' ? (
                        <>
                          <li>• Practice with visual aids and diagrams</li>
                          <li>• Use color coding for complex patterns</li>
                          <li>• Work with mind maps and flowcharts</li>
                          <li>• Focus on spatial reasoning exercises</li>
                        </>
                      ) : metrics.learningStyle === 'Logical' ? (
                        <>
                          <li>• Break patterns into logical steps</li>
                          <li>• Practice mathematical sequences</li>
                          <li>• Use systematic elimination methods</li>
                          <li>• Study formal pattern rules</li>
                        </>
                      ) : metrics.learningStyle === 'Intuitive' ? (
                        <>
                          <li>• Trust initial pattern insights</li>
                          <li>• Practice rapid pattern exposure</li>
                          <li>• Use timed pattern exercises</li>
                          <li>• Develop pattern intuition through volume</li>
                        </>
                      ) : metrics.learningStyle === 'Analytical' ? (
                        <>
                          <li>• Take time to analyze complex patterns</li>
                          <li>• Use systematic comparison methods</li>
                          <li>• Study pattern explanations thoroughly</li>
                          <li>• Practice metacognitive strategies</li>
                        </>
                      ) : (
                        <>
                          <li>• Continue varied pattern practice</li>
                          <li>• Adapt strategies to pattern complexity</li>
                          <li>• Maintain balanced approach</li>
                          <li>• Focus on consistency improvement</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">📊 Detailed Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result, index) => {
                    const pattern = patterns.find(p => p.id === result.patternId);
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{pattern?.category}</h4>
                            <p className="text-sm text-muted-foreground capitalize">
                              {result.patternType} Pattern • Difficulty {result.difficulty}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={result.correct ? "default" : "destructive"}>
                              {result.correct ? "✓ Correct" : "✗ Incorrect"}
                            </Badge>
                            <Badge variant="outline">
                              {Math.round(result.responseTime / 1000)}s
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Rule:</span> {pattern?.rule}
                        </div>
                        {result.attempts > 1 && (
                          <div className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">Attempts:</span> {result.attempts}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                    <h4 className="font-semibold mb-2">Pattern Recognition in Daily Life:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Mathematical problem solving</li>
                      <li>• Programming and algorithm design</li>
                      <li>• Music and artistic composition</li>
                      <li>• Scientific hypothesis formation</li>
                      <li>• Financial market analysis</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Cognitive Benefits:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Enhanced logical reasoning</li>
                      <li>• Improved working memory</li>
                      <li>• Better abstract thinking</li>
                      <li>• Stronger analytical skills</li>
                      <li>• Increased mental flexibility</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-6 space-x-4">
              <Button onClick={startGame} variant="default">
                Practice Again 🧩
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
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              🧩 Pattern Path
              <Badge variant="secondary">Pattern {currentPatternIndex + 1}/15</Badge>
              <Badge variant="outline">Difficulty {currentPattern?.difficulty}</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Streak: <span className="font-bold text-green-600">{streak}</span>
              </div>
              <Progress value={((currentPatternIndex + 1) / patterns.length) * 100} className="w-32" />
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Find the pattern and predict the next element in the sequence.
          </p>
        </CardHeader>
      </Card>

      {!showExplanation ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {currentPattern?.category}
              <Badge variant="outline" className="ml-2 capitalize">
                {currentPattern?.type}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-semibold mb-4">Find the pattern:</h3>
                <div className="flex justify-center items-center gap-3 text-2xl font-mono bg-muted p-4 rounded-lg">
                  {currentPattern?.sequence.map((item, index) => (
                    <span key={index} className={index === currentPattern.sequence.length - 1 ? 'text-blue-600 font-bold' : ''}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {showHint && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">Hint:</span> {currentPattern?.rule}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {currentPattern?.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="lg"
                    onClick={() => submitAnswer(option)}
                    className="h-16 text-lg font-mono hover:bg-blue-50"
                  >
                    {option}
                  </Button>
                ))}
              </div>

              <div className="text-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={showHintHandler}
                  disabled={showHint}
                >
                  💡 Show Hint
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedAnswer === currentPattern?.correctAnswer ? (
                <>
                  <span className="text-green-600">✓ Correct!</span>
                  <Badge variant="default">+10 points</Badge>
                </>
              ) : (
                <>
                  <span className="text-red-600">✗ Incorrect</span>
                  <Badge variant="destructive">Try again next time</Badge>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Explanation:</h4>
                <p className="text-sm text-muted-foreground">{currentPattern?.explanation}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Your Answer:</span>
                  <div className="font-bold text-lg">{selectedAnswer}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Correct Answer:</span>
                  <div className="font-bold text-lg text-green-600">{currentPattern?.correctAnswer}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Response Time:</span>
                  <div className="font-bold">{Math.round((performance.now() - responseStartTime) / 1000)}s</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Pattern Rule:</span>
                  <div className="font-bold">{currentPattern?.rule}</div>
                </div>
              </div>

              <div className="text-center">
                <Button onClick={nextPattern} size="lg">
                  {currentPatternIndex + 1 >= patterns.length ? 'Complete Assessment' : 'Next Pattern'} →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="font-bold text-lg">{Math.round(accuracy)}%</div>
              <div className="text-muted-foreground">Accuracy</div>
            </div>
            <div>
              <div className="font-bold text-lg">{results.filter(r => r.correct).length}</div>
              <div className="text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="font-bold text-lg">{streak}</div>
              <div className="text-muted-foreground">Current Streak</div>
            </div>
            <div>
              <div className="font-bold text-lg">Level {currentDifficulty}</div>
              <div className="text-muted-foreground">Difficulty</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}