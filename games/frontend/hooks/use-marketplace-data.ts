"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export interface ExperimentData {
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

export interface MarketplaceData {
  survey_data_status: {
    records_fetched: number;
    status: string;
    message: string;
  };
  analytics_processing: {
    status: string;
    message: string;
  };
  total_records: number;
  experiments: ExperimentData[];
}

export function useMarketplaceData() {
  const [data, setData] = useState<MarketplaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchMarketplaceData = async () => {
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get auth token - you may need to adjust this based on your auth implementation
      const authToken = typeof window !== "undefined"
        ? localStorage.getItem("authToken") || user.id
        : user.id; // Fallback to user ID if no token or on server

      const response = await fetch("https://serverless-function-shbm.onrender.com/get_marketplace", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const marketplaceData: MarketplaceData = await response.json();
      setData(marketplaceData);
    } catch (err) {
      console.error("Error fetching marketplace data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch marketplace data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMarketplaceData();
    }
  }, [user]);

  const refetch = () => {
    fetchMarketplaceData();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}