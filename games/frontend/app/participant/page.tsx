"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, Target, ChevronRight, Play } from "lucide-react"
import Link from "next/link"
import pb from '@/lib/pb'
import { Navbar } from '@/components/behaviorlab/navbar'

// Define the types based on the provided data structure
type Game = {
  id: string;
  name: string;
  gameType: string;
}

type Experiment = {
  experimentName: string;
  createdAt: string;
  games: Game[];
  gameFlow: {
    startGameId: string;
    sequence: any[];
    conditions: Record<string, any>;
    randomizations: Record<string, any>;
  };
}

type ProjectItem = {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  created_by?: string;
  member_user_id?: string;
  project_id?: string;
  organization?: string;
  updated: string;
  is_published: boolean;
  data: Experiment;
}

type ProjectsResponse = {
  items: ProjectItem[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export default function ParticipantPortal() {
  const [experiments, setExperiments] = useState<ProjectsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch experiments from PocketBase
  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        // Fetch the experiments data
        const records = await pb.collection('get_projects').getList(1, 500);
        console.log("Fetched records:", records);
        setExperiments(records as unknown as ProjectsResponse);
      } catch (error) {
        console.error('Error fetching experiments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiments();
  }, []);

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Common CogniLab Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Research Studies
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Participate in cutting-edge psychology research and contribute to scientific understanding.
          </p>
        </div>

        {/* Available Experiments */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Available Experiments</h3>

          {loading ? (
            <p className="text-muted-foreground">Loading experiments...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {experiments && experiments.items && experiments.items.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{item.data.experimentName}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Created: {formatDate(item.data.createdAt)}</span>
                    </div>

                    {/* Games count */}
                    {item.data.games && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">
                          {item.data.games.length} {item.data.games.length === 1 ? 'game' : 'games'} included
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-end">
                      <Link href={`/participant/onboarding/${item.project_id || item.id}`}>
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Play className="w-4 h-4 mr-1" />
                          Start
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!experiments || !experiments.items || experiments.items.length === 0) && (
                <div className="col-span-3 text-center p-8">
                  <p className="text-muted-foreground">No experiments available at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}