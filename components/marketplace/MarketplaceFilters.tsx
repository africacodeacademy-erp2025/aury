'use client';

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

const categories = [
  'All Categories',
  'Crochet Patterns',
  'Finished Products',
  'Yarn & Materials',
  'Tools & Accessories',
  'Kits & Bundles',
];

const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under R50', min: 0, max: 50 },
  { label: 'R50 - R100', min: 50, max: 100 },
  { label: 'R100 - R200', min: 100, max: 200 },
  { label: 'R200 - R500', min: 200, max: 500 },
  { label: 'Over R500', min: 500, max: Infinity },
];

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Popular', value: 'popular' },
];

export default function MarketplaceFilters() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const clearFilters = () => {
    setSelectedCategory('All Categories');
    setSelectedPriceRange(priceRanges[0]);
    setSelectedSort(sortOptions[0]);
  };

  const hasActiveFilters = selectedCategory !== 'All Categories' || selectedPriceRange !== priceRanges[0];

  return (
    <>
      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="lg:hidden flex items-center gap-2 mb-4 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            Active
          </span>
        )}
      </button>

      {/* Filter Panel */}
      <div className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6
        ${showMobileFilters ? 'block' : 'hidden lg:block'}
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all filters
          </button>
        )}

        {/* Categories */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Category</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mr-2 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Price Range</h4>
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <label key={range.label} className="flex items-center">
                <input
                  type="radio"
                  name="priceRange"
                  value={range.label}
                  checked={selectedPriceRange.label === range.label}
                  onChange={() => setSelectedPriceRange(range)}
                  className="mr-2 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sort By</h4>
          <select
            value={selectedSort.value}
            onChange={(e) => setSelectedSort(sortOptions.find(opt => opt.value === e.target.value) || sortOptions[0])}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}