"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Filter, 
  DollarSign,
  FileText,
  Users,
  Calendar,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  RefreshCw
} from "lucide-react";
import { MarketplaceExperimentCard } from "@/components/dashboard/marketplace/marketplace-experiment-card";
import { useMarketplaceData } from "@/hooks/use-marketplace-data";

interface SellDataFormData {
  experimentId: string;
  title: string;
  description: string;
  price: string;
  includeRawData: boolean;
  includeProcessedData: boolean;
  includeMetadata: boolean;
  includeAnalysis: boolean;
  tags: string[];
}

export default function SellDataPage() {
  const [selectedExperiment, setSelectedExperiment] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<SellDataFormData>({
    experimentId: "",
    title: "",
    description: "",
    price: "",
    includeRawData: true,
    includeProcessedData: true,
    includeMetadata: true,
    includeAnalysis: false,
    tags: []
  });

  const { data: marketplaceData, loading, error, refetch } = useMarketplaceData();

  // Filter experiments that are eligible for data selling
  const eligibleExperiments = marketplaceData?.experiments.filter(exp => 
    exp.status === "completed" && 
    exp.participants > 0 && 
    exp.completion_rate > 0 &&
    exp.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const ineligibleExperiments = marketplaceData?.experiments.filter(exp => 
    (exp.status !== "completed" || 
     exp.participants === 0 || 
     exp.completion_rate === 0) &&
    exp.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSelectExperiment = (experiment: any) => {
    setSelectedExperiment(experiment);
    setFormData(prev => ({
      ...prev,
      experimentId: experiment.id,
      title: `${experiment.name} - Research Dataset`,
      description: `High-quality behavioral data from ${experiment.participants} participants in ${experiment.category} category. Includes performance metrics, timing data, and demographic information.`
    }));
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    console.log("Submitting dataset for marketplace:", formData);
    // Here you would send the data to your backend
    setShowForm(false);
    setSelectedExperiment(null);
  };

  const getDataQualityScore = (experiment: any) => {
    let score = 0;
    if (experiment.participants >= 10) score += 25;
    else if (experiment.participants >= 5) score += 15;
    else if (experiment.participants >= 1) score += 5;
    
    if (experiment.completion_rate >= 80) score += 25;
    else if (experiment.completion_rate >= 60) score += 15;
    else if (experiment.completion_rate >= 40) score += 10;
    
    if (experiment.metrics.engagement >= 80) score += 25;
    else if (experiment.metrics.engagement >= 60) score += 15;
    else if (experiment.metrics.engagement >= 40) score += 10;
    
    if (experiment.duration_days >= 7) score += 25;
    else if (experiment.duration_days >= 3) score += 15;
    else if (experiment.duration_days >= 1) score += 10;
    
    return Math.min(score, 100);
  };

  const getRecommendedPrice = (experiment: any) => {
    const basePrice = 50;
    const participantMultiplier = experiment.participants * 2;
    const qualityMultiplier = getDataQualityScore(experiment) / 100;
    const categoryMultiplier = experiment.category === "cognitive" ? 1.2 : 1.0;
    
    return Math.round((basePrice + participantMultiplier) * qualityMultiplier * categoryMultiplier);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading experiment data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-6 w-6" />
          <span>Error loading experiment data: {error}</span>
        </div>
        <Button onClick={refetch} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (showForm && selectedExperiment) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sell Experiment Data</h1>
            <p className="text-muted-foreground">
              Create a marketplace listing for your research dataset
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Back to Experiments
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dataset Information</CardTitle>
                <CardDescription>
                  Provide details about your dataset for potential buyers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Dataset Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (INR)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder={`Recommended: $${getRecommendedPrice(selectedExperiment)}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended price based on data quality: ${getRecommendedPrice(selectedExperiment)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Inclusions</CardTitle>
                <CardDescription>
                  Select what data components to include in your dataset
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rawData"
                    checked={formData.includeRawData}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, includeRawData: checked as boolean }))
                    }
                  />
                  <Label htmlFor="rawData">Raw experiment data (CSV)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="processedData"
                    checked={formData.includeProcessedData}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, includeProcessedData: checked as boolean }))
                    }
                  />
                  <Label htmlFor="processedData">Processed/cleaned data</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metadata"
                    checked={formData.includeMetadata}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, includeMetadata: checked as boolean }))
                    }
                  />
                  <Label htmlFor="metadata">Metadata and data dictionary</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="analysis"
                    checked={formData.includeAnalysis}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, includeAnalysis: checked as boolean }))
                    }
                  />
                  <Label htmlFor="analysis">Statistical analysis and reports (+₹2,000)</Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleFormSubmit}>
                List Dataset
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dataset Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <MarketplaceExperimentCard 
                  experiment={selectedExperiment}
                  isForSale={true}
                  price={parseFloat(formData.price) || getRecommendedPrice(selectedExperiment)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Quality Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {getDataQualityScore(selectedExperiment)}/100
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Participants</span>
                    <span>{selectedExperiment.participants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion Rate</span>
                    <span>{selectedExperiment.completion_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engagement</span>
                    <span>{selectedExperiment.metrics.engagement}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span>{selectedExperiment.duration_days} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sell Your Data</h1>
          <p className="text-muted-foreground">
            Turn your completed experiments into valuable datasets
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search experiments..."
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

      {/* Eligible Experiments */}
      {eligibleExperiments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Ready to Sell ({eligibleExperiments.length})</h2>
          </div>
          <p className="text-muted-foreground">
            These experiments have sufficient data quality for marketplace listing
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligibleExperiments.map((experiment) => (
              <div key={experiment.id} className="relative">
                <MarketplaceExperimentCard experiment={experiment} />
                <div className="mt-3 flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleSelectExperiment(experiment)}
                  >
                    <DollarSign className="h-3 w-3 mr-1" />
                    Sell Data
                  </Button>
                  <Badge variant="secondary" className="px-2 py-1">
                    Score: {getDataQualityScore(experiment)}/100
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ineligible Experiments */}
      {ineligibleExperiments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold">Not Ready ({ineligibleExperiments.length})</h2>
          </div>
          <p className="text-muted-foreground">
            These experiments need more data before they can be sold
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ineligibleExperiments.map((experiment) => (
              <div key={experiment.id} className="relative opacity-60">
                <MarketplaceExperimentCard experiment={experiment} />
                <div className="mt-3">
                  <Badge variant="outline" className="w-full justify-center">
                    {experiment.status !== "completed" ? "Not Completed" : 
                     experiment.participants === 0 ? "No Participants" :
                     "Insufficient Data"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {eligibleExperiments.length === 0 && ineligibleExperiments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No experiments found</h3>
            <p className="text-muted-foreground mb-4">
              Run some experiments first to generate sellable datasets
            </p>
            <Button>
              Create New Experiment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}