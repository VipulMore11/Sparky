"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { experimentResults } from "@/lib/analytics-data"

export function ExperimentMetricsCard() {
  const recentExperiments = experimentResults
    .filter(exp => exp.status === 'active' || exp.status === 'completed')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Experiments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentExperiments.map((experiment) => (
            <div key={experiment.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-sm">{experiment.name}</h4>
                  <Badge variant={
                    experiment.status === 'active' ? 'default' :
                    experiment.status === 'completed' ? 'secondary' :
                    experiment.status === 'paused' ? 'destructive' : 'outline'
                  }>
                    {experiment.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground capitalize">
                  {experiment.category.replace('-', ' ')} • {experiment.participants} participants
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-medium">{experiment.avg_score.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">
                  {experiment.completion_rate.toFixed(1)}% complete
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
