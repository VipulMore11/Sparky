"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const gameCategories = [
  {
    id: "cognitive",
    title: "🧠 Cognitive Games",
    description: "Test attention, memory, and executive function",
    color: "bg-blue-50 border-blue-200",
    games: [
      {
        name: "🌀 Stroop Sprint",
        description: "Words appear in mismatched colors; tap the color, not the word.",
        concept: "Demonstrates the Stroop Effect — measures selective attention and reaction under cognitive conflict.",
        tech: "WebGL for smooth color transitions and real-time analytics",
        difficulty: "Medium",
        duration: "3-5 min",
        href: "/games/cognitive/stroop-sprint"
      },
      {
        name: "🔢 Trail Tracker",
        description: "Connect numbers or letters in order as quickly as possible.",
        concept: "Tests task switching, visual scanning, and processing speed — classic neuropsych test.",
        tech: "Canvas animations and path detection algorithms",
        difficulty: "Easy",
        duration: "2-4 min",
        href: "/games/cognitive/trail-tracker"
      }
    ]
  },
  {
    id: "perception",
    title: "⚡ Perception & Reaction Games",
    description: "Measure reaction time and visual processing speed",
    color: "bg-yellow-50 border-yellow-200",
    games: [
      {
        name: "💡 Flash Reflex",
        description: "A visual stimulus flashes randomly; tap instantly when it appears.",
        concept: "Showcases reaction-time precision — ideal for highlighting timing engine accuracy.",
        tech: "requestAnimationFrame() and performance.now() for sub-10 ms accuracy",
        difficulty: "Easy",
        duration: "2-3 min",
        href: "/games/perception-reaction/flash-reflex"
      },
      {
        name: "👁️ Blink Gap",
        description: "Detect the missing frame in a rapid image sequence.",
        concept: "Models temporal attention and the attentional blink effect.",
        tech: "Frame-synchronized rendering with adjustable display intervals",
        difficulty: "Hard",
        duration: "4-6 min",
        href: "/games/perception-reaction/blink-gap"
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
        tech: "Animated probability wheels and live data visualization",
        difficulty: "Medium",
        duration: "5-8 min",
        href: "/games/decision-making/risk-run"
      },
      {
        name: "🕹️ Trust Trade",
        description: "Trade with an AI; decide how much to trust them with virtual coins.",
        concept: "Gamifies behavioral economics and social trust dynamics.",
        tech: "WebSockets for real-time gameplay or AI-driven opponent modeling",
        difficulty: "Medium",
        duration: "6-10 min",
        href: "/games/decision-making/trust-trade"
      }
    ]
  },
  {
    id: "social",
    title: "💬 Social & Emotional Games",
    description: "Measure empathy, emotion recognition, and social cognition",
    color: "bg-purple-50 border-purple-200",
    games: [
      {
        name: "😊 Mood Mirror",
        description: "Mimic facial expressions shown on screen; camera detects accuracy.",
        concept: "Uses emotion recognition + gamification — engaging and research-useful.",
        tech: "TensorFlow.js face landmarks for expression detection and feedback",
        difficulty: "Medium",
        duration: "4-6 min",
        href: "/games/social-emotional/mood-mirror"
      },
      {
        name: "💬 Empathy Echo",
        description: "AI chatbot shares emotional stories; choose supportive responses.",
        concept: "Tests empathy and emotional understanding — perfect for affective computing studies.",
        tech: "Sentiment analysis APIs + branching dialogue system",
        difficulty: "Easy",
        duration: "5-8 min",
        href: "/games/social-emotional/empathy-echo"
      }
    ]
  },
  {
    id: "consumer",
    title: "🛒 Consumer Behavior Games",
    description: "Study purchasing decisions and brand preferences",
    color: "bg-orange-50 border-orange-200",
    games: [
      {
        name: "🛍️ Impulse Cart",
        description: "Shop under time pressure, reacting to flash sales or emotional cues.",
        concept: "Combines UX psychology with data analytics — shows how emotions drive spending.",
        tech: "Dynamic React UI with behavior tracking and event-based analytics",
        difficulty: "Easy",
        duration: "3-5 min",
        href: "/games/consumer-behavior/impulse-cart"
      },
      {
        name: "⚔️ Brand Battle",
        description: "Compare competing brands and select based on attributes or price.",
        concept: "Reveals brand loyalty and preference through gamified choices.",
        tech: "Real-time A/B data visualization to map brand perception metrics",
        difficulty: "Easy",
        duration: "4-6 min",
        href: "/games/consumer-behavior/brand-battle"
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
        tech: "Procedural generation with AI difficulty adjustment",
        difficulty: "Hard",
        duration: "5-10 min",
        href: "/games/learning-pattern/pattern-path"
      },
      {
        name: "🔄 Symbol Switch",
        description: "Rules change mid-game; players must adapt quickly.",
        concept: "Highlights cognitive flexibility and fast adaptation — fun yet research-valid.",
        tech: "State machines for rule-switching with performance metrics tracking",
        difficulty: "Medium",
        duration: "4-7 min",
        href: "/games/learning-pattern/symbol-switch"
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Cognitive Research Games
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Explore our collection of scientifically-designed games that measure cognitive abilities, 
              decision-making patterns, and behavioral responses with millisecond precision.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button 
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
              >
                All Games
              </Button>
              {gameCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="text-sm"
                >
                  {category.title}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {category.title}
                </h2>
                <p className="text-lg text-gray-600">
                  {category.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {category.games.map((game, index) => (
                  <Card key={index} className={`${category.color} hover:shadow-lg transition-shadow`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl mb-2">{game.name}</CardTitle>
                          <CardDescription className="text-base">
                            {game.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {game.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {game.duration}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Research Concept</h4>
                        <p className="text-sm text-gray-600">{game.concept}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Technology</h4>
                        <p className="text-sm text-gray-600">{game.tech}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button asChild className="flex-1">
                          <Link href={game.href}>
                            Play Game
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={`${game.href}/info`}>
                            Learn More
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gray-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your Research?
          </h3>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            These games are just the beginning. Create custom experiments, 
            collect precise data, and gain insights into human cognition and behavior.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Start Building Experiments
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">
                Sign Up for Free
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}