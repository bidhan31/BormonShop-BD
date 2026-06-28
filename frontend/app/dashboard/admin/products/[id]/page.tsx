"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { api } from "@/lib/api";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Admin edit form needs the full product including inactive ones, so we pull
    // it from the admin list endpoint rather than the public slug lookup.
    api
      .get("/products/admin/all")
      .then((data) => {
        const found = data.products.find((p: any) => p._id === productId);
        if (!found) throw new Error("Product not found");
        setProduct(found);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [productId]);

  if (isLoading) return <p className="text-muted text-sm">Loading product...</p>;
  if (error || !product) return <p className="text-danger text-sm">{error || "Product not found"}</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Edit Product</h1>
      <ProductForm initialData={product} productId={productId} />
    </div>
  );
}
