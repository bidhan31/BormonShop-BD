"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";

import ThemeSwitcher from "./ThemeSwitcher";

export default function Navbar() {
  const router = useRouter();
  const { itemCount, openCart } = useCart();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-primary/70 backdrop-blur border-b border-border transition-colors duration-300">
      <nav className="max-w-6xl mx-auto px-4 md:px-10 h-16 flex items-center justify-between gap-4 font-bold tracking-wider">
        {/* Logo */}
        <div className="flex items-center">
          <a href="/">
            <img src="/final-logo-removebg-preview.png" alt="BormonShop BD Logo" className="h-[65px] w-auto   " />
          </a>
          <Link href="/" className="font-display font-bold text-lg text-ink text-left mt-10">.<span className="text-accent">BD</span>
          </Link>
        </div>

        {/* Search — hidden on small screens to save space, shown in mobile menu instead */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="w-full bg-secondary border border-border rounded-full px-4 py-2 text-sm
                       text-ink placeholder:text-muted focus:outline-none focus:border-accent"
          />
        </form>

        {/* Right-side actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <ThemeSwitcher />
          </div>

          <Link href="/shop" className="hidden md:inline text-sm text-ink hover:text-accent transition-colors">
            Shop
          </Link>

          {user ? (
            <Link
              href={user.role === "admin" ? "/dashboard/admin" : "/dashboard/user"}
              className="hidden md:inline text-sm text-ink hover:text-accent transition-colors"
            >
              {user.role === "admin" ? "Admin" : "My Account"}
            </Link>
          ) : (
            <Link href="/login" className="hidden md:inline text-sm text-ink hover:text-accent transition-colors">
              Login
            </Link>
          )}

          {user && (
            <Link href="/dashboard/user/wishlist" aria-label="Wishlist" className="text-ink hover:text-accent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21s-7.5-4.7-10-9.3C.5 8.1 2.3 5 5.6 5c1.9 0 3.4 1 4.4 2.4C11 6 12.5 5 14.4 5c3.3 0 5.1 3.1 3.6 6.7C19.5 16.3 12 21 12 21z" />
              </svg>
            </Link>
          )}

          {/* Cart icon with item count badge */}
          <button onClick={openCart} aria-label="Open cart" className="relative text-ink hover:text-accent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-ink"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border px-4 py-4 space-y-3 bg-primary">
          <form onSubmit={handleSearch}>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-secondary border border-border rounded-full px-4 py-2 text-sm text-ink placeholder:text-muted"
            />
          </form>
          <div className="py-2 flex items-center justify-between">
            <span className="text-sm text-ink">Theme</span>
            <ThemeSwitcher />
          </div>
          <Link href="/shop" className="block text-sm text-ink py-1" onClick={() => setIsMobileMenuOpen(false)}>
            Shop
          </Link>
          {user ? (
            <>
              <Link
                href={user.role === "admin" ? "/dashboard/admin" : "/dashboard/user"}
                className="block text-sm text-ink py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {user.role === "admin" ? "Admin Dashboard" : "My Account"}
              </Link>
              <button onClick={() => logout()} className="block text-sm text-danger py-1">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="block text-sm text-ink py-1" onClick={() => setIsMobileMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
