"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Mascot, SpeechBubble } from "@/components/mascot";
import { Sparkles, Brain, Zap } from "lucide-react";

const gameCategories = [
  {
    id: "cognitive",
    title: "🧠 Brain Teasers",
    description: "Train your focus and memory!",
    color: "bg-blue-50 border-blue-200",
    games: [
      {
        name: "🌀 Color Crash",
        description: "Tap the color of the word, not what the word says! It's trickier than it sounds.",
        concept: "Trains your brain to ignore distractions and focus on the right details.",
        difficulty: "Medium",
        duration: "1 min",
        href: "/learn/games/cognitive/stroop-sprint"
      },
      {
        name: "🔢 Path Finder",
        description: "Connect the dots in the right order as fast as you can.",
        concept: "Helps you switch between tasks quickly and spot patterns.",
        difficulty: "Easy",
        duration: "2 min",
        href: "/learn/games/cognitive/trail-tracker"
      }
    ]
  },
  {
    id: "perception",
    title: "⚡ Lightning Reflexes",
    description: "How fast can you react?",
    color: "bg-yellow-50 border-yellow-200",
    games: [
      {
        name: "💡 Flash Tap",
        description: "Tap the screen the exact moment you see the light flash!",
        concept: "Tests and trains your reaction speed.",
        difficulty: "Easy",
        duration: "1 min",
        href: "/learn/games/perception-reaction/flash-reflex"
      },
      {
        name: "👁️ Blink Gap",
        description: "Find the missing symbol in rapid, flashing sequences.",
        concept: "Trains rapid visual processing and attention to detail.",
        difficulty: "Hard",
        duration: "2 min",
        href: "/learn/games/perception-reaction/blink-gap"
      }
    ]
  },
  {
    id: "decision",
    title: "🎯 Decision-Making Games",
    description: "Explore risk-taking and decision processes",
    color: "bg-green-50 border-green-200",
    games: [
      {
        name: "💰 Risk Run",
        description: "Choose between safe and risky rewards with uncertain payoffs.",
        concept: "Simulates human risk-taking behavior — visually engaging and research-valid.",
        difficulty: "Medium",
        duration: "5 min",
        href: "/learn/games/decision-making/risk-run"
      },
      {
        name: "🕹️ Trust Trade",
        description: "Trade with an AI; decide how much to trust them with virtual coins.",
        concept: "Gamifies behavioral economics and social trust dynamics.",
        difficulty: "Medium",
        duration: "6 min",
        href: "/learn/games/decision-making/trust-trade"
      }
    ]
  },
  {
    id: "learning",
    title: "🔢 Learning & Pattern Games",
    description: "Test pattern recognition and adaptive learning",
    color: "bg-pink-50 border-pink-200",
    games: [
      {
        name: "🧩 Pattern Path",
        description: "Predict the next element in a sequence following hidden logic.",
        concept: "Encourages implicit learning and adaptability — simple but deeply analytical.",
        difficulty: "Hard",
        duration: "5 min",
        href: "/learn/games/learning-pattern/pattern-path"
      },
      {
        name: "🔄 Symbol Switch",
        description: "Rules change mid-game; players must adapt quickly.",
        concept: "Highlights cognitive flexibility and fast adaptation — fun yet research-valid.",
        difficulty: "Medium",
        duration: "4 min",
        href: "/learn/games/learning-pattern/symbol-switch"
      }
    ]
  },
  {
    id: "social",
    title: "🤝 Social & Emotional",
    description: "Build empathy and emotion recognition",
    color: "bg-purple-50 border-purple-200",
    games: [
      {
        name: "💝 Empathy Echo",
        description: "Navigate emotional stories and choose the most empathetic responses.",
        concept: "Develops emotional intelligence and different types of empathy.",
        difficulty: "Medium",
        duration: "15 min",
        href: "/learn/games/social-emotional/empathy-echo"
      },
      {
        name: "😊 Mood Mirror",
        description: "Identify micro-expressions and complex emotions in professional scenarios.",
        concept: "Trains facial emotion recognition and emotional regulation.",
        difficulty: "Hard",
        duration: "15 min",
        href: "/learn/games/social-emotional/mood-mirror"
      }
    ]
  },
  {
    id: "consumer",
    title: "🛒 Consumer Behavior",
    description: "Understand marketing and purchasing decisions",
    color: "bg-teal-50 border-teal-200",
    games: [
      {
        name: "🏷️ Brand Battle",
        description: "Test your susceptibility to brand influence and marketing tactics.",
        concept: "Exposes cognitive biases in consumer decision-making.",
        difficulty: "Medium",
        duration: "10 min",
        href: "/learn/games/consumer-behavior/brand-battle"
      },
      {
        name: "💳 Impulse Cart",
        description: "Try to complete your shopping list without falling for impulse buys.",
        concept: "Simulates the psychology of retail environments and self-control.",
        difficulty: "Easy",
        duration: "8 min",
        href: "/learn/games/consumer-behavior/impulse-cart"
      }
    ]
  }
];

