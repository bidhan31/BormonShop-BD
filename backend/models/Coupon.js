const mongoose = require("mongoose");
const { Schema } = mongoose;

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    // For percentage coupons, optionally cap the maximum taka amount discounted
    maxDiscountAmount: { type: Number, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    usageLimit: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Computes the actual discount in BDT for a given cart subtotal, or returns null if invalid
couponSchema.methods.calculateDiscount = function (subtotal) {
  if (!this.isActive) return null;
  if (this.expiresAt < new Date()) return null;
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) return null;
  if (subtotal < this.minOrderValue) return null;

  let discount =
    this.discountType === "percentage" ? (subtotal * this.discountValue) / 100 : this.discountValue;

  if (this.maxDiscountAmount) discount = Math.min(discount, this.maxDiscountAmount);
  return Math.min(discount, subtotal); // never discount more than the order is worth
};

module.exports = mongoose.model("Coupon", couponSchema);
