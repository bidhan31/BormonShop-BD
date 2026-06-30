"use client";

import { useEffect, useState } from "react";
import CategoryForm from "@/components/CategoryForm";
import { api } from "@/lib/api";

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/categories/${params.id}`)
      .then((data) => setInitialData(data.category))
      .catch((err) => setError(err.message || "Failed to load category"))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) return <p className="text-muted text-sm">Loading category...</p>;
  if (error) return <p className="text-danger text-sm">{error}</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Edit Category</h1>
      <CategoryForm initialData={initialData} categoryId={params.id} />
    </div>
  );
}
