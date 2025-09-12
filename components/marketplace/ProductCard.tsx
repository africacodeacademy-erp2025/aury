import React from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import PurchaseModal from "./PurchaseModal";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Card className="flex flex-col h-full">
      <div className="relative flex justify-center items-center h-72 bg-slate-100">
        <Image
          src={product.imageUrl || ""}
          alt={product.name}
          width={300}
          height={300}
          className="object-cover max-h-60"
        />
      </div>

      <CardHeader className="text-xl">
        <CardTitle>{product.name}</CardTitle>
        <CardDescription className="text-pretty">
          {product.description}
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex justify-between">
        <span className="text-xl text-primary-600 font-medium">R {product.price}</span>
        <PurchaseModal productId={product.id} />
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
