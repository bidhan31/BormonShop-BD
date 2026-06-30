"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product, ProductVariant } from "@/types/product";
import { useCart } from "@/lib/CartContext";

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Unique sizes & colors derived from variants
  const sizes = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.size))),
    [product.variants]
  );
  const colors = useMemo(() => {
    const map = new Map<string, string>();
    product.variants.forEach((v) => map.set(v.color, v.colorHex));
    return Array.from(map.entries()); // [name, hex][]
  }, [product.variants]);

  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState<string>(colors[0]?.[0] ?? "");

  const selectedVariant: ProductVariant | undefined = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );
  const inStock = (selectedVariant?.stock ?? 0) > 0;
  const maxQty = selectedVariant?.stock ?? 1;

  const finalPrice = product.discountPrice ?? product.price;

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem({
      productId: product._id,
      name: product.name,
      image: product.images[0],
      price: finalPrice,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-10 py-10 grid md:grid-cols-2 gap-10">
      {/* ---------- Gallery ---------- */}
      <div>
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary border border-border">
          <Image
            src={product.images[activeImage]}
            alt={`${product.name} — view ${activeImage + 1}`}
            fill
            priority
            className="object-cover"
          />
        </div>

        {product.images.length > 1 && (
          <div className="flex gap-3 mt-4">
            {product.images.map((img, idx) => (
              <button
                key={img}
                onClick={() => setActiveImage(idx)}
                aria-label={`View image ${idx + 1}`}
                className={`relative w-20 h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                  activeImage === idx ? "border-accent" : "border-border"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---------- Details / Buy box ---------- */}
      <div>
        <p className="text-xs text-muted uppercase tracking-wide">{product.category}</p>
        <h1 className="font-display text-3xl font-semibold text-ink mt-1">{product.name}</h1>

        <div className="flex items-center gap-2 mt-2 text-sm">
          <span className="text-accent">★ {product.rating}</span>
          <span className="text-muted">({product.reviewCount} reviews)</span>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <span className="text-2xl font-semibold text-accent">৳{finalPrice.toLocaleString()}</span>
          {product.discountPrice && (
            <span className="text-muted line-through">৳{product.price.toLocaleString()}</span>
          )}
        </div>

        <p className="text-muted text-sm mt-4 leading-relaxed">{product.description}</p>

        {/* Size selector */}
        <div className="mt-6">
          <p className="text-sm font-medium text-ink mb-2">Size</p>
          <div className="flex gap-2" role="radiogroup" aria-label="Select size">
            {sizes.map((size) => (
              <button
                key={size}
                role="radio"
                aria-checked={selectedSize === size}
                onClick={() => setSelectedSize(size)}
                className={`w-12 h-12 rounded-lg border text-sm font-medium transition-colors ${
                  selectedSize === size
                    ? "bg-accent text-accent-foreground border-accent"
                    : "border-border text-ink hover:border-accent"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Color selector */}
        <div className="mt-6">
          <p className="text-sm font-medium text-ink mb-2">
            Color {selectedColor && <span className="text-muted">— {selectedColor}</span>}
          </p>
          <div className="flex gap-3" role="radiogroup" aria-label="Select color">
            {colors.map(([name, hex]) => (
              <button
                key={name}
                role="radio"
                aria-checked={selectedColor === name}
                aria-label={name}
                onClick={() => setSelectedColor(name)}
                style={{ backgroundColor: hex }}
                className={`w-9 h-9 rounded-full border-2 transition-transform ${
                  selectedColor === name ? "border-accent scale-110" : "border-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quantity counter */}
        <div className="mt-6">
          <p className="text-sm font-medium text-ink mb-2">Quantity</p>
          <div className="flex items-center gap-4 w-fit border border-border rounded-full px-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="w-9 h-9 text-ink text-lg hover:text-accent disabled:opacity-30"
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="w-6 text-center text-ink">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              aria-label="Increase quantity"
              className="w-9 h-9 text-ink text-lg hover:text-accent disabled:opacity-30"
              disabled={quantity >= maxQty}
            >
              +
            </button>
          </div>
          {!inStock && (
            <p className="text-danger text-sm mt-2">This size/color combination is out of stock.</p>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3 mt-8">
          <button onClick={handleAddToCart} disabled={!inStock} className="btn-outline flex-1 disabled:opacity-40">
            Add to Cart
          </button>
          <button onClick={handleBuyNow} disabled={!inStock} className="btn-gold flex-1 disabled:opacity-40">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
