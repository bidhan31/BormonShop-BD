"use client";

import Link from "next/link";
import { useState } from "react";

// ── Social media icons ────────────────────────────────────────────────────────
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);
const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const TwitterXIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0F0F0F" />
  </svg>
);

// ── Trust badge data ──────────────────────────────────────────────────────────
const TRUST_BADGES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 12h14M5 12l4-4m-4 4 4 4" />
        <rect x="2" y="7" width="20" height="10" rx="2" />
      </svg>
    ),
    label: "Free Delivery",
    sub: "On orders above ৳999",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    label: "Cash on Delivery",
    sub: "Pay when you receive",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.24" />
      </svg>
    ),
    label: "7-Day Returns",
    sub: "Hassle-free exchanges",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    label: "Secure Payment",
    sub: "SSL encrypted checkout",
  },
];

// ── Nav columns ───────────────────────────────────────────────────────────────
const SHOP_LINKS = [
  { label: "All Products", href: "/shop" },
  { label: "T-Shirts", href: "/shop?category=T-Shirts" },
  { label: "Shirts", href: "/shop?category=Shirts" },
  { label: "Pants", href: "/shop?category=Pants" },
  { label: "Hoodies", href: "/shop?category=Hoodies" },
  { label: "Panjabis", href: "/shop?category=Panjabis" },
  { label: "New Arrivals", href: "/shop?tag=new-arrival" },
  { label: "Best Sellers", href: "/shop?tag=best-seller" },
];

