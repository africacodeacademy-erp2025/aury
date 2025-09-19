"use client";

import React from "react";
import ProductForm from "./ProductForm";
import { createProduct, updateProduct } from "@/lib/actions/product.action";
import { CreateProductParams, Product } from "@/types";

// type ProductModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   editingItem?: Product | null;
//   onSuccess: () => void;
// };
type ProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: Product | null;
  onSuccess: (newProduct?: Product) => void;
};

export default function ProductModal({
  isOpen,
  onClose,
  editingItem,
  onSuccess,
}: ProductModalProps) {
  if (!isOpen) return null;

  const handleSubmit = async (data: CreateProductParams) => {
    try {
      if (editingItem) {
        await updateProduct(editingItem.id, data);
      } else {
        await createProduct(data);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">
          {editingItem ? "Edit Product" : "Add Product"}
        </h2>

        <ProductForm editingItem={editingItem} onSubmit={handleSubmit} />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
