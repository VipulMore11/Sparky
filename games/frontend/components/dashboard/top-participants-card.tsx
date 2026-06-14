"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { topParticipants } from "@/lib/analytics-data"

export function TopParticipantsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Participants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topParticipants.slice(0, 5).map((participant, index) => (
            <div key={participant.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium w-6">#{index + 1}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {participant.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="text-sm font-medium">{participant.name}</p>
                  <p className="text-xs text-muted-foreground">{participant.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {participant.badge && (
                  <Badge variant={
                    participant.badge === 'Gold' ? 'default' :
                    participant.badge === 'Silver' ? 'secondary' : 'outline'
                  }>
                    {participant.badge}
                  </Badge>
                )}
                <div className="text-right">
                  <p className="text-sm font-medium">{participant.avg_score.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">{participant.total_experiments} exp</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
