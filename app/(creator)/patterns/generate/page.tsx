"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Sparkles, Info } from "lucide-react";
import { toast } from "sonner";
import PatternPreview from "@/components/creator/PatternPreview";
import PatternEditor from "@/components/creator/PatternEditor";

const PatternGeneratorPage = () => {
  const [formData, setFormData] = useState({
    patternName: "",
    projectType: "",
    difficultyLevel: "",
    yarnWeight: "",
    hookSize: "",
    sizeDimensions: "",
    customInstructions: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPattern, setGeneratedPattern] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGeneratePattern = async () => {
    setIsGenerating(true);
    setGeneratedPattern(null); // reset preview

    try {
      const response = await fetch("/api/patterns/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.message || "Something went wrong!");
        setIsGenerating(false);
        return;
      }

      toast.success(data.message);

      // Show pattern in preview card instead of console
      setGeneratedPattern(data.pattern); // save pattern into state
    } catch {
      toast.error("Request failed!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pattern Generator
          </h1>
          <p className="text-gray-600">
            Create professional crochet patterns with AI assistance
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pattern Configuration Card */}
          <Card className="p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Pattern Configuration
              </h2>
            </div>

            <div className="space-y-6">
              {/* Pattern Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="patternName"
                  className="text-sm font-medium text-gray-700"
                >
                  Pattern Name *
                </Label>
                <Input
                  id="patternName"
                  placeholder="e.g., Cozy Winter Scarf"
                  value={formData.patternName}
                  onChange={(e) =>
                    handleInputChange("patternName", e.target.value)
                  }
                  className="w-full"
                />
              </div>

              {/* Project Type and Difficulty Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Project Type
                  </Label>
                  <Select
                    value={formData.projectType}
                    onValueChange={(value) =>
                      handleInputChange("projectType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scarf">Scarf</SelectItem>
                      <SelectItem value="hat">Hat</SelectItem>
                      <SelectItem value="blanket">Blanket</SelectItem>
                      <SelectItem value="sweater">Sweater</SelectItem>
                      <SelectItem value="amigurumi">Amigurumi</SelectItem>
                      <SelectItem value="bag">Bag</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Difficulty Level
                  </Label>
                  <Select
                    value={formData.difficultyLevel}
                    onValueChange={(value) =>
                      handleInputChange("difficultyLevel", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Yarn Weight and Hook Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Yarn Weight
                  </Label>
                  <Select
                    value={formData.yarnWeight}
                    onValueChange={(value) =>
                      handleInputChange("yarnWeight", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select weight" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lace">0 - Lace</SelectItem>
                      <SelectItem value="super-fine">1 - Super Fine</SelectItem>
                      <SelectItem value="fine">2 - Fine</SelectItem>
                      <SelectItem value="light">3 - Light</SelectItem>
                      <SelectItem value="medium">4 - Medium</SelectItem>
                      <SelectItem value="bulky">5 - Bulky</SelectItem>
                      <SelectItem value="super-bulky">
                        6 - Super Bulky
                      </SelectItem>
                      <SelectItem value="jumbo">7 - Jumbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Hook Size
                  </Label>
                  <Input
                    placeholder="e.g., H/8(5.0mm)"
                    value={formData.hookSize}
                    onChange={(e) =>
                      handleInputChange("hookSize", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Size/Dimensions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Size/Dimensions
                </Label>
                <Input
                  placeholder="e.g., Adult Medium, 60 x 8 inches, One Size"
                  value={formData.sizeDimensions}
                  onChange={(e) =>
                    handleInputChange("sizeDimensions", e.target.value)
                  }
                />
              </div>

              {/* Custom Instructions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Custom Instructions (Optional)
                </Label>
                <Textarea
                  placeholder="Add any special notes, modifications, or additional instructions..."
                  value={formData.customInstructions}
                  onChange={(e) =>
                    handleInputChange("customInstructions", e.target.value)
                  }
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGeneratePattern}
                disabled={
                  !formData.patternName || !formData.projectType || isGenerating
                }
                className="w-full bg-primary-500/70 hover:bg-primary-600 text-white py-3 text-lg font-medium"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {isGenerating
                  ? "Generating Professional Pattern..."
                  : "Generate Professional Pattern"}
              </Button>
            </div>
          </Card>

          {/* Pattern Preview */}
          {isGenerating ? (
            <Card className="p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Pattern Preview
                </h2>
              </div>
              <div className="flex flex-col items-center justify-center h-64 md:h-80 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
                  <p className="text-gray-600 font-medium">
                    Generating your pattern...
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    This may take a few moments
                  </p>
                </div>
              </div>
            </Card>
          ) : generatedPattern && !isEditing ? (
            <PatternPreview
              patternData={{
                ...formData,
                generatedPattern
              }}
              onEdit={() => {
                setIsEditing(true);
              }}
            />
          ) : generatedPattern && isEditing ? (
            <PatternEditor
              patternData={{
                ...formData,
                generatedPattern
              }}
              onSave={(updatedPatternData) => {
                setGeneratedPattern(updatedPatternData.generatedPattern);
                setIsEditing(false);
                toast.success("Pattern updated successfully!");
              }}
              onCancel={() => {
                setIsEditing(false);
              }}
            />
          ) : (
            <Card className="p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Pattern Preview
                </h2>
              </div>
              <div className="flex flex-col items-center justify-center h-64 md:h-80 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Sparkles className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">
                    Fill in the pattern details to generate your professional
                    pattern
                  </p>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                    <Info className="w-4 h-4" />
                    <span>
                      Patterns include materials, gauge, instructions, and
                      finishing details
                    </span>
                  </div>
                </div>
              </div>
              {/* Pattern Features */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  Your pattern will include:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Complete materials list with yarn requirements</li>
                  <li>• Detailed gauge and tension information</li>
                  <li>• Step-by-step instructions with stitch counts</li>
                  <li>• Professional formatting and layout</li>
                  <li>• Finishing and assembly details</li>
                </ul>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatternGeneratorPage;
