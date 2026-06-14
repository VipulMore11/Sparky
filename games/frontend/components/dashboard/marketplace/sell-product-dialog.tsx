"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Plus, FileText, Gamepad2, ShoppingCart } from "lucide-react";

interface SellProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SellProductDialog({ open, onOpenChange }: SellProductDialogProps) {
  const [productType, setProductType] = useState<"game" | "dataset">("game");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    tags: [] as string[],
    files: [] as File[],
    isForSale: false // New field to control if product should be available for sale immediately
  });
  const [newTag, setNewTag] = useState("");

  const categories = {
    game: [
      "cognitive",
      "perception-reaction", 
      "decision-making",
      "social-emotional",
      "learning-pattern",
      "consumer-behavior"
    ],
    dataset: [
      "cognitive",
      "perception-reaction",
      "decision-making", 
      "social-emotional",
      "learning-pattern",
      "consumer-behavior",
      "longitudinal-studies",
      "cross-sectional"
    ]
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const removeFile = (fileToRemove: File) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(file => file !== fileToRemove)
    }));
  };

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log("Submitting product:", { productType, ...formData });
    onOpenChange(false);
    // Reset form
    setFormData({
      title: "",
      description: "",
      category: "",
      price: "",
      tags: [],
      files: [],
      isForSale: false
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sell Your Product</DialogTitle>
          <DialogDescription>
            Upload your custom games or research datasets to the marketplace
          </DialogDescription>
        </DialogHeader>

        <Tabs value={productType} onValueChange={(value) => setProductType(value as "game" | "dataset")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="game" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Game
            </TabsTrigger>
            <TabsTrigger value="dataset" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dataset
            </TabsTrigger>
          </TabsList>

          <TabsContent value="game" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Details</CardTitle>
                <CardDescription>
                  Provide information about your custom behavioral game
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="game-title">Game Title</Label>
                    <Input
                      id="game-title"
                      placeholder="Enter game title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="game-price">Price (INR)</Label>
                    <Input
                      id="game-price"
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="game-description">Description</Label>
                  <Textarea
                    id="game-description"
                    placeholder="Describe your game, its objectives, and what it measures"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="game-category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.game.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dataset" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dataset Details</CardTitle>
                <CardDescription>
                  Provide information about your research dataset
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataset-title">Dataset Title</Label>
                    <Input
                      id="dataset-title"
                      placeholder="Enter dataset title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataset-price">Price (INR)</Label>
                    <Input
                      id="dataset-price"
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataset-description">Description</Label>
                  <Textarea
                    id="dataset-description"
                    placeholder="Describe your dataset, methodology, participant demographics, and data structure"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataset-category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.dataset.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Common sections for both types */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>
              Add relevant tags to help researchers find your product
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <Button onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marketplace Availability</CardTitle>
            <CardDescription>
              Choose whether to make your product available for sale immediately
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="font-medium">List for Sale</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formData.isForSale 
                    ? "Product will be immediately available for purchase" 
                    : "Product will be saved as private (you can enable selling later)"
                  }
                </span>
              </div>
              <Switch
                checked={formData.isForSale}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isForSale: checked }))
                }
              />
            </div>
            
            {formData.isForSale && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Marketplace Ready:</strong> Your product will appear in the marketplace immediately after creation and can be purchased by other researchers.
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
            <CardDescription>
              Upload your {productType} files {productType === "dataset" ? "(CSV, JSON, etc.)" : "(ZIP, executable, etc.)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Drop files here or click to upload
                  </span>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileUpload}
                  accept={productType === "dataset" ? ".csv,.json,.xlsx,.txt" : ".zip,.exe,.js,.html"}
                />
              </div>
            </div>
            
            {formData.files.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files:</Label>
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(file)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            List Product
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}