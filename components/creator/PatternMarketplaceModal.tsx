"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PatternData, PatternProductParams } from "@/types";
import { Upload, Sparkles, Loader2, X } from "lucide-react";
import { uploadImage } from "@/lib/actions/community.action";
import { createPatternProduct } from "@/lib/actions/pattern.action";
import { toast } from "sonner";

interface PatternMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  patternData: PatternData;
  onSuccess: () => void;
}

export default function PatternMarketplaceModal({
  isOpen,
  onClose,
  patternData,
  onSuccess,
}: PatternMarketplaceModalProps) {
  const [formData, setFormData] = useState({
    description: `${patternData.patternName} - A ${patternData.difficultyLevel} level ${patternData.projectType} pattern using ${patternData.yarnWeight} yarn with ${patternData.hookSize} hook.`,
    price: 0,
    imageUrl: null as string | null,
  });

  const [uploading, setUploading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploading(true);
    try {
      const result = await uploadImage(file);
      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, imageUrl: result.url }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const generateProductImage = async () => {
    setGeneratingImage(true);
    try {
      const response = await fetch('/api/patterns/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectType: patternData.projectType,
          patternName: patternData.patternName,
          description: `A beautiful ${patternData.projectType} made with ${patternData.yarnWeight} yarn`
        }),
      });

      const data = await response.json();
      if (data.success && data.imageUrl) {
        setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
        toast.success("Product image generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate image");
      }
    } catch (error) {
      console.error("Image generation failed:", error);
      toast.error("Failed to generate image");
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim() || formData.price <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const patternProductData: PatternProductParams = {
        name: patternData.patternName,
        description: formData.description,
        category: "crochet pattern",
        price: formData.price,
        imageUrl: formData.imageUrl,
        stock: undefined, // Digital products don't need stock
        materials: [], // Will be extracted from pattern content
        difficulty: patternData.difficultyLevel as "beginner" | "intermediate" | "advanced",
        tags: [patternData.projectType, "crochet", "pattern", "digital"],
        patternContent: patternData.generatedPattern,
        patternData: patternData,
        productType: 'pattern'
      };

      const result = await createPatternProduct(patternProductData);
      
      if (result.success) {
        toast.success("Pattern added to marketplace successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(result.message || "Failed to add pattern to marketplace");
      }
    } catch (error) {
      console.error("Error adding pattern to marketplace:", error);
      toast.error("Failed to add pattern to marketplace");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Pattern to Marketplace
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pattern Name (readonly) */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Pattern Name
            </Label>
            <Input
              type="text"
              value={patternData.patternName}
              readOnly
              className="mt-1 bg-gray-50 dark:bg-gray-700"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Description *
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="mt-1"
              rows={4}
              placeholder="Describe your pattern..."
            />
          </div>

          {/* Price */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Price (R) *
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
              className="mt-1"
              placeholder="0.00"
            />
          </div>

          {/* Category (readonly) */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Category
            </Label>
            <Input
              type="text"
              value="Crochet Pattern"
              readOnly
              className="mt-1 bg-gray-50 dark:bg-gray-700"
            />
          </div>

          {/* Pattern Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Project Type
              </Label>
              <Input
                type="text"
                value={patternData.projectType}
                readOnly
                className="mt-1 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Difficulty
              </Label>
              <Input
                type="text"
                value={patternData.difficultyLevel}
                readOnly
                className="mt-1 bg-gray-50 dark:bg-gray-700"
              />
            </div>
          </div>

          {/* Image Upload/Generation */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Product Image
            </Label>
            
            <div className="flex gap-3 mb-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition">
                <Upload className="h-4 w-4" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <Button
                type="button"
                onClick={generateProductImage}
                disabled={generatingImage}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                {generatingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
            </div>

            {uploading && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading image...
              </p>
            )}

            {formData.imageUrl && (
              <Image
                src={formData.imageUrl}
                alt="Product preview"
                width={128}
                height={128}
                className="mt-3 rounded-lg object-cover border"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !formData.description.trim() || formData.price <= 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding to Marketplace...
                </>
              ) : (
                "Add to Marketplace"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}