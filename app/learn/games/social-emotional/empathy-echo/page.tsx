"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Mascot, SpeechBubble } from '@/components/mascot';
import { RotateCcw, Target } from 'lucide-react';

interface EmotionalStory {
  id: number;
  title: string;
  context: string;
  character: string;
  emotion: string;
  situation: string;
  challenge: string;
  actions: {
    id: string;
    text: string;
    empathyScore: number;
    outcome: string;
    explanation: string;
    empathyType: 'cognitive' | 'affective' | 'compassionate' | 'dismissive';
  }[];
  category: 'friendship' | 'family' | 'workplace' | 'romantic' | 'stranger' | 'conflict';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  emotionalIntensity: 'low' | 'medium' | 'high';
}

export default function EmpathyEcho() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [selectedAction, setSelectedAction] = useState<EmotionalStory['actions'][0] | null>(null);

  const stories: EmotionalStory[] = [
    {
      id: 1,
      title: "The Overwhelmed Friend",
      context: "Your close friend Sarah has been struggling with work stress lately.",
      character: "Sarah",
      emotion: "Overwhelmed & Anxious",
      situation: "Sarah calls you crying, saying she can't handle her new job responsibilities and feels like a failure.",
      challenge: "How do you respond to support her emotional needs?",
      category: 'friendship',
      difficulty: 'basic',
      emotionalIntensity: 'high',
      actions: [
        {
          id: 'A',
          text: "Listen actively and validate: 'This sounds really overwhelming. It makes sense you'd feel this way with so much pressure.'",
          empathyScore: 95,
          empathyType: 'affective',
          outcome: "Sarah feels heard and supported. She opens up more about specific challenges.",
          explanation: "Validation and active listening provide emotional safety and encourage further sharing."
        },
        {
          id: 'B',
          text: "Offer solutions immediately: 'You just need to organize better. Have you tried making lists? What about time management apps?'",
          empathyScore: 40,
          empathyType: 'cognitive',
          outcome: "Sarah feels like you don't understand her emotional state and becomes more withdrawn.",
          explanation: "Jumping to solutions without acknowledging emotions can feel dismissive and unsupportive."
        },
        {
          id: 'C',
          text: "Minimize the problem: 'Everyone feels stressed at new jobs. You'll get used to it soon. Don't worry so much!'",
          empathyScore: 15,
          empathyType: 'dismissive',
          outcome: "Sarah feels invalidated and regrets reaching out. She ends the call feeling worse.",
          explanation: "Minimizing emotions dismisses the person's experience and can damage trust."
        },
        {
          id: 'D',
          text: "Share your experience: 'I remember feeling exactly like this at my job. Would it help to talk through what's feeling most overwhelming right now?'",
          empathyScore: 80,
          empathyType: 'compassionate',
          outcome: "Sarah feels less alone and appreciates the relatability. She's ready to discuss specifics.",
          explanation: "Sharing relevant experience shows understanding while keeping focus on their needs."
        }
      ]
    },
    {
      id: 2,
      title: "Family Disappointment",
      context: "Your teenage cousin Jake didn't get into his dream college.",
      character: "Jake",
      emotion: "Disappointed & Defeated",
      situation: "At a family gathering, Jake sits alone looking devastated. He just received his college rejection letter.",
      challenge: "How do you approach and support him during this difficult moment?",
      category: 'family',
      difficulty: 'intermediate',
      emotionalIntensity: 'high',
      actions: [
        {
          id: 'A',
          text: "Give space but show availability: 'I see you're having a tough time. I'm here if you want to talk, or just sit together quietly.'",
          empathyScore: 90,
          empathyType: 'compassionate',
          outcome: "Jake appreciates the non-pressured support and eventually opens up about his feelings.",
          explanation: "Offering presence without pressure respects autonomy while providing emotional availability."
        },
        {
          id: 'B',
          text: "Focus on silver lining: 'This is actually a blessing! You'll find an even better school. Everything happens for a reason!'",
          empathyScore: 25,
          empathyType: 'dismissive',
          outcome: "Jake feels like his disappointment is being invalidated and becomes more isolated.",
          explanation: "Forced positivity can feel dismissive when someone needs to process difficult emotions."
        },
        {
          id: 'C',
          text: "Acknowledge the loss: 'This must be really disappointing. You had your heart set on that school, and it makes sense you'd feel crushed.'",
          empathyScore: 95,
          empathyType: 'affective',
          outcome: "Jake feels understood and begins to share his fears about his future.",
          explanation: "Acknowledging the emotional reality validates the person's experience and opens communication."
        },
        {
          id: 'D',
          text: "Distract with activity: 'Come on, let's go play some video games. No point dwelling on things you can't change.'",
          empathyScore: 35,
          empathyType: 'cognitive',
          outcome: "Jake goes along but feels like his emotions don't matter. The sadness remains unprocessed.",
          explanation: "Distraction without emotional acknowledgment can prevent healthy processing of difficult feelings."
        }
      ]
    },
    {
      id: 3,
      title: "Workplace Conflict",
      context: "Your colleague Maria is visibly upset after a difficult meeting with your boss.",
      character: "Maria",
      emotion: "Angry & Humiliated",
      situation: "Maria was publicly criticized in the meeting for a project delay that wasn't entirely her fault. She's now sitting at her desk, clearly upset.",
      challenge: "How do you approach this delicate workplace situation?",
      category: 'workplace',
      difficulty: 'advanced',
      emotionalIntensity: 'medium',
      actions: [
        {
          id: 'A',
          text: "Private validation: Approach quietly and say, 'That meeting seemed really tough. Are you okay? Want to grab coffee and talk about it?'",
          empathyScore: 85,
          empathyType: 'compassionate',
          outcome: "Maria appreciates the private support and feels less alone in the situation.",
          explanation: "Private validation in workplace settings shows care while respecting professional boundaries."
        },
        {
          id: 'B',
          text: "Public support: 'I can't believe how unfair that was! Everyone saw that wasn't your fault. The boss was totally out of line!'",
          empathyScore: 45,
          empathyType: 'affective',
          outcome: "While Maria appreciates the support, the public nature makes the situation more uncomfortable.",
          explanation: "Public emotional support in workplace conflicts can escalate situations and create more problems."
        },
        {
          id: 'C',
          text: "Professional distance: Continue working normally without acknowledging the situation.",
          empathyScore: 20,
          empathyType: 'dismissive',
          outcome: "Maria feels isolated and unsupported by her colleagues.",
          explanation: "Ignoring obvious emotional distress can damage relationships and team cohesion."
        },
        {
          id: 'D',
          text: "Practical focus: 'Let's figure out how to fix this project timeline so it doesn't happen again. What do you think went wrong?'",
          empathyScore: 60,
          empathyType: 'cognitive',
          outcome: "Maria appreciates the problem-solving approach but still feels emotionally unaddressed.",
          explanation: "Focusing solely on practical solutions can miss the emotional impact of difficult situations."
        }
      ]
    }
  ];

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setCurrentStoryIndex(0);
    setScore(0);
    setShowOutcome(false);
    setSelectedAction(null);
  };

  const handleActionChoice = (action: EmotionalStory['actions'][0]) => {
    setSelectedAction(action);
    setScore(prev => prev + action.empathyScore);
    setShowOutcome(true);
  };

  const nextStory = () => {
    const nextIndex = currentStoryIndex + 1;
    if (nextIndex >= stories.length) {
      setGameComplete(true);
      setGameStarted(false);
    } else {
      setCurrentStoryIndex(nextIndex);
      setShowOutcome(false);
      setSelectedAction(null);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setCurrentStoryIndex(0);
    setScore(0);
    setShowOutcome(false);
    setSelectedAction(null);
  };

  const currentStory = stories[currentStoryIndex];

  return (
    <DashboardShell activeItem="games">
      <div className="mx-auto w-full max-w-4xl pb-12">
        <Card className="overflow-hidden rounded-3xl border-2 border-b-[8px] border-purple-200 bg-white">
          <CardHeader className="border-b-2 bg-purple-50 px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="mb-2 flex items-center gap-3 text-3xl font-black text-foreground">
                  💝 Empathy Echo
                  <Badge variant="secondary" className="rounded-xl border-2 border-purple-200 bg-purple-100 px-3 py-1 text-sm font-extrabold uppercase text-purple-800">
                    Social & Emotional
                  </Badge>
                </CardTitle>
                <p className="font-semibold text-muted-foreground">
                  Navigate emotional stories and choose the most empathetic responses.
                </p>
              </div>
              <Mascot size={80} animate={!gameStarted} />
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {!gameStarted && !gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  Let's practice empathy! I'll tell you a story, and you decide the best way to help.
                </SpeechBubble>

                <div className="flex w-full max-w-xl flex-col items-center rounded-2xl border-2 border-b-[4px] border-purple-100 bg-purple-50 p-6 text-center">
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-purple-800">How to Play</h4>
                  <p className="text-sm font-semibold text-purple-700 mb-2">1. Read the emotional situation.</p>
                  <p className="text-sm font-semibold text-purple-700 mb-2">2. Put yourself in their shoes.</p>
                  <p className="text-sm font-semibold text-purple-700">3. Choose the response that shows the most empathy!</p>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-purple-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-purple-400 active:translate-y-1 active:border-b-0">
                  Start Empathy Echo
                </Button>
              </div>
            ) : gameComplete ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  {score >= 250 ? "Wow! You have incredible emotional intelligence!" : "Great job practicing your empathy skills!"}
                </SpeechBubble>

                <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-8 text-center max-w-md w-full">
                  <span className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">Total Empathy Score</span>
                  <span className="text-6xl font-black text-purple-600 mb-4">{score}</span>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, (score / 300) * 100)}%` }}></div>
                  </div>
                </div>

                <Button onClick={startGame} className="h-16 w-full max-w-sm rounded-2xl border-b-4 bg-purple-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-purple-400 active:translate-y-1 active:border-b-0">
                  Play Again
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 px-6 py-4">
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3"/> Scenario</span>
                      <span className="text-2xl font-black">{currentStoryIndex + 1}/{stories.length}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-purple-600">Score</span>
                      <span className="text-2xl font-black text-purple-600">💝 {score}</span>
                    </div>
                  </div>
                  <Button onClick={resetGame} variant="outline" className="rounded-xl border-2 font-bold shadow-sm">
                    <RotateCcw className="mr-2 h-4 w-4" /> Quit
                  </Button>
                </div>

                <div className="w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-3 rounded-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${(currentStoryIndex / stories.length) * 100}%` }}
                  ></div>
                </div>

                {!showOutcome ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-b-[8px] border-blue-200 rounded-3xl p-8">
                      <h3 className="text-2xl font-black text-gray-900 mb-4">
                        {currentStory.title}
                      </h3>
                      
                      <div className="bg-white rounded-2xl p-6 mb-6 border-2 border-blue-100 shadow-sm">
                        <p className="text-gray-700 font-medium mb-4 text-lg">
                          <span className="font-bold text-blue-900">Context:</span> {currentStory.context}
                        </p>
                        <p className="text-gray-700 font-medium text-lg">
                          <span className="font-bold text-blue-900">Situation:</span> {currentStory.situation}
                        </p>
                      </div>

                      <div className="bg-amber-50 border-4 border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-4">
                        <div className="text-4xl">😔</div>
                        <div>
                          <span className="text-amber-900 font-bold uppercase text-sm block mb-1">{currentStory.character} is feeling: </span>
                          <span className="text-amber-700 font-black text-xl">{currentStory.emotion}</span>
                        </div>
                      </div>
                      
                      <div className="bg-purple-100 border-4 border-purple-300 rounded-2xl p-4">
                        <h4 className="font-black text-purple-900 uppercase text-sm mb-1">Your Challenge</h4>
                        <p className="text-purple-800 font-bold text-lg">{currentStory.challenge}</p>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-black text-gray-900 pt-4 text-center">How do you respond?</h4>
                    <div className="grid gap-4">
                      {currentStory.actions.map((action, index) => (
                        <button
                          key={action.id}
                          onClick={() => handleActionChoice(action)}
                          className="flex items-center gap-4 p-6 rounded-2xl border-4 border-b-[6px] border-gray-200 bg-white text-left transition-all hover:-translate-y-1 hover:border-purple-300 hover:bg-purple-50 active:translate-y-1 active:border-b-4"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 font-black text-gray-600">
                            {action.id}
                          </div>
                          <span className="font-bold text-gray-800 text-lg">{action.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center bg-white border-4 border-gray-100 rounded-3xl p-8 shadow-sm">
                      <div className="text-6xl mb-4">
                        {selectedAction?.empathyScore! >= 80 ? '🌟' : selectedAction?.empathyScore! >= 60 ? '👍' : '🤔'}
                      </div>
                      <h3 className="text-3xl font-black text-gray-900 mb-6">
                        Empathy Score: <span className="text-purple-600">{selectedAction?.empathyScore}</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="bg-blue-50 border-4 border-blue-200 rounded-2xl p-6">
                          <h4 className="font-black text-blue-900 uppercase text-sm mb-2">Outcome</h4>
                          <p className="text-blue-800 font-medium text-lg">{selectedAction?.outcome}</p>
                        </div>
                        <div className="bg-green-50 border-4 border-green-200 rounded-2xl p-6">
                          <h4 className="font-black text-green-900 uppercase text-sm mb-2">Learning Insight</h4>
                          <p className="text-green-800 font-medium text-lg">{selectedAction?.explanation}</p>
                        </div>
                      </div>
                    </div>

                    <Button onClick={nextStory} className="h-16 w-full rounded-2xl border-b-4 bg-purple-500 text-xl font-black uppercase tracking-wide text-white transition-all hover:bg-purple-400 active:translate-y-1 active:border-b-0">
                      Next Scenario ➜
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
