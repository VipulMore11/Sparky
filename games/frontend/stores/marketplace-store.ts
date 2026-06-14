"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  status: 'active' | 'pending' | 'rejected' | 'paused';
  isForSale: boolean;
  sales: number;
  revenue: number;
  rating: number;
  downloads: number;
  views: number;
  seller: string;
  tags: string[];
  createdAt: string;
  lastUpdated: string;
  // Optional fields for datasets
  size?: string;
  participants?: number;
  // Optional fields for games
  image?: string;
}

interface MarketplaceState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  toggleProductSaleStatus: (id: string) => void;
  getProductsForSale: () => Product[];
  getMyProducts: () => Product[];
}

// Initial mock data
const initialProducts: Product[] = [
  {
    id: "mg1",
    title: "Stroop Test Advanced",
    description: "Enhanced version of the classic Stroop test with customizable parameters",
    category: "perception-reaction",
    price: 75.00,
    status: "active",
    isForSale: true,
    sales: 23,
    revenue: 1725.00,
    rating: 4.6,
    downloads: 45,
    views: 234,
    seller: "You",
    createdAt: "2025-09-15",
    lastUpdated: "2025-10-10",
    image: "/api/placeholder/300/200",
    tags: ["stroop", "perception", "assessment"]
  },
  {
    id: "mg2",
    title: "Working Memory Challenge",
    description: "N-back task implementation for working memory assessment",
    category: "cognitive", 
    price: 120.00,
    status: "active",
    isForSale: true,
    sales: 0,
    revenue: 0,
    rating: 0,
    downloads: 0,
    views: 12,
    seller: "You",
    createdAt: "2025-10-08",
    lastUpdated: "2025-10-08",
    image: "/api/placeholder/300/200",
    tags: ["working-memory", "n-back", "cognitive"]
  },
  {
    id: "md1",
    title: "Reaction Time Study - Young Adults",
    description: "Comprehensive reaction time data from 500 participants aged 18-25",
    category: "perception-reaction",
    price: 199.99,
    status: "active",
    isForSale: true,
    sales: 8,
    revenue: 1599.92,
    rating: 4.8,
    downloads: 12,
    views: 89,
    seller: "You",
    tags: ["reaction-time", "young-adults", "dataset"],
    size: "1.2 GB",
    participants: 500,
    createdAt: "2025-08-20",
    lastUpdated: "2025-09-25"
  },
  {
    id: "md2", 
    title: "Decision Making Patterns",
    description: "Consumer choice data across different scenarios and demographics",
    category: "decision-making",
    price: 350.00,
    status: "active",
    isForSale: true,
    sales: 15,
    revenue: 5250.00,
    rating: 4.9,
    downloads: 18,
    views: 156,
    seller: "You",
    tags: ["decision-making", "consumer-behavior", "patterns"],
    size: "2.8 GB",
    participants: 1200,
    createdAt: "2025-07-10",
    lastUpdated: "2025-10-05"
  }
];

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      
      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
        })),
      
      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, ...updates, lastUpdated: new Date().toISOString() } : product
          ),
        })),
      
      toggleProductSaleStatus: (id) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? { ...product, isForSale: !product.isForSale, lastUpdated: new Date().toISOString() }
              : product
          ),
        })),
      
      getProductsForSale: () => {
        return get().products.filter((product) => product.isForSale && product.status === 'active');
      },
      
      getMyProducts: () => {
        return get().products.filter((product) => product.seller === 'You');
      },
    }),
    {
      name: 'marketplace-storage',
    }
  )
);