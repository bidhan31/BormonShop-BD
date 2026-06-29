"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchProducts } from "@/lib/data";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

const CATEGORIES = ["T-Shirts", "Shirts", "Pants", "Hoodies", "Panjabis"];
const SIZES = ["S", "M", "L", "XL", "XXL"];
const PRICE_PRESETS = [
  { label: "Under ৳500", min: 0, max: 500 },
  { label: "৳500–৳1500", min: 500, max: 1500 },
  { label: "৳1500–৳3000", min: 1500, max: 3000 },
  { label: "Over ৳3000", min: 3000, max: 999999 },
];

// ── Helper: push filter state into the URL ────────────────────────────────────
function buildUrl(params: {
  q: string;
  tag: string;
  category: string;
  size: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.tag) sp.set("tag", params.tag);
  if (params.category) sp.set("category", params.category);
  if (params.size) sp.set("size", params.size);
  if (params.minPrice) sp.set("minPrice", params.minPrice);
  if (params.maxPrice) sp.set("maxPrice", params.maxPrice);
  if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
  const qs = sp.toString();
  return `/shop${qs ? `?${qs}` : ""}`;
}

// ── Active filter chip ────────────────────────────────────────────────────────
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/30 text-accent
                     text-xs font-medium px-3 py-1.5 rounded-full">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="hover:text-accent-dark transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </span>
  );
}

