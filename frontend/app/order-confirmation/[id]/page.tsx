"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import OrderTrackingStepper from "@/components/OrderTrackingStepper";
import { useCart } from "@/lib/CartContext";

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { id } = use(params);
  const { clearCart } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((data) => {
        setOrder(data.order);
        // This page only successfully loads once the order genuinely exists with a
        // confirmed state (COD orders are "Confirmed" immediately; SSLCommerz orders
        // only redirect here after the backend's success_url validates the payment).
        // Either way, arriving here means checkout is truly done, so clear the cart now.
        clearCart();
      })
      .catch((err) => setError(err.message || "Could not load order"))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-muted">Loading your order...</div>;
  }

  if (error || !order) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-danger mb-4">{error || "Order not found"}</p>
        <Link href="/" className="btn-gold">
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-10 py-12">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
          <span className="text-accent text-2xl">✓</span>
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink">Order Confirmed</h1>
        <p className="text-muted text-sm mt-1">
          Order <span className="text-accent">{order.orderNumber}</span> has been placed successfully.
        </p>
      </div>

      <div className="bg-secondary border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-medium text-ink mb-4">Order Status</h2>
        <OrderTrackingStepper currentStatus={order.status} />
      </div>

      <div className="bg-secondary border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-medium text-ink mb-4">Items</h2>
        <div className="space-y-4">
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-3 items-center">
              <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-primary shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-ink">{item.name}</p>
                <p className="text-xs text-muted">
                  {item.size}/{item.color} × {item.quantity}
                </p>
              </div>
              <span className="text-sm text-accent font-medium">৳{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-4 pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>৳{order.subtotal.toLocaleString()}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount</span>
              <span>−৳{order.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-muted">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? "Free" : `৳${order.shippingFee}`}</span>
          </div>
          <div className="flex justify-between text-ink font-semibold pt-1">
            <span>Total</span>
            <span className="text-accent">৳{order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-secondary border border-border rounded-2xl p-6 mb-8">
        <h2 className="font-medium text-ink mb-2">Shipping To</h2>
        <p className="text-sm text-muted">{order.shippingAddress.fullName}</p>
        <p className="text-sm text-muted">{order.shippingAddress.mobileNumber}</p>
        <p className="text-sm text-muted">{order.shippingAddress.fullAddress}</p>
        <p className="text-sm text-muted mt-2">
          Payment: <span className="text-ink">{order.paymentMethod === "COD" ? "Cash on Delivery" : "Paid Online"}</span>
        </p>
      </div>

      <div className="text-center">
        <Link href="/shop" className="btn-gold">
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
