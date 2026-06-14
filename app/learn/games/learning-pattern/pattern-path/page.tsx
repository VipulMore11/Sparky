"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Mascot, SpeechBubble } from '@/components/mascot';
import { RotateCcw, Target } from 'lucide-react';

interface Pattern {
  id: number;
  category: string;
  sequence: any[];
  options: any[];
  correctAnswer: any;
  rule: string;
}

export default function PatternPath() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const patterns: Pattern[] = [
    {
      id: 1,
      category: 'Math Magic',
      sequence: [2, 4, 6, 8, '?'],
      options: [9, 10, 11, 12],
      correctAnswer: 10,
      rule: 'Add 2 each time! Easy peasy.'
    },
    {
      id: 2,
      category: 'Shape Shifter',
      sequence: ['▲', '▶', '▼', '◀', '?'],
      options: ['▲', '▶', '▼', '◀'],
      correctAnswer: '▲',
      rule: 'The triangle is spinning clockwise like a clock hand!'
    },
    {
      id: 3,
      category: 'Color Cycle',
      sequence: ['🔴', '🟡', '🔵', '🔴', '🟡', '?'],
      options: ['🔴', '🟡', '🔵', '🟢'],
      correctAnswer: '🔵',
      rule: 'Red, Yellow, Blue! The colors repeat in a loop.'
    },
    {
      id: 4,
      category: 'Leaping Letters',
      sequence: ['A', 'C', 'E', 'G', '?'],
      options: ['H', 'I', 'J', 'K'],
      correctAnswer: 'I',
      rule: 'Skip every other letter! A (skip B) C (skip D) E...'
    },
    {
      id: 5,
      category: 'Super Size',
      sequence: ['◯', '◯◯', '◯◯◯', '◯◯◯◯', '?'],
      options: ['◯◯◯◯◯', '◯◯', '◯', '◯◯◯'],
      correctAnswer: '◯◯◯◯◯',
      rule: 'Just add one more circle each time!'
    }
  ];

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setCurrentPatternIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setStreak(0);
  };

  const submitAnswer = (answer: any) => {
    const currentPattern = patterns[currentPatternIndex];
    const isCorrect = answer === currentPattern.correctAnswer;
    
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    if (isCorrect) {
      setStreak(prev => prev + 1);
      setScore(prev => prev + 20);
    } else {
      setStreak(0);
    }
  };

  const nextPattern = () => {
    const nextIndex = currentPatternIndex + 1;
    if (nextIndex >= patterns.length) {
      setGameComplete(true);
      setGameStarted(false);
    } else {
      setCurrentPatternIndex(nextIndex);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setCurrentPatternIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
  };

  const currentPattern = patterns[currentPatternIndex];

  return (
    <DashboardShell activeItem="games">
      <div className="mx-auto w-full max-w-4xl pb-12">
        <Card className="overflow-hidden rounded-3xl border-2 border-b-[8px] border-pink-200 bg-white">
          <CardHeader className="border-b-2 bg-pink-50 px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="mb-2 flex items-center gap-3 text-3xl font-black text-foreground">
                  🧩 Pattern Path
                  <Badge variant="secondary" className="rounded-xl border-2 border-pink-200 bg-pink-100 px-3 py-1 text-sm font-extrabold uppercase text-pink-800">
                    Learning & Logic
                  </Badge>
                </CardTitle>
                <p className="font-semibold text-muted-foreground">
                  Crack the code and figure out what comes next!
                </p>
              </div>
              <Mascot size={80} animate={!gameStarted} />
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {!gameStarted && !gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  Hey detective! We need your help to finish these puzzles. Look closely at the clues!
                </SpeechBubble>

                <div className="flex w-full max-w-xl flex-col items-center rounded-2xl border-2 border-b-[4px] border-pink-100 bg-pink-50 p-6 text-center">
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-pink-800">How to Play</h4>
                  <p className="text-sm font-semibold text-pink-700 mb-2">1. Look at the sequence of items.</p>
                  <p className="text-sm font-semibold text-pink-700 mb-2">2. Figure out the secret rule that connects them.</p>
                  <p className="text-sm font-semibold text-pink-700">3. Pick the missing piece that comes next!</p>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-pink-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-pink-400 active:translate-y-1 active:border-b-0">
                  Start Puzzle Solving
                </Button>
              </div>
            ) : gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  {score >= 80 ? "Amazing! You're a true puzzle master!" : "Great practice! Every puzzle makes your brain stronger."}
                </SpeechBubble>

                <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-8 text-center max-w-md w-full">
                  <span className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">Final Score</span>
                  <span className="text-6xl font-black text-pink-600 mb-4">{score}</span>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500" style={{ width: `${score}%` }}></div>
                  </div>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-pink-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-pink-400 active:translate-y-1 active:border-b-0">
                  Play Again
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 px-6 py-4">
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3"/> Puzzle</span>
                      <span className="text-2xl font-black">{currentPatternIndex + 1}/{patterns.length}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-pink-600">Score</span>
                      <span className="text-2xl font-black text-pink-600">⭐ {score}</span>
                    </div>
                  </div>
                  <Button onClick={resetGame} variant="outline" className="rounded-xl border-2 font-bold shadow-sm">
                    <RotateCcw className="mr-2 h-4 w-4" /> Quit
                  </Button>
                </div>

                <div className="w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-3 rounded-full bg-pink-500 transition-all duration-300"
                    style={{ width: `${((currentPatternIndex) / patterns.length) * 100}%` }}
                  ></div>
                </div>

                {!showExplanation ? (
                  <div className="space-y-8">
                    <div className="text-center bg-blue-50 border-4 border-b-[8px] border-blue-200 rounded-3xl p-8">
                      <Badge className="bg-white text-blue-700 font-bold border-2 border-blue-200 mb-4 text-sm px-4 py-1 hover:bg-white/90">
                        {currentPattern.category}
                      </Badge>
                      <h3 className="text-2xl font-black uppercase text-blue-900 mb-6 tracking-tight">What comes next?</h3>
                      
                      <div className="flex justify-center items-center gap-2 sm:gap-4 flex-wrap">
                        {currentPattern.sequence.map((item, index) => (
                          <div 
                            key={index} 
                            className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 text-3xl font-black rounded-2xl shadow-sm border-4 border-b-[6px] 
                              ${index === currentPattern.sequence.length - 1 
                                ? 'bg-pink-100 border-pink-300 text-pink-600 animate-pulse' 
                                : 'bg-white border-blue-100 text-blue-800'}`}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {currentPattern.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => submitAnswer(option)}
                          className="flex flex-col items-center justify-center h-24 rounded-2xl border-4 border-b-[8px] border-indigo-200 bg-indigo-50 text-3xl font-black text-indigo-700 transition-all hover:-translate-y-1 hover:bg-indigo-100 active:translate-y-1 active:border-b-4"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border-4 border-b-[8px] transition-all
                      ${selectedAnswer === currentPattern.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
                    `}>
                      <div className="text-6xl mb-4">
                        {selectedAnswer === currentPattern.correctAnswer ? '🌟' : '🤔'}
                      </div>
                      <div className={`text-3xl font-black uppercase tracking-tight mb-2
                        ${selectedAnswer === currentPattern.correctAnswer ? 'text-green-700' : 'text-red-700'}
                      `}>
                        {selectedAnswer === currentPattern.correctAnswer ? 'Perfect Match!' : 'Not quite right!'}
                      </div>
                      
                      <div className="flex items-center gap-6 mt-6 bg-white p-4 rounded-2xl border-2">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold uppercase text-gray-500 mb-1">Your Answer</span>
                          <span className={`text-3xl font-black ${selectedAnswer === currentPattern.correctAnswer ? 'text-green-500' : 'text-red-500'}`}>
                            {selectedAnswer}
                          </span>
                        </div>
                        {selectedAnswer !== currentPattern.correctAnswer && (
                          <>
                            <div className="w-px h-12 bg-gray-200"></div>
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-bold uppercase text-gray-500 mb-1">Correct Answer</span>
                              <span className="text-3xl font-black text-green-500">{currentPattern.correctAnswer}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 border-4 border-blue-200 p-6 rounded-2xl flex items-start gap-4">
                      <div className="text-4xl">💡</div>
                      <div>
                        <h4 className="font-bold text-blue-900 uppercase tracking-widest text-sm mb-1">The Secret Rule</h4>
                        <p className="text-blue-800 font-medium">{currentPattern.rule}</p>
                      </div>
                    </div>

                    <Button onClick={nextPattern} className="h-16 w-full rounded-2xl border-b-4 bg-blue-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-blue-400 active:translate-y-1 active:border-b-0">
                      Next Puzzle ➜
                    </Button>
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
