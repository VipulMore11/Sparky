"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Mascot, SpeechBubble } from '@/components/mascot';
import { RotateCcw, Target } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  emotionImage?: string;
}

export default function MoodMirror() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const questions: Question[] = [
    {
      id: 1,
      question: 'Which facial movements indicate a genuine smile?',
      emotionImage: '😊',
      options: [
        'Mouth corners up only',
        'Eyes crinkle and mouth corners up',
        'Upper lip raise',
        'Chin raise'
      ],
      correctAnswer: 1,
      explanation: 'A genuine smile (Duchenne smile) involves both the mouth and the eyes wrinkling at the corners.'
    },
    {
      id: 2,
      question: 'Micro-expressions usually last for how long?',
      emotionImage: '😳',
      options: [
        '1-2 seconds',
        'A fraction of a second (1/25th to 1/5th)',
        '3-5 seconds',
        'Until the person speaks'
      ],
      correctAnswer: 1,
      explanation: 'Micro-expressions are involuntary facial expressions that last only a fraction of a second.'
    },
    {
      id: 3,
      question: 'A colleague shows contempt through an asymmetrical expression. What does this mean?',
      emotionImage: '😒',
      options: [
        'Mild disagreement',
        'Feeling of superiority or disrespect',
        'Confusion',
        'Suppressed anger'
      ],
      correctAnswer: 1,
      explanation: 'Contempt is uniquely asymmetrical, typically involving one side of the mouth lifting, signaling feelings of superiority.'
    },
    {
      id: 4,
      question: 'During a presentation, a coworker touches their neck frequently while maintaining a calm face. This suggests:',
      emotionImage: '🤔',
      options: [
        'Complete comfort',
        'Underlying stress or nervousness',
        'Disagreement',
        'Boredom'
      ],
      correctAnswer: 1,
      explanation: 'Self-soothing or pacifying behaviors like touching the neck often leak underlying stress, even if the face looks calm.'
    }
  ];

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowExplanation(false);
    setSelectedAnswer(null);
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === questions[currentQuestionIndex].correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 25);
    }
    
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= questions.length) {
      setGameComplete(true);
      setGameStarted(false);
    } else {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowExplanation(false);
    setSelectedAnswer(null);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <DashboardShell activeItem="games">
      <div className="mx-auto w-full max-w-4xl pb-12">
        <Card className="overflow-hidden rounded-3xl border-2 border-b-[8px] border-indigo-200 bg-white">
          <CardHeader className="border-b-2 bg-indigo-50 px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="mb-2 flex items-center gap-3 text-3xl font-black text-foreground">
                  😊 Mood Mirror
                  <Badge variant="secondary" className="rounded-xl border-2 border-indigo-200 bg-indigo-100 px-3 py-1 text-sm font-extrabold uppercase text-indigo-800">
                    Social & Emotional
                  </Badge>
                </CardTitle>
                <p className="font-semibold text-muted-foreground">
                  Can you read people's true emotions?
                </p>
              </div>
              <Mascot size={80} animate={!gameStarted} />
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {!gameStarted && !gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  Sometimes faces tell secrets that words hide! Let's see if you can spot the hidden emotions.
                </SpeechBubble>

                <div className="flex w-full max-w-xl flex-col items-center rounded-2xl border-2 border-b-[4px] border-indigo-100 bg-indigo-50 p-6 text-center">
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-indigo-800">How to Play</h4>
                  <p className="text-sm font-semibold text-indigo-700 mb-2">1. Look closely at the scenario or expression.</p>
                  <p className="text-sm font-semibold text-indigo-700 mb-2">2. Analyze the body language and micro-expressions.</p>
                  <p className="text-sm font-semibold text-indigo-700">3. Choose the correct underlying emotion!</p>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-indigo-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-indigo-400 active:translate-y-1 active:border-b-0">
                  Start Reading Faces
                </Button>
              </div>
            ) : gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  {score >= 75 ? "Amazing! You're a human lie detector!" : "Good effort! Reading faces takes practice."}
                </SpeechBubble>

                <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-8 text-center max-w-md w-full">
                  <span className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">Final Score</span>
                  <span className="text-6xl font-black text-indigo-600 mb-4">{score}</span>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${score}%` }}></div>
                  </div>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-indigo-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-indigo-400 active:translate-y-1 active:border-b-0">
                  Play Again
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 px-6 py-4">
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3"/> Challenge</span>
                      <span className="text-2xl font-black">{currentQuestionIndex + 1}/{questions.length}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Score</span>
                      <span className="text-2xl font-black text-indigo-600">⭐ {score}</span>
                    </div>
                  </div>
                  <Button onClick={resetGame} variant="outline" className="rounded-xl border-2 font-bold shadow-sm">
                    <RotateCcw className="mr-2 h-4 w-4" /> Quit
                  </Button>
                </div>

                <div className="w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-3 rounded-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
                  ></div>
                </div>

                {!showExplanation ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-b-[8px] border-blue-200 rounded-3xl p-8 text-center">
                      {currentQuestion.emotionImage && (
                        <div className="text-8xl mb-6 animate-bounce">
                          {currentQuestion.emotionImage}
                        </div>
                      )}
                      <h3 className="text-2xl font-black text-gray-900 leading-tight">
                        {currentQuestion.question}
                      </h3>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswer(index)}
                          className="flex flex-col items-center justify-center p-6 rounded-2xl border-4 border-b-[6px] border-gray-200 bg-white text-center transition-all hover:-translate-y-1 hover:border-indigo-300 hover:bg-indigo-50 active:translate-y-1 active:border-b-4"
                        >
                          <span className="font-bold text-gray-800 text-lg">{option}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`text-center bg-white border-4 rounded-3xl p-8 shadow-sm ${selectedAnswer === currentQuestion.correctAnswer ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <div className="text-6xl mb-4">
                        {selectedAnswer === currentQuestion.correctAnswer ? '✅' : '❌'}
                      </div>
                      <h3 className={`text-3xl font-black mb-6 ${selectedAnswer === currentQuestion.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedAnswer === currentQuestion.correctAnswer ? 'Spot On!' : 'Not Quite!'}
                      </h3>
                      
                      <div className="bg-white border-4 border-gray-100 rounded-2xl p-6 text-left">
                        <h4 className="font-black text-gray-900 uppercase text-sm mb-2">The Science Behind It</h4>
                        <p className="text-gray-800 font-medium text-lg">{currentQuestion.explanation}</p>
                      </div>
                    </div>

                    <Button onClick={nextQuestion} className="h-16 w-full rounded-2xl border-b-4 bg-indigo-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-indigo-400 active:translate-y-1 active:border-b-0">
                      Next Challenge ➜
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
