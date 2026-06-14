"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { experimentRadarData } from "@/lib/analytics-data"

export function ExperimentRadarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Experiment Categories Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={experimentRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tickCount={6}
                tick={{ fontSize: 12 }}
              />
              <Radar
                name="Cognitive"
                dataKey="cognitive"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Radar
                name="Decision Making"
                dataKey="decision_making"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Radar
                name="Perception Reaction"
                dataKey="perception_reaction"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Radar
                name="Social Emotional"
                dataKey="social_emotional"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
