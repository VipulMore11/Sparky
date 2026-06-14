import { MessageSquare, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function Announcements() {
  const announcements = [
    {
      id: 1,
      title: "Our Materials Team Would Like Your Feedback",
      content: "We want to hear from you - what kind of support materials do you find most helpful? Let us know in this quick one-question feedback survey!",
      date: "2 days ago",
      hasLink: true
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Announcements</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="p-4 border border-border rounded-lg">
              <h4 className="font-medium mb-2">{announcement.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{announcement.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{announcement.date}</span>
                {announcement.hasLink && (
                  <Button variant="ghost" size="sm" className="text-primary">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Take Survey
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {/* Placeholder for more announcements */}
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No more announcements</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}