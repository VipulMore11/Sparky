"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Edit, Save, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PriceManagerProps {
  currentPrice: number;
  productId: string;
  productTitle: string;
  onPriceUpdate: (productId: string, newPrice: number) => void;
}

export function PriceManager({ currentPrice, productId, productTitle, onPriceUpdate }: PriceManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempPrice, setTempPrice] = useState(currentPrice.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    const newPrice = parseFloat(tempPrice);
    if (!isNaN(newPrice) && newPrice >= 0) {
      onPriceUpdate(productId, newPrice);
      setIsEditing(false);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTempPrice(currentPrice.toString());
    setIsEditing(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          {formatCurrency(currentPrice)}
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Price</DialogTitle>
          <DialogDescription>
            Set a custom price for "{productTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(currentPrice)}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="price">New Price (INR)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={tempPrice}
              onChange={(e) => setTempPrice(e.target.value)}
              placeholder="Enter price in INR"
            />
            <p className="text-xs text-muted-foreground">
              Enter 0 for free products, or any amount for paid products
            </p>
          </div>

          <div className="space-y-2">
            <Label>Price Preview</Label>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-lg font-semibold">
                {tempPrice && !isNaN(parseFloat(tempPrice)) 
                  ? formatCurrency(parseFloat(tempPrice))
                  : "Invalid price"
                }
              </div>
              {tempPrice && !isNaN(parseFloat(tempPrice)) && parseFloat(tempPrice) === 0 && (
                <Badge variant="secondary" className="mt-1">FREE</Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={!tempPrice || isNaN(parseFloat(tempPrice)) || parseFloat(tempPrice) < 0}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Price
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}