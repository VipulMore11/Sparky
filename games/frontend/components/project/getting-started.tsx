import { Play, Clock, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function GettingStarted() {
  const tutorials = [
    {
      id: 1,
      title: "Gorilla in 60 seconds",
      description: "Learn the foundations of Gorilla's capabilities in just 1 minute",
      duration: "1 min",
      type: "video",
      action: "Watch Now"
    },
    {
      id: 2,
      title: "Experiment Builder Tutorial",
      description: "Put together a simple experiment in Gorilla with a consent form and two randomised conditions in our hands-on tutorial",
      duration: "5 mins",
      type: "tutorial",
      action: "Start"
    },
    {
      id: 3,
      title: "Task Builder Tutorial",
      description: "Build a simple Stroop task from scratch using the Task Builder in our hands-on tutorial",
      duration: "10 mins",
      type: "tutorial",
      action: "Start",
      badge: "Beta"
    },
    {
      id: 4,
      title: "Task Builder Walkthrough",
      description: "Learn the core concepts of Gorilla's task builder.",
      duration: "5 mins",
      type: "tutorial",
      action: "Start",
      badge: "New"
    }
  ]

  const webinar = {
    title: "Gorilla Onboarding Webinar",
    description: "Join our support team as they take you on a tour of Gorilla. We'll show you how to create tasks and experiments, and by the end you'll be ready to build your first real study.",
    subdescription: "Choose from either a live event with our support team where you can ask questions, or a recording that you can watch in your own time.",
    duration: "50 mins",
    action: "Watch"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">New to Gorilla? Start here</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tutorial Cards */}
          {tutorials.map((tutorial, index) => (
            <div key={tutorial.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                {index + 1}
              </div>
              <div className="flex-grow">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{tutorial.title}</h4>
                      {tutorial.badge && (
                        <Badge variant={tutorial.badge === "New" ? "default" : "secondary"} className="text-xs">
                          {tutorial.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{tutorial.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{tutorial.duration}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="ml-4">
                    {tutorial.type === "video" ? (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        {tutorial.action}
                      </>
                    ) : (
                      tutorial.action
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Webinar Section */}
          <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <h4 className="font-medium mb-2">{webinar.title}</h4>
            <p className="text-sm text-muted-foreground mb-2">{webinar.description}</p>
            <p className="text-sm text-muted-foreground mb-4">{webinar.subdescription}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{webinar.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>Live & Recorded</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Calendar className="h-3 w-3 mr-1" />
                {webinar.action}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}