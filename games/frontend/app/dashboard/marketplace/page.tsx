"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Upload, 
  ShoppingCart, 
  Star, 
  Download, 
  DollarSign,
  FileText,
  Gamepad2,
  TrendingUp,
  Package,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { MarketplaceStats } from "@/components/dashboard/marketplace/marketplace-stats";
import { ProductCard } from "@/components/dashboard/marketplace/product-card";
import { SellProductDialog } from "@/components/dashboard/marketplace/sell-product-dialog";
import { MarketplaceTrends } from "@/components/dashboard/marketplace/marketplace-trends";
import { MarketplaceExperimentCard } from "@/components/dashboard/marketplace/marketplace-experiment-card";
import { GlobalStatsManager } from "@/components/dashboard/marketplace/global-stats-manager";
import { EarningsManager } from "@/components/dashboard/marketplace/earnings-manager";
import { useMarketplaceData } from "@/hooks/use-marketplace-data";
import { useMarketplaceStore } from "@/stores/marketplace-store";

// Mock data for marketplace items
const mockGames = [
  {
    id: "1",
    title: "Memory Palace Challenge",
    description: "Advanced cognitive assessment game testing spatial memory and recall abilities",
    category: "cognitive",
    price: 49.99,
    rating: 4.8,
    downloads: 1234,
    seller: "Dr. Sarah Chen",
    image: "/api/placeholder/300/200",
    tags: ["memory", "spatial", "assessment"]
  },
  {
    id: "2", 
    title: "Reaction Time Pro",
    description: "Professional-grade reaction time measurement tool with advanced analytics",
    category: "perception-reaction",
    price: 89.99,
    rating: 4.9,
    downloads: 856,
    seller: "NeuroLab Research",
    image: "/api/placeholder/300/200",
    tags: ["reaction-time", "motor-skills", "assessment"]
  },
  {
    id: "3",
    title: "Decision Tree Simulator",
    description: "Complex decision-making scenarios for behavioral analysis",
    category: "decision-making",
    price: 75.00,
    rating: 4.7,
    downloads: 672,
    seller: "BehaviorTech Inc",
    image: "/api/placeholder/300/200",
    tags: ["decision-making", "behavior", "simulation"]
  }
];

const mockDatasets = [
  {
    id: "d1",
    title: "Cognitive Performance Dataset (10K participants)",
    description: "Comprehensive dataset with cognitive test results from 10,000 participants across 6 months",
    category: "cognitive",
    price: 299.99,
    rating: 4.9,
    downloads: 245,
    seller: "University Research Lab",
    size: "2.5 GB",
    participants: 10000,
    tags: ["cognitive", "longitudinal", "large-scale"]
  },
  {
    id: "d2",
    title: "Reaction Time Analysis Dataset",
    description: "High-precision reaction time data with demographic and environmental variables",
    category: "perception-reaction",
    price: 149.99,
    rating: 4.6,
    downloads: 189,
    seller: "SportsTech Research",
    size: "850 MB",
    participants: 3500,
    tags: ["reaction-time", "sports", "performance"]
  },
  {
    id: "d3",
    title: "Consumer Behavior Patterns",
    description: "Rich dataset of consumer decision-making patterns in various scenarios",
    category: "consumer-behavior",
    price: 199.99,
    rating: 4.8,
    downloads: 312,
    seller: "Market Research Pro",
    size: "1.2 GB",
    participants: 5000,
    tags: ["consumer", "behavior", "marketing"]
  }
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("your-data");
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [customStats, setCustomStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    averageRating: 4.7,
    activeListings: 0
  });
  
  const { data: marketplaceData, loading, error, refetch } = useMarketplaceData();
  const { getProductsForSale } = useMarketplaceStore();
  
  // Get products that are for sale
  const productsForSale = getProductsForSale();
  
  // Filter products for sale based on search
  const filteredProductsForSale = productsForSale.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats from API data or use custom stats
  const calculateStats = () => {
    if (!marketplaceData) {
      return customStats;
    }

    const completedExperiments = marketplaceData.experiments.filter(exp => exp.status === "completed");
    const totalParticipants = marketplaceData.experiments.reduce((sum, exp) => sum + exp.participants, 0);
    
    // Use custom stats if they have been set, otherwise calculate from data
    return customStats.totalRevenue > 0 || customStats.totalSales > 0 ? customStats : {
      totalRevenue: completedExperiments.length * 150, // Estimated revenue
      totalSales: completedExperiments.length,
      averageRating: 4.7, // Mock rating
      activeListings: marketplaceData.total_records
    };
  };

  const stats = calculateStats();

  const handleStatsUpdate = (newStats: typeof customStats) => {
    setCustomStats(newStats);
  };

  // Filter experiments based on search
  const filteredExperiments = marketplaceData?.experiments.filter(exp =>
    exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading marketplace data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-6 w-6" />
          <span>Error loading marketplace data: {error}</span>
        </div>
        <Button onClick={refetch} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and sell custom games and research datasets
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/marketplace/sell-data">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Sell Your Data
            </Button>
          </Link>
          <Link href="/dashboard/marketplace/my-products">
            <Button variant="outline" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              My Products
            </Button>
          </Link>
          <Button onClick={() => setShowSellDialog(true)} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Sell Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <MarketplaceStats stats={stats} />
        </div>
        <div className="flex flex-col gap-2">
          <EarningsManager initialBalance={stats.totalRevenue * 0.8} monthlyGoal={2000} />
          <GlobalStatsManager stats={stats} onStatsUpdate={handleStatsUpdate} />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search games and datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="your-data" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Your Data ({filteredExperiments.length})
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Browse Marketplace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="your-data" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Your Experiment Data</h3>
              <p className="text-sm text-muted-foreground">
                Experiments from your research that can be turned into sellable datasets
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {marketplaceData?.analytics_processing.status === "success" ? (
                <Badge variant="outline" className="text-green-600">
                  ✓ {marketplaceData.analytics_processing.message}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600">
                  Processing...
                </Badge>
              )}
            </div>
          </div>
          
          {filteredExperiments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiments.map((experiment) => (
                <div key={experiment.id} className="relative">
                  <MarketplaceExperimentCard experiment={experiment} />
                  {experiment.status === "completed" && (
                    <div className="mt-3">
                      <Link href="/dashboard/marketplace/sell-data">
                        <Button size="sm" className="w-full">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Sell This Data
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No experiment data found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No experiments match your search" : "Run some experiments to generate sellable datasets"}
                </p>
                {!searchQuery && (
                  <Button>
                    Create New Experiment
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Available Products</h3>
              <p className="text-sm text-muted-foreground">
                Browse games and datasets from the community
              </p>
            </div>
            <Badge variant="outline">
              {filteredProductsForSale.length} products available
            </Badge>
          </div>
          
          {filteredProductsForSale.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProductsForSale.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  type={product.size ? "dataset" : "game"} 
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products available</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No products match your search" : "Be the first to list a product for sale!"}
                </p>
                <Button onClick={() => setShowSellDialog(true)}>
                  Sell Your First Product
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Sell Product Dialog */}
      <SellProductDialog 
        open={showSellDialog} 
        onOpenChange={setShowSellDialog}
      />
    </div>
  );
}