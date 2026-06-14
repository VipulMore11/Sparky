"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  DollarSign,
  TrendingUp,
  Download,
  Star,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  RefreshCw,
  ShoppingCart,
  Package
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { SellProductDialog } from "@/components/dashboard/marketplace/sell-product-dialog";
import { PriceManager } from "@/components/dashboard/marketplace/price-manager";
import { RevenueManager } from "@/components/dashboard/marketplace/revenue-manager";
import { useMarketplaceData } from "@/hooks/use-marketplace-data";
import { useMarketplaceStore } from "@/stores/marketplace-store";

export default function MyProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("games");
  const [showSellDialog, setShowSellDialog] = useState(false);
  
  const { getMyProducts, toggleProductSaleStatus, updateProduct } = useMarketplaceStore();
  const myProducts = getMyProducts();
  
  // Separate games and datasets
  const games = myProducts.filter(product => !product.size); // Games don't have size property
  const datasets = myProducts.filter(product => product.size); // Datasets have size property

  const toggleSaleStatus = (productId: string, type: 'game' | 'dataset') => {
    toggleProductSaleStatus(productId);
  };

  const updatePrice = (productId: string, newPrice: number, type: 'game' | 'dataset') => {
    updateProduct(productId, { price: newPrice });
  };

  const updateRevenue = (productId: string, newRevenue: number, newSales: number, type: 'game' | 'dataset') => {
    updateProduct(productId, { revenue: newRevenue, sales: newSales });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "active": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      "rejected": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      "paused": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    };
    return colors[status] || colors["pending"];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const ProductCard = ({ product, type }: { product: any; type: 'game' | 'dataset' }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(product.status)}>
                {product.status}
              </Badge>
              <Badge variant="outline">
                {product.category.replace('-', ' ')}
              </Badge>
              {product.isForSale && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  For Sale
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">{product.title}</CardTitle>
            <CardDescription className="mt-1">
              {product.description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Marketplace Sell Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Marketplace Listing</span>
            <span className="text-xs text-muted-foreground">
              {product.isForSale ? "Available for purchase" : "Private product"}
            </span>
          </div>
          <Switch
            checked={product.isForSale}
            onCheckedChange={() => toggleSaleStatus(product.id, type)}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">Price</div>
            <PriceManager
              currentPrice={product.price}
              productId={product.id}
              productTitle={product.title}
              onPriceUpdate={(id, price) => updatePrice(id, price, type)}
            />
          </div>
          <div>
            <div className="text-muted-foreground">Sales</div>
            <div className="font-semibold">{product.isForSale ? product.sales : 'N/A'}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Revenue</div>
            {product.isForSale ? (
              <RevenueManager
                currentRevenue={product.revenue}
                currentSales={product.sales}
                productId={product.id}
                productTitle={product.title}
                onRevenueUpdate={(id, revenue, sales) => updateRevenue(id, revenue, sales, type)}
              />
            ) : (
              <div className="font-semibold">N/A</div>
            )}
          </div>
          <div>
            <div className="text-muted-foreground">Views</div>
            <div className="font-semibold">{product.isForSale ? product.views : 'N/A'}</div>
          </div>
        </div>

        {type === "dataset" && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">File Size</div>
              <div className="font-semibold">{product.size}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Participants</div>
              <div className="font-semibold">{product.participants?.toLocaleString()}</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {product.rating > 0 && product.isForSale && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {product.rating}
              </div>
            )}
            {product.isForSale && (
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {product.downloads}
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Updated {formatDate(product.lastUpdated)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const totalRevenue = myProducts.reduce((sum, product) => sum + (product.isForSale ? product.revenue : 0), 0);
  const totalSales = myProducts.reduce((sum, product) => sum + (product.isForSale ? product.sales : 0), 0);
  const totalProducts = myProducts.length;
  const productsForSale = myProducts.filter(product => product.isForSale).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Products</h1>
          <p className="text-muted-foreground">
            Manage your marketplace listings and track performance
          </p>
        </div>
        <Button onClick={() => setShowSellDialog(true)} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{totalSales}</div>
                <p className="text-xs text-muted-foreground">Total Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{productsForSale}</div>
                <p className="text-xs text-muted-foreground">For Sale</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search your products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Products Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="games">
            Games ({games.length})
          </TabsTrigger>
          <TabsTrigger value="datasets">
            Datasets ({datasets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-6">
          {games.length > 0 ? (
            <div className="grid gap-4">
              {games.map((game) => (
                <ProductCard key={game.id} product={game} type="game" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No games uploaded yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start selling your custom behavioral games on the marketplace
                </p>
                <Button onClick={() => setShowSellDialog(true)}>
                  Upload Your First Game
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="datasets" className="space-y-6">
          {datasets.length > 0 ? (
            <div className="grid gap-4">
              {datasets.map((dataset) => (
                <ProductCard key={dataset.id} product={dataset} type="dataset" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No datasets uploaded yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your research data and earn from your valuable datasets
                </p>
                <Button onClick={() => setShowSellDialog(true)}>
                  Upload Your First Dataset
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