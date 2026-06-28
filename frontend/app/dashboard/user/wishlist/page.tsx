"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users/wishlist")
      .then((data) => setWishlist(data.wishlist))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Wishlist</h1>

      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : wishlist.length === 0 ? (
        <p className="text-muted text-sm">Items you heart while browsing will show up here.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {wishlist.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              initialWishlisted
              onWishlistChange={(productId, stillWishlisted) => {
                if (!stillWishlisted) {
                  setWishlist((prev) => prev.filter((p) => p._id !== productId));
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
