"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function ExperimentsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "flow-builder") {
      router.push("/dashboard/experiments/flow-builder")
    } else if (value === "game-builder") {
      router.push("/dashboard/experiments/game-builder")
    } else {
      router.push("/dashboard/experiments")
    }
  }

  return (
    <main className="flex h-[calc(100vh-6rem)] min-h-[640px] flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Experiments</h2>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabChange} className="w-full">

        <TabsContent value="dashboard" className="w-full">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-2">Create Your Experiment</h3>
              <p className="text-muted-foreground">Choose from our behavioral research experiment types</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div
                className="group border rounded-xl p-8 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary bg-card"
                onClick={() => handleTabChange("game-builder")}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Cognitive Game</h4>
                    <p className="text-muted-foreground">Create interactive cognitive tasks and behavioral experiments</p>
                  </div>
                  <Button variant="default" size="sm" className="mt-4">
                    Create Cognitive Game
                  </Button>
                </div>
              </div>

              <div
                className="group border rounded-xl p-8 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary bg-card"
                onClick={() => handleTabChange("flow-builder")}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Experiment Flow</h4>
                    <p className="text-muted-foreground">Design complex experiment workflows with visual editor</p>
                  </div>
                  <Button variant="default" size="sm" className="mt-4">
                    Create Experiment Flow
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="flow-builder">
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">Experiment Flow Builder</h3>
              <p className="text-muted-foreground max-w-md mx-auto">Create sophisticated experiment workflows with our intuitive drag-and-drop visual editor</p>
            </div>
            <Button
              size="lg"
              onClick={() => router.push("/dashboard/experiments/flow-builder")}
              className="mt-6"
            >
              Open Flow Builder
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="game-builder">
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">Cognitive Game Creator</h3>
              <p className="text-muted-foreground max-w-md mx-auto">Design interactive cognitive tasks and behavioral experiments with our comprehensive game editor</p>
            </div>
            <Button
              size="lg"
              onClick={() => router.push("/dashboard/experiments/game-builder")}
              className="mt-6"
            >
              Open Game Creator
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
