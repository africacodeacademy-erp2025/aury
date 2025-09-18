"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AddToCartButton = ({ productId }: { productId: string }) => {
  const [loading, setLoading] = useState(false);

  const handleAdd = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        toast.error(data?.message || "Failed to add to cart");
        return;
      }
      toast.success("Added to cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  return (
    <Button onClick={handleAdd} disabled={loading} className="bg-primary-600">
      {loading ? "Adding..." : "Add to Cart"}
    </Button>
  );
};

export default AddToCartButton;
