"use client";

import { getProducts } from "@/lib/actions/product.action";
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import { toast } from "sonner";
import { Search, Grid, List, SlidersHorizontal } from "lucide-react";

interface FilterState {
  category: string;
  materials: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: "newest" | "price_asc" | "price_desc" | "popular";
  searchQuery: string;
}

const MarketplaceGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [filters, setFilters] = useState<FilterState>({
    category: "All Categories",
    materials: [],
    minPrice: 0,
    maxPrice: 10000,
    sortBy: "newest",
    searchQuery: "",
  });

  // Available filter options
  const [filterOptions, setFilterOptions] = useState<{
    categories: string[];
    materials: string[];
    priceRange: { min: number; max: number };
  }>({
    categories: ["All Categories"],
    materials: [],
    priceRange: { min: 0, max: 10000 },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await getProducts();

        if (!result.success || !result.products) {
          toast.error(result.message || "Failed to load products");
          return;
        }

        setProducts(result.products);
        setFilteredProducts(result.products);

        // Extract filter options from products
        const categories = [
          "All Categories",
          ...new Set(result.products.map((p) => p.category)),
        ];
        const materials = [
          ...new Set(result.products.flatMap((p) => p.materials || [])),
        ];
        const prices = result.products.map((p) => p.price);

        setFilterOptions({
          categories,
          materials,
          priceRange: {
            min: Math.min(...prices),
            max: Math.max(...prices),
          },
        });
      } catch (error) {
        console.error("Error fetching products: ", error);
        toast.error("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          (product.tags || []).some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category !== "All Categories") {
      filtered = filtered.filter(
        (product) => product.category === filters.category
      );
    }

    // Materials filter
    if (filters.materials.length > 0) {
      filtered = filtered.filter((product) =>
        filters.materials.some((material) =>
          (product.materials || []).some((productMaterial) =>
            productMaterial.toLowerCase().includes(material.toLowerCase())
          )
        )
      );
    }

    // Price filter
    filtered = filtered.filter(
      (product) =>
        product.price >= filters.minPrice && product.price <= filters.maxPrice
    );

    // Sort
    switch (filters.sortBy) {
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        filtered.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      category: "All Categories",
      materials: [],
      minPrice: filterOptions.priceRange.min,
      maxPrice: filterOptions.priceRange.max,
      sortBy: "newest",
      searchQuery: "",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading Products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover unique crochet patterns and handmade crafts
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products, patterns, or materials..."
          value={filters.searchQuery}
          onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}>
          <ProductFilters
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            resultCount={filteredProducts.length}
          />
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {filteredProducts.length} of {products.length} products
            </p>

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) =>
                handleFilterChange({
                  sortBy: e.target.value as FilterState["sortBy"],
                })
              }
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Products Display */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceGrid;
