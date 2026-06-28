"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const statusColors: Record<string, string> = {
  Pending: "text-muted",
  Confirmed: "text-accent",
  Processing: "text-accent",
  Shipped: "text-accent",
  "Out for Delivery": "text-accent",
  Delivered: "text-success",
  Cancelled: "text-danger",
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/my-orders")
      .then((data) => setOrders(data.orders))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="text-muted text-sm">Loading orders...</p>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted mb-4">You haven't placed any orders yet.</p>
        <Link href="/shop" className="btn-gold">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order._id}
            href={`/order-confirmation/${order._id}`}
            className="block bg-secondary border border-border rounded-xl p-4 hover:border-accent transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-ink">{order.orderNumber}</span>
              <span className={`text-xs font-medium ${statusColors[order.status] || "text-muted"}`}>
                {order.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted">
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              <span>{order.items.length} item(s)</span>
              <span className="text-accent font-medium">৳{order.total.toLocaleString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
