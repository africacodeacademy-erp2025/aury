"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PatternData } from "@/types";
import { Save, X, RotateCcw } from "lucide-react";

interface PatternEditorProps {
  patternData: PatternData;
  onSave: (updatedPatternData: PatternData) => void;
  onCancel: () => void;
}

export default function PatternEditor({ 
  patternData, 
  onSave, 
  onCancel 
}: PatternEditorProps) {
  const [editedPattern, setEditedPattern] = useState(patternData.generatedPattern);
  const [isModified, setIsModified] = useState(false);

  const handlePatternChange = (value: string) => {
    setEditedPattern(value);
    setIsModified(value !== patternData.generatedPattern);
  };

  const handleSave = () => {
    const updatedPatternData: PatternData = {
      ...patternData,
      generatedPattern: editedPattern,
    };
    onSave(updatedPatternData);
  };

  const handleReset = () => {
    setEditedPattern(patternData.generatedPattern);
    setIsModified(false);
  };

  return (
    <Card className="p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Edit Pattern: {patternData.patternName}
        </h2>
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="text-gray-600 hover:text-gray-800"
        >
          <X className="w-4 h-4 mr-1" />
          Close
        </Button>
      </div>

      {/* Pattern Details Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
          <div><strong>Type:</strong> {patternData.projectType}</div>
          <div><strong>Difficulty:</strong> {patternData.difficultyLevel}</div>
          <div><strong>Yarn Weight:</strong> {patternData.yarnWeight}</div>
          <div><strong>Hook Size:</strong> {patternData.hookSize}</div>
        </div>
      </div>

      {/* Pattern Editor */}
      <div className="space-y-4">
        <Label className="block text-sm font-medium text-gray-700">
          Pattern Instructions
        </Label>
        <Textarea
          value={editedPattern}
          onChange={(e) => handlePatternChange(e.target.value)}
          className="min-h-[400px] font-mono text-sm"
          placeholder="Edit your pattern instructions here..."
        />
        
        {/* Editor Controls */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {isModified && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset Changes
              </Button>
            )}
            <span className="text-sm text-gray-500">
              {editedPattern.length} characters
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onCancel}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isModified}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Editing Tips:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• You can modify instructions, add clarifications, or correct any mistakes</li>
          <li>• Make sure to maintain consistent formatting and terminology</li>
          <li>• Double-check stitch counts and gauge information</li>
          <li>• Consider adding your own personal touches or variations</li>
        </ul>
      </div>
    </Card>
  );
}