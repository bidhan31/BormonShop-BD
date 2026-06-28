"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminSalesReportPage() {
  const [summary, setSummary] = useState<any>(null);
  const [daily, setDaily] = useState<any[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    api
      .get(`/orders/admin/sales-report?${params.toString()}`)
      .then((data) => {
        setSummary(data.summary);
        setDaily(data.dailyBreakdown);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const maxRevenue = Math.max(...daily.map((d) => d.revenue), 1);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Sales Report</h1>

      <div className="flex gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs text-muted mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-ink"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-ink"
          />
        </div>
        <button onClick={fetchReport} className="btn-outline text-sm">
          Apply
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted text-sm">Loading report...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-secondary border border-border rounded-xl p-5">
              <p className="text-muted text-xs mb-1">Total Revenue</p>
              <p className="text-2xl font-semibold text-accent">৳{summary?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-secondary border border-border rounded-xl p-5">
              <p className="text-muted text-xs mb-1">Total Orders</p>
              <p className="text-2xl font-semibold text-accent">{summary?.totalOrders || 0}</p>
            </div>
            <div className="bg-secondary border border-border rounded-xl p-5">
              <p className="text-muted text-xs mb-1">Avg. Order Value</p>
              <p className="text-2xl font-semibold text-accent">
                ৳{Math.round(summary?.avgOrderValue || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Simple bar chart — daily revenue breakdown */}
          <div className="bg-secondary border border-border rounded-xl p-5">
            <h2 className="text-sm font-medium text-ink mb-4">Daily Revenue</h2>
            {daily.length === 0 ? (
              <p className="text-muted text-sm">No paid orders in this date range.</p>
            ) : (
              <div className="flex items-end gap-2 h-48 overflow-x-auto">
                {daily.map((d) => (
                  <div key={d._id} className="flex flex-col items-center gap-2 min-w-[36px]">
                    <div
                      className="w-6 bg-accent rounded-t"
                      style={{ height: `${(d.revenue / maxRevenue) * 160}px` }}
                      title={`৳${d.revenue.toLocaleString()}`}
                    />
                    <span className="text-[10px] text-muted whitespace-nowrap">{d._id.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
