"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product } from "@/types/product";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

interface ProductCardProps {
  product: Product;
  // Pass true when the caller already knows this product is wishlisted (e.g. the
  // Wishlist page itself) so the heart renders filled immediately instead of a
  // misleading "empty" state that only updates after the user taps it.
  initialWishlisted?: boolean;
  // Called after a successful toggle with the new wishlisted state — lets a parent
  // like the Wishlist page remove the card from its list when un-hearted.
  onWishlistChange?: (productId: string, isWishlisted: boolean) => void;
}

export default function ProductCard({ product, initialWishlisted = false, onWishlistChange }: ProductCardProps) {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const hasDiscount = !!product.discountPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); // don't navigate when tapping the heart
    if (!user) {
      window.location.href = "/login";
      return;
    }
    const next = !isWishlisted;
    // Optimistic update — flip immediately, then sync with the server
    setIsWishlisted(next);
    try {
      await api.post(`/users/wishlist/${product._id}`);
      onWishlistChange?.(product._id, next);
    } catch {
      setIsWishlisted(!next); // revert on failure
    }
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block rounded-2xl bg-secondary border border-border overflow-hidden
                 transition-transform duration-300 hover:-translate-y-1 hover:shadow-card"
    >
      {/* Image with zoom-on-hover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-primary">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
            -{discountPercent}%
          </span>
        )}

        {/* Wishlist heart toggle */}
        <button
          onClick={toggleWishlist}
          aria-label="Toggle wishlist"
          aria-pressed={isWishlisted}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-primary/70 backdrop-blur
                     flex items-center justify-center transition-colors hover:bg-primary"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "#F5C542" : "none"}
            stroke={isWishlisted ? "#F5C542" : "#FFFFFF"}
            strokeWidth="2"
          >
            <path d="M12 21s-7.5-4.7-10-9.3C.5 8.1 2.3 5 5.6 5c1.9 0 3.4 1 4.4 2.4C11 6 12.5 5 14.4 5c3.3 0 5.1 3.1 3.6 6.7C19.5 16.3 12 21 12 21z" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-muted uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="font-display font-medium text-ink truncate">{product.name}</h3>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-accent font-semibold">
            ৳{(product.discountPrice ?? product.price).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-muted text-sm line-through">৳{product.price.toLocaleString()}</span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2 text-xs text-muted">
          <span className="text-accent">★</span>
          <span>{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>
      </div>
    </Link>
  );
}
