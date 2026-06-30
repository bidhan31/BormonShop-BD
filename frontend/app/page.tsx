import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedSection from "@/components/FeaturedSection";
import HomepageReviews from "@/components/HomepageReviews";
import { getProductsByTag, getCategories } from "@/lib/data";

// Revalidate this page every 60s so new products/admin changes show up
// without needing a full rebuild — good middle ground for a storefront.
export const revalidate = 60;

export default async function HomePage() {
  // Fetched in parallel — each powers one FeaturedSection below.
  const [categories, newArrivals, bestSellers, trending] = await Promise.all([
    getCategories(),
    getProductsByTag("new-arrival"),
    getProductsByTag("best-seller"),
    getProductsByTag("trending"),
  ]);

  return (
    <main className="bg-primary min-h-screen">
      <Hero />

      <CategoryGrid categories={categories} />

      <FeaturedSection
        title="New Arrivals"
        subtitle="Fresh drops, just landed"
        viewAllHref="/shop?tag=new-arrival"
        products={newArrivals.slice(0, 20)}
      />


      {/* Newsletter / brand strip */}
      {/* <section className="px-4 md:px-10 py-16 border-t border-border text-center">
        <h2 className="font-display text-2xl font-semibold text-ink mb-3">
          Stay ahead of the drop
        </h2>
        <p className="text-muted text-sm mb-6 max-w-md mx-auto">
          Get early access to new collections, restocks, and member-only discounts.
        </p>
        <form className="flex max-w-md mx-auto gap-2" action="/api/newsletter" method="POST">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="flex-1 bg-secondary border border-border rounded-full px-4 py-3 text-sm
                       text-ink placeholder:text-muted focus:outline-none focus:border-accent"
          />
          <button type="submit" className="btn-gold whitespace-nowrap">
            Subscribe
          </button>
        </form>
      </section> */}

      <HomepageReviews />
    </main>
  );
}
