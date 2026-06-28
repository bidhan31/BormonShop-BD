"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, subtotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-label="Shopping cart">
      {/* Backdrop — click to close */}
      <button
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeCart}
        aria-label="Close cart overlay"
      />

      {/* Drawer panel */}
      <div className="relative w-full max-w-md h-full bg-secondary border-l border-border flex flex-col animate-fade-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-ink">Your Cart ({items.length})</h2>
          <button onClick={closeCart} aria-label="Close cart" className="text-muted hover:text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-muted text-sm text-center mt-10">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-primary shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{item.name}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {item.size} / {item.color}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 border border-border rounded-full px-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-6 h-6 text-ink text-sm"
                      >
                        −
                      </button>
                      <span className="text-xs text-ink w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-6 h-6 text-ink text-sm"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-medium text-accent">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.productId, item.size, item.color)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="text-muted hover:text-danger self-start"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer — subtotal + checkout CTA */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="text-ink font-semibold">৳{subtotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted">Shipping and discounts calculated at checkout.</p>
            <Link href="/checkout" onClick={closeCart} className="btn-gold w-full text-center block">
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
