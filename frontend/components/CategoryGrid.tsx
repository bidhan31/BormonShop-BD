import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types/category";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="px-4 md:px-10 py-16" aria-labelledby="shop-by-category">
      <h2 id="shop-by-category" className="font-display text-2xl md:text-3xl font-semibold text-ink mb-8 text-center">
        Shop by Category
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/shop?category=${encodeURIComponent(cat.name)}`}
            className="group relative rounded-2xl overflow-hidden aspect-[4/5] border border-border"
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/10 to-transparent" />
            <span className="absolute bottom-4 left-4 font-display font-semibold text-lg text-ink group-hover:text-accent transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
