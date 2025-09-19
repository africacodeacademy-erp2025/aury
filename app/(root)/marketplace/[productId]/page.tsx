import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductById, getProducts } from "@/lib/actions/product.action";
import ProductCard from "@/components/marketplace/ProductCard";
import PurchaseModal from "@/components/marketplace/PurchaseModal";
import { Product } from "@/types";

type PageProps = {
  params: { productId: string };
};

export default async function ProductPage({ params }: PageProps) {
  const { productId } = await params;

  const result = await getProductById(productId);
  if (!result.success || !result.product) {
    return notFound();
  }

  const product = result.product as Product;

  // Fetch related products by category and exclude current product
  const relatedRes = await getProducts({ category: product.category });
  const related = (relatedRes.products || [])
    .filter((p) => p.id !== product.id)
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-10 px-5 md:px-20 pt-5">
      {/* BREADCRUMBS */}
      <nav className="text-sm text-muted-foreground">
        <Link href="/marketplace" className="hover:underline">Marketplace</Link>
        <span className="mx-2">/</span>
        <span className="capitalize">{product.category}</span>
      </nav>

      {/* PRODUCT DETAILS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="w-full">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-100">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No image available
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">{product.name}</h1>
            <p className="mt-2 text-muted-foreground">by {product.sellerName}</p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-primary-600">P {product.price}</span>
          </div>

          <p className="leading-relaxed text-base sm:text-lg whitespace-pre-line">
            {product.description}
          </p>

          {product.materials?.length ? (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Materials:</span>
              <span> {product.materials.join(", ")}</span>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* <AddToCartButton productId={product.id} /> */}
            <PurchaseModal productId={product.id} />
          </div>

          <div className="mt-2 text-sm text-muted-foreground">
            <span>Category: </span>
            <span className="capitalize">{product.category}</span>
          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-xl sm:text-2xl font-semibold">Related products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
