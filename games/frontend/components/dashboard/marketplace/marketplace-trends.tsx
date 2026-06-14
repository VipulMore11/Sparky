"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target,
  Clock,
  Star,
  DollarSign,
  Activity
} from "lucide-react";

interface MarketplaceTrendsProps {
  experimentsData?: any[];
}

export function MarketplaceTrends({ experimentsData = [] }: MarketplaceTrendsProps) {
  // Calculate marketplace insights from experiments data
  const calculateMarketplaceInsights = () => {
    if (!experimentsData.length) return null;

    const totalExperiments = experimentsData.length;
    const completedExperiments = experimentsData.filter(exp => exp.status === "completed");
    const totalParticipants = experimentsData.reduce((sum, exp) => sum + exp.participants, 0);
    const avgCompletionRate = experimentsData.reduce((sum, exp) => sum + exp.completion_rate, 0) / totalExperiments;
    const avgEngagement = experimentsData.reduce((sum, exp) => sum + (exp.metrics?.engagement || 0), 0) / totalExperiments;

    // Category distribution
    const categoryStats = experimentsData.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularCategories = Object.entries(categoryStats)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);

    // Estimated market values
    const basePrice = 12500; // Base price per dataset in INR
    const qualityMultiplier = avgEngagement / 100;
    const participantBonus = totalParticipants * 165; // 2 USD = ~165 INR
    
    const estimatedValue = completedExperiments.length * basePrice * qualityMultiplier + participantBonus;

    return {
      totalExperiments,
      completedExperiments: completedExperiments.length,
      totalParticipants,
      avgCompletionRate,
      avgEngagement,
      popularCategories,
      estimatedValue
    };
  };

  const insights = calculateMarketplaceInsights();

  if (!insights) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No data available for marketplace trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const trendingCategories = [
    { name: "Cognitive", demand: 85, growth: "+12%" },
    { name: "Perception-Reaction", demand: 78, growth: "+8%" },
    { name: "Decision Making", demand: 65, growth: "+15%" },
  ];

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sellable Datasets</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.completedExperiments}</div>
            <p className="text-xs text-muted-foreground">
              From {insights.totalExperiments} total experiments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalParticipants.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all experiments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(insights.estimatedValue).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Potential marketplace value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Overview</CardTitle>
          <CardDescription>
            Quality metrics for your experiment data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Average Completion Rate</span>
              <span>{insights.avgCompletionRate.toFixed(1)}%</span>
            </div>
            <Progress value={insights.avgCompletionRate} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Average Engagement</span>
              <span>{insights.avgEngagement.toFixed(1)}%</span>
            </div>
            <Progress value={insights.avgEngagement} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Popular Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Your Research Categories</CardTitle>
          <CardDescription>
            Distribution of your experiments by category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.popularCategories.map(([category, count]) => (
            <div key={category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {category.replace('-', ' ')}
                </Badge>
                <span className="text-sm">{count as number} experiments</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {(((count as number) / insights.totalExperiments) * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Trending Categories</CardTitle>
          <CardDescription>
            Popular categories in the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {trendingCategories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{category.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">{category.growth}</span>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                </div>
              </div>
              <Progress value={category.demand} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {category.demand}% market demand
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}