import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-10 py-12 border-t border-border" aria-labelledby="related-products">
      <h2 id="related-products" className="font-display text-2xl font-semibold text-ink mb-6">
        You Might Also Like
      </h2>

      {/* Horizontal scroll on mobile, grid on desktop — acts as a lightweight "slider" without extra deps */}
      <div className="flex md:grid md:grid-cols-4 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x pb-2">
        {products.map((product) => (
          <div key={product._id} className="min-w-[180px] md:min-w-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
