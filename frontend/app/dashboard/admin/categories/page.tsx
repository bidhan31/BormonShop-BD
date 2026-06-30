"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { Category } from "@/types/category";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = () => {
    api
      .get("/categories/admin/all")
      .then((data) => setCategories(data.categories))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"? It won't appear in the storefront.`)) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.map(c => c._id === id ? { ...c, isActive: false } : c));
    } catch (err: any) {
      alert(err.message || "Failed to delete category");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Categories</h1>
        <Link href="/dashboard/admin/categories/new" className="btn-gold text-sm">
          + Add Category
        </Link>
      </div>

      {isLoading ? (
        <p className="text-muted text-sm">Loading categories...</p>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category._id}
              className="flex items-center gap-4 bg-secondary border border-border rounded-xl p-3"
            >
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-primary shrink-0">
                <Image src={category.image} alt={category.name} fill className="object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink font-medium truncate">{category.name}</p>
                <p className="text-xs text-muted">Order: {category.order}</p>
              </div>

              <span className={`text-xs px-2 py-1 rounded-full ${category.isActive ? "text-success" : "text-muted"}`}>
                {category.isActive ? "Active" : "Inactive"}
              </span>

              <div className="flex gap-2">
                <Link
                  href={`/dashboard/admin/categories/${category._id}`}
                  className="text-xs text-accent hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(category._id, category.name)}
                  className="text-xs text-danger hover:underline"
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
