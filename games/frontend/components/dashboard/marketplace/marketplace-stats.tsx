"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Star, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MarketplaceStatsProps {
  stats: {
    totalRevenue: number;
    totalSales: number;
    averageRating: number;
    activeListings: number;
  };
}

export function MarketplaceStats({ stats }: MarketplaceStatsProps) {
  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      description: "+12% from last month",
      color: "text-green-600"
    },
    {
      title: "Total Sales",
      value: stats.totalSales.toLocaleString(),
      icon: ShoppingCart,
      description: "+8% from last month",
      color: "text-blue-600"
    },
    {
      title: "Average Rating",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      description: "Across all products",
      color: "text-yellow-600"
    },
    {
      title: "Active Listings",
      value: stats.activeListings.toLocaleString(),
      icon: TrendingUp,
      description: "+3 new this week",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}