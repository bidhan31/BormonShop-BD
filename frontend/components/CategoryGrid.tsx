import Link from "next/link";
import Image from "next/image";

// IMPORTANT: `name` must match the MongoDB category enum exactly (case-sensitive).
// The backend does a strict equality filter: filter.category = req.query.category
const categories = [
  {
    name: "T-Shirts",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
  },
  {
    name: "Shirts",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
  },
  {
    name: "Pants",
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600",
  },
  {
    name: "Hoodies",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600",
  },
  {
    name: "Panjabis",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600",
  },
];

export default function CategoryGrid() {
  return (
    <section className="px-4 md:px-10 py-16" aria-labelledby="shop-by-category">
      <h2 id="shop-by-category" className="font-display text-2xl md:text-3xl font-semibold text-ink mb-8 text-center">
        Shop by Category
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto">
        {categories.map((cat) => (
          <Link
            key={cat.name}
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
