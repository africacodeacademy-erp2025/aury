'use client';

import React, { useEffect, useState } from 'react';
import { getProducts } from '@/lib/actions/product.action';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { Edit, Trash2, Eye, Package } from 'lucide-react';
import Image from 'next/image';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResult, productsResult] = await Promise.all([
          getCurrentUser(),
          getProducts()
        ]);

        setUser(userResult);

        if (productsResult.success && productsResult.products) {
          // Filter products to show only current user's products
          const userProducts = productsResult.products.filter(
            product => product.sellerId === userResult?.id
          );
          setProducts(userProducts);
        } else {
          setError(productsResult.message || 'Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Failed to load products
        </h3>
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No products yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start by adding your first product to the marketplace.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          {/* Product Image */}
          <div className="relative aspect-square">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                {product.category}
              </span>
            </div>

            {/* Stock Status */}
            {product.stock !== undefined && (
              <div className="absolute top-3 right-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                {product.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                R{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  R{product.originalPrice}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{product.salesCount || 0} sold</span>
                </span>
                {product.rating && product.rating > 0 && (
                  <span className="flex items-center space-x-1">
                    <svg className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{product.rating.toFixed(1)}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit product"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {product.difficulty && (
                  <span className="capitalize">{product.difficulty}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}