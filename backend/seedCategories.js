require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");

const categoriesToSeed = [
  {
    name: "T-Shirts",
    slug: "t-shirts",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    order: 1,
  },
  {
    name: "Shirts",
    slug: "shirts",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
    order: 2,
  },
  {
    name: "Pants",
    slug: "pants",
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600",
    order: 3,
  },
  {
    name: "Hoodies",
    slug: "hoodies",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600",
    order: 4,
  },
  {
    name: "Panjabis",
    slug: "panjabis",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600",
    order: 5,
  },
];

async function seedCategories() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for category seeding...");

  for (const cat of categoriesToSeed) {
    const exists = await Category.findOne({ name: cat.name });
    if (!exists) {
      await Category.create(cat);
      console.log(`Seeded category: ${cat.name}`);
    } else {
      console.log(`Category already exists: ${cat.name}`);
    }
  }

  console.log("Category seeding complete.");
  await mongoose.disconnect();
}

seedCategories().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
