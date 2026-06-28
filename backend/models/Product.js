const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Sub-schema: one size/color combination with its own stock count.
 * Embedded directly in Product since variants are always queried/updated
 * together with their parent product (no need for a separate collection).
 */
const variantSchema = new Schema(
  {
    size: {
      type: String,
      enum: ["S", "M", "L", "XL", "XXL"],
      required: true,
    },
    color: { type: String, required: true, trim: true },
    colorHex: { type: String, required: true }, // e.g. "#0F0F0F" — used for swatch UI
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, unique: true, sparse: true }, // optional per-variant SKU
  },
  { _id: false } // variants don't need their own _id; size+color is identity enough
);

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true }, // denormalized for fast read without populate
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },

    // Slug is used for the public-facing URL (/product/:slug) — must stay unique.
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },

    description: { type: String, required: true },

    category: {
      type: String,
      required: true,
      enum: ["T-Shirts", "Shirts", "Pants", "Hoodies"],
      index: true, // frequently filtered on, so indexed
    },

    price: { type: Number, required: true, min: 0 },
    discountPrice: {
      type: Number,
      min: 0,
      validate: {
        // Discount must always be cheaper than the original price
        validator: function (value) {
          return value == null || value < this.price;
        },
        message: "discountPrice must be lower than price",
      },
    },

    images: {
      type: [String], // Cloudinary secure_urls
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one product image is required",
      },
    },

    variants: {
      type: [variantSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one variant (size/color) is required",
      },
    },

    // Denormalized rating fields — recalculated whenever a review is added/removed,
    // so the product listing/grid doesn't need to aggregate reviews on every read.
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    reviews: [reviewSchema],

    // Used to power "New Arrivals" / "Best Sellers" / "Trending" home page sections
    tags: {
      type: [String],
      enum: ["new-arrival", "best-seller", "trending"],
      default: [],
      index: true,
    },

    isFeatured: { type: Boolean, default: false, index: true },

    // Soft-delete flag so admin can deactivate a product without losing order history
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index supporting the storefront's "filter by category + price range" search
productSchema.index({ category: 1, price: 1 });

// Recalculate aggregate rating fields whenever reviews change.
// Call this from the controller after pushing/removing a review, e.g.:
//   product.reviews.push(newReview);
//   product.recalculateRating();
//   await product.save();
productSchema.methods.recalculateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.reviewCount = 0;
    return;
  }
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.rating = Math.round((total / this.reviews.length) * 10) / 10; // 1 decimal place
  this.reviewCount = this.reviews.length;
};

module.exports = mongoose.model("Product", productSchema);
