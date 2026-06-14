"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Users, Package, Edit, Save, X, Target } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface GlobalStatsManagerProps {
  stats: {
    totalRevenue: number;
    totalSales: number;
    averageRating: number;
    activeListings: number;
  };
  onStatsUpdate: (newStats: {
    totalRevenue: number;
    totalSales: number;
    averageRating: number;
    activeListings: number;
  }) => void;
}

export function GlobalStatsManager({ stats, onStatsUpdate }: GlobalStatsManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStats, setTempStats] = useState({
    totalRevenue: stats.totalRevenue.toString(),
    totalSales: stats.totalSales.toString(),
    averageRating: stats.averageRating.toString(),
    activeListings: stats.activeListings.toString()
  });

  const handleSave = () => {
    const newStats = {
      totalRevenue: parseFloat(tempStats.totalRevenue) || 0,
      totalSales: parseInt(tempStats.totalSales) || 0,
      averageRating: parseFloat(tempStats.averageRating) || 0,
      activeListings: parseInt(tempStats.activeListings) || 0
    };

    onStatsUpdate(newStats);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempStats({
      totalRevenue: stats.totalRevenue.toString(),
      totalSales: stats.totalSales.toString(),
      averageRating: stats.averageRating.toString(),
      activeListings: stats.activeListings.toString()
    });
    setIsOpen(false);
  };

  const addToRevenue = (amount: number) => {
    const current = parseFloat(tempStats.totalRevenue) || 0;
    setTempStats(prev => ({ ...prev, totalRevenue: (current + amount).toString() }));
  };

  const addToSales = (count: number) => {
    const current = parseInt(tempStats.totalSales) || 0;
    setTempStats(prev => ({ ...prev, totalSales: Math.max(0, current + count).toString() }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Edit className="h-3 w-3" />
          Customize Stats
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Marketplace Statistics</DialogTitle>
          <DialogDescription>
            Customize your marketplace performance metrics
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Stats Display */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-blue-600">
                  {stats.totalSales.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-yellow-600">
                  {stats.averageRating.toFixed(1)}★
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-purple-600">
                  {stats.activeListings}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="quick">Quick Actions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue">Total Revenue (INR)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={tempStats.totalRevenue}
                    onChange={(e) => setTempStats(prev => ({ ...prev, totalRevenue: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sales">Total Sales</Label>
                  <Input
                    id="sales"
                    type="number"
                    min="0"
                    value={tempStats.totalSales}
                    onChange={(e) => setTempStats(prev => ({ ...prev, totalSales: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Average Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={tempStats.averageRating}
                    onChange={(e) => setTempStats(prev => ({ ...prev, averageRating: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listings">Active Listings</Label>
                  <Input
                    id="listings"
                    type="number"
                    min="0"
                    value={tempStats.activeListings}
                    onChange={(e) => setTempStats(prev => ({ ...prev, activeListings: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="quick" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Add Revenue</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[100, 500, 1000, 5000, 10000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => addToRevenue(amount)}
                      >
                        +{formatCurrency(amount)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Add Sales</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[1, 5, 10, 50, 100].map((count) => (
                      <Button
                        key={count}
                        variant="outline"
                        size="sm"
                        onClick={() => addToSales(count)}
                      >
                        +{count} sales
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Preview New Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                  <div className="text-sm font-bold text-green-600">
                    {tempStats.totalRevenue && !isNaN(parseFloat(tempStats.totalRevenue)) 
                      ? formatCurrency(parseFloat(tempStats.totalRevenue))
                      : "₹0.00"
                    }
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Sales</div>
                  <div className="text-sm font-bold text-blue-600">
                    {tempStats.totalSales || "0"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                  <div className="text-sm font-bold text-yellow-600">
                    {tempStats.averageRating ? parseFloat(tempStats.averageRating).toFixed(1) : "0.0"}★
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Listings</div>
                  <div className="text-sm font-bold text-purple-600">
                    {tempStats.activeListings || "0"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}