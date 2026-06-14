"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { performanceMetrics } from "@/lib/analytics-data"

export function AnalyticsChart() {
  // Simple data for testing
  const testData = [
    { month: 'Jan', experiments: 8, completion_rate: 78.9, avg_score: 75.2 },
    { month: 'Feb', experiments: 12, completion_rate: 84.8, avg_score: 79.1 },
    { month: 'Mar', experiments: 10, completion_rate: 85.9, avg_score: 81.4 },
    { month: 'Apr', experiments: 15, completion_rate: 86.0, avg_score: 82.7 },
    { month: 'May', experiments: 18, completion_rate: 88.3, avg_score: 84.2 },
    { month: 'Jun', experiments: 14, completion_rate: 90.2, avg_score: 85.6 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Experiment Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={testData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs fill-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs fill-foreground"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="experiments" 
                stroke="#ef4444" 
                strokeWidth={3}
                name="Experiments"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="completion_rate" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Completion Rate (%)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="avg_score" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                name="Average Score"
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
