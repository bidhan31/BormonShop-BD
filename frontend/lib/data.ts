import { Product } from "@/types/product";

/**
 * These functions simulate server-side data fetching from the Express/MongoDB API.
 * In production, replace the mock arrays below with:
 *   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?tag=new-arrival`);
 *   return res.json();
 *
 * Kept as async functions on purpose so the Home Page Server Component
 * doesn't need to change when you wire up the real API.
 */




const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || []).filter((p: Product) => p.isFeatured);
  } catch (err) {
    console.error("Failed to fetch featured products:", err);
    return [];
  }
}

export async function getProductsByTag(
  tag: "new-arrival" | "best-seller" | "trending"
): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?tag=${tag}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error(`Failed to fetch products by tag ${tag}:`, err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.product;
  } catch (err) {
    console.error(`Failed to fetch product by slug ${slug}:`, err);
    return undefined;
  }
}

export async function getRelatedProducts(category: string, excludeId: string): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products/${excludeId}/related`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error("Failed to fetch related products:", err);
    return [];
  }
}

interface SearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  tag?: string;
  sort?: string;
}

export async function searchProducts(params: SearchParams): Promise<Product[]> {
  try {
    const urlParams = new URLSearchParams(params as any);
    const res = await fetch(`${API_URL}/products?${urlParams.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error("Failed to search products:", err);
    return [];
  }
}
