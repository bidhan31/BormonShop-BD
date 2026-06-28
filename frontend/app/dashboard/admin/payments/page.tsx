"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type OrderPaymentInfo = {
  _id: string;
  orderNumber: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  sslTransactionId?: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
};

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<OrderPaymentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/admin/all?limit=100");
      setOrders(res.orders || []);
    } catch (err: any) {
      setError(err.message || "Failed to load payments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/admin/${orderId}/payment-status`, { paymentStatus: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, paymentStatus: newStatus } : o))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update payment status");
      // refresh to reset UI state
      fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <div className="text-center py-10">Loading payments...</div>;
  if (error) return <div className="text-center text-danger py-10">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Payment Management</h1>
      </div>

      <div className="bg-secondary border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-primary/50 text-muted uppercase tracking-wider text-xs border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Transaction ID</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Payment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-primary/20 transition-colors">
                <td className="px-4 py-4 font-medium text-ink">
                  {order.orderNumber}
                  <div className="text-xs text-muted font-normal">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-4 text-ink">
                  {order.user?.name || "Guest"}
                  <div className="text-xs text-muted">{order.user?.email}</div>
                </td>
                <td className="px-4 py-4 text-ink">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentMethod === 'SSLCommerz' ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-600'
                  }`}>
                    {order.paymentMethod}
                  </span>
                </td>
                <td className="px-4 py-4 text-muted font-mono text-xs">
                  {order.sslTransactionId || "N/A"}
                </td>
                <td className="px-4 py-4 font-medium text-ink">
                  ৳{order.total.toLocaleString()}
                </td>
                <td className="px-4 py-4">
                  <select
                    value={order.paymentStatus}
                    disabled={updatingId === order._id}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`bg-primary border rounded px-2 py-1 text-xs focus:outline-none focus:border-accent disabled:opacity-50 ${
                      order.paymentStatus === 'Paid' ? 'border-success text-success' : 
                      order.paymentStatus === 'Failed' || order.paymentStatus === 'Refunded' ? 'border-danger text-danger' : 
                      'border-border text-ink'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
