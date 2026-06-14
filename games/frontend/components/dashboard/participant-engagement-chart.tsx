"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { participantEngagement } from "@/lib/analytics-data"

export function ParticipantEngagementChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Participant Engagement Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={participantEngagement} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                className="text-xs fill-foreground"
              />
              <YAxis className="text-xs fill-foreground" />
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <Legend />
              <Area
                type="monotone"
                dataKey="new_participants"
                stackId="1"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorNew)"
                name="New Participants"
              />
              <Area
                type="monotone"
                dataKey="returning_participants"
                stackId="1"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorReturning)"
                name="Returning Participants"
              />
              <Area
                type="monotone"
                dataKey="active_sessions"
                stackId="2"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorActive)"
                name="Active Sessions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
