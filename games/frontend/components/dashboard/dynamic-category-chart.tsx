"use client"

import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DynamicCategoryChartProps {
  data?: any;
}

const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

export function DynamicCategoryChart({ data }: DynamicCategoryChartProps) {
  // Transform the category breakdown data for the pie chart - use real data only
  const chartData = data?.category_distribution ? 
    Object.entries(data.category_distribution).map(([key, value], index) => ({
      name: key.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      value: value as number,
      fill: colors[index % colors.length]
    })).filter(item => item.value > 0) : [];

  // Don't render if no data
  if (!data || !chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] flex items-center justify-center">
            <p className="text-muted-foreground">No category data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}