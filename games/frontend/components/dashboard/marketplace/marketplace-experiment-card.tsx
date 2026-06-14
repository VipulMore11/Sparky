"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  Download, 
  DollarSign,
  Activity,
  Clock,
  Target,
  BarChart3
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ExperimentData {
  id: string;
  name: string;
  category: string;
  status: string;
  participants: number;
  completion_rate: number;
  avg_score: number;
  created_at: string;
  duration_days: number;
  metrics: {
    reaction_time: number;
    accuracy: number;
    engagement: number;
    retention: number;
  };
}

interface MarketplaceExperimentCardProps {
  experiment: ExperimentData;
  isForSale?: boolean;
  price?: number;
}

export function MarketplaceExperimentCard({ 
  experiment, 
  isForSale = false, 
  price = 0 
}: MarketplaceExperimentCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "cognitive": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "perception-reaction": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "decision-making": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "consumer-behavior": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      "social-emotional": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      "learning-pattern": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "completed": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "active": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "paused": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      "draft": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    };
    return colors[status] || colors["draft"];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2">
            <Badge className={getCategoryColor(experiment.category)}>
              {experiment.category.replace('-', ' ')}
            </Badge>
            <Badge className={getStatusColor(experiment.status)}>
              {experiment.status}
            </Badge>
          </div>
          {isForSale && price > 0 && (
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(price)}
            </div>
          )}
        </div>
        <CardTitle className="text-lg line-clamp-2">{experiment.name}</CardTitle>
        <CardDescription>
          Created on {formatDate(experiment.created_at)} • {experiment.duration_days} days duration
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-blue-500" />
            <span className="text-muted-foreground">Participants:</span>
            <span className="font-semibold">{experiment.participants}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-3 w-3 text-green-500" />
            <span className="text-muted-foreground">Completion:</span>
            <span className="font-semibold">{experiment.completion_rate}%</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-3 w-3 text-purple-500" />
            <span className="text-muted-foreground">Avg Score:</span>
            <span className="font-semibold">{experiment.avg_score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-orange-500" />
            <span className="text-muted-foreground">Engagement:</span>
            <span className="font-semibold">{experiment.metrics.engagement}%</span>
          </div>
        </div>

        {/* Performance Metrics */}
        {experiment.metrics.reaction_time > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Performance Metrics</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Reaction Time:</span>
                <div className="font-semibold">{experiment.metrics.reaction_time.toFixed(0)}ms</div>
              </div>
              <div>
                <span className="text-muted-foreground">Accuracy:</span>
                <div className="font-semibold">{experiment.metrics.accuracy}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Data Quality Indicators */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Data Quality</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Retention:</span>
              <div className="font-semibold">{(experiment.metrics.retention * 100).toFixed(1)}%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Sample Size:</span>
              <div className="font-semibold">{experiment.participants} participants</div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-auto pt-4">
          {isForSale ? (
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                <Download className="h-3 w-3 mr-1" />
                Buy Dataset
              </Button>
              <Button size="sm" variant="outline">
                Preview
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                View Details
              </Button>
              <Button size="sm">
                Sell Data
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}