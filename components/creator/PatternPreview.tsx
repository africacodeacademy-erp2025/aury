"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Store, Sparkles } from "lucide-react";
import { PatternData } from "@/types";
import PatternMarketplaceModal from "./PatternMarketplaceModal";
// import PatternMarketplaceModal from "./PatternMarketplaceModal";

interface PatternPreviewProps {
  patternData: PatternData;
  onEdit: () => void;
}

export default function PatternPreview({
  patternData,
  onEdit,
}: PatternPreviewProps) {
  const [isMarketplaceModalOpen, setIsMarketplaceModalOpen] = useState(false);

  return (
    <>
      <Card className="p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Pattern Preview
          </h2>
        </div>

        {/* Pattern Content */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {patternData.generatedPattern}
            </pre>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onEdit}
            variant="outline"
            className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Pattern
          </Button>

          <Button
            onClick={() => setIsMarketplaceModalOpen(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Store className="w-4 h-4 mr-2" />
            Add to Marketplace
          </Button>
        </div>

        {/* Pattern Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Pattern Details:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
            <div>
              <strong>Name:</strong> {patternData.patternName}
            </div>
            <div>
              <strong>Type:</strong> {patternData.projectType}
            </div>
            <div>
              <strong>Difficulty:</strong> {patternData.difficultyLevel}
            </div>
            <div>
              <strong>Yarn Weight:</strong> {patternData.yarnWeight}
            </div>
            <div>
              <strong>Hook Size:</strong> {patternData.hookSize}
            </div>
            <div>
              <strong>Size:</strong> {patternData.sizeDimensions}
            </div>
          </div>
        </div>
      </Card>

      {/* Marketplace Modal */}
      <PatternMarketplaceModal
        isOpen={isMarketplaceModalOpen}
        onClose={() => setIsMarketplaceModalOpen(false)}
        patternData={patternData}
        onSuccess={() => {
          setIsMarketplaceModalOpen(false);
          console.log("Pattern added to marketplace successfully!");
        }}
      />
    </>
  );
}
