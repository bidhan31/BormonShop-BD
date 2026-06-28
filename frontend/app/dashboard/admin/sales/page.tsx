"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminSalesReportPage() {
  const [summary, setSummary] = useState<any>(null);
  const [daily, setDaily] = useState<any[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (paymentStatus) params.set("paymentStatus", paymentStatus);
    
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
  }, [paymentStatus]); // Also refetch when status changes

  const maxRevenue = Math.max(...daily.map((d) => d.revenue), 1);

  const getBarColor = () => {
    switch (paymentStatus) {
      case "Paid": return "bg-success";
      case "Failed":
      case "Refunded": return "bg-danger";
      case "Pending": return "bg-orange-500";
      default: return "bg-accent";
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Sales Report</h1>

      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs text-muted mb-1">Status</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
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
              <p className="text-muted text-sm">No orders in this date range with selected status.</p>
            ) : (
              <div className="flex items-end gap-2 h-48 overflow-x-auto">
                {daily.map((d) => (
                  <div key={d._id} className="flex flex-col items-center gap-2 min-w-[36px]">
                    <div
                      className={`w-6 rounded-t ${getBarColor()}`}
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
