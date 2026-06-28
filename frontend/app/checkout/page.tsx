"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";

const REDIRECT_MESSAGES: Record<string, { type: "error" | "info"; text: string }> = {
  payment_failed: { type: "error", text: "Your payment could not be completed. Please try again." },
  validation_failed: { type: "error", text: "We couldn't verify that payment. Please try again or choose Cash on Delivery." },
  order_not_found: { type: "error", text: "We couldn't find that order. Please start checkout again." },
  server_error: { type: "error", text: "Something went wrong on our end. Please try again." },
  payment_cancelled: { type: "info", text: "Payment was cancelled. Your items are still in your cart." },
};

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotal, clearCart } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    mobileNumber: "",
    fullAddress: "",
    city: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "SSLCommerz">("COD");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [redirectNotice, setRedirectNotice] = useState<{ type: "error" | "info"; text: string } | null>(null);

  // If SSLCommerz bounced the user back here after a failed/cancelled payment,
  // surface that as a banner instead of silently dropping them on a blank form.
  useEffect(() => {
    const errorKey = searchParams.get("error");
    const infoKey = searchParams.get("info");
    const key = errorKey || infoKey;
    if (key && REDIRECT_MESSAGES[key]) {
      setRedirectNotice(REDIRECT_MESSAGES[key]);
    }
  }, [searchParams]);

  const shippingFee = subtotal >= 2000 ? 0 : 80;
  const total = subtotal - discount + shippingFee;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponMessage("");
    try {
      const data = await api.post("/coupons/validate", { code: couponCode, subtotal });
      setDiscount(data.discount);
      setCouponMessage(`Coupon applied — ৳${data.discount.toLocaleString()} off`);
    } catch (err: any) {
      setDiscount(0);
      setCouponMessage(err.message || "Invalid coupon code");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      }));

      const { order } = await api.post("/orders", {
        items: orderItems,
        shippingAddress,
        paymentMethod,
        couponCode: discount > 0 ? couponCode : undefined,
      });
      console.log(order);
      

      if (paymentMethod === "SSLCommerz") {
        // Kick off the SSLCommerz session — backend returns the gateway redirect URL.
        // Cart is intentionally NOT cleared here: if the user cancels or the payment
        // fails on SSLCommerz's page, they're redirected back to /checkout and need
        // their cart items still present to retry. The cart is only cleared once the
        // success callback actually confirms payment (see order-confirmation page).
        const { gatewayUrl } = await api.post("/payment/init", { orderId: order._id });
        window.location.href = gatewayUrl; // full redirect to SSLCommerz's hosted payment page
      } else {
        clearCart();
        router.push(`/order-confirmation/${order._id}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isAuthLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-muted">Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        {redirectNotice && (
          <div
            className={`max-w-md mb-6 text-sm rounded-lg px-4 py-3 ${
              redirectNotice.type === "error"
                ? "bg-danger/10 border border-danger/30 text-danger"
                : "bg-secondary border border-border text-muted"
            }`}
          >
            {redirectNotice.text}
          </div>
        )}
        <p className="text-muted mb-4">Your cart is empty.</p>
        <a href="/shop" className="btn-gold">
          Continue Shopping
        </a>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-10 py-10 grid md:grid-cols-3 gap-8">
      {redirectNotice && (
        <div
          className={`md:col-span-3 text-sm rounded-lg px-4 py-3 ${
            redirectNotice.type === "error"
              ? "bg-danger/10 border border-danger/30 text-danger"
              : "bg-secondary border border-border text-muted"
          }`}
        >
          {redirectNotice.text}
        </div>
      )}

      {/* ---------- Shipping + Payment form ---------- */}
      <form onSubmit={handlePlaceOrder} className="md:col-span-2 space-y-8">
        <section>
          <h2 className="font-display text-xl font-semibold text-ink mb-4">Shipping Details</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm text-ink mb-1.5">
                Full Name
              </label>
              <input
                id="fullName"
                required
                value={shippingAddress.fullName}
                onChange={(e) => setShippingAddress((p) => ({ ...p, fullName: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label htmlFor="mobileNumber" className="block text-sm text-ink mb-1.5">
                Mobile Number
              </label>
              <input
                id="mobileNumber"
                required
                placeholder="01XXXXXXXXX"
                value={shippingAddress.mobileNumber}
                onChange={(e) => setShippingAddress((p) => ({ ...p, mobileNumber: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label htmlFor="fullAddress" className="block text-sm text-ink mb-1.5">
                Full Address
              </label>
              <textarea
                id="fullAddress"
                required
                rows={3}
                placeholder="House, Road, Area, Thana"
                value={shippingAddress.fullAddress}
                onChange={(e) => setShippingAddress((p) => ({ ...p, fullAddress: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent resize-none"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm text-ink mb-1.5">
                City / District
              </label>
              <input
                id="city"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress((p) => ({ ...p, city: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </section>

        {/* ---------- Payment method toggle ---------- */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink mb-4">Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("COD")}
              className={`border rounded-xl px-4 py-4 text-left transition-colors ${
                paymentMethod === "COD" ? "border-accent bg-accent/10" : "border-border"
              }`}
            >
              <p className="font-medium text-ink text-sm">Cash on Delivery</p>
              <p className="text-muted text-xs mt-1">Pay when your order arrives</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("SSLCommerz")}
              className={`border rounded-xl px-4 py-4 text-left transition-colors ${
                paymentMethod === "SSLCommerz" ? "border-accent bg-accent/10" : "border-border"
              }`}
            >
              <p className="font-medium text-ink text-sm">Pay Online</p>
              <p className="text-muted text-xs mt-1">Card, bKash, Nagad via SSLCommerz</p>
            </button>
          </div>
        </section>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <button type="submit" disabled={isPlacingOrder} className="btn-gold w-full disabled:opacity-50">
          {isPlacingOrder ? "Placing order..." : `Place Order — ৳${total.toLocaleString()}`}
        </button>
      </form>

      {/* ---------- Order summary sidebar ---------- */}
      <aside className="bg-secondary border border-border rounded-2xl p-5 h-fit">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Order Summary</h2>

        <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
              <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-primary shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink truncate">{item.name}</p>
                <p className="text-xs text-muted">
                  {item.size}/{item.color} × {item.quantity}
                </p>
              </div>
              <span className="text-xs text-accent font-medium">৳{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Coupon code input */}
        <div className="flex gap-2 mb-4">
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Coupon code"
            className="flex-1 bg-primary border border-border rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={isApplyingCoupon}
            className="btn-outline px-4 text-sm disabled:opacity-50"
          >
            Apply
          </button>
        </div>
        {couponMessage && (
          <p className={`text-xs mb-4 ${discount > 0 ? "text-success" : "text-danger"}`}>{couponMessage}</p>
        )}

        <div className="space-y-2 text-sm border-t border-border pt-4">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>৳{subtotal.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount</span>
              <span>−৳{discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-muted">
            <span>Shipping</span>
            <span>{shippingFee === 0 ? "Free" : `৳${shippingFee}`}</span>
          </div>
          <div className="flex justify-between text-ink font-semibold text-base pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-accent">৳{total.toLocaleString()}</span>
          </div>
        </div>
      </aside>
    </main>
  );
}

// useSearchParams() requires a Suspense boundary in the App Router — without this,
// `next build` fails with "useSearchParams() should be wrapped in a suspense boundary".
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-muted">Loading...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}
