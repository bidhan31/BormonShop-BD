"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Image from "next/image";

interface CategoryFormProps {
  initialData?: any;
  categoryId?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function CategoryForm({ initialData, categoryId }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = !!categoryId;

  const [form, setForm] = useState({
    name: initialData?.name || "",
    order: initialData?.order || 0,
    isActive: initialData?.isActive ?? true,
  });
  
  const [image, setImage] = useState<string>(initialData?.image || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async () => {
    if (!imageFile) return image;
    const formData = new FormData();
    formData.append("image", imageFile);

    const res = await fetch(`${API_URL}/categories/upload-image`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Image upload failed");
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const uploadedUrl = await handleImageUpload();

      if (!uploadedUrl) {
        throw new Error("Category image is required");
      }

      const payload = {
        ...form,
        image: uploadedUrl,
        slug: form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      };

      if (isEditing) {
        await api.put(`/categories/${categoryId}`, payload);
      } else {
        await api.post("/categories", payload);
      }

      router.push("/dashboard/admin/categories");
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div>
        <label className="block text-sm text-ink mb-1.5">Category Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-sm text-ink mb-1.5">Display Order (lowest appears first)</label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
          className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-sm text-ink mb-2">Category Image</label>
        {image && !imageFile && (
          <div className="mb-2">
            <img src={image} alt="" className="w-24 h-24 object-cover rounded-lg border border-border" />
          </div>
        )}
        {imageFile && (
          <div className="mb-2 text-sm text-muted">
            Selected: {imageFile.name}
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="text-sm text-muted"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
        />
        Active
      </label>

      <button type="submit" disabled={isSubmitting} className="btn-gold disabled:opacity-50">
        {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Category"}
      </button>
    </form>
  );
}
