"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DynamicRadarChartProps {
  data?: any;
}

export function DynamicRadarChart({ data }: DynamicRadarChartProps) {
  // Transform the radar data - use real data only
  const radarData = data?.performance_metrics_radar ? 
    Object.entries(data.performance_metrics_radar).map(([key, value]) => ({
      metric: key.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      value: value as number,
      fullMark: key === 'response_time' ? 5000 : 100 // Different scale for response time
    })) : [];

  // Don't render if no data
  if (!data || !radarData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">No metrics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics Radar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tickCount={6}
                tick={{ fontSize: 12 }}
              />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
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