import React from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Star, ShoppingCart, Eye } from "lucide-react";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard = ({ product, viewMode = 'grid' }: ProductCardProps) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col sm:flex-row">
          {/* Product Image */}
          <div className="relative w-full sm:w-48 h-48 sm:h-32 bg-slate-100 dark:bg-slate-700 flex-shrink-0">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-2 left-2">
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                {product.category}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                {/* Materials */}
                {product.materials && product.materials.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Materials:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.materials.slice(0, 3).map((material, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
                        >
                          {material}
                        </span>
                      ))}
                      {product.materials.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{product.materials.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {product.rating && product.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{product.salesCount || 0} sold</span>
                  </div>
                  <span className="text-gray-400">by {product.sellerName}</span>
                </div>
              </div>

              {/* Price and Action */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-primary-600">
                      P{product.price}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        P{product.originalPrice}
                      </span>
                    )}
                  </div>
                  {product.difficulty && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {product.difficulty}
                    </span>
                  )}
                </div>
                <Button className="bg-primary-600 whitespace-nowrap" asChild>
                  <Link href={`/marketplace/${product.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-48 sm:h-56 bg-slate-100 dark:bg-slate-700 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            {product.category}
          </span>
        </div>
        
        {/* Difficulty Badge */}
        {product.difficulty && (
          <div className="absolute top-3 right-3">
            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
              product.difficulty === 'beginner' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : product.difficulty === 'intermediate'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {product.difficulty}
            </span>
          </div>
        )}
      </div>

      <CardHeader className="flex-1 p-4">
        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </CardTitle>
        <CardDescription className="text-sm line-clamp-2 mt-2">
          {product.description}
        </CardDescription>
        
        {/* Materials */}
        {product.materials && product.materials.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {product.materials.slice(0, 2).map((material, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
                >
                  {material}
                </span>
              ))}
              {product.materials.length > 2 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{product.materials.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Stats */}
        <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            {product.rating && product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{product.salesCount || 0}</span>
            </div>
          </div>
          <span className="text-xs">by {product.sellerName}</span>
        </div>
      </CardHeader>

      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-600">
              P{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                P{product.originalPrice}
              </span>
            )}
          </div>
        </div>
        <Button className="bg-primary-600" asChild>
          <Link href={`/marketplace/${product.id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
