"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DynamicPerformanceChartProps {
  data?: any;
}

export function DynamicPerformanceChart({ data }: DynamicPerformanceChartProps) {
  // Transform the performance by category data - use real data only
  const chartData = data?.performance_by_category ? 
    Object.keys(data.performance_by_category.average_score).map((category) => ({
      category: category.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      avgScore: data.performance_by_category.average_score[category] || 0,
      completionRate: data.performance_by_category.completion_rate[category] || 0
    })).filter(item => item.avgScore > 0 || item.completionRate > 0) : [];

  // Don't render if no data
  if (!data || !chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">No performance data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="category" 
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
              <Bar 
                dataKey="avgScore" 
                fill="rgba(75, 192, 192, 0.8)"
                name="Average Score"
              />
              <Bar 
                dataKey="completionRate" 
                fill="rgba(255, 99, 132, 0.8)"
                name="Completion Rate"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}