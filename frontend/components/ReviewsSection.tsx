"use client";

import { useState } from "react";
import { ProductReview } from "@/types/product";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";

interface ReviewsSectionProps {
  productId: string;
  reviews: ProductReview[];
  rating: number;
  reviewCount: number;
}

export default function ReviewsSection({ productId, reviews, rating, reviewCount }: ReviewsSectionProps) {
  const { user } = useAuth();
  const [localReviews, setLocalReviews] = useState(reviews);
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      const data = await api.post(`/products/${productId}/reviews`, { rating: newRating, comment });
      // Backend returns the full updated product — pull the freshly added review
      // (the last one) back out so it appears immediately without a page reload.
      const updatedReviews = data.product.reviews;
      setLocalReviews(updatedReviews);
      setComment("");
      setNewRating(5);
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-10 py-12 border-t border-border" aria-labelledby="reviews">
      <div className="flex items-center gap-3 mb-6">
        <h2 id="reviews" className="font-display text-2xl font-semibold text-ink">
          Customer Reviews
        </h2>
        <span className="text-accent text-lg">★ {rating}</span>
        <span className="text-muted text-sm">({reviewCount})</span>
      </div>

      {localReviews.length === 0 ? (
        <p className="text-muted text-sm mb-8">No reviews yet — be the first to review this product.</p>
      ) : (
        <div className="space-y-5 mb-8">
          {localReviews.map((review) => (
            <div key={review._id} className="border border-border rounded-xl p-4 bg-secondary">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-ink text-sm">{review.userName}</span>
                <span className="text-accent text-sm">{"★".repeat(review.rating)}</span>
              </div>
              <p className="text-muted text-sm">{review.comment}</p>
              <p className="text-xs text-muted/60 mt-2">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ---------- Submit a review ---------- */}
      {user ? (
        <form onSubmit={handleSubmit} className="border-t border-border pt-6 max-w-md">
          <h3 className="text-sm font-medium text-ink mb-3">Write a review</h3>

          <div className="flex gap-1 mb-3" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setNewRating(star)}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                className={`text-xl ${star <= newRating ? "text-accent" : "text-border"}`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent resize-none mb-3"
          />

          {error && <p className="text-danger text-sm mb-3">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-gold text-sm disabled:opacity-50">
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <p className="text-muted text-sm border-t border-border pt-6">
          <a href="/login" className="text-accent hover:underline">
            Log in
          </a>{" "}
          to write a review.
        </p>
      )}
    </section>
  );
}