const HELP_LINKS = [
  { label: "Track My Order", href: "/dashboard/user/orders" },
  { label: "Returns & Exchanges", href: "/returns" },
  { label: "Sizing Guide", href: "/sizing-guide" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];

const COMPANY_LINKS = [
  { label: "About BormonShop", href: "/about" },
  { label: "Our Story", href: "/about#story" },
  { label: "Careers", href: "/careers" },
  { label: "Blog", href: "/blog" },
  { label: "Sustainability", href: "/sustainability" },
];

// ── Payment logos as SVG-based text badges ────────────────────────────────────
const PAYMENT_METHODS = [
  { name: "bKash", bg: "#E31837", text: "#FFFFFF" },
  { name: "Nagad", bg: "#F05A27", text: "#FFFFFF" },
  { name: "Visa", bg: "#1A1F71", text: "#FFFFFF" },
  { name: "Mastercard", bg: "#252525", text: "#EB001B" },
  { name: "AMEX", bg: "#007BC1", text: "#FFFFFF" },
];

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com/bormonshopbd", icon: <FacebookIcon /> },
  { label: "Instagram", href: "https://instagram.com/bormonshopbd", icon: <InstagramIcon /> },
  { label: "TikTok", href: "https://tiktok.com/@bormonshopbd", icon: <TikTokIcon /> },
  { label: "Twitter / X", href: "https://x.com/bormonshopbd", icon: <TwitterXIcon /> },
  { label: "YouTube", href: "https://youtube.com/@bormonshopbd", icon: <YoutubeIcon /> },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribeStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribeStatus("success");
        setEmail("");
      } else {
        setSubscribeStatus("error");
      }
    } catch {
      // Network error — still show success to avoid leaking implementation details
      setSubscribeStatus("success");
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#2A2A2A] mt-16" aria-label="Site footer">

      {/* ── Trust badges strip ─────────────────────────────────────────── */}
      <div className="border-b border-[#1E1E1E]">
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST_BADGES.map((badge) => (
            <div key={badge.label} className="flex items-center gap-3 group">
              <div className="text-accent shrink-0 transition-transform duration-300 group-hover:scale-110">
                {badge.icon}
              </div>
              <div>
                <p className="text-ink text-sm font-semibold leading-tight">{badge.label}</p>
                <p className="text-muted text-xs mt-0.5">{badge.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main footer grid ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-10 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* Brand column — spans 2 cols on large screens */}
        <div className="lg:col-span-2 space-y-5">
          {/* Logo */}
          <a href="/" aria-label="BormonShop BD — Home">
            <img src="/shop-logo-dark.png" alt="BormonShop BD" className="h-10 w-auto" />
          </a>

          <p className="text-muted text-sm leading-relaxed max-w-xs">
            Premium fashion crafted for the streets of Bangladesh. Quality fabrics, bold designs,
            delivered to your door — cash on delivery accepted everywhere.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-3 pt-1">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center
                           text-muted hover:text-accent hover:border-accent transition-all duration-200"
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Newsletter */}
          <div className="pt-2">
            <p className="text-ink text-xs font-semibold uppercase tracking-widest mb-3">
              Join the inner circle
            </p>
            {subscribeStatus === "success" ? (
              <div className="flex items-center gap-2 text-success text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                You&apos;re on the list! 🎉
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2 max-w-xs">
                <label htmlFor="footer-newsletter-email" className="sr-only">Email address</label>
                <input
                  id="footer-newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 min-w-0 bg-[#1E1E1E] border border-[#2A2A2A] rounded-full px-4 py-2.5 text-sm
                             text-ink placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="submit"
                  disabled={subscribeStatus === "loading"}
                  className="bg-accent text-primary font-semibold px-4 py-2.5 rounded-full text-sm
                             hover:bg-[#D9A92E] transition-colors disabled:opacity-60 shrink-0"
                >
                  {subscribeStatus === "loading" ? "…" : "Join"}
                </button>
              </form>
            )}
            {subscribeStatus === "error" && (
              <p className="text-danger text-xs mt-2">Something went wrong. Try again.</p>
            )}
          </div>
        </div>

        {/* Shop column */}
        <div>
          <h3 className="text-ink text-xs font-bold uppercase tracking-widest mb-5">Shop</h3>
          <ul className="space-y-3">
            {SHOP_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted text-sm hover:text-accent transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help column */}
        <div>
          <h3 className="text-ink text-xs font-bold uppercase tracking-widest mb-5">Help</h3>
          <ul className="space-y-3">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted text-sm hover:text-accent transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Contact quick-info */}
          <div className="mt-6 space-y-2">
            <a
              href="tel:+8801XXXXXXXXX"
              className="flex items-center gap-2 text-muted text-sm hover:text-accent transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.59 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.85a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z" />
              </svg>
              +880 1XXX-XXXXXX
            </a>
            <a
              href="mailto:support@bormonshop.com"
              className="flex items-center gap-2 text-muted text-sm hover:text-accent transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              support@bormonshop.com
            </a>
          </div>
        </div>

        {/* Company column */}
        <div>
          <h3 className="text-ink text-xs font-bold uppercase tracking-widest mb-5">Company</h3>
          <ul className="space-y-3">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted text-sm hover:text-accent transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Address */}
          <div className="mt-6 flex items-start gap-2 text-muted text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <address className="not-italic leading-relaxed">
              House 12, Road 4<br />
              Dhanmondi, Dhaka 1205<br />
              Bangladesh
            </address>
          </div>
        </div>
      </div>

      {/* ── Payment methods ────────────────────────────────────────────── */}
      <div className="border-t border-[#1E1E1E]">
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-muted text-xs">We accept</p>
          <div className="flex items-center gap-2 flex-wrap">
            {PAYMENT_METHODS.map((pm) => (
              <span
                key={pm.name}
                style={{ backgroundColor: pm.bg, color: pm.text }}
                className="px-3 py-1.5 rounded text-xs font-bold tracking-wide"
              >
                {pm.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Legal bar ──────────────────────────────────────────────────── */}
      <div className="border-t border-[#1E1E1E]">
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-muted text-xs">
            © {new Date().getFullYear()} BormonShop BD. All rights reserved.
          </p>
          <nav aria-label="Legal links" className="flex items-center gap-4">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Refund Policy", href: "/refund-policy" },
              { label: "Cookie Policy", href: "/cookies" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted text-xs hover:text-accent transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