// ── Filter Sidebar / Drawer content ──────────────────────────────────────────
function FilterPanel({
  category, size, minPrice, maxPrice,
  onCategory, onSize, onMinPrice, onMaxPrice, onClearAll,
}: {
  category: string; size: string; minPrice: string; maxPrice: string;
  onCategory: (v: string) => void; onSize: (v: string) => void;
  onMinPrice: (v: string) => void; onMaxPrice: (v: string) => void;
  onClearAll: () => void;
}) {
  const hasAnyFilter = !!(category || size || minPrice || maxPrice);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-ink text-base">Filters</h2>
        {hasAnyFilter && (
          <button
            onClick={onClearAll}
            className="text-xs text-accent hover:text-accent-dark transition-colors hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="text-[10px] text-muted mb-3 uppercase tracking-widest font-semibold">Category</p>
        <div className="space-y-2">
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={category === c}
                onChange={() => onCategory(category === c ? "" : c)}
                className="accent-accent w-3.5 h-3.5"
              />
              <span className={`text-sm transition-colors ${category === c ? "text-accent font-medium" : "text-ink group-hover:text-accent/80"}`}>
                {c}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <p className="text-[10px] text-muted mb-3 uppercase tracking-widest font-semibold">Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => onSize(size === s ? "" : s)}
              className={`w-10 h-10 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                size === s
                  ? "bg-accent text-primary border-accent shadow-gold"
                  : "border-[#2A2A2A] text-ink hover:border-accent/50 hover:text-accent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Price presets */}
      <div>
        <p className="text-[10px] text-muted mb-3 uppercase tracking-widest font-semibold">Price Range</p>
        <div className="space-y-2 mb-4">
          {PRICE_PRESETS.map((preset) => {
            const isActive =
              minPrice === String(preset.min) && maxPrice === String(preset.max);
            return (
              <button
                key={preset.label}
                onClick={() => {
                  if (isActive) {
                    onMinPrice("");
                    onMaxPrice("");
                  } else {
                    onMinPrice(String(preset.min));
                    onMaxPrice(String(preset.max));
                  }
                }}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-all duration-200 ${
                  isActive
                    ? "bg-accent/10 border-accent/40 text-accent"
                    : "border-[#2A2A2A] text-muted hover:border-accent/30 hover:text-ink"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom range inputs */}
        <p className="text-[10px] text-muted mb-2 uppercase tracking-widest">Custom (৳)</p>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPrice(e.target.value)}
            className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-ink
                       placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPrice(e.target.value)}
            className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-ink
                       placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        {(minPrice || maxPrice) && (
          <p className="text-muted text-[11px] mt-1.5">
            {minPrice ? `৳${Number(minPrice).toLocaleString()}` : "Any"} –{" "}
            {maxPrice ? `৳${Number(maxPrice).toLocaleString()}` : "Any"}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main shop content ─────────────────────────────────────────────────────────
function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial values from URL so direct links / refreshes work
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [size, setSize] = useState(searchParams.get("size") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const q = searchParams.get("q") || "";
  const tag = searchParams.get("tag") || "";

  // ── Debounced price inputs ───────────────────────────────────────────────
  const [debouncedMin, setDebouncedMin] = useState(minPrice);
  const [debouncedMax, setDebouncedMax] = useState(maxPrice);
  const minTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMinPrice = (v: string) => {
    setMinPrice(v);
    if (minTimer.current) clearTimeout(minTimer.current);
    minTimer.current = setTimeout(() => setDebouncedMin(v), 500);
  };
  const handleMaxPrice = (v: string) => {
    setMaxPrice(v);
    if (maxTimer.current) clearTimeout(maxTimer.current);
    maxTimer.current = setTimeout(() => setDebouncedMax(v), 500);
  };

  // ── Sync filters → URL ────────────────────────────────────────────────────
  const syncUrl = useCallback(() => {
    router.replace(buildUrl({ q, tag, category, size, minPrice: debouncedMin, maxPrice: debouncedMax, sort }), {
      scroll: false,
    });
  }, [q, tag, category, size, debouncedMin, debouncedMax, sort, router]);

  useEffect(() => { syncUrl(); }, [syncUrl]);

  // ── Fetch products ────────────────────────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    searchProducts({
      q: q || undefined,
      category: category || undefined,
      tag: tag || undefined,
      size: size || undefined,
      minPrice: debouncedMin ? Number(debouncedMin) : undefined,
      maxPrice: debouncedMax ? Number(debouncedMax) : undefined,
      sort,
    })
      .then(setProducts)
      .finally(() => setIsLoading(false));
  }, [q, tag, category, size, debouncedMin, debouncedMax, sort]);

  // ── Clear helpers ─────────────────────────────────────────────────────────
  const clearAll = () => {
    setCategory("");
    setSize("");
    setMinPrice("");
    setMaxPrice("");
    setDebouncedMin("");
    setDebouncedMax("");
    router.replace(`/shop${q ? `?q=${encodeURIComponent(q)}` : ""}${tag ? `?tag=${tag}` : ""}`, { scroll: false });
  };

  // ── Active filter chips ───────────────────────────────────────────────────
  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (category) activeFilters.push({ label: category, onRemove: () => setCategory("") });
  if (size) activeFilters.push({ label: `Size: ${size}`, onRemove: () => setSize("") });
  if (minPrice && maxPrice)
    activeFilters.push({
      label: `৳${Number(minPrice).toLocaleString()}–৳${Number(maxPrice).toLocaleString()}`,
      onRemove: () => { setMinPrice(""); setMaxPrice(""); setDebouncedMin(""); setDebouncedMax(""); },
    });
  else if (minPrice)
    activeFilters.push({
      label: `From ৳${Number(minPrice).toLocaleString()}`,
      onRemove: () => { setMinPrice(""); setDebouncedMin(""); },
    });
  else if (maxPrice)
    activeFilters.push({
      label: `Up to ৳${Number(maxPrice).toLocaleString()}`,
      onRemove: () => { setMaxPrice(""); setDebouncedMax(""); },
    });

  return (
    <>
      {/* ── Mobile filter drawer overlay ─────────────────────────────────── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <aside
            className="relative ml-auto w-80 max-w-[90vw] h-full bg-[#0F0F0F] border-l border-[#2A2A2A]
                       p-6 overflow-y-auto animate-fadeIn"
            aria-label="Filter panel"
          >
            <button
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close filter panel"
              className="absolute top-4 right-4 text-muted hover:text-ink transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <FilterPanel
              category={category} size={size} minPrice={minPrice} maxPrice={maxPrice}
              onCategory={setCategory} onSize={setSize}
              onMinPrice={handleMinPrice} onMaxPrice={handleMaxPrice}
              onClearAll={clearAll}
            />
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="mt-8 w-full bg-accent text-primary font-semibold py-3 rounded-full text-sm
                         hover:bg-[#D9A92E] transition-colors"
            >
              Show Results ({products.length})
            </button>
          </aside>
        </div>
      )}

      {/* ── Page layout ──────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 md:px-10 py-10">

        {/* Mobile top bar */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <h1 className="font-display text-xl font-semibold text-ink">
            {q ? `"${q}"` : tag ? tag.replace(/-/g, " ") : "Shop All"}
          </h1>
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex items-center gap-2 border border-[#2A2A2A] text-ink text-sm
                       px-4 py-2 rounded-full hover:border-accent hover:text-accent transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="14" y2="12" />
              <line x1="4" y1="18" x2="10" y2="18" />
            </svg>
            Filters
            {activeFilters.length > 0 && (
              <span className="bg-accent text-primary text-[10px] font-bold rounded-full w-5 h-5
                               flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* ── Sidebar (desktop) ──────────────────────────────────────── */}
          <aside className="hidden md:block md:col-span-1">
            <div className="sticky top-24 bg-[#131313] border border-[#2A2A2A] rounded-2xl p-5">
              <FilterPanel
                category={category} size={size} minPrice={minPrice} maxPrice={maxPrice}
                onCategory={setCategory} onSize={setSize}
                onMinPrice={handleMinPrice} onMaxPrice={handleMaxPrice}
                onClearAll={clearAll}
              />
            </div>
          </aside>

          {/* ── Results ────────────────────────────────────────────────── */}
          <div className="md:col-span-3">
            {/* Desktop title + sort */}
            <div className="hidden md:flex items-center justify-between mb-4">
              <h1 className="font-display text-xl font-semibold text-ink">
                {q ? `Results for "${q}"` : tag ? tag.replace(/-/g, " ") : "Shop All"}
              </h1>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl px-4 py-2 text-sm text-ink
                           focus:outline-none focus:border-accent transition-colors"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Mobile sort */}
            <div className="flex md:hidden items-center justify-between mb-4">
              <p className="text-muted text-xs">
                {isLoading ? "Loading…" : `${products.length} products`}
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-ink
                           focus:outline-none focus:border-accent"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {activeFilters.map((f) => (
                  <FilterChip key={f.label} label={f.label} onRemove={f.onRemove} />
                ))}
                <button
                  onClick={clearAll}
                  className="text-xs text-muted hover:text-danger transition-colors hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Desktop product count */}
            {!isLoading && (
              <p className="hidden md:block text-muted text-xs mb-4">
                {products.length} {products.length === 1 ? "product" : "products"} found
              </p>
            )}

            {/* Grid */}
            {isLoading ? (
              <ProductGridSkeleton count={9} />
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3A3A3A" strokeWidth="1.5"
                     className="mx-auto mb-4">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="text-ink font-medium mb-1">No products found</p>
                <p className="text-muted text-sm mb-5">Try adjusting your filters or search term.</p>
                <button
                  onClick={clearAll}
                  className="bg-accent text-primary font-semibold px-6 py-2.5 rounded-full text-sm
                             hover:bg-[#D9A92E] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

// useSearchParams() requires a Suspense boundary in the App Router
export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted text-sm">Loading products…</p>
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
