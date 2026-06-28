# BormonShop BD — Project Architecture

A premium, dark-themed e-commerce platform for Bangladeshi fashion. This package contains
a working folder structure and core implementation for the storefront and payment backend.

## Folder structure

```
bormonshop-bd/
├── frontend/                      # Next.js 14 App Router
│   ├── app/
│   │   ├── layout.tsx             # Root layout — forces dark mode, loads Inter/Poppins
│   │   ├── globals.css            # Tailwind base + skeleton/btn-gold utility classes
│   │   ├── page.tsx                # HOME PAGE
│   │   └── product/[slug]/page.tsx # PRODUCT DETAIL PAGE (dynamic route + SEO metadata)
│   ├── components/
│   │   ├── Hero.tsx                 # Full-width banner, "New Collection 2026", Shop Now CTA
│   │   ├── CategoryGrid.tsx         # T-Shirts/Shirts/Pants/Hoodies cards, hover zoom
│   │   ├── FeaturedSection.tsx      # Reusable row used for New Arrivals/Best Sellers/Trending
│   │   ├── ProductCard.tsx          # Card with wishlist heart toggle, discount badge
│   │   ├── ProductCardSkeleton.tsx  # Loading skeleton (shimmer animation)
│   │   ├── ProductDetail.tsx        # Gallery, size/color selector, qty counter, Add/Buy
│   │   ├── ReviewsSection.tsx       # Ratings & reviews list
│   │   └── RelatedProducts.tsx      # "You might also like" slider
│   ├── lib/data.ts                  # Mock data layer — swap for real fetch() calls to Express
│   ├── types/product.ts             # Shared TS interfaces (Product, CartItem, etc.)
│   └── tailwind.config.js           # Maps your exact hex codes (#0F0F0F / #1E1E1E / #F5C542)
│
└── backend/                        # Node.js + Express + MongoDB
    ├── models/
    │   ├── Product.js               # Variants (size/color/stock), reviews, tags, indexes
    │   ├── Order.js                 # Items snapshot, shipping address, payment, status stepper
    │   └── User.js                  # Minimal auth-ready user model
    ├── controllers/paymentController.js  # SSLCommerz init/success/fail/cancel/IPN logic
    ├── routes/payment.js            # Express routes wiring the controller above
    ├── middleware/auth.js           # JWT verification via HTTP-only cookie
    ├── config/sslcommerz.js         # Store ID/password/sandbox-vs-live toggle
    └── server.js                    # App entry point — mounts routes, connects MongoDB
```

## Why these decisions

- **Mongoose schemas are denormalized on purpose.** `Order.items` snapshots the product
  name/image/price at purchase time, so editing or deleting a product later never corrupts
  historical orders. `Product.rating`/`reviewCount` are pre-calculated fields updated via
  `recalculateRating()` so your product grid never needs to aggregate reviews on every page load.
- **SSLCommerz flow is 3 layers deep on purpose:** `init` → browser redirect → `success_url`
  callback. The success callback **re-validates** the transaction server-side via SSLCommerz's
  Validation API rather than trusting the redirect alone — and the IPN webhook acts as a backup
  in case the customer closes their browser mid-redirect. This is the same pattern SSLCommerz's
  own docs recommend for fraud safety.
- **JWT lives in an HTTP-only cookie**, not localStorage — keeps the token inaccessible to
  injected/malicious JS (XSS protection), which matters more once you have an admin dashboard.
- **`lib/data.ts` mock functions mirror the shape your real API will return.** When your Express
  routes for `/api/products` are ready, you only need to replace the function bodies — the Home
  Page and Product Detail page components don't change at all.

## To run locally

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in MongoDB URI, JWT secret, SSLCommerz sandbox keys
npm run dev

# Frontend
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## What's intentionally left as a next step

This covers the home page, product detail page, Product/Order schemas, and SSLCommerz route —
exactly what was asked for as the "core" implementation. Not yet built out (happy to do any of
these next):

- Cart/Checkout page UI (sidebar + form + COD/SSLCommerz toggle)
- User dashboard (orders, profile, wishlist) and Admin dashboard (CRUD, sales report)
- Auth routes (`/api/auth/register`, `/login`, `/logout`) and the bcrypt password hashing
- Product search/filter API endpoint and the matching frontend filter UI
- Coupon code redemption logic
- Cloudinary upload route for the admin "Add Product" form
- Order tracking stepper component (the UI piece — `Order.statusHistory` already powers it)

Let me know which of these you want built next and I'll go straight into it.
