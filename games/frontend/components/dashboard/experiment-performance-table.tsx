"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { experimentResults } from "@/lib/analytics-data"

export function ExperimentPerformanceTable() {
  const sortedExperiments = experimentResults
    .filter(exp => exp.status !== 'draft')
    .sort((a, b) => b.avg_score - a.avg_score);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experiment Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Experiment</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Participants</TableHead>
              <TableHead className="text-right">Avg Score</TableHead>
              <TableHead className="text-right">Completion %</TableHead>
              <TableHead className="text-right">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExperiments.map((experiment) => (
              <TableRow key={experiment.id}>
                <TableCell className="font-medium">{experiment.name}</TableCell>
                <TableCell>
                  <span className="capitalize text-sm text-muted-foreground">
                    {experiment.category.replace('-', ' ')}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    experiment.status === 'active' ? 'default' :
                    experiment.status === 'completed' ? 'secondary' :
                    experiment.status === 'paused' ? 'destructive' : 'outline'
                  }>
                    {experiment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{experiment.participants}</TableCell>
                <TableCell className="text-right font-medium">
                  {experiment.avg_score.toFixed(1)}
                </TableCell>
                <TableCell className="text-right">
                  {experiment.completion_rate.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  {experiment.duration_days} days
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
