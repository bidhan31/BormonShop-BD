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

const productsData = require("../frontend/products.json");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for seeding...");

  await Product.deleteMany({});
  
  // Clean up any potential data issues from the JSON before insertion
  const cleanProducts = productsData.map(p => {
    // Ensure all discountPrices are valid (must be < price)
    if (p.discountPrice && p.discountPrice >= p.price) {
      delete p.discountPrice;
    }
    return p;
  });

  await Product.insertMany(cleanProducts);
  console.log(`Seeded ${cleanProducts.length} products from products.json`);

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
