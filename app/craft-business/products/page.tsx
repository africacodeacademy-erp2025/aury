"use client";

import ProductList from '@/components/creator/ProductList';
import ProductModal from '@/components/creator/ProductModal';
import { Plus } from 'lucide-react';
import React, { useState } from "react";

export default function CraftBusinessProductsPage() {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const deleteLater = () => {
    console.log("Delete me later")
  }

  return (
    <>
      <main className="mx-auto max-w-7xl p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Products
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Manage your craft products and track their performance in the marketplace.
            </p>
          </div>
          
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
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
        onSuccess={deleteLater}
      />
    </>
  );
}