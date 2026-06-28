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




let Products: Product[] = [];

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      Products = data.products;
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

fetchProducts();

export async function getFeaturedProducts(): Promise<Product[]> {

  return Products.filter((p) => p.isFeatured);
}

export async function getProductsByTag(
  tag: "new-arrival" | "best-seller" | "trending"
): Promise<Product[]> {
  return Products.filter((p) => p.tags.includes(tag));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  console.log(slug);
  // console.log("Products:", Products);
  
  const product = Products.find((p) => p.slug === slug);
  console.log("Product found:", product);
  return product;
}

export async function getRelatedProducts(category: string, excludeId: string): Promise<Product[]> {
  return Products.filter((p) => p.category === category && p._id !== excludeId);
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

// Mirrors the real GET /api/products?... query params — same filtering logic,
// just running client-side against the mock array instead of MongoDB.
export async function searchProducts(params: SearchParams): Promise<Product[]> {
  console.log("Fetched products from API with params");
  const response = await fetch(`http://localhost:5000/api/products?` + new URLSearchParams(params as any));
  console.log(response);
  
  const data = await response.json();
  console.log(data);
  
  let results = data.products as Product[];

  if (params.q) {
    const q = params.q.toLowerCase();
    results = results.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (params.category) results = results.filter((p) => p.category === params.category);
  if (params.tag) results = results.filter((p) => p.tags.includes(params.tag as any));
  if (params.size) results = results.filter((p) => p.variants.some((v) => v.size === params.size));
  if (params.minPrice != null) results = results.filter((p) => p.price >= params.minPrice!);
  if (params.maxPrice != null) results = results.filter((p) => p.price <= params.maxPrice!);

  if (params.sort === "price-asc") results.sort((a, b) => a.price - b.price);
  else if (params.sort === "price-desc") results.sort((a, b) => b.price - a.price);
  else if (params.sort === "rating") results.sort((a, b) => b.rating - a.rating);

  return results;
}