export default function GamesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = selectedCategory 
    ? gameCategories.filter(cat => cat.id === selectedCategory)
    : gameCategories;

  return (
    <DashboardShell activeItem="games">
      <div className="w-full space-y-8 pb-12">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border-b-[6px] border-orange-600/20 bg-gradient-to-br from-orange-400 to-amber-500 px-6 py-12 text-white shadow-sm">
          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="mb-6 flex items-end gap-4">
              <Mascot size={100} animate={true} />
              <SpeechBubble tail="bottom-left" className="mb-8 text-foreground">
                <span className="font-extrabold">Ready to play?</span> These games are super fun and make your brain stronger!
              </SpeechBubble>
            </div>
            
            <h1 className="mb-4 flex items-center justify-center gap-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
              <Sparkles className="h-10 w-10 text-yellow-300" />
              Sparky's Brain Games
            </h1>
            <p className="mb-8 text-lg font-bold text-orange-100 sm:text-xl">
              Power up your mind with fun, fast-paced challenges!
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              <Button 
                variant={selectedCategory === null ? "default" : "secondary"}
                onClick={() => setSelectedCategory(null)}
                className={`rounded-2xl border-b-4 px-6 py-6 text-base font-extrabold uppercase tracking-wide transition-all active:translate-y-1 active:border-b-0 ${selectedCategory === null ? "bg-white text-orange-600 hover:bg-orange-50 border-orange-200" : "bg-orange-500/50 text-white border-transparent hover:bg-orange-500/70"}`}
              >
                All Games
              </Button>
              {gameCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "secondary"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-2xl border-b-4 px-6 py-6 text-base font-extrabold uppercase tracking-wide transition-all active:translate-y-1 active:border-b-0 ${selectedCategory === category.id ? "bg-white text-orange-600 hover:bg-orange-50 border-orange-200" : "bg-orange-500/50 text-white border-transparent hover:bg-orange-500/70"}`}
                >
                  {category.title}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Decorative background circles */}
          <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-orange-600/20 blur-3xl" />
        </div>

        {/* Games Grid */}
        <div className="mx-auto max-w-5xl">
          <div className="space-y-12">
            {filteredCategories.map((category) => (
              <div key={category.id} className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-foreground">
                    {category.title}
                  </h2>
                  <Badge variant="secondary" className="rounded-xl px-3 py-1 font-bold">
                    {category.description}
                  </Badge>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {category.games.map((game, index) => (
                    <Card key={index} className={`flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-b-[8px] bg-white transition-all hover:-translate-y-1 hover:border-b-[10px] active:translate-y-2 active:border-b-[2px] ${category.color.replace('bg-', 'border-').replace('-50', '-200')}`}>
                      <CardHeader className={`${category.color} border-b-2 px-6 py-5`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="mb-2 text-2xl font-black text-foreground">{game.name}</CardTitle>
                            <CardDescription className="text-sm font-semibold text-muted-foreground">
                              {game.description}
                            </CardDescription>
                          </div>
                          <div className="flex shrink-0 flex-col gap-2 items-end ml-4">
                            <Badge variant="outline" className="rounded-lg border-2 bg-white/60 px-2 py-1 text-xs font-bold uppercase">
                              <Brain className="mr-1 h-3 w-3" /> {game.difficulty}
                            </Badge>
                            <Badge variant="outline" className="rounded-lg border-2 bg-white/60 px-2 py-1 text-xs font-bold uppercase">
                              <Zap className="mr-1 h-3 w-3" /> {game.duration}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex grow flex-col justify-between space-y-6 p-6">
                        <div className="rounded-2xl bg-muted/50 p-4">
                          <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">Why play this?</h4>
                          <p className="text-sm font-semibold text-foreground">{game.concept}</p>
                        </div>
                        <Button asChild className="h-14 w-full rounded-2xl border-b-4 bg-primary text-lg font-extrabold uppercase tracking-wide text-primary-foreground transition-all active:translate-y-1 active:border-b-0">
                          <Link href={game.href}>
                            Play Now!
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
