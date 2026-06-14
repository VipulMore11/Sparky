"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

interface ParticipantSession {
  id: string
  status: 'active' | 'completed' | 'dropped'
  startTime: number
  lastActivity: number
  trialsCompleted: number
  averageReactionTime: number
  calibrationQuality: 'high' | 'medium' | 'low'
}

interface ExperimentMetrics {
  totalParticipants: number
  activeParticipants: number
  completionRate: number
  averageSessionDuration: number
  dropoutRate: number
}

export function LiveExperimentMonitor() {
  const [participants, setParticipants] = useState<ParticipantSession[]>([])
  const [metrics, setMetrics] = useState<ExperimentMetrics>({
    totalParticipants: 0,
    activeParticipants: 0,
    completionRate: 0,
    averageSessionDuration: 0,
    dropoutRate: 0
  })

  // Simulate real-time data updates
  useEffect(() => {
    const generateMockData = () => {
      const mockParticipants: ParticipantSession[] = []
      const now = Date.now()
      
      // Generate mock participants
      for (let i = 0; i < 15; i++) {
        const startTime = now - Math.random() * 600000 // Started within last 10 mins
        const lastActivity = now - Math.random() * 60000 // Last activity within 1 min
        
        mockParticipants.push({
          id: `P${String(i + 1).padStart(3, '0')}`,
          status: Math.random() > 0.8 ? 'completed' : Math.random() > 0.9 ? 'dropped' : 'active',
          startTime,
          lastActivity,
          trialsCompleted: Math.floor(Math.random() * 50),
          averageReactionTime: 200 + Math.random() * 200,
          calibrationQuality: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
        })
      }
      
      setParticipants(mockParticipants)
      
      // Calculate metrics
      const active = mockParticipants.filter(p => p.status === 'active').length
      const completed = mockParticipants.filter(p => p.status === 'completed').length
      const dropped = mockParticipants.filter(p => p.status === 'dropped').length
      
      setMetrics({
        totalParticipants: mockParticipants.length,
        activeParticipants: active,
        completionRate: mockParticipants.length > 0 ? (completed / mockParticipants.length) * 100 : 0,
        averageSessionDuration: 8.5, // minutes
        dropoutRate: mockParticipants.length > 0 ? (dropped / mockParticipants.length) * 100 : 0
      })
    }

    generateMockData()
    const interval = setInterval(generateMockData, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'completed': return 'bg-blue-500'
      case 'dropped': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getCalibrationIcon = (quality: string) => {
    switch (quality) {
      case 'high': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'low': return <AlertTriangle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  const formatDuration = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000)
    return `${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{metrics.activeParticipants}</div>
                <div className="text-sm text-muted-foreground">Active Now</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{metrics.completionRate.toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Completion</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{metrics.averageSessionDuration}m</div>
                <div className="text-sm text-muted-foreground">Avg Duration</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{metrics.dropoutRate.toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Dropout Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Participant Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Live Participant Monitor
            <Badge variant="outline" className="ml-auto">
              {participants.filter(p => p.status === 'active').length} Active
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time monitoring of participant sessions and experiment progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {participants.map((participant) => (
              <div 
                key={participant.id} 
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(participant.status)}`} />
                  <div>
                    <div className="font-medium">{participant.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {participant.trialsCompleted} trials • {formatDuration(participant.startTime)} ago
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {participant.averageReactionTime.toFixed(0)}ms
                    </div>
                    <div className="text-xs text-muted-foreground">avg RT</div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {getCalibrationIcon(participant.calibrationQuality)}
                    <span className="text-xs text-muted-foreground">
                      {participant.calibrationQuality}
                    </span>
                  </div>
                  
                  <Badge variant="outline" className={`text-xs ${participant.status === 'active' ? 'border-green-500 text-green-700' : participant.status === 'completed' ? 'border-blue-500 text-blue-700' : 'border-red-500 text-red-700'}`}>
                    {participant.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.dropoutRate > 15 && (
              <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">High dropout rate detected ({metrics.dropoutRate.toFixed(0)}%)</span>
              </div>
            )}
            
            {participants.filter(p => p.calibrationQuality === 'low').length > 3 && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 text-yellow-700 rounded">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Multiple participants with low timing calibration</span>
              </div>
            )}
            
            {metrics.activeParticipants === 0 && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 text-gray-700 rounded">
                <Users className="w-4 h-4" />
                <span className="text-sm">No active participants - experiment may be offline</span>
              </div>
            )}
            
            {metrics.activeParticipants > 0 && metrics.dropoutRate < 10 && (
              <div className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Experiment running smoothly</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}