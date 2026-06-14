"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DynamicAnalyticsChartProps {
  data?: any;
}

export function DynamicAnalyticsChart({ data }: DynamicAnalyticsChartProps) {
  // Use real data only - new format has performance_trends
  const chartData = data?.performance_trends ? 
    data.performance_trends.dates.map((date: string, index: number) => ({
      date: date,
      performance: data.performance_trends.scores[index] || 0
    })) : [];

  // Don't render if no data
  if (!data || !chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">No trend data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
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
                dataKey="performance" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Performance Trend"
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}