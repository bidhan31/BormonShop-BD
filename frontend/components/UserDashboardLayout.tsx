"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

const links = [
  { href: "/dashboard/user", label: "My Orders" },
  { href: "/dashboard/user/wishlist", label: "Wishlist" },
  { href: "/dashboard/user/profile", label: "Profile" },
];

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-10 py-10 grid md:grid-cols-4 gap-8">
      <aside className="md:col-span-1">
        <p className="text-ink font-medium mb-1">{user?.name}</p>
        <p className="text-muted text-xs mb-6">{user?.email}</p>

        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                pathname === link.href ? "bg-accent text-primary font-medium" : "text-ink hover:bg-secondary"
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

      <section className="md:col-span-3">{children}</section>
    </main>
  );
}
