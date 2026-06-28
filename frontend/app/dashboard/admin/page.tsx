"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AdminOverviewPage() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    api.get("/orders/admin/sales-report").then((data) => setSummary(data.summary));
  }, []);

  const cards = [
    { label: "Total Revenue", value: summary ? `৳${summary.totalRevenue.toLocaleString()}` : "—" },
    { label: "Total Orders", value: summary ? summary.totalOrders : "—" },
    { label: "Avg. Order Value", value: summary ? `৳${Math.round(summary.avgOrderValue || 0).toLocaleString()}` : "—" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-secondary border border-border rounded-xl p-5">
            <p className="text-muted text-xs mb-1">{card.label}</p>
            <p className="text-2xl font-semibold text-accent">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard/admin/products" className="btn-gold">
          Manage Products
        </Link>
        <Link href="/dashboard/admin/orders" className="btn-outline">
          View Orders
        </Link>
      </div>
    </div>
  );
}
