import { Suspense } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { ProductGridSkeleton } from "./ProductCardSkeleton";

interface FeaturedSectionProps {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  products: Product[];
}

function ProductRow({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p className="text-muted text-sm">No products in this section yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

export default function FeaturedSection({ title, subtitle, viewAllHref, products }: FeaturedSectionProps) {
  return (
    <section className="px-4 md:px-10 py-12" aria-labelledby={`section-${title}`}>
      <div className="flex items-end justify-between mb-6 max-w-6xl mx-auto">
        <div>
          <h2 id={`section-${title}`} className="font-display text-2xl md:text-3xl font-semibold text-ink">
            {title}
          </h2>
          {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
        </div>
        <Link href={viewAllHref} className="text-accent text-sm font-medium hover:underline whitespace-nowrap">
          View all →
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductRow products={products} />
        </Suspense>
      </div>
    </section>
  );
}
