"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

const links = [
  { href: "/dashboard/admin", label: "Overview" },
  { href: "/dashboard/admin/products", label: "Products" },
  { href: "/dashboard/admin/categories", label: "Categories" },
  { href: "/dashboard/admin/orders", label: "Orders" },
  { href: "/dashboard/admin/customers", label: "Customers" },
  { href: "/dashboard/admin/payments", label: "Payments" },
  { href: "/dashboard/admin/sales", label: "Sales Report" },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  // Basic client-side gate — the real enforcement is server-side via the `adminOnly` middleware
  // on every admin API call, so even if someone bypasses this UI check, the API still blocks them.
  if (!isLoading && user && user.role !== "admin") {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-4 text-center">
        <p className="text-danger">You don't have access to the admin dashboard.</p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-10 py-10 grid md:grid-cols-5 gap-8">
      <aside className="md:col-span-1">
        <p className="text-ink font-medium mb-1">Admin Panel</p>
        <p className="text-muted text-xs mb-6">{user?.email}</p>

        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                pathname === link.href ? "bg-accent text-accent-foreground font-medium" : "text-ink hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => logout()}
            className="block w-full text-left text-sm px-3 py-2 rounded-lg text-danger hover:bg-secondary"
          >
            Logout
          </button>
        </nav>
      </aside>

      <section className="md:col-span-4">{children}</section>
    </main>
  );
}
