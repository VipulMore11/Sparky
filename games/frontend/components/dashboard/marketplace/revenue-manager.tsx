"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Edit, Save, X, Plus, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RevenueManagerProps {
  currentRevenue: number;
  currentSales: number;
  productId: string;
  productTitle: string;
  onRevenueUpdate: (productId: string, newRevenue: number, newSales: number) => void;
}

export function RevenueManager({ 
  currentRevenue, 
  currentSales, 
  productId, 
  productTitle, 
  onRevenueUpdate 
}: RevenueManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRevenue, setTempRevenue] = useState(currentRevenue.toString());
  const [tempSales, setTempSales] = useState(currentSales.toString());
  const [activeTab, setActiveTab] = useState("direct");

  const handleSave = () => {
    const newRevenue = parseFloat(tempRevenue);
    const newSales = parseInt(tempSales);
    
    if (!isNaN(newRevenue) && newRevenue >= 0 && !isNaN(newSales) && newSales >= 0) {
      onRevenueUpdate(productId, newRevenue, newSales);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTempRevenue(currentRevenue.toString());
    setTempSales(currentSales.toString());
    setIsOpen(false);
  };

  const addQuickRevenue = (amount: number) => {
    const current = parseFloat(tempRevenue) || 0;
    setTempRevenue((current + amount).toString());
  };

  const addQuickSales = (count: number) => {
    const current = parseInt(tempSales) || 0;
    setTempSales(Math.max(0, current + count).toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {formatCurrency(currentRevenue)}
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Revenue & Sales</DialogTitle>
          <DialogDescription>
            Set custom revenue and sales numbers for "{productTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Current Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(currentRevenue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Current Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-blue-600">
                  {currentSales} sales
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="direct">Direct Entry</TabsTrigger>
              <TabsTrigger value="quick">Quick Add</TabsTrigger>
            </TabsList>
            
            <TabsContent value="direct" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue">Total Revenue (INR)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={tempRevenue}
                    onChange={(e) => setTempRevenue(e.target.value)}
                    placeholder="Enter total revenue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sales">Total Sales Count</Label>
                  <Input
                    id="sales"
                    type="number"
                    min="0"
                    value={tempSales}
                    onChange={(e) => setTempSales(e.target.value)}
                    placeholder="Enter sales count"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="quick" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Add to Revenue</Label>
                  <div className="flex gap-2 mt-2">
                    {[10, 50, 100, 500, 1000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => addQuickRevenue(amount)}
                      >
                        +${amount}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Add to Sales</Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 5, 10, 25, 50].map((count) => (
                      <Button
                        key={count}
                        variant="outline"
                        size="sm"
                        onClick={() => addQuickSales(count)}
                      >
                        +{count}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addQuickSales(-1)}
                      disabled={parseInt(tempSales) <= 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">New Revenue</div>
                  <div className="text-lg font-bold text-green-600">
                    {tempRevenue && !isNaN(parseFloat(tempRevenue)) 
                      ? formatCurrency(parseFloat(tempRevenue))
                      : "₹0.00"
                    }
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">New Sales</div>
                  <div className="text-lg font-bold text-blue-600">
                    {tempSales && !isNaN(parseInt(tempSales)) 
                      ? `${tempSales} sales`
                      : "0 sales"
                    }
                  </div>
                </div>
              </div>
              {tempRevenue && tempSales && !isNaN(parseFloat(tempRevenue)) && !isNaN(parseInt(tempSales)) && parseInt(tempSales) > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Average per sale: {formatCurrency(parseFloat(tempRevenue) / parseInt(tempSales))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={
                !tempRevenue || !tempSales || 
                isNaN(parseFloat(tempRevenue)) || isNaN(parseInt(tempSales)) ||
                parseFloat(tempRevenue) < 0 || parseInt(tempSales) < 0
              }
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}