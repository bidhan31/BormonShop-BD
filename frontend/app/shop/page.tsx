"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchProducts } from "@/lib/data";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

const CATEGORIES = ["T-Shirts", "Shirts", "Pants", "Hoodies"];
const SIZES = ["S", "M", "L", "XL", "XXL"];

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state initialized from URL so links like /shop?category=hoodies work on landing
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [size, setSize] = useState(searchParams.get("size") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || 1);
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || 100000000);
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  const q = searchParams.get("q") || "";
  const tag = searchParams.get("tag") || "";
  useEffect(() => {
    setIsLoading(true);
    searchProducts({
      q: q || undefined,
      category: category || undefined,
      tag: tag || undefined,
      size: size || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
    })
    .then(setProducts)
    .finally(() => setIsLoading(false));
    // In production, replace `searchProducts` above with:
    //   fetch(`${API_URL}/products?` + new URLSearchParams({...}))
    console.log(products);
  }, [q, tag, category, size, minPrice, maxPrice, sort]);

  const clearFilters = () => {
    setCategory("");
    setSize("");
    setMinPrice("");
    setMaxPrice("");
    router.push("/shop");
  };

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-10 py-10 grid md:grid-cols-4 gap-8">
      {/* ---------- Filters sidebar ---------- */}
      <aside className="md:col-span-1 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-ink text-sm">Filters</h2>
          <button onClick={clearFilters} className="text-xs text-accent hover:underline">
            Clear all
          </button>
        </div>

        {/* Category */}
        <div>
          <p className="text-xs text-muted mb-2 uppercase tracking-wide">Category</p>
          <div className="space-y-1.5">
            {CATEGORIES.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="radio"
                  checked={category === c}
                  onChange={() => setCategory(c)}
                  className="accent-accent"
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        {/* Size */}
        <div>
          <p className="text-xs text-muted mb-2 uppercase tracking-wide">Size</p>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(size === s ? "" : s)}
                className={`w-9 h-9 rounded-lg border text-xs font-medium ${
                  size === s ? "bg-accent text-primary border-accent" : "border-border text-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div>
          <p className="text-xs text-muted mb-2 uppercase tracking-wide">Price (৳)</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-ink"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-ink"
            />
          </div>
        </div>
      </aside>

      {/* ---------- Results ---------- */}
      <div className="md:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-xl font-semibold text-ink">
            {q ? `Results for "${q}"` : tag ? tag.replace("-", " ") : "Shop All"}
          </h1>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-ink"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <p className="text-muted text-sm">No products match your filters.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// useSearchParams() requires a Suspense boundary in the App Router
export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-muted">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
