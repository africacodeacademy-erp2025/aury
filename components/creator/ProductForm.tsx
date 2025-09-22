/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseStorage } from "@/firebase/client";
import { Loader2, Upload } from "lucide-react"; // ✅ icons
import { CreateProductParams, Product } from "@/types";

type ProductFormProps = {
  editingItem?: Product | null;
  onSubmit: (data: CreateProductParams) => Promise<void>;
};

export default function ProductForm({ editingItem, onSubmit }: ProductFormProps) {
  const [formValues, setFormValues] = useState<
    Omit<
      Product,
      "id" | "sellerId" | "sellerName" | "sellerType" | "createdAt" | "updatedAt"
    >
  >({
    name: editingItem?.name ?? "",
    description: editingItem?.description ?? "",
    category: editingItem?.category ?? "",
    price: editingItem?.price ?? 0,
    originalPrice: editingItem?.originalPrice ?? undefined,
    stock: editingItem?.stock ?? 0,
    imageUrl: editingItem?.imageUrl ?? null,
    materials: editingItem?.materials ?? [],
    difficulty: editingItem?.difficulty ?? "beginner",
    tags: editingItem?.tags ?? [],
  });

  const [uploading, setUploading] = useState(false);

  const sanitizeProductPayload = (
    values: typeof formValues
  ): CreateProductParams => ({
    name: values.name,
    description: values.description,
    category: values.category,
    price: values.price,
    originalPrice: values.originalPrice ?? undefined,
    imageUrl: values.imageUrl ?? null,
    stock: values.stock,
    materials: values.materials,
    difficulty: values.difficulty,
    tags: values.tags,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploading(true);
    try {
      const storageRef = ref(firebaseStorage, `products/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormValues({ ...formValues, imageUrl: url });
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productPayload = sanitizeProductPayload(formValues);
    await onSubmit(productPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Product Name
        </label>
        <input
          type="text"
          value={formValues.name}
          onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
          className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Description
        </label>
        <textarea
          value={formValues.description}
          onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
          className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows={3}
        />
      </div>

      {/* Category & Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Category
          </label>
          <input
            type="text"
            value={formValues.category}
            onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Stock
          </label>
          <input
            type="number"
            value={formValues.stock}
            onChange={(e) => setFormValues({ ...formValues, stock: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Price & Original Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Price (P)
          </label>
          <input
            type="number"
            value={formValues.price}
            onChange={(e) => setFormValues({ ...formValues, price: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Original Price (P)
          </label>
          <input
            type="number"
            value={formValues.originalPrice ?? ""}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                originalPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Product Image
        </label>
        <div className="mt-2 flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition">
            <Upload className="h-4 w-4" />
            <span>Choose File</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          {uploading && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading image...
            </span>
          )}
        </div>

        {formValues.imageUrl && (
          <img
            src={formValues.imageUrl}
            alt="Preview"
            className="mt-3 h-32 w-32 rounded-lg object-cover border"
          />
        )}
      </div>

      {/* Save Button */}
      <button
        type="submit"
        className="w-full rounded-lg bg-blue-500 px-6 py-3 text-white font-semibold hover:bg-blue-600 transition"
      >
        Save Product
      </button>
    </form>
  );
}
