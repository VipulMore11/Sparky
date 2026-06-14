"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, Lightbulb, TrendingUp, Users, Clock, Target } from 'lucide-react'

interface AIRecommendation {
  type: 'optimization' | 'warning' | 'insight'
  category: 'timing' | 'participants' | 'design' | 'data'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
}

interface ExperimentPrediction {
  estimatedDuration: number
  expectedDropoutRate: number
  recommendedSampleSize: number
  statisticalPower: number
}

export function AIExperimentOptimizer() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [predictions, setPredictions] = useState<ExperimentPrediction | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Simulate AI analysis
  useEffect(() => {
    const generateRecommendations = () => {
      const mockRecommendations: AIRecommendation[] = [
        {
          type: 'optimization',
          category: 'timing',
          title: 'Optimize Stimulus Intervals',
          description: 'Based on participant data, reduce inter-stimulus interval to 1.5-2.5s for optimal attention. Current 3-5s may cause mind-wandering.',
          impact: 'high',
          confidence: 0.87
        },
        {
          type: 'insight',
          category: 'participants',
          title: 'Peak Performance Hours Detected',
          description: 'Participants show 23% better reaction times between 10-11 AM and 2-4 PM. Consider scheduling critical trials during these windows.',
          impact: 'medium',
          confidence: 0.92
        },
        {
          type: 'warning',
          category: 'design',
          title: 'Practice Effect Detected',
          description: 'Significant improvement after trial 15. Consider extending practice phase or counterbalancing to control for learning effects.',
          impact: 'high',
          confidence: 0.81
        },
        {
          type: 'optimization',
          category: 'data',
          title: 'Increase Trial Count',
          description: 'Current 30 trials provide 0.72 statistical power. Increase to 42 trials for 0.80 power threshold with your effect size.',
          impact: 'medium',
          confidence: 0.89
        },
        {
          type: 'insight',
          category: 'participants',
          title: 'Cultural Adaptation Needed',
          description: 'Participants from collectivist cultures show different response patterns. Consider cultural priming or separate analysis groups.',
          impact: 'medium',
          confidence: 0.76
        }
      ]
      
      setRecommendations(mockRecommendations)
      
      setPredictions({
        estimatedDuration: 12.5,
        expectedDropoutRate: 8.3,
        recommendedSampleSize: 156,
        statisticalPower: 0.84
      })
    }

    generateRecommendations()
  }, [])

  const runAIAnalysis = async () => {
    setIsAnalyzing(true)
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsAnalyzing(false)
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <TrendingUp className="w-4 h-4" />
      case 'warning': return <Target className="w-4 h-4" />
      case 'insight': return <Lightbulb className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Experiment Optimizer
          <Badge variant="outline" className="ml-auto">
            Beta
          </Badge>
        </CardTitle>
        <CardDescription>
          AI-powered analysis and recommendations to optimize your experimental design and data quality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="insights">Real-time Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">AI Recommendations</h3>
              <Button 
                onClick={runAIAnalysis}
                disabled={isAnalyzing}
                variant="outline"
                size="sm"
              >
                {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
              </Button>
            </div>
            
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(rec.type)}
                      <span className="font-medium">{rec.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getImpactColor(rec.impact)}>
                        {rec.impact} impact
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(rec.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Apply</Button>
                    <Button variant="ghost" size="sm">Dismiss</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="predictions" className="space-y-4">
            <h3 className="text-lg font-semibold">Experiment Predictions</h3>
            
            {predictions && (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold">{predictions.estimatedDuration}min</div>
                        <div className="text-sm text-muted-foreground">Estimated Duration</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold">{predictions.expectedDropoutRate}%</div>
                        <div className="text-sm text-muted-foreground">Expected Dropout</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-500" />
                      <div>
                        <div className="text-2xl font-bold">{predictions.recommendedSampleSize}</div>
                        <div className="text-sm text-muted-foreground">Recommended N</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="text-2xl font-bold">{predictions.statisticalPower.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Statistical Power</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">AI Prediction Model</h4>
              <p className="text-sm text-blue-800">
                Predictions based on 10,000+ similar experiments, participant behavior patterns, 
                and current experimental parameters. Updated in real-time as data is collected.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <h3 className="text-lg font-semibold">Real-time Insights</h3>
            
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Adaptive Difficulty Suggested</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current task may be too easy - 95% accuracy rate. Consider increasing difficulty 
                    to maintain engagement and capture meaningful individual differences.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">Attention Pattern Detected</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Participants show decreased attention after trial 25. Consider adding a break 
                    or motivation boost at this point.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Data Quality Excellent</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current timing calibration and participant engagement levels are producing 
                    high-quality, reliable data. Continue current protocol.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}