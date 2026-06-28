import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import ProductDetail from "@/components/ProductDetail";
import RelatedProducts from "@/components/RelatedProducts";
import ReviewsSection from "@/components/ReviewsSection";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Dynamic SEO metadata per product — critical for organic search traffic
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.images[0] }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product._id);

  return (
    <main className="bg-primary min-h-screen">
      {/* JSON-LD structured data for rich search results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.images,
            offers: {
              "@type": "Offer",
              priceCurrency: "BDT",
              price: product.discountPrice ?? product.price,
              availability: "https://schema.org/InStock",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviewCount,
            },
          }),
        }}
      />

      <ProductDetail product={product} />
      <ReviewsSection
        productId={product._id}
        reviews={product.reviews ?? []}
        rating={product.rating}
        reviewCount={product.reviewCount}
      />
      <RelatedProducts products={related} />
    </main>
  );
}
