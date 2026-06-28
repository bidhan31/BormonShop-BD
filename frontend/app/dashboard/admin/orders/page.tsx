"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const ORDER_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchOrders = (status?: string) => {
    setIsLoading(true);
    const query = status ? `?status=${status}` : "";
    api
      .get(`/orders/admin/all${query}`)
      .then((data) => setOrders(data.orders))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders(filterStatus);
  }, [filterStatus]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Orders</h1>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-ink"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-muted text-sm">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted text-sm">No orders found.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="bg-secondary border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div>
                  <p className="text-sm font-medium text-ink">{order.orderNumber}</p>
                  <p className="text-xs text-muted">
                    {order.user?.name} — {order.user?.email}
                  </p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="bg-primary border border-border rounded-lg px-3 py-1.5 text-xs text-ink"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between text-sm text-muted">
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                <span>{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</span>
                <span className="text-accent font-medium">৳{order.total.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
