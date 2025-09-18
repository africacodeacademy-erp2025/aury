"use client";

import { Plus } from "lucide-react";
import React, { useState } from "react";

import ProductList from "@/components/creator/ProductList";
import ProductModal from "@/components/creator/ProductModal";

export default function PatternsPage() {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  return (
    <>
      <main className="mx-auto max-w-7xl p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Patterns & Products
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Manage your crochet patterns, products, and track their
              performance in the marketplace.
            </p>
          </div>

          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </button>
        </div>

        <ProductList />
      </main>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
