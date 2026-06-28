/**
 * Run with: node seed.js
 * Wipes existing products and creates a fresh sample catalog + one admin account,
 * so you have real data to test the storefront against instead of empty collections.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Product = require("./models/Product");
const User = require("./models/User");
const Coupon = require("./models/Coupon");

const sampleProducts = [
  {
    name: "Midnight Oversized Tee",
    slug: "midnight-oversized-tee",
    description:
      "Premium heavyweight cotton oversized tee with a boxy silhouette. Garment-dyed for a soft, lived-in feel.",
    category: "T-Shirts",
    price: 1450,
    discountPrice: 1199,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800",
    ],
    variants: [
      { size: "S", color: "Black", colorHex: "#0F0F0F", stock: 8 },
      { size: "M", color: "Black", colorHex: "#0F0F0F", stock: 12 },
      { size: "L", color: "Black", colorHex: "#0F0F0F", stock: 5 },
    ],
    tags: ["new-arrival", "best-seller"],
    isFeatured: true,
  },
  {
    name: "Ivory Tailored Shirt",
    slug: "ivory-tailored-shirt",
    description: "Slim-fit formal shirt with a soft sheen finish, perfect for evening occasions.",
    category: "Shirts",
    price: 2100,
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"],
    variants: [
      { size: "M", color: "Ivory", colorHex: "#F5F0E6", stock: 10 },
      { size: "L", color: "Ivory", colorHex: "#F5F0E6", stock: 7 },
    ],
    tags: ["trending"],
    isFeatured: true,
  },
  {
    name: "Carbon Cargo Pants",
    slug: "carbon-cargo-pants",
    description: "Technical cargo pants with articulated knees and a tapered ankle.",
    category: "Pants",
    price: 2850,
    images: ["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800"],
    variants: [{ size: "L", color: "Charcoal", colorHex: "#36454F", stock: 4 }],
    tags: ["best-seller"],
    isFeatured: false,
  },
  {
    name: "Noir Pullover Hoodie",
    slug: "noir-pullover-hoodie",
    description: "Brushed fleece hoodie with gold embroidered wordmark on the chest.",
    category: "Hoodies",
    price: 3200,
    discountPrice: 2799,
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"],
    variants: [
      { size: "M", color: "Black", colorHex: "#0F0F0F", stock: 15 },
      { size: "XL", color: "Black", colorHex: "#0F0F0F", stock: 6 },
    ],
    tags: ["trending", "best-seller", "new-arrival"],
    isFeatured: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for seeding...");

  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  console.log(`Seeded ${sampleProducts.length} products`);

  // Create a default admin account if one doesn't already exist
  const adminEmail = "admin@bormonshopbd.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin@12345", 10);
    await User.create({
      name: "BormonShop Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });
    console.log(`Admin account created — email: ${adminEmail} / password: Admin@12345`);
    console.log("IMPORTANT: change this password immediately after first login.");
  } else {
    console.log("Admin account already exists, skipping.");
  }

  // Sample coupon for testing checkout
  const existingCoupon = await Coupon.findOne({ code: "WELCOME10" });
  if (!existingCoupon) {
    await Coupon.create({
      code: "WELCOME10",
      discountType: "percentage",
      discountValue: 10,
      maxDiscountAmount: 300,
      minOrderValue: 1000,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      usageLimit: null,
    });
    console.log("Sample coupon WELCOME10 (10% off, max ৳300, min order ৳1000) created");
  }

  console.log("Seeding complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
