"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/admin/customers")
      .then((data) => setCustomers(data.customers))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Customers</h1>

      {isLoading ? (
        <p className="text-muted text-sm">Loading customers...</p>
      ) : customers.length === 0 ? (
        <p className="text-muted text-sm">No customers with orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Orders</th>
                <th className="py-2 pr-4">Total Spent</th>
                <th className="py-2 pr-4">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="py-3 pr-4 text-ink">{customer.name}</td>
                  <td className="py-3 pr-4 text-muted">{customer.email}</td>
                  <td className="py-3 pr-4 text-ink">{customer.totalOrders}</td>
                  <td className="py-3 pr-4 text-accent font-medium">৳{customer.totalSpent.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-muted">{new Date(customer.lastOrderAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
