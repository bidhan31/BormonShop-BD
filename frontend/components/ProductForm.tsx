"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface VariantInput {
  size: string;
  color: string;
  colorHex: string;
  stock: number;
}

interface ProductFormProps {
  initialData?: any; // existing product when editing
  productId?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!productId;

  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "T-Shirts",
    price: initialData?.price || "",
    discountPrice: initialData?.discountPrice || "",
    tags: initialData?.tags || [],
    isFeatured: initialData?.isFeatured || false,
  });
  const [variants, setVariants] = useState<VariantInput[]>(
    initialData?.variants || [{ size: "M", color: "Black", colorHex: "#0F0F0F", stock: 0 }]
  );
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleVariantChange = (index: number, field: keyof VariantInput, value: string | number) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { size: "M", color: "", colorHex: "#000000", stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t: string) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const handleImageUpload = async () => {
    if (imageFiles.length === 0) return [];
    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("images", file));

    // Image upload uses raw fetch (not the api.ts JSON wrapper) since this is multipart/form-data
    const res = await fetch(`${API_URL}/products/upload-images`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Image upload failed");
    return data.urls as string[];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const uploadedUrls = await handleImageUpload();
      const allImages = [...images, ...uploadedUrls];

      if (allImages.length === 0) {
        throw new Error("At least one product image is required");
      }

      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        images: allImages,
        variants: variants.map((v) => ({ ...v, stock: Number(v.stock) })),
        slug: form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      };

      if (isEditing) {
        await api.put(`/products/${productId}`, payload);
      } else {
        await api.post("/products", payload);
      }

      router.push("/dashboard/admin/products");
    } catch (err: any) {
      setError(err.message || "Failed to save product");
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
        <label className="block text-sm text-ink mb-1.5">Product Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-sm text-ink mb-1.5">Description</label>
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-ink mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
          >
            {["T-Shirts", "Shirts", "Pants", "Hoodies"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-ink mb-1.5">Price (৳)</label>
          <input
            required
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-ink mb-1.5">Discount Price (৳, optional)</label>
        <input
          type="number"
          min={0}
          value={form.discountPrice}
          onChange={(e) => setForm((p) => ({ ...p, discountPrice: e.target.value }))}
          className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm text-ink mb-2">Tags</label>
        <div className="flex gap-2">
          {["new-arrival", "best-seller", "trending"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                form.tags.includes(tag) ? "bg-accent text-primary border-accent" : "border-border text-muted"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={form.isFeatured}
          onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
        />
        Featured on home page
      </label>

      {/* Variants */}
      <div>
        <label className="block text-sm text-ink mb-2">Variants (Size / Color / Stock)</label>
        <div className="space-y-2">
          {variants.map((variant, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <select
                value={variant.size}
                onChange={(e) => handleVariantChange(idx, "size", e.target.value)}
                className="bg-secondary border border-border rounded-lg px-2 py-2 text-xs text-ink"
              >
                {["S", "M", "L", "XL", "XXL"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                placeholder="Color name"
                value={variant.color}
                onChange={(e) => handleVariantChange(idx, "color", e.target.value)}
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-ink"
              />
              <input
                type="color"
                value={variant.colorHex}
                onChange={(e) => handleVariantChange(idx, "colorHex", e.target.value)}
                className="w-9 h-9 rounded-lg border border-border bg-secondary"
              />
              <input
                type="number"
                min={0}
                placeholder="Stock"
                value={variant.stock}
                onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                className="w-20 bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-ink"
              />
              <button type="button" onClick={() => removeVariant(idx)} className="text-danger text-xs">
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addVariant} className="text-accent text-xs mt-2 hover:underline">
          + Add variant
        </button>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm text-ink mb-2">Product Images</label>
        {images.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {images.map((url, idx) => (
              <img key={idx} src={url} alt="" className="w-16 h-20 object-cover rounded-lg border border-border" />
            ))}
          </div>
        )}
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
          className="text-sm text-muted"
        />
        <p className="text-xs text-muted mt-1">JPEG, PNG, or WEBP. Max 6 images, 5MB each.</p>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-gold disabled:opacity-50">
        {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
      </button>
    </form>
  );
}
