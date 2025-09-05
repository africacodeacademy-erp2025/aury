'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { createProduct } from '@/lib/actions/product.action';
import { uploadImage } from '@/lib/actions/community.action';

const ProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0').max(10000, 'Price must be less than R10,000'),
  originalPrice: z.number().min(0).max(10000).optional(),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().min(0).optional(),
  materials: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tags: z.string().optional(),
});

type ProductFormData = z.infer<typeof ProductSchema>;

interface ProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const categories = [
  'Crochet Patterns',
  'Finished Products',
  'Yarn & Materials',
  'Tools & Accessories',
  'Kits & Bundles',
];

export default function ProductForm({ onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      originalPrice: undefined,
      category: '',
      stock: 0,
      materials: '',
      difficulty: 'beginner',
      tags: '',
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    
    try {
      const result = await uploadImage(file);
      
      if (result.success && result.url) {
        setUploadedImage(result.url);
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(result.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    
    try {
      // Parse materials and tags from comma-separated strings
      const materials = data.materials ? data.materials.split(',').map(m => m.trim()).filter(m => m) : [];
      const tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [];

      const result = await createProduct({
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        category: data.category,
        imageUrl: uploadedImage,
        stock: data.stock,
        materials,
        difficulty: data.difficulty,
        tags,
      });

      if (result.success) {
        toast.success('Product created successfully!');
        form.reset();
        setUploadedImage(null);
        onSuccess?.();
      } else {
        toast.error(result.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Name *
            </label>
            <input
              {...form.register('name')}
              placeholder="Enter product name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-500 dark:placeholder-gray-400"
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              {...form.register('description')}
              placeholder="Describe your product..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            />
            {form.formState.errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Price and Original Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price (R) *
              </label>
              <input
                {...form.register('price', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-500 dark:placeholder-gray-400"
              />
              {form.formState.errors.price && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Original Price (R)
              </label>
              <input
                {...form.register('originalPrice', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-500 dark:placeholder-gray-400"
              />
              {form.formState.errors.originalPrice && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.originalPrice.message}
                </p>
              )}
            </div>
          </div>

          {/* Category and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <Controller
                name="category"
                control={form.control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                )}
              />
              {form.formState.errors.category && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock Quantity
              </label>
              <input
                {...form.register('stock', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-500 dark:placeholder-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave as 0 for digital products (patterns)
              </p>
              {form.formState.errors.stock && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.stock.message}
                </p>
              )}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty Level
            </label>
            <Controller
              name="difficulty"
              control={form.control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              )}
            />
          </div>

          {/* Materials */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Materials
            </label>
            <input
              {...form.register('materials')}
              placeholder="e.g., Cotton yarn, Hook size 4mm, Scissors (comma separated)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-500 dark:placeholder-gray-400"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Separate multiple materials with commas
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <input
              {...form.register('tags')}
              placeholder="e.g., amigurumi, baby, blanket, scarf (comma separated)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-500 dark:placeholder-gray-400"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Image
            </label>
            
            {uploadedImage ? (
              <div className="relative">
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <img
                    src={uploadedImage}
                    alt="Product preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Add a product image
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={loading || uploading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg 
                       font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Creating Product...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}