"use client";

import { getProducts } from "@/lib/actions/product.action";
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { toast } from "sonner";

const MarketplaceGrid = () => {
  const [products, setproducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await getProducts();
        console.log("Products: ", result);

        if (!result.success || !result.products) {
          // toast or set error
          toast.error(result.message);
        }

        // Set products in state
        setproducts(result.products);
      } catch (error) {
        console.error("Error fetching products: ", error);
        // set error (Failed to load products. Please try again.)
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  if (loading) {
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>Loading Products</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      </div>
    </div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-semibold text-left text-3xl">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
    </div>
  );
};

export default MarketplaceGrid;
