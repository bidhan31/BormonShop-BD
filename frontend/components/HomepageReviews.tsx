"use client";

import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  product: string;
  verified: boolean;
  avatar: string; // initials
  avatarColor: string;
}

// ── Static review data (swap for API call when ready) ─────────────────────────
const REVIEWS: Review[] = [
  {
    id: 1,
    name: "Rafiqul Islam",
    location: "Dhaka",
    rating: 5,
    date: "June 2026",
    title: "Absolutely premium quality!",
    comment:
      "Ordered a hoodie and a polo — both arrived within 2 days and the fabric quality is insane for the price. The gold stitching detail is *chef's kiss*. Will definitely be ordering again this eid.",
    product: "Essential Hoodie — Midnight Black",
    verified: true,
    avatar: "RI",
    avatarColor: "#7C3AED",
  },
  {
    id: 2,
    name: "Nusrat Jahan",
    location: "Chittagong",
    rating: 5,
    date: "May 2026",
    title: "Best online clothing store in BD!",
    comment:
      "I was skeptical at first about buying clothes online but BormonShop proved me wrong. The sizes are accurate, the return process was smooth and customer support replied within minutes.",
    product: "Urban Slim Fit Shirt — Arctic White",
    verified: true,
    avatar: "NJ",
    avatarColor: "#DC2626",
  },
  {
    id: 3,
    name: "Shafiul Alam",
    location: "Sylhet",
    rating: 4,
    date: "June 2026",
    title: "Great value for money",
    comment:
      "Got 3 t-shirts in the bundle deal. Quality is really good for the price. One had a tiny thread pull but it's barely noticeable. Fast delivery to Sylhet — only took 3 days!",
    product: "Classic Crew T-Shirt — 3-Pack Bundle",
    verified: true,
    avatar: "SA",
    avatarColor: "#059669",
  },
  {
    id: 4,
    name: "Tasnia Hossain",
    location: "Rajshahi",
    rating: 5,
    date: "June 2026",
    title: "Exactly what I expected and more!",
    comment:
      "The photos on the site are accurate — no photoshop magic here. What you see is what you get. The pant fits perfectly and the material doesn't get wrinkly. COD made it stress-free.",
    product: "Modern Jogger Pants — Charcoal Grey",
    verified: true,
    avatar: "TH",
    avatarColor: "#D97706",
  },
  {
    id: 5,
    name: "Imtiaz Ahmed",
    location: "Comilla",
    rating: 5,
    date: "May 2026",
    title: "Gifted this to my brother — he loved it!",
    comment:
      "Bought the premium shirt for my brother's birthday. He said it's the best shirt he owns now. The packaging was also really nice — came in a branded box which made it feel like a proper gift.",
    product: "Oxford Formal Shirt — Royal Navy",
    verified: true,
    avatar: "IA",
    avatarColor: "#2563EB",
  },
  {
    id: 6,
    name: "Rumana Begum",
    location: "Mymensingh",
    rating: 5,
    date: "June 2026",
    title: "Super fast shipping, quality product!",
    comment:
      "Ordered on Wednesday, received on Friday — didn't even expect it to be this fast. The hoodie is super soft and warm. Already recommended BormonShop to 4 of my friends.",
    product: "Fleece Zip Hoodie — Forest Green",
    verified: true,
    avatar: "RB",
    avatarColor: "#BE185D",
  },
];

// ── Star renderer ─────────────────────────────────────────────────────────────
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= rating ? "#F5C542" : "none"}
          stroke={star <= rating ? "#F5C542" : "#3A3A3A"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = review.comment.length > 160;
  const displayText = shouldTruncate && !expanded
    ? review.comment.slice(0, 160) + "…"
    : review.comment;

  return (
    <article
      className="relative bg-secondary border border-border rounded-2xl p-6
                 transition-all duration-300 hover:border-accent/30 hover:-translate-y-1 hover:shadow-gold
                 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: review.avatarColor }}
            aria-hidden="true"
          >
            {review.avatar}
          </div>
          <div>
            <p className="text-ink text-sm font-semibold leading-tight">{review.name}</p>
            <p className="text-muted text-xs">{review.location} · {review.date}</p>
          </div>
        </div>

        {review.verified && (
          <span className="flex items-center gap-1 bg-success/10 text-success text-[10px] font-semibold
                           px-2 py-1 rounded-full shrink-0 border border-success/20">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Verified
          </span>
        )}
      </div>

      {/* Stars + title */}
      <div>
        <StarRating rating={review.rating} />
        <h3 className="text-ink text-sm font-semibold mt-2 leading-snug">{review.title}</h3>
      </div>

      {/* Comment */}
      <p className="text-muted text-sm leading-relaxed flex-1">
        {displayText}
        {shouldTruncate && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-1 text-accent text-xs hover:underline focus:outline-none"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </p>

      {/* Product tag */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted/70 border-t border-border pt-3 mt-auto">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        {review.product}
      </div>
    </article>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HomepageReviews() {
  const totalReviews = 2417;
  const averageRating = 4.8;
  const [visible, setVisible] = useState(false);

  // Trigger entrance animation on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Rating distribution (static)
  const ratingBars = [
    { stars: 5, percent: 76 },
    { stars: 4, percent: 15 },
    { stars: 3, percent: 6 },
    { stars: 2, percent: 2 },
    { stars: 1, percent: 1 },
  ];

  return (
    <section
      id="customer-reviews"
      className="px-4 md:px-10 py-20 border-t border-border"
      aria-labelledby="reviews-heading"
    >
      <div className="max-w-6xl mx-auto">

        {/* ── Section header ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div>
            <p className="text-accent text-xs font-bold uppercase tracking-widest mb-3">
              What our customers say
            </p>
            <h2 id="reviews-heading" className="font-display text-3xl md:text-4xl font-bold text-ink leading-tight">
              Loved by{" "}
              <span className="text-accent">
                {totalReviews.toLocaleString()}+
              </span>{" "}
              customers
            </h2>
            <p className="text-muted text-sm mt-3 max-w-md">
              Real reviews from real customers across Bangladesh — unfiltered and unsponsored.
            </p>
          </div>

          {/* Rating summary box */}
          <div className="bg-secondary border border-border rounded-2xl p-6 shrink-0 min-w-[220px]">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display text-5xl font-bold text-ink">{averageRating}</span>
              <span className="text-accent text-2xl">★</span>
            </div>
            <p className="text-muted text-xs mb-4">Based on {totalReviews.toLocaleString()} reviews</p>
            <div className="space-y-1.5">
              {ratingBars.map(({ stars, percent }) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-muted text-[11px] w-3 shrink-0">{stars}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#F5C542" className="shrink-0">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-700"
                      style={{ width: visible ? `${percent}%` : "0%" }}
                    />
                  </div>
                  <span className="text-muted text-[11px] w-6 text-right shrink-0">{percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Review cards grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {REVIEWS.map((review, i) => (
            <div
              key={review.id}
              className="transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transitionDelay: `${i * 80}ms`,
              }}
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <div className="text-center">
          <p className="text-muted text-sm mb-5">Purchased something? Share your experience!</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="/shop"
              className="bg-accent text-accent-foreground font-semibold px-8 py-3 rounded-full text-sm
                         hover:bg-accent-dark transition-colors duration-200"
            >
              Shop &amp; Review
            </a>
            <a
              href="/shop"
              className="border border-border text-ink font-medium px-8 py-3 rounded-full text-sm
                         hover:border-accent hover:text-accent transition-all duration-200"
            >
              View All Products
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
