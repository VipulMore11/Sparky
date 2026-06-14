"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { scoreDistribution } from "@/lib/analytics-data"

export function ScoreDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="score_range" 
                className="text-xs fill-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs fill-foreground"
                tick={{ fontSize: 12 }}
              />
              <Bar 
                dataKey="count" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="Participant Count"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2 text-center">
          {scoreDistribution.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="text-sm font-medium">{item.score_range}</div>
              <div className="text-xs text-muted-foreground">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
