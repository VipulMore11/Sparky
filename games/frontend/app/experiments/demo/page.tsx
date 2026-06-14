"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReactionTimeGame } from '@/components/experiments/reaction-time-game'
import { LiveExperimentMonitor } from '@/components/experiments/live-experiment-monitor'
import { AIExperimentOptimizer } from '@/components/experiments/ai-experiment-optimizer'
import { TimingCalibration } from '@/components/experiments/timing-calibration'
import { Timer, Users, Brain, Zap, Target, TrendingUp } from 'lucide-react'

export default function ExperimentLabDemo() {
  const [activeTab, setActiveTab] = useState('precision-timing')

  const features = [
    {
      id: 'precision-timing',
      title: 'Precision Timing Engine',
      icon: <Timer className="w-5 h-5" />,
      description: 'Millisecond-accurate timing with automatic calibration',
      highlight: 'Industry First'
    },
    {
      id: 'live-monitoring',
      title: 'Live Experiment Monitor',
      icon: <Users className="w-5 h-5" />,
      description: 'Real-time participant tracking and experiment analytics',
      highlight: 'Real-time'
    },
    {
      id: 'ai-optimizer',
      title: 'AI Experiment Optimizer',
      icon: <Brain className="w-5 h-5" />,
      description: 'AI-powered recommendations and predictions',
      highlight: 'AI-Powered'
    },
    {
      id: 'reaction-test',
      title: 'Reaction Time Demo',
      icon: <Zap className="w-5 h-5" />,
      description: 'Interactive demo of precision timing in action',
      highlight: 'Interactive'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              🚀 BehaviorLab Platform Demo
            </Badge>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Next-Generation Behavioral Research Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Democratizing cognitive science research with millisecond-accurate timing, 
              AI-powered optimization, and real-time collaboration tools.
            </p>
            
            {/* Key Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {features.map((feature) => (
                <Card 
                  key={feature.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    activeTab === feature.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setActiveTab(feature.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-2">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {feature.highlight}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Demo Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="precision-timing" className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Precision Timing
            </TabsTrigger>
            <TabsTrigger value="live-monitoring" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Live Monitor
            </TabsTrigger>
            <TabsTrigger value="ai-optimizer" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Optimizer
            </TabsTrigger>
            <TabsTrigger value="reaction-test" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Demo Test
            </TabsTrigger>
          </TabsList>

          <TabsContent value="precision-timing" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold">Millisecond-Accurate Timing Engine</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our precision timing engine automatically calibrates for network latency, 
                display refresh rates, and browser-specific delays to ensure lab-grade accuracy in web experiments.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <TimingCalibration />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Technical Advantages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Sub-millisecond Accuracy</div>
                        <div className="text-sm text-muted-foreground">
                          Compensates for network, display, and audio latency
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Automatic Calibration</div>
                        <div className="text-sm text-muted-foreground">
                          Adapts to each participant's device and environment
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Real-time Validation</div>
                        <div className="text-sm text-muted-foreground">
                          Continuous monitoring of timing accuracy during experiments
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                      <div>
                        <div className="font-medium">Cross-platform Compatible</div>
                        <div className="text-sm text-muted-foreground">
                          Works consistently across devices, browsers, and operating systems
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="live-monitoring">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold">Real-time Experiment Monitoring</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Track participant behavior, experiment progress, and data quality in real-time. 
                Get instant alerts about issues and optimize your experiments on the fly.
              </p>
            </div>
            <LiveExperimentMonitor />
          </TabsContent>

          <TabsContent value="ai-optimizer">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold">AI-Powered Experiment Optimization</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Leverage machine learning to optimize your experimental design, predict outcomes, 
                and get intelligent recommendations based on thousands of similar studies.
              </p>
            </div>
            <AIExperimentOptimizer />
          </TabsContent>

          <TabsContent value="reaction-test">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold">Interactive Reaction Time Demo</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience our precision timing engine in action. This demo showcases 
                the accuracy and reliability of our timing system for cognitive experiments.
              </p>
            </div>
            <ReactionTimeGame />
          </TabsContent>
        </Tabs>
      </div>

      {/* Competitive Advantages Footer */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Why BehaviorLab Wins</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <TrendingUp className="w-8 h-8 mx-auto" />
                <h3 className="text-xl font-semibold">Industry-First Precision</h3>
                <p className="text-blue-100">
                  First web platform to achieve lab-grade timing accuracy with automatic calibration
                </p>
              </div>
              <div className="space-y-2">
                <Brain className="w-8 h-8 mx-auto" />
                <h3 className="text-xl font-semibold">AI-Powered Intelligence</h3>
                <p className="text-blue-100">
                  Machine learning optimization based on 10,000+ experiments and real-time data
                </p>
              </div>
              <div className="space-y-2">
                <Users className="w-8 h-8 mx-auto" />
                <h3 className="text-xl font-semibold">Collaborative Research</h3>
                <p className="text-blue-100">
                  Real-time collaboration tools and live monitoring for distributed research teams
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}