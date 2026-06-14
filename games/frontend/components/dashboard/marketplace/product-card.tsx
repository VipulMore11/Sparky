"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Download, ShoppingCart, Users, HardDrive } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    rating: number;
    downloads: number;
    seller: string;
    tags: string[];
    size?: string;
    participants?: number;
  };
  type: "game" | "dataset";
}

export function ProductCard({ product, type }: ProductCardProps) {

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

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge className={getCategoryColor(product.category)}>
            {product.category.replace('-', ' ')}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {product.rating}
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {product.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>By {product.seller}</span>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {product.downloads.toLocaleString()}
            </div>
          </div>
          
          {type === "dataset" && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {product.size && (
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {product.size}
                </div>
              )}
              {product.participants && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {product.participants.toLocaleString()} participants
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {product.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{product.tags.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              <ShoppingCart className="h-3 w-3 mr-1" />
              Buy Now
            </Button>
            <Button size="sm" variant="outline">
              Preview
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}