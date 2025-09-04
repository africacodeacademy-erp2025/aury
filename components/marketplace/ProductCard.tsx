'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [liked, setLiked] = React.useState(false);

  const handleAddToCart = () => {
    toast.success('Added to cart!');
  };

  const handleToggleLike = () => {
    setLiked(!liked);
    toast.success(liked ? 'Removed from favorites' : 'Added to favorites');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0]?.toUpperCase())
      .join('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift">
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
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Like Button */}
        <button
          onClick={handleToggleLike}
          className={`
            absolute top-3 right-3 p-2 rounded-full transition-all duration-200
            ${liked 
              ? 'bg-red-500 text-white' 
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }
          `}
          aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
        </button>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            {product.category}
          </span>
        </div>
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

        {/* Seller Info */}
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
            {getInitials(product.sellerName)}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            by {product.sellerName}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              R{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through ml-2">
                R{product.originalPrice}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors duration-200"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>

        {/* Stock Status */}
        {product.stock !== undefined && (
          <div className="text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600 dark:text-green-400">
                {product.stock} in stock
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400">
                Out of stock
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}