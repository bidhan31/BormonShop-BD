"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = () => {
    api
      .get("/products/admin/all")
      .then((data) => setProducts(data.products))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}"? This deactivates it — it won't appear in the storefront.`)) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Products</h1>
        <Link href="/dashboard/admin/products/new" className="btn-gold text-sm">
          + Add Product
        </Link>
      </div>

      {isLoading ? (
        <p className="text-muted text-sm">Loading products...</p>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex items-center gap-4 bg-secondary border border-border rounded-xl p-3"
            >
              <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-primary shrink-0">
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted">{product.category}</p>
              </div>

              <span className="text-sm text-accent font-medium">৳{product.price.toLocaleString()}</span>

              <span className={`text-xs px-2 py-1 rounded-full ${product.isActive ? "text-success" : "text-muted"}`}>
                {product.isActive ? "Active" : "Inactive"}
              </span>

              <div className="flex gap-2">
                <Link
                  href={`/dashboard/admin/products/${product._id}`}
                  className="text-xs text-accent hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product._id, product.name)}
                  className="text-xs text-danger hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
