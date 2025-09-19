"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

interface FilterState {
  category: string;
  materials: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  searchQuery: string;
}

interface FilterOptions {
  categories: string[];
  materials: string[];
  priceRange: { min: number; max: number };
}

interface ProductFiltersProps {
  filters: FilterState;
  filterOptions: FilterOptions;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  resultCount: number;
}

export default function ProductFilters({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
  resultCount,
}: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    materials: true,
    price: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleMaterialToggle = (material: string) => {
    const newMaterials = filters.materials.includes(material)
      ? filters.materials.filter(m => m !== material)
      : [...filters.materials, material];
    
    onFilterChange({ materials: newMaterials });
  };

  const removeMaterial = (material: string) => {
    const newMaterials = filters.materials.filter(m => m !== material);
    onFilterChange({ materials: newMaterials });
  };

  const hasActiveFilters = 
    filters.category !== 'All Categories' ||
    filters.materials.length > 0 ||
    filters.minPrice !== filterOptions.priceRange.min ||
    filters.maxPrice !== filterOptions.priceRange.max ||
    filters.searchQuery !== '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
          {resultCount} products found
        </p>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Active Filters
          </h4>
          <div className="flex flex-wrap gap-2">
            {filters.category !== 'All Categories' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                {filters.category}
                <button
                  onClick={() => onFilterChange({ category: 'All Categories' })}
                  className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.materials.map(material => (
              <span
                key={material}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm rounded-full"
              >
                {material}
                <button
                  onClick={() => removeMaterial(material)}
                  className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Category
            </h4>
            {expandedSections.category ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {expandedSections.category && (
            <div className="mt-3 space-y-2">
              {filterOptions.categories.map(category => (
                <label
                  key={category}
                  className="flex items-center cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={filters.category === category}
                    onChange={(e) => onFilterChange({ category: e.target.value })}
                    className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Materials Filter */}
        <div>
          <button
            onClick={() => toggleSection('materials')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Materials
            </h4>
            {expandedSections.materials ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {expandedSections.materials && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.materials.map(material => (
                <label
                  key={material}
                  className="flex items-center cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.materials.includes(material)}
                    onChange={() => handleMaterialToggle(material)}
                    className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {material}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div>
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Price Range
            </h4>
            {expandedSections.price ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {expandedSections.price && (
            <div className="mt-3 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={filters.minPrice}
                    onChange={(e) => onFilterChange({ minPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={filters.maxPrice}
                    onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Price Range Slider */}
              <div className="px-2">
                <input
                  type="range"
                  min={filterOptions.priceRange.min}
                  max={filterOptions.priceRange.max}
                  value={filters.maxPrice}
                  onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>P{filterOptions.priceRange.min}</span>
                  <span>P{filterOptions.priceRange.max}</span>
                </div>
              </div>
              
              <div className="text-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  P{filters.minPrice} - P{filters.maxPrice}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}